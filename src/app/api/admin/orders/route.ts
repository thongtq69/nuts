import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sendOrderStatusEmail } from '@/lib/email';

// Helper to check if user is admin
async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return false;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        return decoded.role === 'admin';
    } catch {
        return false;
    }
}

// GET all orders for admin
export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });

        const formattedOrders = orders.map(order => ({
            id: order._id.toString(),
            customer: (order.user as any)?.name || order.shippingInfo?.fullName || 'Khách vãng lai',
            email: (order.user as any)?.email || '',
            total: order.totalAmount,
            status: order.status,
            paymentMethod: order.paymentMethod || 'COD',
            date: order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A',
            time: order.createdAt ? new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '',
            itemCount: order.items.length
        }));

        return NextResponse.json(formattedOrders);
    } catch (error) {
        console.error('Get admin orders error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}

// PATCH - Update order status
export async function PATCH(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { orderId, status } = await req.json();

        if (!orderId || !status) {
            return NextResponse.json({ message: 'Missing orderId or status' }, { status: 400 });
        }

        const validStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Gửi email thông báo khi đơn hàng được xác nhận
        if (status === 'confirmed' || status === 'shipping' || status === 'completed' || status === 'cancelled') {
            try {
                // Lấy email từ shippingInfo hoặc từ user
                let customerEmail = order.shippingInfo?.email;
                let customerName = order.shippingInfo?.fullName;

                if (!customerEmail && order.user) {
                    const user = await User.findById(order.user);
                    if (user) {
                        customerEmail = user.email;
                        customerName = user.name || customerName;
                    }
                }

                if (customerEmail) {
                    const statusMessages: Record<string, string> = {
                        'confirmed': 'đã được xác nhận và đang được chuẩn bị',
                        'shipping': 'đang được giao đến bạn',
                        'completed': 'đã được giao thành công',
                        'cancelled': 'đã bị hủy'
                    };

                    await sendOrderStatusEmail(customerEmail, {
                        orderId: order._id.toString().slice(-6).toUpperCase(),
                        customerName: customerName || 'Khách hàng',
                        status: status,
                        statusMessage: statusMessages[status] || 'đã được cập nhật'
                    });
                }
            } catch (emailError) {
                console.error('Failed to send order status email:', emailError);
                // Không throw lỗi để không ảnh hưởng đến việc cập nhật đơn hàng
            }
        }

        return NextResponse.json({
            message: 'Cập nhật trạng thái thành công',
            order: {
                id: order._id.toString(),
                status: order.status
            }
        });
    } catch (error) {
        console.error('Update order status error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi cập nhật trạng thái' },
            { status: 500 }
        );
    }
}
