import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import AffiliateCommission from '@/models/AffiliateCommission';
import { sendOrderStatusEmail } from '@/lib/email';

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

        // Handle Affiliate Commission - Support 2-level system
        // Trigger only if status changes to 'delivered' | 'completed'
        // AND there are pending commissions for this order
        if (status === 'delivered' || status === 'completed') {
            // Find all commission records for this order
            const commissions = await AffiliateCommission.find({
                orderId: order._id,
                status: 'pending'
            });

            if (commissions.length > 0) {
                // Approve all pending commissions and credit wallets
                for (const comm of commissions) {
                    const affiliate = await User.findById(comm.affiliateId);
                    if (affiliate) {
                        affiliate.walletBalance = (affiliate.walletBalance || 0) + comm.commissionAmount;
                        affiliate.totalCommission = (affiliate.totalCommission || 0) + comm.commissionAmount;
                        await affiliate.save();

                        // Update commission status
                        comm.status = 'approved';
                        await comm.save();
                    }
                }

                // Update order commission status
                order.commissionStatus = 'approved';
            }
        }

        // Handle Order Cancellation
        if (status === 'cancelled') {
            // Find all pending commissions for this order and mark as rejected
            const pendingCommissions = await AffiliateCommission.find({
                orderId: order._id,
                status: 'pending'
            });

            for (const comm of pendingCommissions) {
                comm.status = 'rejected';
                await comm.save();
            }

            order.commissionStatus = 'cancelled';
        }

        await order.save();

        const statusMessages: Record<string, string> = {
            'pending': 'đang chờ xử lý',
            'processing': 'đang được xử lý',
            'shipped': 'đã được gửi đi',
            'delivered': 'đã giao thành công',
            'cancelled': 'đã bị hủy',
        };

        if (order.user) {
            try {
                const user = await User.findById(order.user);
                if (user && user.email) {
                    await sendOrderStatusEmail(user.email, {
                        orderId: order._id.toString().slice(-6).toUpperCase(),
                        customerName: order.shippingInfo.fullName,
                        status: status,
                        statusMessage: statusMessages[status] || `đã chuyển sang trạng thái ${status}`,
                    });
                }
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
