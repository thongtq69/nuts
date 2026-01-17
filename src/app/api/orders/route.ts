import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import UserVoucher from '@/models/UserVoucher';
import VoucherRewardRule from '@/models/VoucherRewardRule';
import AffiliateSettings from '@/models/AffiliateSettings';
import AffiliateCommission from '@/models/AffiliateCommission';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendOrderConfirmationEmail } from '@/lib/email';

// Helper to get user ID if logged in
async function getUserId() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        return decoded.id;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();
        const { items, shippingInfo, paymentMethod, shippingFee, note, voucherCode } = body;

        const userId = await getUserId();
        const cookieStore = await cookies();

        // 1. Calculate Items Total
        const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // 2. Validate & Apply Voucher
        let discountAmount = 0;
        let appliedVoucherId = undefined;

        if (voucherCode) {
            const voucher = await UserVoucher.findOne({ code: voucherCode, isUsed: false });

            if (!voucher) {
                return NextResponse.json({ message: 'Voucher không hợp lệ hoặc đã sử dụng' }, { status: 400 });
            }

            if (new Date(voucher.expiresAt) < new Date()) {
                return NextResponse.json({ message: 'Voucher đã hết hạn' }, { status: 400 });
            }

            if (itemsTotal < voucher.minOrderValue) {
                return NextResponse.json({ message: `Đơn hàng tối thiểu ${voucher.minOrderValue.toLocaleString()}đ` }, { status: 400 });
            }

            // Check ownership if assigned
            if (voucher.userId && voucher.userId.toString() !== userId) {
                return NextResponse.json({ message: 'Voucher không thuộc về bạn' }, { status: 400 });
            }

            // Calculate discount
            if (voucher.discountType === 'percent') {
                discountAmount = Math.round(itemsTotal * (voucher.discountValue / 100));
                if (voucher.maxDiscount > 0 && discountAmount > voucher.maxDiscount) {
                    discountAmount = voucher.maxDiscount;
                }
            } else {
                discountAmount = voucher.discountValue;
            }

            appliedVoucherId = voucher._id;
        }

        const finalTotal = Math.max(0, itemsTotal + shippingFee - discountAmount);

        // 3. Affiliate Logic
        const refCode = cookieStore.get('gonuts_ref')?.value;
        let referrerId: any = undefined;
        let commissionAmount = 0;
        let commissionStatus: any = undefined;

        // Determine Referrer
        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser && referrerUser._id.toString() !== userId) {
                referrerId = referrerUser._id;
            }
        }
        if (!referrerId && userId) {
            const u = await User.findById(userId);
            if (u && u.referrer) referrerId = u.referrer;
        }

        // Calculate Commission
        if (referrerId) {
            const settings = await AffiliateSettings.findOne();
            const referrerUser = await User.findById(referrerId);
            const rate = referrerUser?.commissionRateOverride ?? settings?.defaultCommissionRate ?? 10;

            // Commission on Net Revenue (Items Total - Discount) ?? Or just Items Total?
            // Usually Net. Let's do (ItemsTotal - Discount).
            const revenueBase = Math.max(0, itemsTotal - discountAmount);

            if (revenueBase > 0) {
                commissionAmount = Math.round(revenueBase * (rate / 100));
                commissionStatus = 'pending';
            }
        }

        // 4. Create Order
        const order = await Order.create({
            user: userId || undefined,
            shippingInfo,
            items,
            paymentMethod,
            shippingFee,
            totalAmount: finalTotal,
            note,
            referrer: referrerId,
            commissionAmount,
            commissionStatus,
        });

        // 5. Mark Voucher Used
        if (appliedVoucherId) {
            await UserVoucher.findByIdAndUpdate(appliedVoucherId, {
                isUsed: true,
                usedAt: new Date(),
                orderId: order._id
            });
        }

        // 6. Create Commission Record
        if (commissionAmount > 0 && referrerId) {
            const comm = await AffiliateCommission.create({
                affiliateId: referrerId,
                orderId: order._id,
                orderValue: Math.max(0, itemsTotal - discountAmount),
                commissionRate: 10, // Should be fetched rate, simplifying for now
                commissionAmount,
                status: 'pending',
                note: voucherCode ? `Order with voucher ${voucherCode}` : ''
            });
            await Order.findByIdAndUpdate(order._id, { commissionId: comm._id });
        }

        // 7. Send Order Confirmation Email
        if (shippingInfo.email || (userId && await User.findById(userId))) {
            try {
                const user = userId ? await User.findById(userId) : null;
                const email = shippingInfo.email || user?.email;

                if (email) {
                    await sendOrderConfirmationEmail(email, {
                        orderId: order._id.toString().slice(-6).toUpperCase(),
                        customerName: shippingInfo.fullName,
                        items: items.map((item: any) => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price
                        })),
                        shippingFee,
                        discount: discountAmount,
                        totalAmount: finalTotal,
                        shippingAddress: `${shippingInfo.address}, ${shippingInfo.ward || ''}, ${shippingInfo.district}, ${shippingInfo.city}`,
                        paymentMethod
                    });
                }
            } catch (emailError) {
                console.error('Failed to send order confirmation email:', emailError);
                // Don't fail the order if email fails
            }
        }

        // 8. Generate Reward Voucher if eligible
        if (userId && finalTotal > 0) {
            try {
                // Find matching reward rule (highest minOrderValue that qualifies)
                const rewardRules = await VoucherRewardRule.find({ isActive: true })
                    .sort({ minOrderValue: -1 })
                    .lean();

                const matchingRule = rewardRules.find(rule => finalTotal >= rule.minOrderValue);

                if (matchingRule) {
                    // Generate unique voucher code
                    const timestamp = Date.now().toString(36).toUpperCase();
                    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
                    const voucherCode = `REWARD${timestamp}${random}`;

                    // Calculate expiry date
                    const expiresAt = new Date();
                    expiresAt.setDate(expiresAt.getDate() + (matchingRule.validityDays || 90));

                    // Create reward voucher
                    await UserVoucher.create({
                        userId,
                        code: voucherCode,
                        discountType: 'fixed',
                        discountValue: matchingRule.voucherValue,
                        maxDiscount: matchingRule.voucherValue,
                        minOrderValue: matchingRule.minOrderForVoucher || 0,
                        expiresAt,
                        isUsed: false,
                        source: 'order_reward',
                        sourceId: order._id,
                        extensionFee: matchingRule.extensionFee,
                        extensionDays: matchingRule.extensionDays || 90,
                        maxExtensions: matchingRule.maxExtensions || 1,
                        extensionCount: 0,
                    });

                    console.log(`Created reward voucher ${voucherCode} (${matchingRule.voucherValue}đ) for user ${userId}`);
                }
            } catch (voucherError) {
                console.error('Failed to create reward voucher:', voucherError);
                // Don't fail the order if voucher creation fails
            }
        }

        return NextResponse.json(order, { status: 201 });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi tạo đơn hàng' },
            { status: 500 }
        );
    }
}

// GET orders for current user
export async function GET(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json(
                { message: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        return NextResponse.json(orders);
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
