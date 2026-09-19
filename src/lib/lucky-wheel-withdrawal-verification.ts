import { getAcbTransactionHistory } from '@/lib/acb';
import { getConfiguredAcbAccountNumber } from '@/lib/server-bank-settings';
import { matchesWithdrawalTransaction } from '@/lib/lucky-wheel-withdrawal-rules';

export interface WithdrawalVerificationTarget {
    amount: number;
    beneficiaryAccount: string;
    payoutReference: string;
    transactionId: string;
    createdAt: Date;
}

export interface VerifiedWithdrawalTransaction {
    transactionId: string;
    transactionDate?: string;
    traceNumber?: string;
}

function text(value: unknown): string {
    return value === undefined || value === null ? '' : String(value).trim();
}

function formatDateInVietnam(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date);
}

export async function verifyWithdrawalInAcbHistory(
    target: WithdrawalVerificationTarget,
): Promise<VerifiedWithdrawalTransaction> {
    const sourceAccount = await getConfiguredAcbAccountNumber();
    if (!sourceAccount) throw new Error('ACB_ACCOUNT_NOT_CONFIGURED');

    const from = new Date(target.createdAt);
    from.setDate(from.getDate() - 1);
    const to = new Date();
    to.setDate(to.getDate() + 1);
    const earliestHistoryDate = new Date(to);
    earliestHistoryDate.setDate(earliestHistoryDate.getDate() - 8);
    if (from < earliestHistoryDate) from.setTime(earliestHistoryDate.getTime());

    let page = 1;
    let totalPages = 1;
    do {
        const history = await getAcbTransactionHistory({
            accountNumber: sourceAccount,
            fromDate: formatDateInVietnam(from),
            toDate: formatDateInVietnam(to),
            page,
            size: 100,
        });
        const transactions = history.responseData?.transactions || [];
        const match = transactions.find(transaction => matchesWithdrawalTransaction(transaction, target));
        if (match) {
            return {
                transactionId: text(match.transactionCode || match.traceNumber || match.transactionTraceNumber).toUpperCase(),
                transactionDate: text(match.transactionDate) || undefined,
                traceNumber: text(match.traceNumber || match.transactionTraceNumber) || undefined,
            };
        }
        totalPages = Math.min(Math.max(1, Number(history.responseData?.pagination?.totalPage || 1)), 20);
        page += 1;
    } while (page <= totalPages);

    throw new Error('BANK_TRANSACTION_NOT_CONFIRMED');
}
