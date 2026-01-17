import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';

// DELETE - Xóa voucher (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const voucher = await UserVoucher.findByIdAndDelete(id);
        
        if (!voucher) {
            return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Xóa voucher thành công' });
    } catch (error) {
        console.error('Error deleting voucher:', error);
        return NextResponse.json({ error: 'Lỗi khi xóa voucher' }, { status: 500 });
    }
}

// GET - Lấy thông tin voucher
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        
        const voucher = await UserVoucher.findById(id).populate('userId', 'name email');
        
        if (!voucher) {
            return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 });
        }
        
        return NextResponse.json(voucher);
    } catch (error) {
        console.error('Error fetching voucher:', error);
        return NextResponse.json({ error: 'Lỗi khi lấy thông tin voucher' }, { status: 500 });
    }
}