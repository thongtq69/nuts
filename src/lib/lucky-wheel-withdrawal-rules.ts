export interface WithdrawalHistoryTransaction {
    transactionCode?: string | number;
    traceNumber?: string;
    transactionTraceNumber?: string | null;
    transactionType?: string;
    transactionAmount?: number;
    transactionDescription?: string;
    beneficiaryAccount?: string | number | null;
    transactionStatus?: string;
    debitOrCredit?: string;
}

export interface WithdrawalMatchTarget {
    amount: number;
    beneficiaryAccount: string;
    payoutReference: string;
    transactionId: string;
}

function text(value: unknown): string {
    return value === undefined || value === null ? '' : String(value).trim();
}

function normalizedReference(value: unknown): string {
    return text(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function normalizedAccount(value: unknown): string {
    return text(value).replace(/\D/g, '');
}

function normalizedDirection(value: unknown): string {
    return text(value).toLowerCase().replace(/[^a-z]/g, '');
}

function transactionReferences(transaction: WithdrawalHistoryTransaction): string[] {
    return [transaction.transactionCode, transaction.traceNumber, transaction.transactionTraceNumber]
        .map(normalizedReference)
        .filter(Boolean);
}

function isPostedDebit(transaction: WithdrawalHistoryTransaction): boolean {
    const direction = normalizedDirection(transaction.debitOrCredit || transaction.transactionType);
    if (!['debit', 'd', 'dr', 'withdrawal', 'out', 'outgoing'].includes(direction)) return false;

    const status = normalizedDirection(transaction.transactionStatus);
    return !status || ['completed', 'complete', 'success', 'successful', 'succeeded', 'paid'].includes(status);
}

export function matchesWithdrawalTransaction(
    transaction: WithdrawalHistoryTransaction,
    target: WithdrawalMatchTarget,
): boolean {
    if (!isPostedDebit(transaction)) return false;
    if (Math.abs(Number(transaction.transactionAmount || 0)) !== target.amount) return false;
    if (normalizedAccount(transaction.beneficiaryAccount) !== normalizedAccount(target.beneficiaryAccount)) return false;

    const expectedTransactionId = normalizedReference(target.transactionId);
    if (!expectedTransactionId || !transactionReferences(transaction).includes(expectedTransactionId)) return false;

    const description = normalizedReference(transaction.transactionDescription);
    return Boolean(description) && description.includes(normalizedReference(target.payoutReference));
}
