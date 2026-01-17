import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VoucherRewardRule from '@/models/VoucherRewardRule';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';

// Helper to check admin
async function isAdmin() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return false;

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_change_me');
        const user = await User.findById(decoded.id);
        return user && (user.role === 'admin' || user.role === 'staff');
    } catch {
        return false;
    }
}

// GET all rules
export async function GET() {
    try {
        await dbConnect();

        const rules = await VoucherRewardRule.find().sort({ minOrderValue: -1 });
        return NextResponse.json(rules);
    } catch (error) {
        console.error('Error fetching voucher reward rules:', error);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}

// POST create new rule
export async function POST(req: Request) {
    try {
        await dbConnect();

        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
        }

        const body = await req.json();
        const { name, minOrderValue, voucherValue, validityDays, extensionFee, extensionDays, maxExtensions, minOrderForVoucher, isActive, priority } = body;

        if (!name || !minOrderValue || !voucherValue) {
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        const rule = await VoucherRewardRule.create({
            name,
            minOrderValue,
            voucherValue,
            validityDays: validityDays || 90,
            extensionFee: extensionFee || 5000,
            extensionDays: extensionDays || 90,
            maxExtensions: maxExtensions || 1,
            minOrderForVoucher: minOrderForVoucher || 0,
            isActive: isActive !== false,
            priority: priority || 0,
        });

        return NextResponse.json(rule, { status: 201 });
    } catch (error) {
        console.error('Error creating voucher reward rule:', error);
        return NextResponse.json({ error: 'Lỗi tạo quy tắc' }, { status: 500 });
    }
}

// PUT update rule
export async function PUT(req: Request) {
    try {
        await dbConnect();

        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
        }

        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) {
            return NextResponse.json({ error: 'Thiếu ID quy tắc' }, { status: 400 });
        }

        const rule = await VoucherRewardRule.findByIdAndUpdate(_id, updateData, { new: true });

        if (!rule) {
            return NextResponse.json({ error: 'Không tìm thấy quy tắc' }, { status: 404 });
        }

        return NextResponse.json(rule);
    } catch (error) {
        console.error('Error updating voucher reward rule:', error);
        return NextResponse.json({ error: 'Lỗi cập nhật quy tắc' }, { status: 500 });
    }
}

// DELETE rule
export async function DELETE(req: Request) {
    try {
        await dbConnect();

        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Không có quyền truy cập' }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Thiếu ID quy tắc' }, { status: 400 });
        }

        const rule = await VoucherRewardRule.findByIdAndDelete(id);

        if (!rule) {
            return NextResponse.json({ error: 'Không tìm thấy quy tắc' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Đã xóa quy tắc' });
    } catch (error) {
        console.error('Error deleting voucher reward rule:', error);
        return NextResponse.json({ error: 'Lỗi xóa quy tắc' }, { status: 500 });
    }
}
