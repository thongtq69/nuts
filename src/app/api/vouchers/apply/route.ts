import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';
import { verifyToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        await dbConnect();
        // Optional: Verify user owns the voucher? 
        // Voucher code might be shared or private. If UserVoucher has userId, usually it's private.
        // Let's assume we check if the current user owns it OR if it's a generic code (if we support that, but specific logic said "UserVoucher").

        const decoded = await verifyToken(req);
        // If logged in, check ownership. If guest, maybe restricted?
        // Requirement implies these are "My Vouchers" from packages/registration. So ownership check is good.

        const { code, orderValue } = await req.json();

        if (!code || orderValue === undefined) {
            return NextResponse.json({ message: 'Missing code or order value' }, { status: 400 });
        }

        const voucher = await UserVoucher.findOne({ code, isUsed: false });

        if (!voucher) {
            return NextResponse.json({ message: 'Mã giảm giá không hợp lệ hoặc đã sử dụng' }, { status: 404 });
        }

        // Validity Checks
        const now = new Date();
        if (voucher.expiresAt < now) {
            return NextResponse.json({ message: 'Mã giảm giá đã hết hạn' }, { status: 400 });
        }

        if (decoded && voucher.userId.toString() !== decoded.id) {
            return NextResponse.json({ message: 'Mã giảm giá không thuộc về bạn' }, { status: 403 });
        }

        if (voucher.minOrderValue > 0 && orderValue < voucher.minOrderValue) {
            return NextResponse.json({
                message: `Đơn hàng tối thiểu để áp dụng mã này là ${voucher.minOrderValue.toLocaleString()}đ`
            }, { status: 400 });
        }

        // Calculate Discount
        let discountAmount = 0;
        if (voucher.discountType === 'percent') {
            discountAmount = orderValue * (voucher.discountValue / 100);
            if (voucher.maxDiscount > 0) {
                discountAmount = Math.min(discountAmount, voucher.maxDiscount);
            }
        } else {
            discountAmount = voucher.discountValue;
        }

        // Ensure discount doesn't exceed order value
        discountAmount = Math.min(discountAmount, orderValue);

        // Return valid logic
        return NextResponse.json({
            valid: true,
            discountAmount,
            message: 'Áp dụng mã giảm giá thành công'
        });

    } catch (error) {
        console.error("Apply voucher error:", error);
        return NextResponse.json({ message: 'Lỗi xử lý mã giảm giá' }, { status: 500 });
    }
}
