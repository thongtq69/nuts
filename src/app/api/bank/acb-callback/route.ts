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

export async function GET(req: Request) {
    return NextResponse.json({
        message: "ACB Webhook endpoint is active",
        status: "success",
        timestamp: new Date().toISOString()
    });
}

export async function POST(req: Request) {
    try {
        let body: any = {};
        try {
            const rawBody = await req.text();
            if (rawBody) {
                body = JSON.parse(rawBody);
            }
        } catch (e) {
            console.warn('⚠️ ACB Callback: Failed to parse JSON body or body is empty');
        }
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
         * ACB sends webhook in multiple formats:
         * 
         * FORMAT 1 - Real ACB Webhook (production):
         * {
         *   "requestMeta": { "clientRequestId": "...", "checksum": "..." },
         *   "requests": [{
         *     "requestMeta": { "requestType": "NOTIFICATION", "requestCode": "TRANSACTION_UPDATE" },
         *     "requestParams": {
         *       "transactions": [{
         *         "transactionStatus": "COMPLETED",
         *         "transactionCode": 3281,
         *         "amount": 372200,
         *         "transactionContent": "THANH TOAN DON HANG GO9D5C03",
         *         "debitOrCredit": "credit",
         *         ...
         *       }],
         *       "pagination": { ... }
         *     }
         *   }]
         * }
         * 
         * FORMAT 2 - Simple/Test format:
         * { "tranId": "...", "tranAmount": 372200, "tranContent": "..." }
         * 
         * FORMAT 3 - Developer Portal sandbox:
         * { "requestParameters": { "transactionAmount": 372200, "description": "..." } }
         */

        let transactionId = '';
        let amount = 0;
        let description = '';

        // FORMAT 1: Real ACB Webhook (deeply nested)
        if (body.requests && Array.isArray(body.requests) && body.requests.length > 0) {
            const request = body.requests[0];
            const transactions = request?.requestParams?.transactions;
            if (transactions && Array.isArray(transactions) && transactions.length > 0) {
                const txn = transactions[0];
                transactionId = String(txn.transactionCode || body.requestMeta?.clientRequestId || '');
                amount = Number(txn.amount || 0);
                description = txn.transactionContent || '';
                console.log(`📦 ACB Format 1 (Real Webhook) detected. TxnCode: ${transactionId}, Amount: ${amount}, Content: "${description}"`);
            }
        }

        // FORMAT 2: Simple/Test format
        if (!description) {
            transactionId = body.transactionId || body.referenceCode || body.tranId || body.requestTrace || '';
            amount = Number(body.amount || body.tranAmount || 0);
            description = body.description || body.tranContent || body.content || '';
            if (description) {
                console.log(`📦 ACB Format 2 (Simple) detected. TxnId: ${transactionId}, Amount: ${amount}, Content: "${description}"`);
            }
        }

        // FORMAT 3: Developer Portal sandbox (requestParameters)
        if (!description && body.requestParameters) {
            const params = body.requestParameters;
            transactionId = body.requestTrace || params.requestTrace || params.referenceCode || '';
            amount = Number(params.transactionAmount || params.amount || params.tranAmount || 0);
            description = params.description || params.tranContent || '';
            if (description) {
                console.log(`📦 ACB Format 3 (Dev Portal) detected. TxnId: ${transactionId}, Amount: ${amount}, Content: "${description}"`);
            }
        }

        if (!description) {
            console.warn('⚠️ ACB Callback: No description found. Treating as ping/validation request.');
            return NextResponse.json({
                "timestamp": new Date().toISOString(),
                "responseCode": "00000000", // Return success for portal validation
                "message": "Webhook validation successful",
                "responseBody": {
                    "index": 0,
                    "referenceCode": transactionId || "ping"
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
