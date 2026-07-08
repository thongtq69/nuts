import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const STAFF_ROLE_TYPES = ['admin', 'manager', 'sales', 'support', 'warehouse', 'accountant', 'collaborator', 'viewer'] as const;
type StaffRoleType = (typeof STAFF_ROLE_TYPES)[number];

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeStaffPayload(payload: Record<string, unknown>) {
    const requestedRoleType = typeof payload.roleType === 'string' ? payload.roleType : 'sales';
    const roleType = STAFF_ROLE_TYPES.includes(requestedRoleType as StaffRoleType)
        ? requestedRoleType as StaffRoleType
        : 'sales';

    return {
        name: typeof payload.name === 'string' ? payload.name.trim() : '',
        email: typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '',
        phone: typeof payload.phone === 'string' ? payload.phone.trim() : '',
        password: typeof payload.password === 'string' ? payload.password : '',
        staffCode: typeof payload.staffCode === 'string' ? payload.staffCode.trim().toUpperCase() : '',
        roleType
    };
}

function getDuplicateStaffMessage(error: unknown) {
    if (!error || typeof error !== 'object') return null;

    const maybeMongoError = error as {
        code?: unknown;
        keyPattern?: Record<string, unknown>;
        keyValue?: Record<string, unknown>;
    };

    if (maybeMongoError.code !== 11000) return null;

    const keyPattern = maybeMongoError.keyPattern || {};
    if ('email' in keyPattern) return 'Email đã tồn tại';
    if ('staffCode' in keyPattern || 'referralCode' in keyPattern) return 'Mã nhân viên đã tồn tại';

    return 'Thông tin nhân viên đã tồn tại';
}

function isDatabaseQuotaError(error: unknown) {
    if (!error || typeof error !== 'object') return false;

    const maybeMongoError = error as {
        code?: unknown;
        codeName?: unknown;
        message?: unknown;
    };

    return (
        maybeMongoError.code === 8000 &&
        maybeMongoError.codeName === 'AtlasError' &&
        typeof maybeMongoError.message === 'string' &&
        maybeMongoError.message.toLowerCase().includes('space quota')
    );
}

// Helper to check if user is admin
async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return false;

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me') as { role?: string };
        return decoded.role === 'admin';
    } catch {
        return false;
    }
}

// GET - List all staff
export async function GET() {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const staffList = await User.find({
            role: 'staff',
            affiliateLevel: 'staff'
        }).select('name email phone staffCode roleType customPermissions collaboratorCount walletBalance totalCommission createdAt').sort({ createdAt: -1 });

        // Get stats for each staff
        const staffWithStats = await Promise.all(
            staffList.map(async (staff) => {
                // Get all collaborators under this staff
                const collaborators = await User.find({
                    parentStaff: staff._id,
                    affiliateLevel: 'collaborator'
                }).select('_id');

                const collaboratorIds = collaborators.map(c => c._id);

                // Get orders from staff and their collaborators
                const allIds = [staff._id, ...collaboratorIds];
                const teamOrders = await Order.find({ referrer: { $in: allIds } });

                const teamRevenue = teamOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

                return {
                    id: staff._id.toString(),
                    name: staff.name,
                    email: staff.email,
                    phone: staff.phone || '',
                    staffCode: staff.staffCode || '',
                    roleType: staff.roleType || 'sales',
                    customPermissions: staff.customPermissions || [],
                    collaboratorCount: staff.collaboratorCount || collaborators.length,
                    totalCommission: staff.totalCommission || 0,
                    teamRevenue,
                    teamOrders: teamOrders.length,
                    createdAt: staff.createdAt
                };
            })
        );

        return NextResponse.json(staffWithStats);
    } catch (error) {
        console.error('Get staff error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}

// POST - Create new staff
export async function POST(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let rawPayload: unknown;
        try {
            rawPayload = await req.json();
        } catch {
            return NextResponse.json({ message: 'Dữ liệu gửi lên không hợp lệ' }, { status: 400 });
        }

        const { name, email, phone, password, staffCode, roleType } = normalizeStaffPayload(
            rawPayload && typeof rawPayload === 'object' ? rawPayload as Record<string, unknown> : {}
        );

        if (!name || !email || !password || !staffCode) {
            return NextResponse.json({ message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json({ message: 'Email không hợp lệ' }, { status: 400 });
        }

        if (!/^[A-Z0-9_-]{3,30}$/.test(staffCode)) {
            return NextResponse.json(
                { message: 'Mã nhân viên chỉ gồm chữ, số, gạch ngang hoặc gạch dưới' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingUser = await User.findOne({
            email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' }
        });
        if (existingUser) {
            return NextResponse.json({ message: 'Email đã tồn tại' }, { status: 400 });
        }

        // Staff code is also used as referralCode, so both fields must be free.
        const codeRegex = { $regex: `^${escapeRegex(staffCode)}$`, $options: 'i' };
        const existingCode = await User.findOne({
            $or: [
                { staffCode: codeRegex },
                { referralCode: codeRegex }
            ]
        });
        if (existingCode) {
            return NextResponse.json({ message: 'Mã nhân viên đã tồn tại' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create staff user
        const staff = await User.create({
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            role: 'staff',
            affiliateLevel: 'staff',
            staffCode,
            referralCode: staffCode,
            walletBalance: 0,
            totalCommission: 0,
            collaboratorCount: 0,
            roleType
        });

        return NextResponse.json({
            message: 'Tạo nhân viên thành công',
            staff: {
                id: staff._id.toString(),
                name: staff.name,
                email: staff.email,
                staffCode: staff.staffCode
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Create staff error:', error);

        const duplicateMessage = getDuplicateStaffMessage(error);
        if (duplicateMessage) {
            return NextResponse.json({ message: duplicateMessage }, { status: 409 });
        }

        if (isDatabaseQuotaError(error)) {
            return NextResponse.json(
                { message: 'Dung lượng database đã đầy, MongoDB đang chặn tạo dữ liệu mới. Vui lòng dọn dữ liệu hoặc nâng cấp dung lượng trước khi tạo nhân viên.' },
                { status: 507 }
            );
        }

        return NextResponse.json(
            { message: 'Lỗi khi tạo nhân viên' },
            { status: 500 }
        );
    }
}

// DELETE - Remove staff
export async function DELETE(req: Request) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { staffId } = await req.json();

        if (!staffId) {
            return NextResponse.json({ message: 'Thiếu ID nhân viên' }, { status: 400 });
        }

        const staff = await User.findById(staffId);
        if (!staff || staff.role !== 'staff') {
            return NextResponse.json({ message: 'Không tìm thấy nhân viên' }, { status: 404 });
        }

        // Delete all collaborators under this staff
        await User.deleteMany({
            parentStaff: staff._id,
            affiliateLevel: 'collaborator'
        });

        // Delete the staff
        await User.findByIdAndDelete(staffId);

        return NextResponse.json({
            message: 'Đã xóa nhân viên và CTV liên quan'
        });
    } catch (error) {
        console.error('Delete staff error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi xóa nhân viên' },
            { status: 500 }
        );
    }
}
