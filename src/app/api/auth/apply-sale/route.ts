import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export async function POST(req: Request) {
    try {
        await dbConnect();

        // Get token from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Vui lòng đăng nhập để đăng ký làm đại lý' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
        const user = await User.findById(decoded.id);

        if (!user) {
            return NextResponse.json(
                { message: 'Không tìm thấy tài khoản' },
                { status: 404 }
            );
        }

        // Check if already a sale or admin
        if (user.role === 'sale') {
            return NextResponse.json(
                { message: 'Bạn đã là đại lý' },
                { status: 400 }
            );
        }

        if (user.role === 'admin') {
            return NextResponse.json(
                { message: 'Admin không cần đăng ký làm đại lý' },
                { status: 400 }
            );
        }

        // Check if already has pending application
        if (user.saleApplicationStatus === 'pending') {
            return NextResponse.json(
                { message: 'Đơn đăng ký của bạn đang chờ xét duyệt' },
                { status: 400 }
            );
        }

        // Submit sale application
        user.saleApplicationStatus = 'pending';
        user.saleAppliedAt = new Date();
        await user.save();

        return NextResponse.json({
            message: 'Đã gửi đơn đăng ký làm đại lý. Chúng tôi sẽ xét duyệt trong 24-48 giờ.',
            status: 'pending'
        });

    } catch (error) {
        console.error('Apply sale error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
