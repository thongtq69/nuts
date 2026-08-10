import mongoose from 'mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import { buildManagedCustomerQuery } from '@/lib/customer-ownership';
import {
    getEligibleProductRevenue,
    type RevenueOrderInput,
} from '@/lib/staff-commission-rules';

export interface StaffRevenueOrder extends RevenueOrderInput {
    _id: mongoose.Types.ObjectId;
    items?: unknown[];
    shippingInfo?: {
        fullName?: string;
        phone?: string;
        address?: string;
        district?: string;
        city?: string;
    };
    paymentMethod?: string;
}

export function getBangkokMonthRange(year: number, month: number) {
    const offsetMs = 7 * 60 * 60 * 1000;
    const start = new Date(Date.UTC(year, month - 1, 1) - offsetMs);
    const end = new Date(Date.UTC(year, month, 1) - offsetMs);
    return { start, end };
}
export async function getStaffEligibleRevenueOrders(
    staffId: string,
    year: number,
    month: number,
): Promise<StaffRevenueOrder[]> {
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

    const orders = await Order.aggregate<StaffRevenueOrder>([
        {
            $match: {
                createdAt: { $gte: start, $lt: end },
                orderType: { $ne: 'membership' },
                status: { $nin: ['cancelled', 'canceled', 'refunded', 'returned', 'failed'] },
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
        {
            $project: {
                _id: 1,
                orderType: 1,
                status: 1,
                paymentStatus: 1,
                totalAmount: 1,
                shippingFee: 1,
                createdAt: 1,
                items: 1,
                shippingInfo: 1,
                paymentMethod: 1,
            },
        },
        { $sort: { createdAt: 1, _id: 1 } },
    ]);

    return orders.filter((order) => getEligibleProductRevenue(order) > 0);
}

export async function getStaffMonthlyRevenue(staffId: string, year: number, month: number): Promise<number> {
    const orders = await getStaffEligibleRevenueOrders(staffId, year, month);
    return orders.reduce((total, order) => total + getEligibleProductRevenue(order), 0);
}
