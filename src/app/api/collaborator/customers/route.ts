import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import { requireCollaboratorAuth } from '@/lib/auth-permissions';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
    const auth = await requireCollaboratorAuth();
    if (!auth.user) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    await dbConnect();
    const search = request.nextUrl.searchParams.get('search')?.trim() || '';
    const searchQuery = search
        ? {
            $or: [
                { name: { $regex: escapeRegExp(search), $options: 'i' } },
                { email: { $regex: escapeRegExp(search), $options: 'i' } },
                { phone: { $regex: escapeRegExp(search), $options: 'i' } },
            ],
        }
        : {};

    // A collaborator may only see customer accounts attributed directly to
    // their own referral identity. Never include customers of another CTV or
    // customers that merely belong to the same parent staff member.
    const customers = await User.find({
        $and: [
            {
                role: 'user',
                affiliateLevel: { $ne: 'collaborator' },
                referrer: auth.user._id,
            },
            searchQuery,
        ],
    })
        .select('name email phone createdAt')
        .sort({ createdAt: -1 })
        .lean();

    const customerIds = customers.map(customer => customer._id);
    const orderStats = customerIds.length
        ? await Order.aggregate([
            {
                $match: {
                    $or: [
                        { user: { $in: customerIds } },
                        { userId: { $in: customerIds } },
                    ],
                },
            },
            {
                $group: {
                    _id: { $ifNull: ['$user', '$userId'] },
                    totalOrders: { $sum: 1 },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $not: [{ $in: ['$status', ['cancelled', 'canceled']] }] },
                                        {
                                            $or: [
                                                { $in: ['$paymentStatus', ['paid', 'completed']] },
                                                { $in: ['$status', ['completed', 'delivered']] },
                                            ],
                                        },
                                    ],
                                },
                                '$totalAmount',
                                0,
                            ],
                        },
                    },
                    lastOrderAt: { $max: '$createdAt' },
                },
            },
        ])
        : [];
    const statsByCustomer = new Map(orderStats.map(stat => [String(stat._id), stat]));

    return NextResponse.json({
        customers: customers.map(customer => {
            const stats = statsByCustomer.get(String(customer._id)) || {
                totalOrders: 0,
                totalSpent: 0,
                lastOrderAt: null,
            };

            return {
                _id: String(customer._id),
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                createdAt: customer.createdAt,
                totalOrders: stats.totalOrders,
                totalSpent: stats.totalSpent,
                lastOrderAt: stats.lastOrderAt,
            };
        }),
        total: customers.length,
    });
}
