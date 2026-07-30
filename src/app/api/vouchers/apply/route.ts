import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';
import Product from '@/models/Product';
import { verifyToken } from '@/lib/auth';
import { calculateVoucherDiscount, type VoucherDiscountItem } from '@/lib/voucher-discount';

export async function POST(req: Request) {
    try {
        await dbConnect();
        // Optional: Verify user owns the voucher? 
        // Voucher code might be shared or private. If UserVoucher has userId, usually it's private.
        // Let's assume we check if the current user owns it OR if it's a generic code (if we support that, but specific logic said "UserVoucher").

        const decoded = await verifyToken(req);
        // If logged in, check ownership. If guest, maybe restricted?
        // Requirement implies these are "My Vouchers" from packages/registration. So ownership check is good.

        const { code, orderValue, items } = await req.json();

        if (!code || (orderValue === undefined && !Array.isArray(items))) {
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

        let discountItems: VoucherDiscountItem[] = [];

        if (Array.isArray(items) && items.length > 0) {
            const productIds = items
                .map(item => item.productId)
                .filter(Boolean);
            const products = await Product.find({ _id: { $in: productIds } })
                .select('_id vipMaxDiscount')
                .lean();
            const productCaps = new Map(
                products.map(product => [
                    product._id.toString(),
                    Number(product.vipMaxDiscount) || 0
                ])
            );

            discountItems = items.map(item => ({
                unitPrice: Math.max(0, Number(item.unitPrice) || 0),
                quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
                vipMaxDiscount: productCaps.get(String(item.productId)) || 0
            }));
        } else {
            discountItems = [{
                unitPrice: Math.max(0, Number(orderValue) || 0),
                quantity: 1,
                vipMaxDiscount: 0
            }];
        }

        const effectiveOrderValue = discountItems.reduce(
            (total, item) => total + item.unitPrice * item.quantity,
            0
        );

        if (voucher.minOrderValue > 0 && effectiveOrderValue < voucher.minOrderValue) {
            return NextResponse.json({
                message: `Đơn hàng tối thiểu để áp dụng mã này là ${voucher.minOrderValue.toLocaleString()}đ`
            }, { status: 400 });
        }

        const discountAmount = calculateVoucherDiscount({
            discountType: voucher.discountType,
            discountValue: voucher.discountValue,
            voucherMaxDiscount: voucher.maxDiscount,
            items: discountItems,
            applyProductCaps: voucher.source === 'package'
        });

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
