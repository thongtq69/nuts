import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-permissions';
import { getLuckyWheelUserSummary, spinLuckyWheel } from '@/lib/lucky-wheel';

export async function GET() {
    const { user } = await requireAuth();
    if (!user) return NextResponse.json({ message: 'Vui lòng đăng nhập để tham gia' }, { status: 401 });
    return NextResponse.json(await getLuckyWheelUserSummary(user._id));
}

export async function POST(request: Request) {
    const { user } = await requireAuth();
    if (!user) return NextResponse.json({ message: 'Vui lòng đăng nhập để tham gia' }, { status: 401 });
    try {
        const { requestId } = await request.json();
        const spin = await spinLuckyWheel(user._id, String(requestId || ''));
        const summary = await getLuckyWheelUserSummary(user._id);
        return NextResponse.json({ spin, account: summary.account });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '';
        const messages: Record<string, string> = {
            CAMPAIGN_INACTIVE: 'Chương trình hiện chưa được mở hoặc đã kết thúc.',
            NO_SPINS: 'Bạn đã dùng hết lượt quay.',
            REQUEST_ID_INVALID: 'Yêu cầu không hợp lệ, vui lòng thử lại.',
        };
        const message = messages[errorMessage] || 'Không thể quay lúc này, vui lòng thử lại.';
        return NextResponse.json({ message }, { status: errorMessage === 'NO_SPINS' ? 409 : 400 });
    }
}
