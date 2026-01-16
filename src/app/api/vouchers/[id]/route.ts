import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const voucher = await UserVoucher.findByIdAndDelete(id);
        if (!voucher) {
            return NextResponse.json({ error: 'Voucher not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Voucher deleted successfully' });
    } catch (error) {
        console.error('Error deleting voucher:', error);
        return NextResponse.json({ error: 'Failed to delete voucher' }, { status: 500 });
    }
}
