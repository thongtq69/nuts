import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { getAdminNotificationPreferences } from '@/lib/admin-email-notifications';
import { sendAdminNotificationTestEmail } from '@/lib/email';

export async function POST() {
    const auth = await requireAdminAuth();
    if (!auth.user) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    try {
        const preferences = await getAdminNotificationPreferences();
        if (preferences.recipients.length === 0) {
            return NextResponse.json(
                { error: 'Vui lòng lưu ít nhất một email nhận thông báo trước' },
                { status: 400 },
            );
        }

        await sendAdminNotificationTestEmail(preferences.recipients);
        return NextResponse.json({
            success: true,
            message: `Đã gửi email thử tới ${preferences.recipients.length} địa chỉ`,
        });
    } catch (error) {
        console.error('Send admin notification test email failed:', error);
        return NextResponse.json(
            { error: 'Không gửi được email thử. Vui lòng kiểm tra cấu hình Gmail.' },
            { status: 500 },
        );
    }
}
