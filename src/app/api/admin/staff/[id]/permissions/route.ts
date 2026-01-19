import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth-permissions';

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ message: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const { roleType, customPermissions } = await req.json();

        const staff = await User.findById(id);
        if (!staff) {
            return NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
        }

        if (staff.role !== 'staff') {
            return NextResponse.json({ message: 'Người dùng này không phải là nhân viên' }, { status: 400 });
        }

        if (roleType) {
            staff.roleType = roleType;
        }

        if (customPermissions) {
            staff.customPermissions = customPermissions;
        }

        await staff.save();

        return NextResponse.json({
            message: 'Cập nhật quyền thành công',
            staff: {
                id: staff._id.toString(),
                name: staff.name,
                roleType: staff.roleType,
                customPermissions: staff.customPermissions
            }
        });
    } catch (error) {
        console.error('Update staff permissions error:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ message: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const staff = await User.findById(id).select('-password');
        if (!staff) {
            return NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
        }

        return NextResponse.json({
            id: staff._id.toString(),
            name: staff.name,
            email: staff.email,
            role: staff.role,
            roleType: staff.roleType,
            customPermissions: staff.customPermissions || []
        });
    } catch (error) {
        console.error('Get staff permissions error:', error);
        return NextResponse.json({ message: 'Lỗi server' }, { status: 500 });
    }
}
