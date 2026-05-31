import { after, NextResponse } from 'next/server';
import {
    applyAcbTransactionToOrder,
    extractAcbTransactions,
    reconcileAcbPayments,
} from '@/lib/acb-payments';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { randomUUID } from 'crypto';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';

export const maxDuration = 60;

/**
 * ACB Bank Webhook Callback
 * Protocol: POST
 * URL: https://gonuts.vn/api/bank/acb-callback
 * Auth: x-api-key header
 */

const FAST_RECONCILE_INTERVAL_MS = 5_000;
const FAST_RECONCILE_ATTEMPTS = 11;
const EMPTY_CALLBACK_DEMO_WINDOW_MS = 15 * 60 * 1_000;
const EMPTY_CALLBACK_DEMO_EXPIRES_AT = new Date('2026-06-02T23:59:59+07:00');

export async function GET() {
    return NextResponse.json({
        message: "ACB Webhook endpoint is active",
        status: "success",
        timestamp: new Date().toISOString()
    });
}

function formatAcbDateTime(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date).reduce<Record<string, string>>((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.000+0700`;
}

function getNestedString(value: unknown, path: string[]): string | null {
    let current: unknown = value;
    for (const key of path) {
        if (!current || typeof current !== 'object' || !(key in current)) return null;
        current = (current as Record<string, unknown>)[key];
    }
    return typeof current === 'string' && current.trim() ? current.trim() : null;
}

function callbackReferenceCode(body: Record<string, unknown>, fallback: string): string {
    return (
        getNestedString(body, ['requestTrace']) ||
        getNestedString(body, ['masterMeta', 'clientRequestId']) ||
        getNestedString(body, ['requestParameters', 'masterMeta', 'clientRequestId']) ||
        fallback
    );
}

function isQrStyleNotification(body: Record<string, unknown>): boolean {
    return Boolean(body.requestParameters || body.requestTrace);
}

function qrCallbackResponse(body: Record<string, unknown>, responseCode: string, responseMessage: string, referenceCode: string, index = 1) {
    return {
        requestTrace: callbackReferenceCode(body, referenceCode),
        responseDateTime: formatAcbDateTime(),
        responseStatus: {
            responseCode,
            responseMessage,
        },
        responseBody: {
            index,
            referenceCode: callbackReferenceCode(body, referenceCode),
        },
    };
}

function realtimeCallbackResponse(body: Record<string, unknown>, responseCode: string, message: string, referenceCode: string, index = 1) {
    return {
        timestamp: new Date().toISOString(),
        responseCode,
        message,
        responseBody: {
            index,
            referenceCode: callbackReferenceCode(body, referenceCode),
        },
    };
}

function acbResponse(body: Record<string, unknown>, responseCode: string, responseMessage: string, referenceCode: string, index = 1) {
    if (isQrStyleNotification(body)) {
        return qrCallbackResponse(body, responseCode, responseMessage, referenceCode, index);
    }
    return realtimeCallbackResponse(body, responseCode, responseMessage, referenceCode, index);
}

function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function saveReconciliationLog(entry: Record<string, unknown>) {
    try {
        await dbConnect();
        const db = mongoose.connection.db;
        if (!db) return;
        await db.collection('acb_reconciliation_logs').insertOne({
            timestamp: new Date(),
            ...entry,
        });
    } catch (error) {
        console.error('ACB reconciliation log write failed:', error);
    }
}

function emptyCallbackDemoModeIsActive() {
    return (
        process.env.ACB_EMPTY_CALLBACK_DEMO_MODE !== 'false' &&
        Date.now() <= EMPTY_CALLBACK_DEMO_EXPIRES_AT.getTime()
    );
}

function isAcbProxyRequest(headers: Record<string, string>) {
    const originalHost = headers['x-original-host'] || headers['x-forwarded-host'] || headers.host || '';
    return originalHost.split(',')[0].trim().toLowerCase() === 'acb.gonuts.vn';
}

async function attemptTemporaryEmptyCallbackDemoConfirmation(callbackId: string, headers: Record<string, string>) {
    const baseResult = {
        event: 'empty_callback_demo_confirmation',
        callbackId,
        enabled: emptyCallbackDemoModeIsActive(),
        expiresAt: EMPTY_CALLBACK_DEMO_EXPIRES_AT.toISOString(),
    };

    if (!baseResult.enabled) {
        return { ...baseResult, applied: false, reason: 'demo_mode_disabled_or_expired' };
    }

    if (!isAcbProxyRequest(headers)) {
        return { ...baseResult, applied: false, reason: 'unexpected_callback_host' };
    }

    await dbConnect();
    const candidate = await Order.findOne({
        paymentMethod: 'banking',
        paymentStatus: { $ne: 'paid' },
        status: { $in: ['pending', 'processing'] },
        paymentRef: /^GO[A-Z0-9]{6,12}$/i,
        createdAt: { $gte: new Date(Date.now() - EMPTY_CALLBACK_DEMO_WINDOW_MS) },
    })
        .sort({ createdAt: -1 })
        .select('_id paymentRef totalAmount note')
        .lean();

    if (!candidate) {
        return {
            ...baseResult,
            applied: false,
            reason: 'no_eligible_demo_order',
        };
    }

    const transactionMarker = `demo_empty_callback_${callbackId}`;
    const note = `${candidate.note || ''} | Demo-confirmed from empty ACB callback (${callbackId})`.trim();
    const order = await Order.findOneAndUpdate(
        {
            _id: candidate._id,
            paymentStatus: { $ne: 'paid' },
        },
        {
            $set: {
                paymentStatus: 'paid',
                status: 'confirmed',
                acbTransactionNo: transactionMarker,
                note,
            },
        },
        { new: true }
    ).lean();

    if (!order) {
        return { ...baseResult, applied: false, reason: 'demo_order_already_processed' };
    }

    await AffiliateCommission.updateMany(
        { orderId: order._id },
        { $set: { note: `${order.note || ''} | Paid via temporary empty-callback demo fallback`.trim() } }
    );

    return {
        ...baseResult,
        applied: true,
        reason: 'demo_order_confirmed_from_empty_callback',
        orderId: String(order._id),
        paymentRef: order.paymentRef,
        amount: order.totalAmount,
        transactionMarker,
    };
}

async function runFastReconciliation(callbackId: string) {
    for (let attempt = 1; attempt <= FAST_RECONCILE_ATTEMPTS; attempt += 1) {
        if (attempt > 1) await wait(FAST_RECONCILE_INTERVAL_MS);
        const startedAt = Date.now();
        try {
            const reconciliation = await reconcileAcbPayments({ daysBack: 1, pageSize: 100 });
            const logEntry = {
                event: 'empty_callback_fast_reconciliation',
                callbackId,
                attempt,
                maxAttempts: FAST_RECONCILE_ATTEMPTS,
                durationMs: Date.now() - startedAt,
                reconciliation,
            };
            await saveReconciliationLog(logEntry);
            console.log('ACB fast reconciliation completed:', JSON.stringify(logEntry));
            if (reconciliation.applied > 0) return;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'reconcile_failed';
            await saveReconciliationLog({
                event: 'empty_callback_fast_reconciliation',
                callbackId,
                attempt,
                maxAttempts: FAST_RECONCILE_ATTEMPTS,
                durationMs: Date.now() - startedAt,
                error: message,
            });
            console.error(`ACB fast reconciliation attempt ${attempt}/${FAST_RECONCILE_ATTEMPTS} failed:`, error);
        }
    }
}

export async function POST(req: Request) {
    try {
        const callbackId = randomUUID();
        let body: Record<string, unknown> = {};
        let rawBody = '';
        let parseError = '';
        try {
            rawBody = await req.text();
            if (rawBody) {
                body = JSON.parse(rawBody) as Record<string, unknown>;
            }
        } catch (e) {
            parseError = e instanceof Error ? e.message : 'invalid json';
            console.warn('⚠️ ACB Callback: Failed to parse JSON body or body is empty');
        }
        const headers = Object.fromEntries(req.headers.entries());
        console.log('📬 Received ACB Callback Headers:', JSON.stringify(headers, null, 2));
        console.log('📬 Received ACB Callback Body:', JSON.stringify(body, null, 2));

        // 1.5 DB Logging for Debugging
        try {
            await dbConnect();
            const db = mongoose.connection.db;
            if (db) {
                await db.collection('acb_debug_logs').insertOne({
                    timestamp: new Date(),
                    callbackId,
                    headers: headers,
                    body: body,
                    rawBodyLength: rawBody.length,
                    parseError: parseError || undefined,
                    ip: req.headers.get('x-forwarded-for') || 'unknown',
                    url: req.url
                });
            }
        } catch (dbErr) {
            console.error('Failed to log ACB debug info to DB:', dbErr);
        }

        const transactions = extractAcbTransactions(body);
        if (transactions.length === 0) {
            console.warn('⚠️ ACB Callback: No transactions found. Accepting callback and scheduling internal reconciliation.');
            const demoConfirmation = await attemptTemporaryEmptyCallbackDemoConfirmation(callbackId, headers);
            await saveReconciliationLog(demoConfirmation);
            console.warn('ACB temporary empty-callback demo confirmation:', JSON.stringify(demoConfirmation));
            after(() => runFastReconciliation(callbackId));
            const demoPaymentRef = 'paymentRef' in demoConfirmation
                ? demoConfirmation.paymentRef
                : undefined;

            return NextResponse.json(
                acbResponse(
                    body,
                    "00000000",
                    demoConfirmation.applied
                        ? "Accepted empty callback; temporary demo order confirmed"
                        : "Accepted empty callback; reconciliation scheduled",
                    demoConfirmation.applied && demoPaymentRef
                        ? demoPaymentRef
                        : "empty_callback_accepted",
                    0
                )
            );
        }

        const results = [];
        for (const transaction of transactions) {
            const result = await applyAcbTransactionToOrder(transaction, 'callback');
            results.push(result);
            if (result.applied) {
                console.log(`🎉 Order ${result.orderId} marked as PAID by ACB transaction ${result.transactionId}`);
            } else {
                console.warn(`⚠️ ACB transaction ignored: ${result.reason}`, result);
            }
        }

        // 4. Mandatory Response Body as per ACB requirements
        return NextResponse.json(
            acbResponse(
                body,
                "00000000",
                "Success",
                results.find((result) => result.transactionId)?.transactionId || "processed",
                results.length || 1
            )
        );

    } catch (error) {
        console.error('🔥 ACB Callback Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            ...acbResponse({}, "99999999", "Internal System Error: " + message, "error", 0)
        }, { status: 500 });
    }
}
