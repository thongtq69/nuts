export interface BankSettings {
    bankName: string;
    bankCode: string;
    bankAccountNumber: string;
    bankAccountName: string;
}

export const DEFAULT_BANK_SETTINGS: BankSettings = {
    bankName: 'ACB',
    bankCode: 'ACB',
    bankAccountNumber: '621588',
    bankAccountName: 'CÔNG TY TNHH GO NUTS VIỆT NAM',
};

function cleanText(value: unknown, fallback: string, maxLength: number): string {
    const text = typeof value === 'string' ? value.trim() : '';
    return (text || fallback).slice(0, maxLength);
}

export function normalizeBankSettings(value: Partial<BankSettings> | null | undefined): BankSettings {
    const bankCode = cleanText(value?.bankCode, DEFAULT_BANK_SETTINGS.bankCode, 20)
        .toUpperCase()
        .replace(/[^A-Z0-9_-]/g, '') || DEFAULT_BANK_SETTINGS.bankCode;
    const bankAccountNumber = cleanText(
        value?.bankAccountNumber,
        DEFAULT_BANK_SETTINGS.bankAccountNumber,
        34,
    ).replace(/\s+/g, '');

    return {
        bankName: cleanText(value?.bankName, DEFAULT_BANK_SETTINGS.bankName, 80),
        bankCode,
        bankAccountNumber,
        bankAccountName: cleanText(
            value?.bankAccountName,
            DEFAULT_BANK_SETTINGS.bankAccountName,
            150,
        ),
    };
}

