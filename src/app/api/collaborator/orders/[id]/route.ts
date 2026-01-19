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

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        const { id } = await params;

        if (!user || (user.role !== 'staff' && user.roleType !== 'collaborator' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Parse order ID
        let orderId: mongoose.Types.ObjectId | null = null;
        const cleanId = id.replace(/[^a-f0-9]/gi, '').slice(0, 24);
        if (cleanId.length === 24) {
            try {
                orderId = new mongoose.Types.ObjectId(cleanId);
            } catch (e) {
                // Invalid ObjectId
            }
        }

        if (!orderId) {
            return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
        }

        // Find the order
        const order = await Order.findById(orderId);
        
        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Check if this order was referred by this collaborator
        // The referrer field is a reference to User model
        const referrerId = (order.referrer as mongoose.Types.ObjectId)?._id?.toString() || (order.referrer as mongoose.Types.ObjectId)?.toString();
        const userId = user._id.toString();
        
        if (referrerId !== userId) {
            return NextResponse.json({ message: 'Bạn không có quyền xem đơn hàng này' }, { status: 403 });
        }

        // Get commission info
        const commission = await AffiliateCommission.findOne({
            orderId: orderId,
            affiliateId: user._id
        });

        const orderAny = order as any;
        
        // Format response
        const response = {
            orderId: order._id.toString().slice(-8).toUpperCase(),
            orderIdFull: order._id.toString(),
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            updatedAt: orderAny.updatedAt || order.createdAt,
            
            // Customer info (show full info for collaborator since they referred the customer)
            customer: {
                name: order.shippingInfo?.fullName || 'Khách vãng lai',
                phone: order.shippingInfo?.phone || '',
                address: order.shippingInfo ? 
                    `${order.shippingInfo.address || ''}, ${order.shippingInfo.district || ''}, ${order.shippingInfo.city || ''}` 
                    : ''
            },
            
            // Items
            items: order.items.map((item: any) => ({
                name: item.name,
                image: item.image,
                price: item.price,
                quantity: item.quantity,
                total: item.price * item.quantity,
                isAgent: item.isAgent || false
            })),
            
            // Pricing
            subtotal: order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
            shippingFee: order.shippingFee || 0,
            discount: (order.originalTotalAmount || 0) - (order.totalAmount || 0),
            totalAmount: order.totalAmount,
            
            // Commission info
            commission: commission ? {
                rate: commission.commissionRate,
                amount: commission.commissionAmount,
                status: commission.status,
                note: commission.note
            } : null,
            
            note: order.note || ''
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Get collaborator order detail error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
