import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-permissions';
import dbConnect from '@/lib/db';
import { getCustomerFinancialSummary } from '@/lib/customer-financials';

export async function GET() {
    const auth = await requireAuth();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });
    await dbConnect();
    const summary = await getCustomerFinancialSummary(auth.user._id);
    return NextResponse.json({
        totalSpent: summary.totalSpent,
        totalVipSavings: summary.totalVipSavings,
        vipSavingsOrderCount: summary.vipSavingsOrderCount,
    });
}
