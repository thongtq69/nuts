import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-permissions';
import { createLuckyWheelTopUp, getLuckyWheelUserSummary, spinLuckyWheel } from '@/lib/lucky-wheel';

export async function GET() {
    const { user } = await requireAuth();
    if (!user) return NextResponse.json({ message: 'Vui lòng đăng nhập để tham gia' }, { status: 401 });
    return NextResponse.json(await getLuckyWheelUserSummary(user._id, user.role === 'admin'));
}

export async function POST(request: Request) {
    const { user } = await requireAuth();
    if (!user) return NextResponse.json({ message: 'Vui lòng đăng nhập để tham gia' }, { status: 401 });
    try {
        const { requestId, action, amount } = await request.json();
        if (action === 'top-up') {
            const topUp = await createLuckyWheelTopUp(user._id, Number(amount));
            return NextResponse.json({ topUp });
        }
        const adminTestMode = user.role === 'admin';
        const spin = await spinLuckyWheel(user._id, String(requestId || ''), adminTestMode);
        const summary = await getLuckyWheelUserSummary(user._id, adminTestMode);
        return NextResponse.json({ spin, account: summary.account, adminTestMode });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '';
        const messages: Record<string, string> = {
            CAMPAIGN_INACTIVE: 'Chương trình hiện chưa được mở hoặc đã kết thúc.',
            NO_SPINS: 'Bạn đã dùng hết lượt quay.',
            REQUEST_ID_INVALID: 'Yêu cầu không hợp lệ, vui lòng thử lại.',
            INVALID_TOP_UP: 'Số tiền nạp không phù hợp với các mức đang được cấu hình.',
        };
        const message = messages[errorMessage] || 'Không thể quay lúc này, vui lòng thử lại.';
        return NextResponse.json({ message }, { status: errorMessage === 'NO_SPINS' ? 409 : 400 });
    }
}
