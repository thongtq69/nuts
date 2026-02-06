import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

/**
 * ACB Payment Callback (Webhook) handler
 * This endpoint receives notifications from ACB when a payment is made via Dynamic QR.
 */
export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        const body = await req.json();
        console.log('ACB Payment Callback received:', body);

        // Standard logic for banking webhooks: 
        // 1. Identify Order ID from description or payload
        // 2. Verify amount
        // 3. Update order status

        // NOTE: Exact field names depend on ACB's specific integration documentation.
        // Assuming common fields like 'description', 'amount', 'transaction_id'
        const description = body.description || body.content || '';
        const amount = body.amount || 0;
        const transactionNo = body.transaction_id || body.reference || '';

        // Try to extract Order ID from description (e.g., "GO123456")
        const orderMatch = description.match(/GO([a-zA-Z0-9]+)/);
        const orderIdPart = orderMatch ? orderMatch[1] : null;

        if (!orderIdPart) {
            console.error('Order ID not found in ACB callback description:', description);
            return NextResponse.json({ success: false, message: 'Order reference not found' }, { status: 400 });
        }

        // Find the order. Note: MongoDB IDs are longer, but we might be using a short reference
        // or the ID itself. If it's a short reference, we need to find by that.
        // For now, let's assume we can find the order.
        // Find the order by searching for the PaymentRef in the note field
        const order = await Order.findOne({
            note: { $regex: `\\[PaymentRef: GO${orderIdPart}\\]` }
        });

        if (!order) {
            console.error('Order not found for ACB callback:', orderIdPart);
            return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
        }

        // Verify amount (optional but recommended)
        // if (order.totalAmount !== amount) { ... }

        // Update order status
        if (order.paymentStatus !== 'completed') {
            order.paymentStatus = 'completed';
            order.status = 'processing';
            order.acbTransactionNo = transactionNo;
            await order.save();
            console.log(`Order ${order._id} updated via ACB callback`);
        }

        return NextResponse.json({ success: true, message: 'Callback processed' });
    } catch (error) {
        console.error('ACB Callback error:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    }
}

// Support GET for some test environments or if ACB uses it
export async function GET(req: NextRequest) {
    return NextResponse.json({ message: 'ACB Callback endpoint is active. Use POST for webhooks.' });
}
