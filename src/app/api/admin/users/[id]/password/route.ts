import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { sendAccountCredentialsEmail } from '@/lib/email';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ message: auth.error }, { status: 401 });
        }

        const { id } = await params;
        const { password, sendEmail = true } = await req.json();
        if (typeof password !== 'string' || password.length < 8) {
            return NextResponse.json({ message: 'Mật khẩu phải có ít nhất 8 ký tự.' }, { status: 400 });
        }

        await dbConnect();
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: 'Không tìm thấy người dùng.' }, { status: 404 });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        let emailSent = false;
        if (sendEmail) {
            try {
                await sendAccountCredentialsEmail(user.email, user.name, password, 'Tài khoản Go Nuts');
                emailSent = true;
            } catch (emailError) {
                console.error('Failed to send updated credentials:', emailError);
            }
        }

        return NextResponse.json({
            message: emailSent
                ? 'Đã cấp mật khẩu và gửi thông tin đăng nhập qua email.'
                : 'Đã cấp mật khẩu. Email thông báo chưa gửi được.',
            emailSent
        });
    } catch (error) {
        console.error('Admin set password error:', error);
        return NextResponse.json({ message: 'Không thể cấp mật khẩu.' }, { status: 500 });
    }
}
