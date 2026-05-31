/* eslint-disable @typescript-eslint/no-explicit-any */
import dbConnect from '@/lib/db';
import { getAcbTransactionHistory } from '@/lib/acb';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';

export interface ParsedAcbTransaction {
    transactionId: string;
    amount: number;
    description: string;
    status?: string;
    debitOrCredit?: string;
    accountNumber?: string;
    transactionDate?: string;
    traceNumber?: string;
    raw: any;
}

export interface AcbApplyResult {
    applied: boolean;
    reason: string;
    paymentRef?: string;
    orderId?: string;
    transactionId?: string;
    amount?: number;
}

const DEFAULT_ACCOUNT = process.env.ACB_DEFAULT_ACCOUNT;

function firstString(...values: any[]): string {
    for (const value of values) {
        if (value === undefined || value === null) continue;
        const text = String(value).trim();
        if (text) return text;
    }
    return '';
}

function firstNumber(...values: any[]): number {
    for (const value of values) {
        if (value === undefined || value === null || value === '') continue;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        const normalized = String(value).replace(/[,\s]/g, '');
        const parsed = Number(normalized);
        if (Number.isFinite(parsed)) return parsed;
    }
    return 0;
}

function normalizeStatus(value?: string): string {
    return (value || '').trim().toLowerCase();
}

function isCompletedStatus(value?: string): boolean {
    const status = normalizeStatus(value);
    if (!status) return true;
    return ['completed', 'complete', 'success', 'successful', 'succeeded', 'paid'].includes(status);
}

function isCredit(value?: string): boolean {
    const direction = normalizeStatus(value);
    if (!direction) return true;
    return ['credit', 'c', 'deposit', 'cr'].includes(direction);
}

function sameAccount(account?: string): boolean {
    if (!DEFAULT_ACCOUNT || !account) return true;
    return account.replace(/\D/g, '') === DEFAULT_ACCOUNT.replace(/\D/g, '');
}

function parseTransaction(txn: any, fallback: any = {}): ParsedAcbTransaction {
    const attributes = txn.transactionEntityAttribute || txn.transactionEntityAttributes || {};
    const transactionId = firstString(
        txn.transactionCode,
        txn.transactionId,
        txn.transactionNo,
        txn.referenceCode,
        txn.traceNumber,
        txn.transactionTraceNumber,
        attributes.traceNumber,
        attributes.referenceNumber,
        fallback.transactionId,
        fallback.requestTrace,
        fallback.clientRequestId
    );

    const amount = firstNumber(
        txn.transactionAmount,
        txn.amount,
        txn.tranAmount,
        txn.paymentAmount,
        txn.value,
        fallback.amount
    );

    const description = firstString(
        txn.transactionDescription,
        txn.transactionContent,
        txn.description,
        txn.tranContent,
        txn.content,
        txn.addInfo,
        txn.paymentContent,
        fallback.description
    );

    const accountNumber = firstString(
        txn.account,
        txn.accountNumber,
        txn.beneficiaryAccount,
        txn.beneficiaryAccountNumber,
        txn.receiverAccountNumber,
        txn.creditAccount,
        attributes.beneficiaryAccountNumber,
        attributes.receiverAccountNumber,
        attributes.accountNumber,
        fallback.accountNumber
    );

    return {
        transactionId,
        amount,
        description,
        status: firstString(txn.transactionStatus, txn.status, fallback.status),
        debitOrCredit: firstString(txn.debitOrCredit, txn.transactionType, fallback.debitOrCredit),
        accountNumber,
        transactionDate: firstString(txn.transactionDate, txn.effectiveDate, txn.createdDate, fallback.transactionDate),
        traceNumber: firstString(txn.traceNumber, txn.transactionTraceNumber, fallback.traceNumber),
        raw: txn,
    };
}

export function extractPaymentRef(description: string): string | null {
    const match = description.match(/GO[A-Z0-9]{6}/i);
    return match ? match[0].toUpperCase() : null;
}

