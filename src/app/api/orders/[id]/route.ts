import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { verifyToken } from '@/lib/auth';
import { activateMembershipOrder, MembershipActivationError } from '@/lib/membership-activation';
import { isConfirmedPaymentStatus } from '@/lib/customer-ownership';

// GET single order
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await dbConnect();
        const order = await Order.findById(id).populate('user', 'name email');
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
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
        const order = await Order.findByIdAndDelete(id);
        
        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        return NextResponse.json({ 
            success: true, 
            message: 'Order deleted successfully' 
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
