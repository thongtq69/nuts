import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to get user ID from JWT token
async function getUserId() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        return decoded.id;
    } catch {
        return null;
    }
}

// GET current user profile
export async function GET() {
    try {
        await dbConnect();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json(
                { message: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json(
                { message: 'Không tìm thấy tài khoản' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}

// PUT update user profile
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const userId = await getUserId();

        if (!userId) {
            return NextResponse.json(
                { message: 'Vui lòng đăng nhập' },
                { status: 401 }
            );
        }

        const body = await req.json();

        // Only allow specific fields to be updated
        const allowedFields = ['name', 'phone', 'address', 'city', 'district'];
        const updateData: Record<string, any> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        // Validate name is not empty
        if (updateData.name !== undefined && !updateData.name.trim()) {
            return NextResponse.json(
                { message: 'Tên không được để trống' },
                { status: 400 }
            );
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true }
        ).select('-password');

        if (!user) {
            return NextResponse.json(
                { message: 'Không tìm thấy tài khoản' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Cập nhật thông tin thành công',
            user
        });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
