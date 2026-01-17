import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';

// GET - Lấy tất cả voucher đã phát hành (Admin only)
export async function GET() {
    try {
        await dbConnect();
        
        // Populate user information
        const vouchers = await UserVoucher.find({})
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        
        return NextResponse.json(vouchers);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        return NextResponse.json({ error: 'Lỗi khi lấy danh sách voucher' }, { status: 500 });
    }
}