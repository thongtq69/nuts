import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { approveLuckyWheelWithdrawal, awardLuckyWheelMilestone, getLuckyWheelAdminSummary, getLuckyWheelSettings, reviewLuckyWheelWithdrawal, updateLuckyWheelMemberAccount } from '@/lib/lucky-wheel';
import { LUCKY_WHEEL_MINIMUM_WITHDRAWAL } from '@/lib/lucky-wheel-rules';
import mongoose from 'mongoose';

const textFields = [
    'campaignName', 'memberBadgeText', 'introText', 'inactiveMessage', 'spinButtonText',
    'totalWinningsLabel', 'balanceLabel', 'topUpTitle', 'withdrawalTitle', 'termsTitle', 'historyTitle',
] as const;

const textLimits: Record<(typeof textFields)[number], number> = {
    campaignName: 120, memberBadgeText: 80, introText: 500, inactiveMessage: 200, spinButtonText: 30,
    totalWinningsLabel: 80, balanceLabel: 80, topUpTitle: 80, withdrawalTitle: 80, termsTitle: 80, historyTitle: 80,
};

function positiveInteger(value: unknown, minimum = 1, maximum = Number.MAX_SAFE_INTEGER) {
    const result = Math.floor(Number(value));
    return Number.isFinite(result) && result >= minimum && result <= maximum ? result : null;
}

export async function GET() {
    const { user } = await requireAdminAuth();
    if (!user) return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    return NextResponse.json(await getLuckyWheelAdminSummary());
}

