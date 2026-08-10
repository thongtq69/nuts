import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { sendOrderStatusEmail } from '@/lib/email';
import {
    removeAffiliateCommissionsForOrder,
    syncAffiliateCommissionsForOrderStatus,
} from '@/lib/affiliate-commission-lifecycle';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const { status } = await req.json();

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Update order status
        order.status = status;
        await syncAffiliateCommissionsForOrderStatus(order, status);

        await order.save();

        const statusMessages: Record<string, string> = {
            'pending': 'đang chờ xử lý',
            'processing': 'đang được xử lý',
            'shipped': 'đã được gửi đi',
            'delivered': 'đã giao thành công',
            'cancelled': 'đã bị hủy',
        };

        const recipientEmail = order.shippingInfo?.email;

        if (recipientEmail) {
            try {
                await sendOrderStatusEmail(recipientEmail, {
                    orderId: order._id.toString().slice(-6).toUpperCase(),
                    customerName: order.shippingInfo.fullName,
                    status: status,
                    statusMessage: statusMessages[status] || `đã chuyển sang trạng thái ${status}`,
                });
            } catch (emailError) {
                console.error('Failed to send order status email:', emailError);
            }
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        await removeAffiliateCommissionsForOrder(order);
        await order.deleteOne();

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
