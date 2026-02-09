import { NextResponse } from 'next/server';

/**
 * ACB Callback SIMULATOR
 * Use this to test your Webhook without actual bank transfers.
 * URL: https://gonuts.vn/api/bank/test-acb?ref=GOXXXXXX&amount=100000
 */

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    const amount = searchParams.get('amount') || "0";

    if (!ref) {
        return NextResponse.json({
            message: "Please provide a 'ref' parameter (e.g., ?ref=GO123456)"
        }, { status: 400 });
    }

    const SECURE_TOKEN = process.env.ACB_CALLBACK_TOKEN || 'acb_gonuts_callback_2026_secure_key';
    const callbackUrl = `${new URL(req.url).origin}/api/bank/acb-callback`;

    try {
        const response = await fetch(callbackUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': SECURE_TOKEN
            },
            body: JSON.stringify({
                transactionId: `SIM_${Date.now()}`,
                amount: Number(amount),
                description: `Simulated payment for ${ref}`,
                transactionDate: new Date().toISOString()
            })
        });

        const result = await response.json();

        return NextResponse.json({
            status: "Simulation Sent",
            callbackResponse: result,
            instructions: "If success, check the order status in admin panel."
        });
    } catch (error: any) {
        return NextResponse.json({
            status: "Failed",
            error: error.message
        }, { status: 500 });
    }
}
