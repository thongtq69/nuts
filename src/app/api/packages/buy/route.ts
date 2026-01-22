import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import SubscriptionPackage from '@/models/SubscriptionPackage';
import Order from '@/models/Order';
import User from '@/models/User';
import UserVoucher from '@/models/UserVoucher';
import AffiliateSettings from '@/models/AffiliateSettings';
import AffiliateCommission from '@/models/AffiliateCommission';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

function generateVoucherCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        // Get user from cookies properly
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        
        if (!token) {
            return NextResponse.json({ message: 'Vui lòng đăng nhập để mua gói' }, { status: 401 });
        }

        let userId: string;
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as any;
            userId = decoded.id;
        } catch (e) {
            return NextResponse.json({ message: 'Phiên đăng nhập đã hết hạn' }, { status: 401 });
        }

        const { packageId, paymentMethod = 'banking' } = await req.json();
        
        const pkg = await SubscriptionPackage.findById(packageId);

        if (!pkg) {
            return NextResponse.json({ message: 'Gói không tồn tại' }, { status: 404 });
        }

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'Người dùng không tồn tại' }, { status: 404 });
        }

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + (pkg.validityDays || 30));

        // Affiliate tracking
        let referrerId: any = undefined;
        let commissionAmount = 0;
        let commissionStatus: any = undefined;
        let staffId: any = undefined;

        const refCode = cookieStore.get('gonuts_ref')?.value;
        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser && referrerUser._id.toString() !== userId) {
                referrerId = referrerUser._id;
                if (referrerUser.affiliateLevel === 'collaborator' && referrerUser.parentStaff) {
                    staffId = referrerUser.parentStaff;
                }
            }
        }
        if (!referrerId && user?.referrer) {
            referrerId = user.referrer;
            const referrerUser = await User.findById(user.referrer);
            if (referrerUser?.affiliateLevel === 'collaborator' && referrerUser.parentStaff) {
                staffId = referrerUser.parentStaff;
            }
        }

        if (referrerId) {
            const referrerUser = await User.findById(referrerId);
            const settings = await AffiliateSettings.findOne();
            const defaultRate = settings?.defaultCommissionRate ?? 10;
            let referrerRate = referrerUser?.commissionRateOverride ?? defaultRate;
            let staffRate = 0;

            if (referrerUser?.affiliateLevel === 'collaborator' && staffId) {
                const staffUser = await User.findById(staffId);
                staffRate = staffUser?.staffCommissionRate ?? 2;
            }

            if (referrerUser?.affiliateLevel === 'collaborator') {
                const collabCommission = Math.round(pkg.price * (referrerRate / 100));
                commissionAmount = collabCommission;
            } else {
                commissionAmount = Math.round(pkg.price * (referrerRate / 100));
            }
            commissionStatus = 'pending';
        }

        // Determine payment status
        // For membership packages, always set to pending - admin will confirm after checking payment
        const orderStatus = 'pending';
        const paymentStatus = 'pending';

        // Create Order with membership type
        const orderData: any = {
            user: userId,
            orderType: 'membership',
            shippingInfo: {
                fullName: user?.name || 'Member',
                phone: user?.phone || '0000000000',
                address: 'Online Membership Purchase - No Shipping Required',
                city: 'Online',
                district: 'N/A'
            },
            items: [{
                productId: String(pkg._id),
                name: `Gói Hội Viên: ${pkg.name}`,
                quantity: 1,
                price: Number(pkg.price),
                image: ''
            }],
            packageInfo: {
                packageId: pkg._id,
                name: pkg.name,
                voucherQuantity: pkg.voucherQuantity,
                expiresAt: expiresAt
            },
            paymentMethod: paymentMethod,
            paymentStatus: paymentStatus,
            totalAmount: Number(pkg.price),
            shippingFee: 0,
            status: orderStatus,
            commissionAmount: commissionAmount,
        };

        const order = await Order.create(orderData);

        // Generate vouchers for the user
        const vouchersToCreate = [];
        for (let i = 0; i < pkg.voucherQuantity; i++) {
            vouchersToCreate.push({
                userId: userId,
                code: generateVoucherCode(),
                discountType: pkg.discountType,
                discountValue: pkg.discountValue,
                maxDiscount: pkg.maxDiscount,
                minOrderValue: pkg.minOrderValue,
                expiresAt: expiresAt,
                isUsed: false,
                source: 'package',
                sourceId: pkg._id
            });
        }

        await UserVoucher.insertMany(vouchersToCreate);

        // Create Commission Records - Support 2-level system
        const commissionRecords = [];
        if (commissionAmount > 0 && referrerId) {
            const referrerUser = await User.findById(referrerId);
            const settings = await AffiliateSettings.findOne();
            const defaultRate = settings?.defaultCommissionRate ?? 10;

            if (referrerUser?.affiliateLevel === 'collaborator' && staffId) {
                // Create commission for collaborator
                const collabRate = referrerUser?.commissionRateOverride ?? defaultRate;
                const collabCommission = Math.round(pkg.price * (collabRate / 100));

                const collabComm = await AffiliateCommission.create({
                    affiliateId: referrerId,
                    orderId: order._id,
                    orderValue: pkg.price,
                    commissionRate: collabRate,
                    commissionAmount: collabCommission,
                    status: 'pending',
                    note: 'Collaborator commission - Membership package'
                });
                commissionRecords.push(collabComm);

                // Create commission for staff (override from collaborator)
                const staffUser = await User.findById(staffId);
                const staffRate = staffUser?.staffCommissionRate ?? 2;
                const staffCommission = Math.round(pkg.price * (staffRate / 100));

                const staffComm = await AffiliateCommission.create({
                    affiliateId: staffId,
                    orderId: order._id,
                    orderValue: pkg.price,
                    commissionRate: staffRate,
                    commissionAmount: staffCommission,
                    status: 'pending',
                    note: 'Staff override commission from collaborator - Membership package'
                });
                commissionRecords.push(staffComm);
            } else {
                // Single level commission (staff or regular referrer)
                const rate = referrerUser?.commissionRateOverride ?? defaultRate;

                const comm = await AffiliateCommission.create({
                    affiliateId: referrerId,
                    orderId: order._id,
                    orderValue: pkg.price,
                    commissionRate: rate,
                    commissionAmount: commissionAmount,
                    status: 'pending',
                    note: 'Hoa hồng mua gói hội viên'
                });
                commissionRecords.push(comm);
            }

            // Update order with first commission ID
            if (commissionRecords.length > 0) {
                await Order.findByIdAndUpdate(order._id, { commissionId: commissionRecords[0]._id });
            }
        }

        return NextResponse.json({
            message: 'Mua gói thành công!',
            orderId: order._id,
            vouchersCount: pkg.voucherQuantity
        }, { status: 201 });

    } catch (error: any) {
        console.error("Buy package error:", error);
        return NextResponse.json({ message: 'Lỗi khi mua gói' }, { status: 500 });
    }
}
