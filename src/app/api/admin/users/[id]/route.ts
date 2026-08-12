import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { encodeAffiliateId } from '@/lib/affiliate';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { assignStaffIdentity } from '@/lib/staff-identity';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updateData: Record<string, unknown> = {};
        if (typeof body.isActive === 'boolean') {
            updateData.isActive = body.isActive;
            updateData.deletedAt = body.isActive ? null : new Date();
        }
        if (['user', 'sale', 'staff'].includes(body.role)) updateData.role = body.role;

        if (body.role === 'sale' && !user.referralCode) {
            const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            updateData.referralCode = `GN${randomCode}`;
        }

        if (body.role === 'sale' && !user.encodedAffiliateCode) {
            updateData.encodedAffiliateCode = encodeAffiliateId(id);
        }

        if (body.role === 'staff') {
            user.role = 'staff';
            user.affiliateLevel = 'staff';
            user.roleType = user.roleType || 'sales';
            await assignStaffIdentity(user);
            updateData.staffCode = user.staffCode;
            updateData.referralCode = user.referralCode;
            updateData.affiliateLevel = 'staff';
            updateData.roleType = user.roleType;
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).select('-password');

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const existingUser = await User.findById(id).select('role');
        if (!existingUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        if (existingUser.role === 'admin' || auth.user._id === id) {
            return NextResponse.json(
                { error: 'Không thể vô hiệu hóa tài khoản quản trị này' },
                { status: 409 },
            );
        }

        await User.findByIdAndUpdate(
            id,
            {
                $set: {
                    isActive: false,
                    deletedAt: new Date(),
                },
            },
            { new: true },
        );
        return NextResponse.json({ message: 'User deactivated successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
