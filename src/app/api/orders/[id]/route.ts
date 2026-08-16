import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { activateMembershipOrder, MembershipActivationError } from '@/lib/membership-activation';
import { isConfirmedPaymentStatus } from '@/lib/customer-ownership';
import {
    removeAffiliateCommissionsForOrder,
    syncAffiliateCommissionsForOrderStatus,
} from '@/lib/affiliate-commission-lifecycle';
import { applyOrderCancellationEffects, cancelOrder } from '@/lib/order-cancellation';

// GET single order
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const decoded = await verifyToken(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();
        const order = await Order.findById(id).populate('user', 'name email');

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // An order carries the customer's name, phone and address, so only the
        // owner or a back-office account may read it.
        const ownerId = (order.user as any)?._id ?? order.user;
        const isOwner = ownerId && String(ownerId) === String(decoded.id);
        if (!isOwner && !['admin', 'staff', 'sale'].includes(decoded.role)) {
            return NextResponse.json({ error: 'Không có quyền xem đơn hàng này' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
    }
}

// PATCH - Update order (status, payment, etc.)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify admin
        const decoded = await verifyToken(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();
        const body = await request.json();
        
        const order = await Order.findById(id);
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const isMembershipOrder = order.orderType === 'membership';

        if (isMembershipOrder && body.status === 'completed') {
            if (!isConfirmedPaymentStatus(order.paymentStatus)) {
                return NextResponse.json(
                    { error: 'Chưa xác nhận thanh toán nên không thể hoàn thành hoặc tạo voucher' },
                    { status: 409 },
                );
            }

            const activation = await activateMembershipOrder(String(order._id));
            const activatedOrder = await Order.findById(order._id);
            return NextResponse.json({
                success: true,
                message: 'Đã hoàn thành và kích hoạt gói hội viên',
                order: activatedOrder,
                activation,
            });
        }

        if (body.status === 'cancelled') {
            const effects = await cancelOrder(order, 'admin');
            return NextResponse.json({
                success: true,
                message: 'Đã hủy đơn hàng',
                order,
                effects,
            });
        }

        // Admin explicitly confirms receipt of payment before activation.
        if (isMembershipOrder && body.status === 'paid') {
            order.status = 'paid';
            order.paymentStatus = 'paid';
        } else if (body.status) {
            order.status = body.status;
        }
        if (body.paymentStatus) order.paymentStatus = body.paymentStatus;
        if (body.shippingInfo) order.shippingInfo = { ...order.shippingInfo, ...body.shippingInfo };
        if (body.note !== undefined) order.note = body.note;

        if (body.status) {
            await syncAffiliateCommissionsForOrderStatus(order, body.status);
        }

        await order.save();

        return NextResponse.json({ 
            success: true, 
            message: 'Order updated successfully',
            order 
        });
    } catch (error) {
        if (error instanceof MembershipActivationError) {
            return NextResponse.json({ error: error.message }, { status: error.status });
        }
        console.error('Update order error:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

// DELETE order
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verify admin
        const decoded = await verifyToken(request);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();
        const order = await Order.findById(id);
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Give back stock and vouchers before the order disappears, otherwise
        // the customer silently loses both.
        await applyOrderCancellationEffects(order, 'admin');
        await removeAffiliateCommissionsForOrder(order);
        await order.deleteOne();

        return NextResponse.json({
            success: true,
            message: 'Order deleted successfully'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
