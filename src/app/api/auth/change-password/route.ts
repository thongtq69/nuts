import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireAuth } from '@/lib/auth-permissions';
import { getNewPasswordValidationError } from '@/lib/password-policy';
import User from '@/models/User';

function clearAuthCookie(response: NextResponse) {
    response.cookies.set('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: new Date(0),
        maxAge: 0,
        path: '/',
    });
}

export async function POST(req: Request) {
    try {
        const auth = await requireAuth();

        if (!auth.user) {
            return NextResponse.json(
                { message: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.' },
                { status: 401 },
            );
        }

        let body: unknown;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ' }, { status: 400 });
        }

        const payload = body && typeof body === 'object' ? body as Record<string, unknown> : {};
        const currentPassword = typeof payload.currentPassword === 'string'
            ? payload.currentPassword
            : '';
        const newPassword = typeof payload.newPassword === 'string'
            ? payload.newPassword
            : '';

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { message: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới' },
                { status: 400 },
            );
        }

        const passwordValidationError = getNewPasswordValidationError(newPassword);
        if (passwordValidationError) {
            return NextResponse.json(
                { message: passwordValidationError },
                { status: 400 },
            );
        }

        const user = await User.findById(auth.user._id);

        if (!user || !user.password) {
            return NextResponse.json({ message: 'Không tìm thấy tài khoản' }, { status: 404 });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isCurrentPasswordValid) {
            return NextResponse.json(
                { message: 'Mật khẩu hiện tại không đúng' },
                { status: 403 },
            );
        }

        const passwordReuseError = getNewPasswordValidationError(newPassword, currentPassword);
        if (passwordReuseError) {
            return NextResponse.json({ message: passwordReuseError }, { status: 400 });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        const response = NextResponse.json({
            success: true,
            message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
        });
        clearAuthCookie(response);

        return response;
    } catch (error) {
        console.error('Change password error:', error);
        return NextResponse.json({ message: 'Lỗi khi đổi mật khẩu' }, { status: 500 });
    }
}
