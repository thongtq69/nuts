import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-permissions';
import { requestLuckyWheelWithdrawal } from '@/lib/lucky-wheel';

export async function POST(request: Request) {
    const { user } = await requireAuth();
    if (!user) return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    try {
        const body = await request.json();
        const withdrawal = await requestLuckyWheelWithdrawal(user._id, body);
        if (withdrawal?.status === 'rejected') {
            return NextResponse.json({ message: `Lệnh rút đã bị từ chối: ${withdrawal.rejectionReason}`, withdrawal });
        }
        return NextResponse.json({ message: 'Đã gửi lệnh rút tiền. Số tiền sẽ chỉ bị trừ sau khi admin duyệt thành công.', withdrawal });
    } catch (error) {
        const code = error instanceof Error ? error.message : '';
        const messages: Record<string, string> = {
            INVALID_WITHDRAWAL_AMOUNT: 'Số tiền rút không phù hợp với mức tối thiểu đang được cấu hình.',
            INVALID_BANK_INFO: 'Thông tin tài khoản ngân hàng không hợp lệ.',
            INSUFFICIENT_PRIZE_BALANCE: 'Số dư tiền thưởng không đủ.',
        };
        return NextResponse.json({ message: messages[code] || 'Không thể tạo yêu cầu rút tiền.' }, { status: 400 });
    }
}
