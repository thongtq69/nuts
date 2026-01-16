import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to get current user
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

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Get all collaborators under this staff
        const collaborators = await User.find({
            parentStaff: user._id,
            affiliateLevel: 'collaborator'
        } as any).select('name email referralCode createdAt');

        // Get all referral codes (staff's own + all collaborators')
        const allCodes = [
            user.referralCode,
            ...collaborators.map(c => c.referralCode)
        ].filter(Boolean);

        // Get orders with these referral codes
        const referrers = await User.find({
            referralCode: { $in: allCodes }
        } as any).select('_id referralCode');

        const referrerIds = referrers.map(r => r._id);
        const referrerCodeMap = Object.fromEntries(referrers.map(r => [r._id.toString(), r.referralCode]));

        // Get all orders from team
        const orders = await Order.find({
            referrer: { $in: referrerIds }
        }).sort({ createdAt: -1 }).limit(100);

        // Calculate stats
        const totalOrders = orders.length;
        const teamRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // Get commissions
        const commissions = await AffiliateCommission.find({
            affiliateId: user._id
        });

        const totalCommission = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

        // Commission data for chart (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentCommissions = await AffiliateCommission.aggregate([
            {
                $match: {
                    affiliateId: user._id,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%d/%m", date: "$createdAt" } },
                    commission: { $sum: "$commissionAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const commissionData = recentCommissions.map(item => ({
            date: item._id,
            commission: item.commission
        }));

        // Get collaborator stats
        const collaboratorStats = await Promise.all(
            collaborators.map(async (collab) => {
                const collabOrders = await Order.find({ referrer: collab._id });
                return {
                    id: collab._id.toString(),
                    name: collab.name,
                    code: collab.referralCode || '',
                    orders: collabOrders.length,
                    revenue: collabOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
                };
            })
        );

        return NextResponse.json({
            totalCommission,
            walletBalance: user.walletBalance || 0,
            totalCollaborators: collaborators.length,
            totalOrders,
            teamRevenue,
            commissionData,
            collaborators: collaboratorStats.slice(0, 5) // Top 5 for dashboard
        });
    } catch (error) {
        console.error('Get staff stats error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
