import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';

/**
 * ACB Bank Webhook Callback
 * Protocol: POST
 * URL: https://gonuts.vn/api/bank/acb-callback
 * Auth: x-api-key header
 */

export async function POST(req: Request) {
    try {
        // 1. Verify Authentication
        const apiKey = req.headers.get('x-api-key');
        const SECURE_TOKEN = process.env.ACB_CALLBACK_TOKEN || 'acb_gonuts_callback_2026_secure_key';

        if (apiKey !== SECURE_TOKEN) {
            console.warn('❌ ACB Callback: Unauthorized access attempt.');
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        console.log('📬 Received ACB Callback:', JSON.stringify(body, null, 2));

        /**
         * Standard Bank Request Body usually includes:
         * - transactionId: string
         * - amount: number
         * - description: string (Contains Order ID / Reference)
         * - transactionDate: string
         * - accountName/Number: string
         */

        // Adjust these based on ACB's actual request schema
        const transactionId = body.transactionId || body.referenceCode || body.tranId;
        const amount = Number(body.amount || body.tranAmount);
        const description = body.description || body.tranContent || '';

        if (!description) {
            console.error('❌ ACB Callback: Missing description in payload.');
            return NextResponse.json({
                "timestamp": new Date().toISOString(),
                "responseCode": "00000001", // Custom error code
                "message": "Missing description",
                "responseBody": {
                    "index": 0,
                    "referenceCode": transactionId || "none"
                }
            });
        }

        await dbConnect();

        // 2. Logic: Identify Order from Description
        // Step 1: Try to match a 6-character alphanumeric pattern (common for the suffix used in emails)
        // Regex looks for "GN" or just a 6-char hex/alphanum sequence
        const orderSuffixMatch = description.match(/[A-Z0-9]{6}/i);
        let order = null;

        if (orderSuffixMatch) {
            const suffix = orderSuffixMatch[0].toUpperCase();
            console.log(`🔍 Searching for order with suffix: ${suffix}`);

            // Search for orders where the ID ends with this suffix
            const allOrders = await Order.find({ paymentStatus: 'pending' }).sort({ createdAt: -1 }).limit(100);
            order = allOrders.find(o => o._id.toString().toUpperCase().endsWith(suffix));
        }

        // Step 2: Fallback to searching by total amount if suffix not found
        if (!order && amount > 0) {
            console.log(`🔍 Fallback: Searching by amount: ${amount}`);
            order = await Order.findOne({
                totalAmount: amount,
                paymentStatus: 'pending',
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24h
            }).sort({ createdAt: -1 });
        }

        if (order) {
            console.log(`✅ Order found: ${order._id}. Updating status...`);

            // 3. Update Order Status
            order.paymentStatus = 'paid';
            order.acbTransactionNo = transactionId;
            // Only update main status if it was pending
            if (order.status === 'pending') {
                order.status = 'processing';
            }
            await order.save();

            // 4. Update Commissions (Optional: Mark as confirmed payment)
            await AffiliateCommission.updateMany(
                { orderId: order._id },
                { $set: { note: (order.note || '') + ` | Paid via ACB (${transactionId})` } }
            );

            console.log(`🎉 Order ${order._id} marked as PAID successfully.`);
        } else {
            console.warn(`⚠️ No matching pending order found for content: "${description}" and amount: ${amount}`);
        }

        // 4. Mandatory Response Body as per ACB requirements
        return NextResponse.json({
            "timestamp": new Date().toISOString(),
            "responseCode": "00000000",
            "message": "Success",
            "responseBody": {
                "index": 1,
                "referenceCode": transactionId || "processed"
            }
        });

    } catch (error: any) {
        console.error('🔥 ACB Callback Error:', error);
        return NextResponse.json({
            "timestamp": new Date().toISOString(),
            "responseCode": "99999999",
            "message": "Internal System Error: " + error.message,
            "responseBody": {
                "index": 0,
                "referenceCode": "error"
            }
        }, { status: 500 });
    }
}
