import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import OrderDetailClient from './OrderDetailClient';

export const dynamic = 'force-dynamic';

async function getOrderById(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;

    await dbConnect();
    const order = await Order.findById(id)
        .populate('user', 'name email')
        .lean();

    if (!order) return null;

    return {
        id: order._id.toString(),
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
        orderType: (order as any).orderType || 'product',
        customer: {
            name: (order.user as any)?.name || order.shippingInfo?.fullName || 'Khách vãng lai',
            email: (order.user as any)?.email || '',
            phone: order.shippingInfo?.phone || '',
        },
        shippingInfo: order.shippingInfo,
        items: order.items.map((item: any) => ({
            id: item.productId?.toString() || '',
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity
        })),
        packageInfo: (order as any).packageInfo || null,
        subtotal: order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        shippingFee: order.shippingFee || 0,
        discount: (order as any).discount || 0,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod || 'COD',
        paymentStatus: order.paymentStatus || 'pending',
        note: order.note || '',
        voucherCode: (order as any).voucherCode || '',
        membershipActivatedAt: (order as any).membershipActivatedAt
            ? new Date((order as any).membershipActivatedAt).toISOString()
            : null,
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: (order as any).updatedAt ? new Date((order as any).updatedAt).toISOString() : new Date().toISOString(),
    };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let order: Awaited<ReturnType<typeof getOrderById>>;
    try {
        order = await getOrderById(id);
    } catch (error) {
        // Next only shows a digest to the browser, so record the real cause here
        // or an intermittent database drop stays undiagnosable.
        console.error(`Admin order detail failed for ${id}:`, error);
        throw error;
    }

    if (!order) {
        notFound();
    }

    return <OrderDetailClient order={order} />;
}
