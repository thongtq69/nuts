import { NextResponse } from 'next/server';
import {
    applyAcbTransactionToOrder,
    extractAcbTransactions,
    reconcileAcbPayments,
} from '@/lib/acb-payments';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';

/**
 * ACB Bank Webhook Callback
 * Protocol: POST
 * URL: https://gonuts.vn/api/bank/acb-callback
 * Auth: x-api-key header
 */

export async function GET() {
    return NextResponse.json({
        message: "ACB Webhook endpoint is active",
        status: "success",
        timestamp: new Date().toISOString()
    });
}

function formatAcbDateTime(date = new Date()) {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    }).formatToParts(date).reduce<Record<string, string>>((acc, part) => {
        if (part.type !== 'literal') acc[part.type] = part.value;
        return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:${parts.second}.000+0700`;
}

function acbResponse(body: Record<string, unknown>, responseCode: string, responseMessage: string, referenceCode: string, index = 1) {
    return {
        requestTrace: typeof body.requestTrace === 'string' ? body.requestTrace : referenceCode,
        responseDateTime: formatAcbDateTime(),
        responseStatus: {
            responseCode,
            responseMessage,
        },
        responseBody: {
            index,
            referenceCode,
        },
    };
}

export async function POST(req: Request) {
    try {
        let body: Record<string, unknown> = {};
        let rawBody = '';
        let parseError = '';
        try {
            rawBody = await req.text();
            if (rawBody) {
                body = JSON.parse(rawBody) as Record<string, unknown>;
            }
        } catch (e) {
            parseError = e instanceof Error ? e.message : 'invalid json';
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
                    rawBodyLength: rawBody.length,
                    parseError: parseError || undefined,
                    ip: req.headers.get('x-forwarded-for') || 'unknown',
                    url: req.url
                });
            }
        } catch (dbErr) {
            console.error('Failed to log ACB debug info to DB:', dbErr);
        }

        const transactions = extractAcbTransactions(body);
        if (transactions.length === 0) {
            console.warn('⚠️ ACB Callback: No transactions found. Treating as validation/ping and running reconciliation.');
            let reconciliation = null;
            try {
                reconciliation = await reconcileAcbPayments({ daysBack: 1, pageSize: 100 });
            } catch (reconcileErr) {
                console.error('ACB reconciliation after empty callback failed:', reconcileErr);
            }

            return NextResponse.json({
                ...acbResponse(body, "00000000", "Webhook validation successful", "ping", 1),
                "reconciliation": reconciliation ? {
                    "applied": reconciliation.applied,
                    "checkedDates": reconciliation.checkedDates
                } : undefined
            });
        }

        const results = [];
        for (const transaction of transactions) {
            const result = await applyAcbTransactionToOrder(transaction, 'callback');
            results.push(result);
            if (result.applied) {
                console.log(`🎉 Order ${result.orderId} marked as PAID by ACB transaction ${result.transactionId}`);
            } else {
                console.warn(`⚠️ ACB transaction ignored: ${result.reason}`, result);
            }
        }

        // 4. Mandatory Response Body as per ACB requirements
        return NextResponse.json({
            ...acbResponse(
                body,
                "00000000",
                "Success",
                results.find((result) => result.transactionId)?.transactionId || "processed",
                results.length || 1
            ),
            "results": results
        });

    } catch (error) {
        console.error('🔥 ACB Callback Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
            ...acbResponse({}, "99999999", "Internal System Error: " + message, "error", 0)
        }, { status: 500 });
    }
}
