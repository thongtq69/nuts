import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { notFound } from 'next/navigation';
import OrderDetailClient from './OrderDetailClient';

export const dynamic = 'force-dynamic';

async function getOrderById(id: string) {
    await dbConnect();
    const order = await Order.findById(id)
        .populate('user', 'name email')
        .lean();

    if (!order) return null;

    return {
        id: order._id.toString(),
        orderNumber: order._id.toString().slice(-8).toUpperCase(),
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
        subtotal: order.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        shippingFee: order.shippingFee || 0,
        discount: order.discount || 0,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod || 'COD',
        paymentStatus: order.paymentStatus || 'pending',
        note: order.note || '',
        voucherCode: order.voucherCode || '',
        createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : new Date().toISOString(),
    };
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
        notFound();
    }

    return <OrderDetailClient order={order} />;
}
