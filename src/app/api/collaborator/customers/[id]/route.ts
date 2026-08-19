import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireCollaboratorAuth } from '@/lib/auth-permissions';
import { getCustomerDetail } from '@/lib/customer-detail';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireCollaboratorAuth();
    if (!auth.user) {
        return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Khách hàng không hợp lệ' }, { status: 400 });
    }

    await dbConnect();
    const customer = await User.findOne({
        _id: id,
        role: 'user',
        affiliateLevel: { $ne: 'collaborator' },
        referrer: auth.user._id,
    });

    if (!customer) {
        return NextResponse.json(
            { error: 'Không tìm thấy khách hàng hoặc bạn không có quyền xem khách hàng này' },
            { status: 404 },
        );
    }

    // Voucher codes remain private; CTV only receives information needed to
    // follow up with their own customer and review purchase history.
    return NextResponse.json(await getCustomerDetail(customer, { includeVouchers: false }));
}
