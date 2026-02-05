import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

// POST - Lookup orders by email and phone (for guest users)
export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, phone } = await req.json();

        if (!email || !phone) {
            return NextResponse.json(
                { message: 'Vui lòng nhập email và số điện thoại' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        // Normalize phone number (remove spaces)
        const normalizedPhone = phone.replace(/\s/g, '');
        
        // Find orders matching email and phone
        const orders = await Order.find({
            $and: [
                { 'shippingInfo.email': { $regex: new RegExp('^' + email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } },
                { 'shippingInfo.phone': { $regex: normalizedPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') } }
            ]
        }).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return NextResponse.json(
                { message: 'Không tìm thấy đơn hàng nào với thông tin này' },
                { status: 404 }
            );
        }

        // Format orders for response
        const formattedOrders = orders.map(order => ({
            id: order._id.toString(),
            orderId: order._id.toString().slice(-6).toUpperCase(),
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            shippingFee: order.shippingFee,
            createdAt: order.createdAt,
            shippingInfo: {
                fullName: order.shippingInfo?.fullName,
                phone: order.shippingInfo?.phone,
                email: order.shippingInfo?.email,
                address: order.shippingInfo?.address,
                ward: order.shippingInfo?.ward,
                district: order.shippingInfo?.district,
                city: order.shippingInfo?.city,
            },
            items: order.items.map((item: any) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
            })),
            note: order.note,
        }));

        return NextResponse.json({
            success: true,
            orders: formattedOrders,
            count: formattedOrders.length
        });
    } catch (error) {
        console.error('Guest order lookup error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi tra cứu đơn hàng' },
            { status: 500 }
        );
    }
}
