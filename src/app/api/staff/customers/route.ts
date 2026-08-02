import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireStaffAuth } from '@/lib/auth-permissions';
import { buildManagedCustomerQuery } from '@/lib/customer-ownership';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
    const auth = await requireStaffAuth();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    await dbConnect();
    const search = request.nextUrl.searchParams.get('search')?.trim() || '';

    const collaborators = auth.user.role === 'admin'
        ? []
        : await User.find({ parentStaff: auth.user._id, affiliateLevel: 'collaborator' })
            .select('_id')
            .lean();
    const ownershipQuery = auth.user.role === 'admin'
        ? { role: 'user' }
        : buildManagedCustomerQuery(
            auth.user._id,
            collaborators.map((item: any) => String(item._id)),
        );
    const searchQuery = search
        ? {
            $or: [
                { name: { $regex: escapeRegExp(search), $options: 'i' } },
                { email: { $regex: escapeRegExp(search), $options: 'i' } },
                { phone: { $regex: escapeRegExp(search), $options: 'i' } },
            ],
        }
        : {};

    const customers: any[] = await User.find({ $and: [ownershipQuery, searchQuery] })
        .select('name email phone createdAt referrer parentStaff')
        .populate('referrer', 'name referralCode staffCode affiliateLevel')
        .sort({ createdAt: -1 })
        .lean();

    const ids = customers.map(customer => customer._id);
    const orderStats = ids.length
        ? await Order.aggregate([
            { $match: { $or: [{ user: { $in: ids } }, { userId: { $in: ids } }] } },
            {
                $group: {
                    _id: { $ifNull: ['$user', '$userId'] },
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                {
                                    $or: [
                                        { $in: ['$paymentStatus', ['paid', 'completed']] },
                                        { $in: ['$status', ['completed', 'delivered']] },
                                    ],
                                },
                                '$totalAmount',
                                0,
                            ],
                        },
                    },
                },
            },
        ])
        : [];
    const statsByUser = new Map(orderStats.map(stat => [String(stat._id), stat]));

    return NextResponse.json({
        customers: customers.map(customer => {
            const stats = statsByUser.get(String(customer._id)) || { totalOrders: 0, totalSpent: 0 };
            return {
                _id: String(customer._id),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                createdAt: customer.createdAt,
                referrer: customer.referrer
                    ? {
                        name: customer.referrer.name,
                        code: customer.referrer.staffCode || customer.referrer.referralCode,
                    }
                    : null,
                totalOrders: stats.totalOrders,
                totalSpent: stats.totalSpent,
            };
        }),
        total: customers.length,
    });
}
