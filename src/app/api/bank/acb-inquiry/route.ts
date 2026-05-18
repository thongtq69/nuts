import { NextResponse } from 'next/server';
import { getAcbBalance } from '@/lib/acb';

const ADMIN_TOKEN = process.env.ACB_INQUIRY_TOKEN;

function authorized(req: Request): boolean {
    if (!ADMIN_TOKEN) return false;
    const header = req.headers.get('x-admin-token');
    const url = new URL(req.url);
    const queryToken = url.searchParams.get('token');
    return header === ADMIN_TOKEN || queryToken === ADMIN_TOKEN;
}

export async function GET(req: Request) {
    if (!authorized(req)) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountNumber = searchParams.get('account') || process.env.ACB_DEFAULT_ACCOUNT;
    if (!accountNumber) {
        return NextResponse.json({ error: 'missing account number' }, { status: 400 });
    }

    try {
        const result = await getAcbBalance(accountNumber);
        return NextResponse.json(result);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || 'inquiry failed' }, { status: 502 });
    }
}
