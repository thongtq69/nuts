import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';
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
        } as any).select('_id name email referralCode');

        const collaboratorIds = collaborators.map((c: any) => c._id);

        // Get all referral codes (staff's own + all collaborators')
        const allCodes = [
            user.referralCode,
            ...collaborators.map((c: any) => c.referralCode).filter(Boolean)
        ];

        // Get all commissions for staff (from their own referrals and from collaborator referrals)
        const commissions = await AffiliateCommission.find({
            $or: [
                { affiliateId: user._id },
                { 
                    affiliateId: { $in: collaboratorIds },
                    note: { $regex: 'Collaborator commission' }
                }
            ]
        })
        .populate({
            path: 'orderId',
            select: 'totalAmount status createdAt items shippingInfo paymentMethod'
        })
        .sort({ createdAt: -1 });

        const formattedCommissions = commissions.map((comm: any) => {
            const order = comm.orderId || {};
            return {
                id: comm._id.toString(),
                orderId: order._id?.toString().slice(-8).toUpperCase() || 'N/A',
                orderValue: comm.orderValue || order.totalAmount || 0,
                commissionRate: comm.commissionRate,
                commissionAmount: comm.commissionAmount,
                status: comm.status,
                note: comm.note,
                orderStatus: order.status || 'unknown',
                orderItems: order.items || [],
                customerName: order.shippingInfo?.fullName || 'Khách vãng lai',
                customerPhone: order.shippingInfo?.phone || '',
                customerAddress: order.shippingInfo ? 
                    `${order.shippingInfo.address || ''}, ${order.shippingInfo.district || ''}, ${order.shippingInfo.city || ''}` : '',
                paymentMethod: order.paymentMethod || 'cod',
                createdAt: comm.createdAt
            };
        });

        // Calculate totals
        const totalPending = commissions.filter((c: any) => c.status === 'pending').reduce((sum: number, c: any) => sum + c.commissionAmount, 0);
        const totalApproved = commissions.filter((c: any) => c.status === 'approved').reduce((sum: number, c: any) => sum + c.commissionAmount, 0);
        const totalPaid = commissions.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + c.commissionAmount, 0);
        const totalAll = commissions.reduce((sum: number, c: any) => sum + c.commissionAmount, 0);

        return NextResponse.json({
            commissions: formattedCommissions,
            stats: {
                totalPending,
                totalApproved,
                totalPaid,
                totalAll
            }
        });
    } catch (error) {
        console.error('Get staff commissions error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
