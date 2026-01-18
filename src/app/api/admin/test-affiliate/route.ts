import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';
import AffiliateSettings from '@/models/AffiliateSettings';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { items, shippingInfo, referralCode } = await req.json();

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ message: 'Items are required' }, { status: 400 });
        }

        if (!shippingInfo || !shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
            return NextResponse.json({ message: 'Shipping info is required' }, { status: 400 });
        }

        const userId = await getCurrentUser().then(u => u?._id);

        const cookieStore = await cookies();

        const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const shippingFee = shippingInfo.shippingFee || 30000;
        const finalTotal = itemsTotal + shippingFee;

        let referrerId: any = undefined;
        let staffId: any = undefined;
        let collaboratorCommission = 0;
        let staffCommission = 0;
        let commissionStatus: any = undefined;

        const refCode = referralCode || cookieStore.get('gonuts_ref')?.value;

        if (refCode) {
            const referrerUser = await User.findOne({ referralCode: refCode });
            if (referrerUser && referrerUser._id.toString() !== userId) {
                referrerId = referrerUser._id;

                if (referrerUser.affiliateLevel === 'collaborator' && referrerUser.parentStaff) {
                    staffId = referrerUser.parentStaff;
                }
            }
        }

        const settings = await AffiliateSettings.findOne();
        const defaultRate = settings?.defaultCommissionRate ?? 10;

        let referrerRate = defaultRate;
        let staffRate = 0;
        let referrerUser: any = null;

        if (referrerId) {
            referrerUser = await User.findById(referrerId);
            referrerRate = referrerUser?.commissionRateOverride ?? defaultRate;

            if (staffId) {
                const staffUser = await User.findById(staffId);
                staffRate = staffUser?.staffCommissionRate ?? 2;
            }

            const revenueBase = Math.max(0, itemsTotal);

            if (revenueBase > 0) {
                if (referrerUser?.affiliateLevel === 'collaborator') {
                    collaboratorCommission = Math.round(revenueBase * (referrerRate / 100));
                    staffCommission = Math.round(revenueBase * (staffRate / 100));
                } else {
                    collaboratorCommission = Math.round(revenueBase * (referrerRate / 100));
                }
                commissionStatus = 'pending';
            }
        }

        const order = await Order.create({
            user: userId || undefined,
            shippingInfo,
            items,
            paymentMethod: 'cod',
            shippingFee,
            totalAmount: finalTotal,
            referrer: referrerId,
            commissionAmount: collaboratorCommission + staffCommission,
            commissionStatus,
        });

        const commissionRecords = [];

        if (collaboratorCommission > 0 && referrerId) {
            const comm = await AffiliateCommission.create({
                affiliateId: referrerId,
                orderId: order._id,
                orderValue: itemsTotal,
                commissionRate: referrerRate,
                commissionAmount: collaboratorCommission,
                status: 'pending',
                note: referrerUser?.affiliateLevel === 'collaborator' ? 'Collaborator commission' : 'Staff direct commission'
            });
            commissionRecords.push(comm);
        }

        if (staffCommission > 0 && staffId) {
            const staffComm = await AffiliateCommission.create({
                affiliateId: staffId,
                orderId: order._id,
                orderValue: itemsTotal,
                commissionRate: staffRate,
                commissionAmount: staffCommission,
                status: 'pending',
                note: 'Staff override commission from collaborator'
            });
            commissionRecords.push(staffComm);
        }

        return NextResponse.json({
            order,
            commissions: commissionRecords,
            message: 'Test order created successfully'
        }, { status: 201 });

    } catch (error) {
        console.error('Test order error:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const stats = {
            totalOrders: await Order.countDocuments(),
            totalCommissions: await AffiliateCommission.countDocuments(),
            totalCommissionAmount: (await AffiliateCommission.aggregate([
                { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
        ]))[0]?.total || 0,
            pendingCommissions: await AffiliateCommission.countDocuments({ status: 'pending' }),
            approvedCommissions: await AffiliateCommission.countDocuments({ status: 'approved' }),
        };

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('referrer', 'name email affiliateLevel')
            .populate('user', 'name email');

        const recentCommissions = await AffiliateCommission.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('affiliateId', 'name email affiliateLevel')
            .populate('orderId', 'totalAmount createdAt');

        return NextResponse.json({
            stats,
            recentOrders,
            recentCommissions
        });

    } catch (error) {
        console.error('Test stats error:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        await AffiliateCommission.deleteMany({});
        await Order.deleteMany({});

        return NextResponse.json({
            message: 'All test orders and commissions deleted successfully'
        });

    } catch (error) {
        console.error('Test reset error:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}
