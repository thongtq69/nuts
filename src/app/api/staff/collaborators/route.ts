import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Helper to get current user
async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        await dbConnect();
        return await User.findById(decoded.id);
    } catch {
        return null;
    }
}

// GET - List all collaborators of this staff
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const collaborators = await User.find({
            parentStaff: user._id,
            affiliateLevel: 'collaborator'
        } as any).select('name email phone referralCode walletBalance totalCommission createdAt').sort({ createdAt: -1 });

        // Get order stats for each collaborator
        const collaboratorsWithStats = await Promise.all(
            collaborators.map(async (collab) => {
                const orders = await Order.find({ referrer: collab._id });
                return {
                    id: collab._id.toString(),
                    name: collab.name,
                    email: collab.email,
                    phone: collab.phone || '',
                    code: collab.referralCode || '',
                    walletBalance: collab.walletBalance || 0,
                    totalCommission: collab.totalCommission || 0,
                    orders: orders.length,
                    revenue: orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
                    createdAt: collab.createdAt
                };
            })
        );

        return NextResponse.json(collaboratorsWithStats);
    } catch (error) {
        console.error('Get collaborators error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}

// POST - Create new collaborator code
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!user.staffCode) {
            return NextResponse.json({ message: 'Bạn chưa được cấp mã nhân viên' }, { status: 400 });
        }

        await dbConnect();
        const { name, email, phone, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ message: 'Email đã tồn tại' }, { status: 400 });
        }

        // Generate collaborator code based on staff code
        const collaboratorCount = await User.countDocuments({
            parentStaff: user._id,
            affiliateLevel: 'collaborator'
        } as any);

        const newCode = `${user.staffCode}-CTV${collaboratorCount + 1}`;

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create collaborator user
        const collaborator = await User.create({
            name,
            email,
            phone: phone || '',
            password: hashedPassword,
            role: 'sale', // CTV has sale role for affiliate functionality
            parentStaff: user._id,
            affiliateLevel: 'collaborator',
            referralCode: newCode,
            walletBalance: 0,
            totalCommission: 0
        } as any) as any;

        // Update staff's collaborator count
        await User.findByIdAndUpdate(user._id, {
            $inc: { collaboratorCount: 1 }
        });

        return NextResponse.json({
            message: 'Tạo cộng tác viên thành công',
            collaborator: {
                id: collaborator._id.toString(),
                name: collaborator.name,
                email: collaborator.email,
                code: collaborator.referralCode
            }
        }, { status: 201 });
    } catch (error) {
        console.error('Create collaborator error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi tạo cộng tác viên' },
            { status: 500 }
        );
    }
}

// DELETE - Remove collaborator
export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { collaboratorId } = await req.json();

        if (!collaboratorId) {
            return NextResponse.json({ message: 'Thiếu ID cộng tác viên' }, { status: 400 });
        }

        // Verify this collaborator belongs to this staff
        const collaborator = await User.findOne({
            _id: collaboratorId,
            parentStaff: user._id,
            affiliateLevel: 'collaborator'
        } as any);

        if (!collaborator) {
            return NextResponse.json({ message: 'Không tìm thấy cộng tác viên' }, { status: 404 });
        }

        // Delete the collaborator
        await User.findByIdAndDelete(collaboratorId);

        // Update staff's collaborator count
        await User.findByIdAndUpdate(user._id, {
            $inc: { collaboratorCount: -1 }
        });

        return NextResponse.json({
            message: 'Đã xóa cộng tác viên'
        });
    } catch (error) {
        console.error('Delete collaborator error:', error);
        return NextResponse.json(
            { message: 'Lỗi khi xóa cộng tác viên' },
            { status: 500 }
        );
    }
}
