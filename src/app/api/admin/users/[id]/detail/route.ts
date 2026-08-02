import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { assignStaffIdentity } from '@/lib/staff-identity';
import { getCustomerDetail } from '@/lib/customer-detail';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        // Lấy thông tin user
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'Không tìm thấy người dùng' }, { status: 404 });
        }

        if (user.role === 'staff' && (!user.staffCode || !user.referralCode)) {
            await assignStaffIdentity(user);
        }

        return NextResponse.json(await getCustomerDetail(user));
    } catch (error) {
        console.error('Error fetching user detail:', error);
        return NextResponse.json({ error: 'Lỗi khi lấy thông tin người dùng' }, { status: 500 });
    }
}