export async function PATCH(request: Request) {
    const { user } = await requireAdminAuth();
    if (!user) return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    const body = await request.json();
    if (body.campaignStartAt && body.campaignEndAt && new Date(body.campaignStartAt) >= new Date(body.campaignEndAt)) {
        return NextResponse.json({ message: 'Thời gian kết thúc phải sau thời gian bắt đầu.' }, { status: 400 });
    }
    const settings = await getLuckyWheelSettings();
    settings.enabled = Boolean(body.enabled);
    for (const field of textFields) {
        const value = String(body[field] || '').trim();
        if (!value) return NextResponse.json({ message: `Trường ${field} không được để trống.` }, { status: 400 });
        if (value.length > textLimits[field]) return NextResponse.json({ message: `Trường ${field} dài tối đa ${textLimits[field]} ký tự.` }, { status: 400 });
        settings[field] = value;
    }
    settings.campaignStartAt = body.campaignStartAt ? new Date(body.campaignStartAt) : undefined;
    settings.campaignEndAt = body.campaignEndAt ? new Date(body.campaignEndAt) : undefined;

    const minimumTopUp = positiveInteger(body.minimumTopUp, 1_000);
    const spinsPerTopUpUnit = positiveInteger(body.spinsPerTopUpUnit, 1, 100);
    const minimumWithdrawal = positiveInteger(body.minimumWithdrawal, 100_000);
    const milestoneTopUps = positiveInteger(body.milestoneTopUps, 1);
    if (!minimumTopUp || !spinsPerTopUpUnit || !minimumWithdrawal || !milestoneTopUps) {
        return NextResponse.json({ message: 'Các mức tiền, lượt quay và mốc thưởng phải là số nguyên dương hợp lệ.' }, { status: 400 });
    }
    if (minimumWithdrawal < LUCKY_WHEEL_MINIMUM_WITHDRAWAL) {
        return NextResponse.json({ message: 'Số tiền rút tối thiểu không được thấp hơn 100.000đ.' }, { status: 400 });
    }

    const topUpOptions = Array.isArray(body.topUpOptions)
        ? body.topUpOptions.map((value: unknown) => positiveInteger(value, minimumTopUp)).filter((value: number | null): value is number => Boolean(value))
        : [];
    if (topUpOptions.length < 1 || topUpOptions.length > 8 || topUpOptions.some((value: number) => value % minimumTopUp !== 0)) {
        return NextResponse.json({ message: 'Mức nạp nhanh phải có từ 1 đến 8 giá trị và là bội số của mức nạp tối thiểu.' }, { status: 400 });
    }

    const wheelSegments = Array.isArray(body.wheelSegments) ? body.wheelSegments.map((segment: Record<string, unknown>) => ({
        label: String(segment?.label || '').trim(),
        value: Math.max(0, Math.floor(Number(segment?.value) || 0)),
        color: String(segment?.color || '').trim().toLowerCase(),
    })) : [];
    const segmentValues = wheelSegments.map((segment: { value: number }) => segment.value);
    if (wheelSegments.length !== 6 || new Set(segmentValues).size !== 6 || wheelSegments.some((segment: { label: string; color: string }) => !segment.label || segment.label.length > 30 || !/^#[0-9a-f]{6}$/.test(segment.color))) {
        return NextResponse.json({ message: 'Vòng quay phải có đúng 6 ô, giá trị không trùng nhau, tên tối đa 30 ký tự và mã màu hợp lệ.' }, { status: 400 });
    }

    const regularSpinPrizes = Array.isArray(body.regularSpinPrizes)
        ? body.regularSpinPrizes.map((value: unknown) => Math.max(0, Math.floor(Number(value) || 0)))
        : [];
    const visibleValues = new Set(wheelSegments.map((segment: { value: number }) => segment.value));
    if (regularSpinPrizes.length < 1 || regularSpinPrizes.length > 100 || regularSpinPrizes.some((value: number) => !visibleValues.has(value))) {
        return NextResponse.json({ message: 'Cơ cấu lượt quay phải có từ 1 đến 100 lượt và mọi giá trị phải tồn tại trên vòng quay.' }, { status: 400 });
    }

    const terms = Array.isArray(body.terms) ? body.terms.map((term: unknown) => String(term || '').trim()).filter(Boolean) : [];
    if (terms.length < 1 || terms.length > 10 || terms.some((term: string) => term.length > 300)) return NextResponse.json({ message: 'Thể lệ phải có từ 1 đến 10 dòng, mỗi dòng tối đa 300 ký tự.' }, { status: 400 });

    const milestoneRewards = Array.isArray(body.milestoneRewards) ? body.milestoneRewards.map((reward: Record<string, unknown>) => ({
        value: Math.max(0, Math.floor(Number(reward?.value) || 0)),
        count: positiveInteger(reward?.count, 1, 100) || 0,
    })) : [];
    if (milestoneRewards.length < 1 || milestoneRewards.length > 5 || milestoneRewards.some((reward: { value: number; count: number }) => reward.value < 1_000 || !reward.count)) {
        return NextResponse.json({ message: 'Cơ cấu thưởng mốc phải có từ 1 đến 5 nhóm giải hợp lệ.' }, { status: 400 });
    }

    settings.minimumTopUp = minimumTopUp;
    settings.spinsPerTopUpUnit = spinsPerTopUpUnit;
    settings.minimumWithdrawal = minimumWithdrawal;
    settings.milestoneTopUps = milestoneTopUps;
    const normalizedTopUpOptions: number[] = Array.from(new Set<number>(topUpOptions));
    settings.topUpOptions = normalizedTopUpOptions.sort((a, b) => a - b);
    settings.wheelSegments = wheelSegments;
    settings.regularSpinPrizes = regularSpinPrizes;
    settings.terms = terms;
    settings.milestoneRewards = milestoneRewards;
    settings.updatedBy = new mongoose.Types.ObjectId(user._id);
    await settings.save();
    return NextResponse.json({ message: settings.enabled ? 'Đã kích hoạt chương trình' : 'Đã lưu ở trạng thái tạm dừng', settings });
}

export async function POST(request: Request) {
    const { user } = await requireAdminAuth();
    if (!user) return NextResponse.json({ message: 'Không có quyền truy cập' }, { status: 401 });
    const body = await request.json();
    const { action } = body;
    try {
        if (action === 'award') {
            const milestone = await awardLuckyWheelMilestone(user._id);
            return NextResponse.json({ message: `Đã chọn ngẫu nhiên và cộng tiền thưởng cho ${milestone?.winners.length || 0} thành viên.`, milestone });
        }
        if (action === 'withdrawal-approved') {
            const withdrawal = await approveLuckyWheelWithdrawal(
                user._id,
                String(body.withdrawalId || ''),
                String(body.note || ''),
            );
            return NextResponse.json({ message: 'Đã duyệt lệnh rút và trừ số dư thưởng của khách hàng.', withdrawal });
        }
        if (action === 'withdrawal-rejected') {
            const withdrawal = await reviewLuckyWheelWithdrawal(user._id, String(body.withdrawalId || ''), 'rejected', String(body.note || ''));
            return NextResponse.json({ message: 'Đã từ chối lệnh rút và giải phóng số tiền đang chờ.', withdrawal });
        }
        if (action === 'account-update') {
            const account = await updateLuckyWheelMemberAccount(String(body.userId || ''), {
                availableSpins: body.availableSpins,
                prizeBalance: body.prizeBalance,
                lifetimeWinnings: body.lifetimeWinnings,
            });
            return NextResponse.json({ message: 'Đã cập nhật tài khoản vòng quay của thành viên.', account });
        }
        return NextResponse.json({ message: 'Thao tác không hợp lệ' }, { status: 400 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '';
        const messages: Record<string, string> = {
            CAMPAIGN_INACTIVE: 'Chương trình chưa hoạt động.',
            MILESTONE_NOT_REACHED: 'Chưa đạt mốc số lần nạp tiếp theo.',
            NOT_ENOUGH_CUSTOMERS: 'Chưa đủ số khách hàng đã nạp để trao thưởng theo cơ cấu hiện tại.',
            ACCOUNT_NOT_FOUND: 'Không tìm thấy tài khoản vòng quay của thành viên.',
            INVALID_ACCOUNT_VALUES: 'Lượt quay và các số tiền phải là số nguyên không âm.',
            BALANCE_BELOW_PENDING_WITHDRAWALS: 'Số dư thưởng không được thấp hơn tổng tiền đang chờ rút.',
            WITHDRAWAL_NOT_FOUND: 'Yêu cầu rút tiền không còn ở trạng thái chờ xử lý.',
            WITHDRAWAL_REFERENCE_CREATED: 'Đã tạo nội dung đối chiếu cho yêu cầu cũ. Vui lòng kiểm tra thông tin rồi duyệt lại.',
        };
        return NextResponse.json({ message: messages[errorMessage] || 'Không thể thực hiện thao tác.' }, { status: 409 });
    }
}
