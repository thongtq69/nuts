import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { encodeAffiliateId } from '@/lib/affiliate';
import { requireAdminAuth } from '@/lib/auth-permissions';
import { assignStaffIdentity } from '@/lib/staff-identity';

type TargetAccountRole = 'user' | 'sale' | 'staff' | 'collaborator';

async function createUniqueReferralCode() {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        const randomCode = Math.random().toString(36).slice(2, 8).toUpperCase();
        const referralCode = `GN${randomCode}`;
        if (!await User.exists({ referralCode })) return referralCode;
    }

    throw new Error('Không thể tạo mã giới thiệu duy nhất');
}

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

        if (user.role === 'admin' && body.role) {
            return NextResponse.json(
                { error: 'Không thể thay đổi vai trò của tài khoản quản trị' },
                { status: 409 },
            );
        }

        const updateData: Record<string, unknown> = {};
        const unsetData: Record<string, 1> = {};
        if (typeof body.isActive === 'boolean') {
            updateData.isActive = body.isActive;
            updateData.deletedAt = body.isActive ? null : new Date();
        }

        const targetRole = body.role as TargetAccountRole | undefined;
        if (targetRole === 'collaborator') {
            updateData.role = 'sale';
            updateData.roleType = 'collaborator';
            updateData.saleType = 'collaborator';
            updateData.affiliateLevel = 'collaborator';
            updateData.saleApplicationStatus = 'approved';
            updateData.saleApprovedAt = new Date();
            updateData.referralCode = user.referralCode || await createUniqueReferralCode();
            updateData.encodedAffiliateCode = user.encodedAffiliateCode || encodeAffiliateId(id);
            unsetData.staffCode = 1;
            unsetData.customPermissions = 1;
        } else if (targetRole === 'sale') {
            updateData.role = 'sale';
            updateData.saleType = 'agent';
            updateData.saleApplicationStatus = 'approved';
            updateData.saleApprovedAt = new Date();
            updateData.referralCode = user.referralCode || await createUniqueReferralCode();
            updateData.encodedAffiliateCode = user.encodedAffiliateCode || encodeAffiliateId(id);
            unsetData.roleType = 1;
            unsetData.affiliateLevel = 1;
            unsetData.staffCode = 1;
            unsetData.parentStaff = 1;
            unsetData.customPermissions = 1;
        } else if (targetRole === 'staff') {
            user.role = 'staff';
            user.affiliateLevel = 'staff';
            user.roleType = user.roleType && !['collaborator', 'viewer'].includes(user.roleType)
                ? user.roleType
                : 'sales';
            await assignStaffIdentity(user);
            updateData.role = 'staff';
            updateData.staffCode = user.staffCode;
            updateData.referralCode = user.referralCode;
            updateData.affiliateLevel = 'staff';
            updateData.roleType = user.roleType;
            unsetData.saleType = 1;
            unsetData.parentStaff = 1;
        } else if (targetRole === 'user') {
            updateData.role = 'user';
            updateData.saleApplicationStatus = null;
            unsetData.roleType = 1;
            unsetData.saleType = 1;
            unsetData.affiliateLevel = 1;
            unsetData.staffCode = 1;
            unsetData.referralCode = 1;
            unsetData.encodedAffiliateCode = 1;
            unsetData.customPermissions = 1;
        }

        if (Object.prototype.hasOwnProperty.call(body, 'assignedStaffId')) {
            if (user.role !== 'user') {
                return NextResponse.json(
                    { error: 'Chỉ có thể phân công tài khoản khách hàng cho nhân viên' },
                    { status: 409 },
                );
            }

            const assignedStaffId = typeof body.assignedStaffId === 'string'
                ? body.assignedStaffId.trim()
                : '';

            if (!assignedStaffId) {
                unsetData.assignedStaff = 1;
            } else {
                const staff = await User.findOne({
                    _id: assignedStaffId,
                    role: 'staff',
                    affiliateLevel: 'staff',
                    isActive: { $ne: false },
                }).select('_id');

                if (!staff) {
                    return NextResponse.json(
                        { error: 'Nhân viên không tồn tại hoặc đã bị vô hiệu hóa' },
                        { status: 404 },
                    );
                }

                updateData.assignedStaff = staff._id;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            {
                ...(Object.keys(updateData).length > 0 ? { $set: updateData } : {}),
                ...(Object.keys(unsetData).length > 0 ? { $unset: unsetData } : {}),
            },
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
