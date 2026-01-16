import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';

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

        // Store previous status to detect changes
        const previousStatus = order.status;

        // Update order status
        order.status = status;

        // Handle Affiliate Commission
        // Trigger only if status changes to 'delivered' | 'completed' 
        // AND commission is pending AND there is a referrer
        if (
            (status === 'delivered' || status === 'completed') &&
            order.commissionStatus === 'pending' &&
            order.referrer &&
            order.commissionAmount &&
            order.commissionAmount > 0
        ) {
            const referrer = await User.findById(order.referrer);
            if (referrer) {
                referrer.walletBalance = (referrer.walletBalance || 0) + order.commissionAmount;
                referrer.totalCommission = (referrer.totalCommission || 0) + order.commissionAmount;
                await referrer.save();

                order.commissionStatus = 'approved';
            }
        }

        // Handle Order Cancellation (Revert commission if it was approved?)
        // For now complex logic is skipped, assuming only pending commissions are cancelled.
        if (status === 'cancelled' && order.commissionStatus === 'pending') {
            order.commissionStatus = 'cancelled';
        }

        await order.save();

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

        const order = await Order.findByIdAndDelete(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Order deleted successfully' });
    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
