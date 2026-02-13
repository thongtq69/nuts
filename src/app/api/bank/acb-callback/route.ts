import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import AffiliateCommission from '@/models/AffiliateCommission';
import mongoose from 'mongoose';

/**
 * ACB Bank Webhook Callback
 * Protocol: POST
 * URL: https://gonuts.vn/api/bank/acb-callback
 * Auth: x-api-key header
 */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const headers = Object.fromEntries(req.headers.entries());
        console.log('📬 Received ACB Callback Headers:', JSON.stringify(headers, null, 2));
        console.log('📬 Received ACB Callback Body:', JSON.stringify(body, null, 2));

        // 1.5 DB Logging for Debugging
        try {
            await dbConnect();
            const db = mongoose.connection.db;
            if (db) {
                await db.collection('acb_debug_logs').insertOne({
                    timestamp: new Date(),
                    headers: headers,
                    body: body,
                    ip: req.headers.get('x-forwarded-for') || 'unknown',
                    url: req.url
                });
            }
        } catch (dbErr) {
            console.error('Failed to log ACB debug info to DB:', dbErr);
        }

        /**
         * Standard Bank Request Body usually includes:
         * - transactionId: string
         * - amount: number
         * - description: string (Contains Order ID / Reference)
         * - transactionDate: string
         * - accountName/Number: string
         */

        // Adjust these based on ACB's actual request schema
        // Support both direct fields and nested requestParameters (from ACB Developer Portal)
        const params = body.requestParameters || {};
        const transactionId = body.transactionId || body.referenceCode || body.tranId || body.requestTrace || params.requestTrace || params.referenceCode;
        const amount = Number(body.amount || body.tranAmount || params.transactionAmount || params.amount || params.tranAmount || 0);
        const description = body.description || body.tranContent || params.description || params.tranContent || body.content || '';

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

        // 2. Logic: Identify Order from Description
        // Search pattern: GOXXXXXX (where X is alphanumeric, e.g., GO904721)
        const paymentRefMatch = description.match(/GO[A-Z0-9]{6}/i);
        let order = null;

        if (paymentRefMatch) {
            const refCode = paymentRefMatch[0].toUpperCase();
            console.log(`🔍 Searching for order with paymentRef: ${refCode}`);

            await dbConnect();
            order = await Order.findOne({
                paymentRef: refCode,
                paymentStatus: { $ne: 'paid' } // Search for non-paid orders
            }).sort({ createdAt: -1 });
        }

        // Step 2: Fallback to searching by order ID suffix if paymentRef not found
        if (!order) {
            const orderSuffixMatch = description.match(/[A-Z0-9]{6}/i);
            if (orderSuffixMatch) {
                const suffix = orderSuffixMatch[0].toUpperCase();
                console.log(`🔍 Fallback: Searching by order ID suffix: ${suffix}`);

                await dbConnect(); // Ensure DB is connected for fallback searches
                // Search for orders where the ID ends with this suffix
                const allOrders = await Order.find({ paymentStatus: { $ne: 'paid' } }).sort({ createdAt: -1 }).limit(100);
                order = allOrders.find(o => o._id.toString().toUpperCase().endsWith(suffix));
            }
        }

        // Step 3: Global Fallback by amount
        if (!order && amount > 0) {
            console.log(`🔍 Global Fallback: Searching by amount: ${amount}`);
            await dbConnect(); // Ensure DB is connected for fallback searches
            order = await Order.findOne({
                totalAmount: amount,
                paymentStatus: { $ne: 'paid' },
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within last 24h
            }).sort({ createdAt: -1 });
        }

        if (order) {
            console.log(`✅ Order found: ${order._id}. Updating status...`);

            // 3. Update Order Status
            order.paymentStatus = 'paid';
            order.acbTransactionNo = transactionId;
            // Update main status to 'confirmed' (which displays as 'Đã xác nhận' in the UI)
            if (order.status === 'pending' || order.status === 'processing') {
                order.status = 'confirmed';
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
