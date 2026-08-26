import dbConnect from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import {
    DEFAULT_BANK_SETTINGS,
    normalizeBankSettings,
    type BankSettings,
} from '@/lib/bank-settings';

export async function getConfiguredBankSettings(): Promise<BankSettings> {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne()
            .sort({ updatedAt: -1 })
            .select('bankName bankCode bankAccountNumber bankAccountName bankQrCodeUrl')
            .lean();

        return normalizeBankSettings(settings as Partial<BankSettings> | null);
    } catch (error) {
        console.error('Unable to load configured bank settings:', error);
        return DEFAULT_BANK_SETTINGS;
    }
}

export async function getConfiguredAcbAccountNumber(): Promise<string> {
    const settings = await getConfiguredBankSettings();
    if (settings.bankCode !== 'ACB') {
        throw new Error('Automatic bank reconciliation currently supports ACB accounts only');
    }
    return settings.bankAccountNumber;
}
