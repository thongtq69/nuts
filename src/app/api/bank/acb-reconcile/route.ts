import { NextResponse } from 'next/server';
import { reconcileAcbPayments } from '@/lib/acb-payments';

const ADMIN_TOKEN = process.env.ACB_INQUIRY_TOKEN;
const CRON_SECRET = process.env.CRON_SECRET;

function authorized(req: Request): boolean {
    const authorization = req.headers.get('authorization');
    if (CRON_SECRET && authorization === `Bearer ${CRON_SECRET}`) return true;
    if (!ADMIN_TOKEN) return false;
    const header = req.headers.get('x-admin-token');
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token');
    return header === ADMIN_TOKEN || queryToken === ADMIN_TOKEN;
}

async function run(req: Request) {
    if (!authorized(req)) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get('account') || process.env.ACB_DEFAULT_ACCOUNT || undefined;
    const daysBack = Math.min(Number(searchParams.get('daysBack') || 1), 7);
    const pageSize = Math.min(Number(searchParams.get('pageSize') || 100), 1000);

    try {
        const result = await reconcileAcbPayments({ accountNumber, daysBack, pageSize });
        return NextResponse.json(result);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'reconcile failed';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}

export async function GET(req: Request) {
    return run(req);
}

export async function POST(req: Request) {
    return run(req);
}
