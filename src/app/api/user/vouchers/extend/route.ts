import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import UserVoucher from '@/models/UserVoucher';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to get user ID
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

// POST - Extend a voucher
export async function POST(req: Request) {
    try {
        await dbConnect();

        const userId = await getUserId();
        if (!userId) {
            return NextResponse.json({ error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const { voucherId } = await req.json();

        if (!voucherId) {
            return NextResponse.json({ error: 'Thiếu ID voucher' }, { status: 400 });
        }

        // Find the voucher
        const voucher = await UserVoucher.findById(voucherId);

        if (!voucher) {
            return NextResponse.json({ error: 'Không tìm thấy voucher' }, { status: 404 });
        }

        // Check ownership
        if (voucher.userId.toString() !== userId) {
            return NextResponse.json({ error: 'Voucher không thuộc về bạn' }, { status: 403 });
        }

        // Check if voucher can be extended
        if (voucher.isUsed) {
            return NextResponse.json({ error: 'Voucher đã sử dụng, không thể gia hạn' }, { status: 400 });
        }

        // Check if voucher is from order_reward (only these can be extended)
        if (voucher.source !== 'order_reward') {
            return NextResponse.json({ error: 'Chỉ voucher thưởng đơn hàng mới có thể gia hạn' }, { status: 400 });
        }

        // Check extension limit
        const currentExtensions = voucher.extensionCount || 0;
        const maxExtensions = voucher.maxExtensions || 1;

        if (currentExtensions >= maxExtensions) {
            return NextResponse.json({ error: 'Voucher đã đạt giới hạn gia hạn' }, { status: 400 });
        }

        // Check extension fee
        const extensionFee = voucher.extensionFee || 0;
        if (extensionFee <= 0) {
            return NextResponse.json({ error: 'Voucher này không hỗ trợ gia hạn' }, { status: 400 });
        }

        // Calculate new expiry date
        const extensionDays = voucher.extensionDays || 90;
        const currentExpiry = new Date(voucher.expiresAt);
        const now = new Date();

        // If expired, extend from now; otherwise extend from current expiry
        const baseDate = currentExpiry < now ? now : currentExpiry;
        const newExpiresAt = new Date(baseDate);
        newExpiresAt.setDate(newExpiresAt.getDate() + extensionDays);

        // Update voucher
        const updatedVoucher = await UserVoucher.findByIdAndUpdate(
            voucherId,
            {
                expiresAt: newExpiresAt,
                extensionCount: currentExtensions + 1,
                lastExtendedAt: now,
                // Save original expiry on first extension
                ...(currentExtensions === 0 && { originalExpiresAt: voucher.expiresAt }),
            },
            { new: true }
        );

        return NextResponse.json({
            message: 'Gia hạn voucher thành công',
            voucher: updatedVoucher,
            extensionFee,
            newExpiresAt,
        });
    } catch (error) {
        console.error('Error extending voucher:', error);
        return NextResponse.json({ error: 'Lỗi gia hạn voucher' }, { status: 500 });
    }
}
