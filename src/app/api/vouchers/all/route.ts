import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';

// GET - Lấy tất cả voucher đã phát hành (Admin only)
export async function GET(request: Request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const source = searchParams.get('source');
        const sourceId = searchParams.get('sourceId');

        const query: any = {};
        if (source) query.source = source;
        if (sourceId && sourceId !== 'null') query.sourceId = sourceId;
        if (sourceId === 'null') query.sourceId = null;

        // Populate user information
        const vouchers = await UserVoucher.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(vouchers);
    } catch (error) {
        console.error('Error fetching vouchers:', error);
        return NextResponse.json({ error: 'Lỗi khi lấy danh sách voucher' }, { status: 500 });
    }
}