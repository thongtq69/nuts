import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { cancelOrder, describeCustomerCancelBlock } from '@/lib/order-cancellation';

// POST - customer cancels their own order
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ message: 'Không tìm thấy đơn hàng' }, { status: 404 });
        }

        const isOwner = order.user && String(order.user) === String(decoded.id);
        if (!isOwner && decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Bạn không có quyền hủy đơn hàng này' }, { status: 403 });
        }

        const block = describeCustomerCancelBlock(order);
        if (block && decoded.role !== 'admin') {
            return NextResponse.json({ message: block }, { status: 409 });
        }

        const effects = await cancelOrder(order, isOwner ? 'customer' : 'admin');

        return NextResponse.json({
            success: true,
            message: effects.voucherRestored
                ? 'Đã hủy đơn hàng và hoàn lại voucher chưa dùng.'
                : 'Đã hủy đơn hàng.',
            order: { _id: String(order._id), status: order.status },
            effects,
        });
    } catch (error) {
        console.error('Cancel order error:', error);
        return NextResponse.json({ message: 'Lỗi khi hủy đơn hàng' }, { status: 500 });
    }
}
