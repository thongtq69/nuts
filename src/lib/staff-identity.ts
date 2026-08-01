import User, { type IUser } from '@/models/User';
import { formatStaffCode } from '@/lib/staff-code';

export { formatStaffCode } from '@/lib/staff-code';

const STAFF_CODE_PATTERN = /^NV\d{6}$/;

/**
 * Generates the next human-friendly staff code. The final uniqueness guarantee
 * still comes from MongoDB's unique indexes, so callers should retry on E11000.
 */
export async function generateNextStaffCode(): Promise<string> {
    const latest = await User.findOne({ staffCode: { $regex: '^NV\\d{6}$' } })
        .sort({ staffCode: -1 })
        .select('staffCode')
        .lean();

    const current = latest?.staffCode && STAFF_CODE_PATTERN.test(latest.staffCode)
        ? Number(latest.staffCode.slice(2))
        : 0;

    return formatStaffCode(current + 1);
}

export async function assignStaffIdentity(user: IUser & { save: () => Promise<unknown> }): Promise<string> {
    if (user.staffCode) {
        user.referralCode = user.staffCode;
        await user.save();
        return user.staffCode;
    }

    for (let attempt = 0; attempt < 20; attempt += 1) {
        const nextCode = await generateNextStaffCode();
        user.staffCode = nextCode;
        user.referralCode = nextCode;

        try {
            await user.save();
            return nextCode;
        } catch (error) {
            const mongoError = error as { code?: number; keyPattern?: Record<string, unknown> };
            if (mongoError.code !== 11000) throw error;
            user.staffCode = undefined;
            user.referralCode = undefined;
        }
    }

    throw new Error('Không thể tạo mã nhân viên duy nhất');
}

export async function findReferrerByCode(rawCode?: string | null) {
    const code = rawCode?.trim().toUpperCase();
    if (!code) return null;

    return User.findOne({
        $or: [
            { referralCode: code },
            { staffCode: code }
        ]
    });
}
