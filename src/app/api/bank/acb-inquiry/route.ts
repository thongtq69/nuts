import { NextResponse } from 'next/server';
import { getAcbBalance } from '@/lib/acb';
import { getConfiguredAcbAccountNumber } from '@/lib/server-bank-settings';

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

    try {
        const { searchParams } = new URL(req.url);
        const accountNumber = searchParams.get('account') || await getConfiguredAcbAccountNumber();
        const result = await getAcbBalance(accountNumber);
        return NextResponse.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'inquiry failed';
        return NextResponse.json({ error: message }, { status: 502 });
    }
}
