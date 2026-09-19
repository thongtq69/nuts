import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-permissions';
import { reconcileAcbPaymentRef } from '@/lib/acb-payments';
import dbConnect from '@/lib/db';
import LuckyWheelTopUp from '@/models/LuckyWheelTopUp';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ ref: string }> }) {
    const { user } = await requireAuth();
    if (!user) return NextResponse.json({ message: 'Vui lòng đăng nhập' }, { status: 401 });
    const { ref } = await params;
    await dbConnect();
    let topUp = await LuckyWheelTopUp.findOne({ paymentRef: ref.toUpperCase(), userId: user._id }).lean();
    if (!topUp) return NextResponse.json({ message: 'Không tìm thấy giao dịch nạp' }, { status: 404 });
    if (topUp.status === 'pending') {
        try { await reconcileAcbPaymentRef(topUp.paymentRef, { daysBack: 1, pageSize: 100 }); } catch (error) { console.error('Lucky wheel top-up reconciliation failed:', error); }
        topUp = await LuckyWheelTopUp.findById(topUp._id).lean();
    }
    return NextResponse.json({ topUp });
}
