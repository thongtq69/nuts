import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Không có quyền truy cập' },
                { status: 401 }
            );
        }

        try {
            const decoded: any = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback_secret_change_me'
            );

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return NextResponse.json(
                    { message: 'User không tồn tại' },
                    { status: 404 }
                );
            }

            return NextResponse.json(user);

        } catch (error) {
            return NextResponse.json(
                { message: 'Token không hợp lệ' },
                { status: 401 }
            );
        }

    } catch (error) {
        console.error('Me error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
