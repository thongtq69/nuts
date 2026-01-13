import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        // Get token from cookie
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const vouchers = await UserVoucher.find({ userId: decoded.id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(vouchers.map((v: any) => ({
            ...v,
            _id: v._id.toString(),
            userId: v.userId.toString(),
        })));
    } catch (error) {
        console.error('Error fetching user vouchers:', error);
        return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 });
    }
}
