import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { requireAdminAuth } from '@/lib/auth-permissions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(request.url);
        const roles = searchParams.get('role')?.split(',') || [];

        const query: any = {};
        if (roles.length > 0) {
            query.role = { $in: roles };
        }

        const users = await User.find(query)
            .select('-password')
            .populate('parentStaff', 'name email staffCode')
            .populate('commissionSettings.managerId', 'name email staffCode')
            .populate({
                path: 'referrer',
                select: 'name email staffCode role affiliateLevel parentStaff',
                populate: { path: 'parentStaff', select: 'name email staffCode' },
            })
            .sort({ createdAt: -1 })
            .lean();


        return NextResponse.json(users.map((user: any) => {
            const directManager = user.parentStaff || user.commissionSettings?.managerId;
            const referrerManager = user.referrer && (
                user.referrer.role === 'staff' || user.referrer.affiliateLevel === 'staff'
                    ? user.referrer
                    : user.referrer.parentStaff
            );
            const manager = directManager && typeof directManager === 'object'
                ? directManager
                : referrerManager;

            return {
                ...user,
                _id: user._id.toString(),
                managedBy: manager
                    ? {
                        _id: String(manager._id),
                        name: manager.name,
                        email: manager.email,
                        staffCode: manager.staffCode,
                    }
                    : null,
            };
        }));
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
