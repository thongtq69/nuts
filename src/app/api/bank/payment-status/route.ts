import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { reconcileAcbPaymentRef } from '@/lib/acb-payments';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function orderCodeFromId(id: unknown): string {
    return String(id || '').slice(-6).toUpperCase();
}

function noStoreJson(data: unknown, init?: ResponseInit) {
    const headers = new Headers(init?.headers);
    headers.set('Cache-Control', 'no-store, max-age=0');
    return NextResponse.json(data, { ...init, headers });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const paymentRef = (searchParams.get('ref') || '').trim().toUpperCase();
    const orderCode = (searchParams.get('order') || '').trim().toUpperCase();
    const amount = Number(searchParams.get('amount') || 0);

    if (!/^GO[A-Z0-9]{6,12}$/i.test(paymentRef)) {
        return noStoreJson({ error: 'invalid_payment_ref' }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findOne({
        paymentRef: new RegExp(`^${escapeRegExp(paymentRef)}$`, 'i'),
        paymentMethod: 'banking',
    }).select('_id paymentRef paymentStatus status totalAmount acbTransactionNo').lean();

    if (!order) {
        return noStoreJson({ error: 'order_not_found' }, { status: 404 });
    }

    if (orderCode && orderCodeFromId(order._id) !== orderCode) {
        return noStoreJson({ error: 'order_mismatch' }, { status: 404 });
    }

    if (Number.isFinite(amount) && amount > 0 && Number(order.totalAmount) !== amount) {
        return noStoreJson({ error: 'amount_mismatch' }, { status: 400 });
    }

    let reconciliation:
        | Awaited<ReturnType<typeof reconcileAcbPaymentRef>>
        | { error: string }
        | null = null;

    if (order.paymentStatus !== 'paid') {
        try {
            reconciliation = await reconcileAcbPaymentRef(paymentRef, { daysBack: 1, pageSize: 100 });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'reconcile_failed';
            reconciliation = { error: message };
            console.error('ACB payment status reconciliation failed:', error);
        }
    }

    const latestOrder = await Order.findById(order._id)
        .select('_id paymentRef paymentStatus status totalAmount acbTransactionNo')
        .lean();

    return noStoreJson({
        order: orderCodeFromId(order._id),
        paymentRef,
        paid: latestOrder?.paymentStatus === 'paid',
        paymentStatus: latestOrder?.paymentStatus || order.paymentStatus,
        status: latestOrder?.status || order.status,
        acbTransactionNo: latestOrder?.acbTransactionNo || order.acbTransactionNo || null,
        checkedAt: new Date().toISOString(),
        reconciliation,
    });
}
