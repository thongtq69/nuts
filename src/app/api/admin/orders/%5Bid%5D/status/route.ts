import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { revalidatePath } from 'next/cache';

export async function POST(
    req: NextRequest,
    props: { params: Promise<any> }
) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;
        const formData = await req.formData();
        const status = formData.get('status') as string;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const order = await Order.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!order) {
            console.error(`Order ${id} not found`);
            return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        // Revalidate admin orders page and detail page
        revalidatePath('/admin/orders');
        revalidatePath(`/admin/orders/${id}`);

        // Redirect back to the order detail page
        return NextResponse.redirect(new URL(`/admin/orders/${id}`, req.url));

    } catch (error) {
        console.error('Error updating order status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
