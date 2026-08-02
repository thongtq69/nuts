import mongoose from 'mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import { buildManagedCustomerQuery } from '@/lib/customer-ownership';

export function getBangkokMonthRange(year: number, month: number) {
    const offsetMs = 7 * 60 * 60 * 1000;
    const start = new Date(Date.UTC(year, month - 1, 1) - offsetMs);
    const end = new Date(Date.UTC(year, month, 1) - offsetMs);
    return { start, end };
}
export async function getStaffMonthlyRevenue(staffId: string, year: number, month: number): Promise<number> {
    const staffObjectId = new mongoose.Types.ObjectId(staffId);
    const collaborators = await User.find({
        parentStaff: staffObjectId,
        affiliateLevel: 'collaborator',
    }).select('_id').lean();
    const collaboratorIds = collaborators.map((item) => String(item._id));
    const managedCustomers = await User.find(
        buildManagedCustomerQuery(staffId, collaboratorIds),
    ).select('_id').lean();

    const customerIds = managedCustomers.map((item) => item._id);
    const attributionIds = [staffObjectId, ...collaborators.map((item) => item._id)];
    const { start, end } = getBangkokMonthRange(year, month);

    const result = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: start, $lt: end },
                $and: [
                    {
                        $or: [
                            { user: { $in: customerIds } },
                            { userId: { $in: customerIds } },
                            { referrer: { $in: attributionIds } },
                        ],
                    },
                    {
                        $or: [
                            { paymentStatus: { $in: ['paid', 'completed'] } },
                            { status: { $in: ['completed', 'delivered'] } },
                        ],
                    },
                ],
            },
        },
        { $group: { _id: null, revenue: { $sum: '$totalAmount' } } },
    ]);

    return Math.max(0, Number(result[0]?.revenue || 0));
}
