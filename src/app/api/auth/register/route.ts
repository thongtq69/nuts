import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserVoucher from '@/models/UserVoucher';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';

// Generate unique voucher code
function generateVoucherCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'WELCOME';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, phone } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json(
                { message: 'Email này đã được đăng ký' },
                { status: 400 }
            );
        }

        // Check referrer
        const cookieStore = await cookies();
        const refCode = cookieStore.get('gonuts_ref')?.value;
        let referrerId: any = undefined;

        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser) {
                referrerId = referrerUser._id;
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user: any = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            welcomeVoucherIssued: false,
            referrer: referrerId || undefined,
        });

        if (user) {
            // Create welcome voucher for new user
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

            const voucherCode = generateVoucherCode();

            await UserVoucher.create({
                userId: user._id,
                code: voucherCode,
                discountType: 'fixed',
                discountValue: 50000, // 50,000 VND
                maxDiscount: 50000,
                minOrderValue: 300000, // Minimum order 300,000 VND
                expiresAt,
                isUsed: false,
            });

            // Mark welcome voucher as issued
            await User.findByIdAndUpdate(user._id, { welcomeVoucherIssued: true });

            // Send welcome email
            try {
                await sendWelcomeEmail(user.email, user.name, voucherCode);
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
            }

            return NextResponse.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                message: 'Đăng ký thành công! Bạn đã nhận được voucher 50.000đ cho đơn hàng đầu tiên từ 300.000đ.'
            }, { status: 201 });
        } else {
            return NextResponse.json(
                { message: 'Không thể tạo tài khoản' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