export function extractAcbTransactions(body: any): ParsedAcbTransaction[] {
    const transactions: ParsedAcbTransaction[] = [];

    if (!body || typeof body !== 'object') return transactions;

    if (Array.isArray(body.requests)) {
        for (const request of body.requests) {
            const requestParams = request?.requestParams || {};
            const nestedTransactions = requestParams.transactions;
            if (Array.isArray(nestedTransactions)) {
                for (const txn of nestedTransactions) {
                    transactions.push(parseTransaction(txn, {
                        clientRequestId: body.masterMeta?.clientRequestId || body.requestMeta?.clientRequestId || request?.requestMeta?.clientRequestId,
                        requestTrace: body.requestTrace,
                    }));
                }
            }
        }
    }

    const requestParametersRequest = body.requestParameters?.request;
    const requestParameterRequests = body.requestParameters?.requests;
    const nestedRequests = Array.isArray(requestParameterRequests)
        ? requestParameterRequests
        : requestParametersRequest
            ? [requestParametersRequest]
            : [];

    for (const request of nestedRequests) {
        const nestedTransactions = request?.requestParams?.transactions;
        if (Array.isArray(nestedTransactions)) {
            for (const txn of nestedTransactions) {
                transactions.push(parseTransaction(txn, {
                    clientRequestId: body.requestParameters?.masterMeta?.clientRequestId,
                    requestTrace: body.requestTrace,
                    status: txn.transactionStatus,
                    debitOrCredit: txn.debitOrCredit,
                }));
            }
        }
    }

    const requestParamsTransactions = body.requestParams?.transactions;
    if (Array.isArray(requestParamsTransactions)) {
        for (const txn of requestParamsTransactions) {
            transactions.push(parseTransaction(txn, {
                clientRequestId: body.requestMeta?.clientRequestId,
                requestTrace: body.requestTrace,
            }));
        }
    }

    const requestParameterTransactions = body.requestParameters?.transactions;
    if (Array.isArray(requestParameterTransactions)) {
        for (const txn of requestParameterTransactions) {
            transactions.push(parseTransaction(txn, {
                requestTrace: body.requestTrace,
            }));
        }
    }

    if (body.requestParameters && !Array.isArray(body.requestParameters.transactions)) {
        const params = body.requestParameters;
        const hasFlatTransactionParams = [
            params.transactionAmount,
            params.amount,
            params.tranAmount,
            params.transactionDescription,
            params.transactionContent,
            params.description,
            params.tranContent,
            params.transactionStatus,
            params.debitOrCredit,
            params.accountNumber,
            params.account,
        ].some((value) => value !== undefined && value !== null && value !== '');

        if (hasFlatTransactionParams) {
            const parsed = parseTransaction({
                transactionId: body.transactionId || body.referenceCode,
                transactionAmount: params.transactionAmount,
                amount: params.amount,
                tranAmount: params.tranAmount,
                transactionDescription: params.transactionDescription,
                transactionContent: params.transactionContent,
                description: params.description,
                tranContent: params.tranContent,
                transactionStatus: params.transactionStatus,
                debitOrCredit: params.debitOrCredit,
                accountNumber: params.accountNumber || params.account,
            }, {
                requestTrace: body.requestTrace,
            });
            if (parsed.description || parsed.amount || parsed.transactionId) transactions.push(parsed);
        }
    }

    const simple = parseTransaction(body);
    if (simple.description || simple.amount || simple.transactionId) {
        transactions.push(simple);
    }

    const seen = new Set<string>();
    return transactions.filter((txn) => {
        const key = `${txn.transactionId}|${txn.amount}|${txn.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

export function normalizeHistoryTransaction(txn: any): ParsedAcbTransaction {
    return parseTransaction(txn);
}

export function validateAcbTransaction(txn: ParsedAcbTransaction): string | null {
    if (!txn.description) return 'missing_description';
    if (!extractPaymentRef(txn.description)) return 'missing_payment_ref';
    if (!txn.amount || txn.amount <= 0) return 'invalid_amount';
    if (!isCompletedStatus(txn.status)) return 'not_completed';
    if (!isCredit(txn.debitOrCredit)) return 'not_credit';
    if (!sameAccount(txn.accountNumber)) return 'wrong_account';
    return null;
}

export async function applyAcbTransactionToOrder(
    txn: ParsedAcbTransaction,
    source: 'callback' | 'reconcile'
): Promise<AcbApplyResult> {
    const invalidReason = validateAcbTransaction(txn);
    const paymentRef = extractPaymentRef(txn.description);
    if (invalidReason || !paymentRef) {
        return {
            applied: false,
            reason: invalidReason || 'missing_payment_ref',
            paymentRef: paymentRef || undefined,
            transactionId: txn.transactionId,
            amount: txn.amount,
        };
    }

    await dbConnect();

    if (txn.transactionId) {
        const duplicate = await Order.findOne({
            acbTransactionNo: txn.transactionId,
            paymentStatus: 'paid',
        }).select('_id paymentRef').lean();

        if (duplicate) {
            return {
                applied: false,
                reason: 'duplicate_transaction',
                paymentRef,
                orderId: String(duplicate._id),
                transactionId: txn.transactionId,
                amount: txn.amount,
            };
        }
    }

    const order = await Order.findOne({
        paymentRef,
        paymentStatus: { $ne: 'paid' },
    }).sort({ createdAt: -1 });

    if (!order) {
        return {
            applied: false,
            reason: 'order_not_found_or_already_paid',
            paymentRef,
            transactionId: txn.transactionId,
            amount: txn.amount,
        };
    }

    if (Number(order.totalAmount) !== Number(txn.amount)) {
        return {
            applied: false,
            reason: 'amount_mismatch',
            paymentRef,
            orderId: String(order._id),
            transactionId: txn.transactionId,
            amount: txn.amount,
        };
    }

    order.paymentStatus = 'paid';
    order.acbTransactionNo = txn.transactionId || txn.traceNumber || `${source}_${Date.now()}`;
    if (order.status === 'pending' || order.status === 'processing') {
        order.status = 'confirmed';
    }
    await order.save();

    await AffiliateCommission.updateMany(
        { orderId: order._id },
        { $set: { note: `${order.note || ''} | Paid via ACB (${order.acbTransactionNo})`.trim() } }
    );

    return {
        applied: true,
        reason: 'paid',
        paymentRef,
        orderId: String(order._id),
        transactionId: order.acbTransactionNo,
        amount: txn.amount,
    };
}

function formatDateInVietnam(date: Date): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(date);
}

function dateRangeForReconcile(daysBack: number, daysForward = 1): string[] {
    const dates: string[] = [];
    for (let offset = -daysForward; offset <= daysBack; offset += 1) {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        dates.push(formatDateInVietnam(date));
    }
    return dates;
}

export async function reconcileAcbPayments(options: {
    accountNumber?: string;
    daysBack?: number;
    pageSize?: number;
} = {}) {
    const accountNumber = options.accountNumber || DEFAULT_ACCOUNT;
    if (!accountNumber) {
        throw new Error('Missing ACB account number');
    }

    await dbConnect();
    const pendingRefs = await Order.find({
        paymentMethod: 'banking',
        paymentStatus: { $ne: 'paid' },
        paymentRef: /^GO[A-Z0-9]{6,12}$/i,
        createdAt: { $gte: new Date(Date.now() - (options.daysBack || 1) * 24 * 60 * 60 * 1000) },
    }).select('paymentRef totalAmount').lean();

    const pendingRefSet = new Set(pendingRefs.map((order: any) => String(order.paymentRef).toUpperCase()));
    const results: AcbApplyResult[] = [];
    const dates = dateRangeForReconcile(options.daysBack || 1);

    for (const date of dates) {
        const history = await getAcbTransactionHistory({
            accountNumber,
            fromDate: date,
            toDate: date,
            page: 1,
            size: options.pageSize || 100,
        });

        const transactions = history.responseData?.transactions || [];
        for (const rawTxn of transactions) {
            const txn = normalizeHistoryTransaction(rawTxn);
            const paymentRef = extractPaymentRef(txn.description);
            if (!paymentRef || !pendingRefSet.has(paymentRef)) continue;
            results.push(await applyAcbTransactionToOrder(txn, 'reconcile'));
        }
    }

    return {
        pendingRefs: pendingRefs.length,
        checkedDates: dates,
        results,
        applied: results.filter((result) => result.applied).length,
    };
}
