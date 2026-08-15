import { after, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import UserVoucher from '@/models/UserVoucher';
import bcrypt from 'bcryptjs';
import { sendWelcomeEmail } from '@/lib/email';
import { findReferrerByCode } from '@/lib/staff-identity';
import { normalizeReferralCode } from '@/lib/referral-attribution';
import { notifyAdminOfNewAccount } from '@/lib/admin-email-notifications';

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
        const { name, email, password, phone, registerAs, referralCode } = await req.json();

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
        const refCode = normalizeReferralCode(referralCode) ||
            normalizeReferralCode(cookieStore.get('gonuts_ref')?.value);
        let referrerId: any = undefined;
        let managingStaffId: any = undefined;

        if (refCode) {
            const referrerUser = await findReferrerByCode(refCode);
            if (!referrerUser) {
                return NextResponse.json(
                    { message: 'Mã nhân viên trong link giới thiệu không hợp lệ. Vui lòng xin lại link từ nhân viên.' },
                    { status: 400 }
                );
            }

            referrerId = referrerUser._id;
            if (referrerUser.role === 'staff' || referrerUser.affiliateLevel === 'staff') {
                managingStaffId = referrerUser._id;
            } else if (referrerUser.parentStaff) {
                managingStaffId = referrerUser.parentStaff;
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if registering as agent/collaborator
        const isAgentOrCollaborator = registerAs === 'agent' || registerAs === 'collaborator';

        const userData: any = {
            name,
            email,
            password: hashedPassword,
            phone,
            welcomeVoucherIssued: false,
            referrer: referrerId || undefined,
            parentStaff: managingStaffId || undefined,
            commissionSettings: managingStaffId
                ? { tier: 'bronze', managerId: managingStaffId }
                : { tier: 'bronze' },
        };

        // If registering as agent/collaborator, set pending status
        if (isAgentOrCollaborator) {
            userData.role = 'user'; // Still user role initially
            userData.saleApplicationStatus = 'pending';
            userData.saleAppliedAt = new Date();
            userData.saleType = registerAs === 'agent' ? 'agent' : 'collaborator';
        }

        const user: any = await User.create(userData);
        after(() => notifyAdminOfNewAccount(String(user._id)));

        if (user) {
            let emailSent = false;
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

            // Send welcome email for regular users only
            if (!isAgentOrCollaborator) {
                try {
                    await sendWelcomeEmail(user.email, user.name, voucherCode);
                    emailSent = true;
                } catch (emailError) {
                    console.error('Failed to send welcome email:', emailError);
                }
            }

            let message = 'Đăng ký thành công! Bạn đã nhận được voucher 50.000đ cho đơn hàng đầu tiên từ 300.000đ.';
            if (!isAgentOrCollaborator) {
                message += emailSent
                    ? ' Thông tin tài khoản đã được gửi tới email của bạn.'
                    : ' Tài khoản đã tạo thành công nhưng email thông báo chưa gửi được; bạn vẫn có thể đăng nhập bằng mật khẩu vừa tạo.';
            }
            
            if (isAgentOrCollaborator) {
                message = 'Đăng ký thành công! Tài khoản của bạn đang chờ admin duyệt. Sau khi được duyệt, bạn sẽ nhận được email thông báo và có thể truy cập trang đại lý/CTV.';
            }

            return NextResponse.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                saleApplicationStatus: user.saleApplicationStatus || null,
                emailSent,
                message
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
