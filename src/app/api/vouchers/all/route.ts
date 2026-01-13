import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const decoded = await verifyToken(req);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const vouchers = await UserVoucher.find().populate('userId', 'name email').sort({ createdAt: -1 }).limit(100);
        return NextResponse.json(vouchers);
    } catch (error) {
        return NextResponse.json({ message: 'Error fetching vouchers' }, { status: 500 });
    }
}
