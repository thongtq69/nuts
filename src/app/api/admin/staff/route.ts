import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to check if user is admin
async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return false;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
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
        }).select('name email phone staffCode collaboratorCount walletBalance totalCommission createdAt').sort({ createdAt: -1 });

        // Get stats for each staff
        const staffWithStats = await Promise.all(
            staffList.map(async (staff) => {
                // Get all collaborators under this staff
                const collaborators = await User.find({
                    parentStaff: staff._id,
                    affiliateLevel: 'collaborator'
                } as any).select('_id');

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
        const { name, email, phone, password, staffCode } = await req.json();

        if (!name || !email || !password || !staffCode) {
            return NextResponse.json({ message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'Email đã tồn tại' }, { status: 400 });
        }

        // Check if staff code already exists
        const existingCode = await User.findOne({ staffCode });
        if (existingCode) {
            return NextResponse.json({ message: 'Mã nhân viên đã tồn tại' }, { status: 400 });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create staff user
        const staff = await User.create({
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            role: 'staff',
            affiliateLevel: 'staff',
            staffCode: staffCode.toUpperCase(),
            referralCode: staffCode.toUpperCase(), // Staff also has referral code same as staff code
            walletBalance: 0,
            totalCommission: 0,
            collaboratorCount: 0
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
        } as any);

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
