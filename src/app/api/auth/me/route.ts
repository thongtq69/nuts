import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { assignStaffIdentity } from '@/lib/staff-identity';

export async function GET() {
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
            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET || 'fallback_secret_change_me'
            ) as JwtPayload;

            const user = await User.findById(decoded.id).select('-password');

            if (!user || user.isActive === false) {
                return NextResponse.json(
                    { message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa' },
                    { status: 401 }
                );
            }

            if (user.role === 'staff' && (!user.staffCode || !user.referralCode)) {
                await assignStaffIdentity(user);
            }

            return NextResponse.json(user);

        } catch {
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
