import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireStaffAuth } from '@/lib/auth-permissions';
import { buildManagedCustomerQuery } from '@/lib/customer-ownership';
import { getCustomerDetail } from '@/lib/customer-detail';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const auth = await requireStaffAuth();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    let customer: any = null;

    if (auth.user.role === 'admin') {
        customer = await User.findOne({
            _id: id,
            role: 'user',
            isActive: { $ne: false },
        });
    } else {
        const collaborators = await User.find({
            parentStaff: auth.user._id,
            affiliateLevel: 'collaborator',
            isActive: { $ne: false },
        }).select('_id').lean();
        const ownershipQuery = buildManagedCustomerQuery(
            auth.user._id,
            collaborators.map((item: any) => String(item._id)),
        );
        customer = await User.findOne({
            $and: [{ _id: id }, ownershipQuery, { isActive: { $ne: false } }],
        });
    }

    if (!customer) {
        return NextResponse.json(
            { error: 'Không tìm thấy khách hàng hoặc bạn không có quyền xem khách hàng này' },
            { status: 404 },
        );
    }

    return NextResponse.json(await getCustomerDetail(customer, { includeVouchers: false }));
}

