import { NextResponse } from 'next/server';
import { requireStaffAuth } from '@/lib/auth-permissions';
import dbConnect from '@/lib/db';
import {
    buildManagedCustomerQuery,
    buildManagedOrderQuery,
} from '@/lib/customer-ownership';
import Order from '@/models/Order';
import User from '@/models/User';

type StaffOrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

function normalizeOrderStatus(status: unknown): StaffOrderStatus {
    switch (String(status || '').trim().toLowerCase()) {
        case 'confirmed':
        case 'processing':
            return 'processing';
        case 'shipping':
        case 'shipped':
            return 'shipped';
        case 'completed':
        case 'delivered':
            return 'delivered';
        case 'cancelled':
        case 'refunded':
            return 'cancelled';
        default:
            return 'pending';
    }
}

function buildShippingAddress(shippingInfo: {
    address?: string;
    ward?: string;
    district?: string;
    city?: string;
} | undefined): string {
    if (!shippingInfo) return '';
    return [shippingInfo.address, shippingInfo.ward, shippingInfo.district, shippingInfo.city]
        .map((part) => String(part || '').trim())
        .filter(Boolean)
        .join(', ');
}

export async function GET() {
    try {
        const auth = await requireStaffAuth();
        if (!auth.user) {
            return NextResponse.json({ message: auth.error || 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let orderQuery: Record<string, unknown> = {};
        if (auth.user.role === 'staff') {
            const collaborators = await User.find({
                parentStaff: auth.user._id,
                affiliateLevel: 'collaborator',
            }).select('_id').lean();
            const collaboratorIds = collaborators.map((collaborator) => String(collaborator._id));
            const managedCustomers = await User.find(
                buildManagedCustomerQuery(auth.user._id, collaboratorIds),
            ).select('_id').lean();
            const managedCustomerIds = managedCustomers.map((customer) => String(customer._id));

            orderQuery = buildManagedOrderQuery(
                auth.user._id,
                collaboratorIds,
                managedCustomerIds,
            );
        }

        const orders = await Order.find(orderQuery)
            .select('shippingInfo items totalAmount status createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            orders: orders.map((order) => ({
                _id: String(order._id),
                orderId: String(order._id).slice(-8).toUpperCase(),
                customerName: order.shippingInfo?.fullName || 'Khách vãng lai',
                customerPhone: order.shippingInfo?.phone || '',
                shippingAddress: buildShippingAddress(order.shippingInfo),
                items: (order.items || []).map((item) => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                totalAmount: order.totalAmount || 0,
                status: normalizeOrderStatus(order.status),
                createdAt: order.createdAt,
            })),
        });
    } catch (error) {
        console.error('Get staff orders error:', error);
        return NextResponse.json({ message: 'Lỗi khi tải danh sách đơn hàng' }, { status: 500 });
    }
}
