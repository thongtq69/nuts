import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import Order from '@/models/Order';
import User from '@/models/User';
import AffiliateSettings from '@/models/AffiliateSettings';
import AffiliateCommission from '@/models/AffiliateCommission';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const getUserFromRequest = async (req: Request) => {
    // Basic JWT extraction
    const token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as any;
        return decoded.id;
    } catch (e) {
        return null;
    }
};

export async function POST(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserFromRequest(req); // Optional for guest? But this is membership. Must be logged in?
        // Let's assume must be logged in for membership.
        if (!userId) {
            return NextResponse.json({ message: 'Vui lòng đăng nhập để mua gói' }, { status: 401 });
        }

        const { packageId, shippingInfo } = await req.json();
        const pkg = await SubscriptionPackage.findById(packageId);

        if (!pkg) {
            return NextResponse.json({ message: 'Gói không tồn tại' }, { status: 404 });
        }

        // Affiliate Tracking
        const user = await User.findById(userId);
        const cookieStore = await cookies();
        const refCode = cookieStore.get('gonuts_ref')?.value;
        let referrerId: any = user?.referrer; // Default to existing referrer

        // Check if cookie overrides or sets referrer (if not set)
        if (refCode && !referrerId) {
            const refUser = await User.findOne({ referralCode: refCode });
            if (refUser && refUser._id.toString() !== userId) {
                referrerId = refUser._id;
            }
        }

        // Commission Calculation
        let commissionAmount = 0;
        let commissionId = undefined;
        let commissionStatus: any = undefined;

        if (referrerId) {
            // Get settings
            const settings = await AffiliateSettings.findOne();
            const rate = user?.commissionRateOverride ?? settings?.defaultCommissionRate ?? 10;
            commissionAmount = Math.round(pkg.price * (rate / 100));
            commissionStatus = 'pending';
        }

        // Create Order
        // Treat package as 1 item
        const order = await Order.create({
            user: userId,
            shippingInfo: shippingInfo || {
                fullName: user?.name || 'Guest',
                phone: user?.phone || '0000',
                address: 'Membership Purchase',
                city: 'N/A',
                district: 'N/A'
            },
            items: [{
                productId: pkg._id, // Use package ID as product ID
                name: `Gói Hội Viên: ${pkg.name}`,
                quantity: 1,
                price: pkg.price,
                image: '' // Optional pkg image
            }],
            paymentMethod: 'cod', // Enforce COD/Banking (Pending)
            paymentStatus: 'pending',
            totalAmount: pkg.price,
            shippingFee: 0,
            status: 'pending',
            referrer: referrerId,
            commissionAmount: commissionAmount,
            commissionStatus: commissionStatus
        });

        // Create Commission Record if applicable
        if (commissionAmount > 0 && referrerId) {
            const comm = await AffiliateCommission.create({
                affiliateId: referrerId,
                orderId: order._id,
                orderValue: pkg.price,
                commissionRate: user?.commissionRateOverride ?? 10, // Approximate
                commissionAmount,
                status: 'pending',
                note: 'Hoa hồng mua gói hội viên'
            });

            // Link back to order
            await Order.findByIdAndUpdate(order._id, { commissionId: comm._id });
        }

        return NextResponse.json({
            message: 'Đặt hàng thành công. Vui lòng thanh toán để kích hoạt gói.',
            orderId: order._id
        }, { status: 201 });

    } catch (error) {
        console.error("Buy package error:", error);
        return NextResponse.json({ message: 'Lỗi khi tạo đơn hàng' }, { status: 500 });
    }
}
