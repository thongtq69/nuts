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

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = user._id as mongoose.Types.ObjectId;

        // Get all collaborators under this staff
        const collaborators = await User.find({
            parentStaff: userId,
            affiliateLevel: 'collaborator'
        } as any).select('_id');

        const collaboratorIds = collaborators.map((c: any) => c._id);
        const allAffiliates = [userId, ...collaboratorIds];

        // Find the order
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

        const order = await Order.findById(orderId);
        
        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Check if this order belongs to the staff's team
        const referrerId = (order.referrer as mongoose.Types.ObjectId)?.toString();
        const hasAccess = allAffiliates.some((aid: any) => 
            (aid as mongoose.Types.ObjectId).toString() === referrerId
        );

        if (!hasAccess) {
            return NextResponse.json({ message: 'Bạn không có quyền xem đơn hàng này' }, { status: 403 });
        }

        // Get commission info for this order
        const commissions = await AffiliateCommission.find({
            orderId: orderId,
            affiliateId: { $in: allAffiliates }
        });

        // Get referrer info
        let referrer: any = null;
        if (order.referrer) {
            referrer = await User.findById(order.referrer).select('name email referralCode phone roleType affiliateLevel');
        }

        const orderAny = order as any;
        
        // Format response with masked sensitive info
        const response = {
            orderId: order._id.toString().slice(-8).toUpperCase(),
            orderIdFull: order._id.toString(),
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            createdAt: order.createdAt,
            updatedAt: orderAny.updatedAt || order.createdAt,
            
            // Customer info (masked for privacy)
            customer: {
                name: maskName(order.shippingInfo?.fullName || 'Khách vãng lai'),
                phone: maskPhone(order.shippingInfo?.phone || ''),
                address: order.shippingInfo ? 
                    `${maskAddress(order.shippingInfo.address || '')}, ${order.shippingInfo.district || ''}, ${order.shippingInfo.city || ''}` 
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
            discount: orderAny.discount || 0,
            totalAmount: order.totalAmount,
            
            // Affiliate info
            referrer: referrer ? {
                name: referrer.name,
                code: referrer.referralCode,
                level: referrer.affiliateLevel || 'direct',
                role: referrer.role
            } : null,
            
            // Commission details
            commissions: commissions.map((c: any) => ({
                affiliateName: (c.affiliateId as mongoose.Types.ObjectId).toString() === userId.toString() ? user.name : 'CTV',
                rate: c.commissionRate,
                amount: c.commissionAmount,
                status: c.status,
                note: c.note
            })),
            
            note: order.note || ''
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Get order detail error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}

function maskName(name: string): string {
    if (!name || name.length < 2) return '***';
    const firstChar = name.charAt(0);
    const lastChar = name.charAt(name.length - 1);
    const masked = '*'.repeat(Math.min(name.length - 2, 5));
    return `${firstChar}${masked}${lastChar}`;
}

function maskPhone(phone: string): string {
    if (!phone || phone.length < 4) return '***';
    return '***' + phone.slice(-4);
}

function maskAddress(address: string): string {
    if (!address || address.length < 4) return '***';
    return address.slice(0, Math.min(10, Math.floor(address.length / 2))) + '***';
}
