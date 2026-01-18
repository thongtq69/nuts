import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const resetTokenStore = new Map<string, { userId: string; expires: number }>();

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email là bắt buộc' }, { status: 400 });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ message: 'Email không tồn tại trong hệ thống' }, { status: 404 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');

        resetTokenStore.set(resetToken, {
            userId: user._id.toString(),
            expires: Date.now() + 60 * 60 * 1000
        });

        await sendPasswordResetEmail(email, resetToken);

        return NextResponse.json({
            message: 'Email đặt lại mật khẩu đã được gửi',
            success: true
        });

    } catch (error) {
        console.error('Send reset password email error:', error);
        return NextResponse.json({ message: 'Lỗi khi gửi email đặt lại mật khẩu' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { token, newPassword } = await req.json();

        if (!token || !newPassword) {
            return NextResponse.json({ message: 'Token và mật khẩu mới là bắt buộc' }, { status: 400 });
        }

        const stored = resetTokenStore.get(token);

        if (!stored) {
            return NextResponse.json({ message: 'Token không hợp lệ' }, { status: 400 });
        }

        if (Date.now() > stored.expires) {
            resetTokenStore.delete(token);
            return NextResponse.json({ message: 'Token đã hết hạn' }, { status: 400 });
        }

        const user = await User.findById(stored.userId);

        if (!user) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        resetTokenStore.delete(token);

        return NextResponse.json({
            message: 'Mật khẩu đã được đặt lại thành công',
            success: true
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ message: 'Lỗi khi đặt lại mật khẩu' }, { status: 500 });
    }
}
