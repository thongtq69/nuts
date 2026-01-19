import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';

async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'sale' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = user._id;

        // Find orders where this user is the referrer
        const orders = await Order.find({ referrer: userId })
            .sort({ createdAt: -1 })
            .lean();

        // Get commission info for these orders
        const orderIds = orders.map((o: any) => o._id);
        const commissions = await AffiliateCommission.find({
            orderId: { $in: orderIds },
            affiliateId: userId
        }).lean();

        const commissionMap = new Map();
        commissions.forEach((c: any) => {
            commissionMap.set(c.orderId.toString(), {
                amount: c.commissionAmount,
                rate: c.commissionRate,
                status: c.status
            });
        });

        // Format orders
        const formattedOrders = orders.map((order: any) => {
            const comm = commissionMap.get(order._id.toString()) || { amount: 0, rate: 0, status: 'pending' };
            return {
                _id: order._id.toString(),
                orderId: order._id.toString().slice(-8).toUpperCase(),
                customerName: order.shippingInfo?.fullName || 'Khách vãng lai',
                customerPhone: order.shippingInfo?.phone || '',
                customerAddress: order.shippingInfo ? 
                    `${order.shippingInfo.address || ''}, ${order.shippingInfo.district || ''}, ${order.shippingInfo.city || ''}` 
                    : '',
                items: order.items || [],
                subtotal: order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0,
                shippingFee: order.shippingFee || 0,
                discount: (order.originalTotalAmount || 0) - (order.totalAmount || 0),
                totalAmount: order.totalAmount || 0,
                paymentMethod: order.paymentMethod || 'cod',
                status: order.status || 'pending',
                commissionAmount: comm.amount || 0,
                commissionRate: comm.rate || 0,
                commissionStatus: comm.status || 'pending',
                createdAt: order.createdAt
            };
        });

        // Calculate stats
        const stats = {
            totalOrders: formattedOrders.length,
            totalRevenue: formattedOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0),
            totalCommission: formattedOrders.reduce((sum: number, o: any) => sum + o.commissionAmount, 0),
            pendingOrders: formattedOrders.filter((o: any) => ['pending', 'processing', 'shipping'].includes(o.status)).length
        };

        return NextResponse.json({
            orders: formattedOrders,
            stats
        });
    } catch (error) {
        console.error('Get agent orders error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
