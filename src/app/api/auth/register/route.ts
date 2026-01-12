import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { name, email, password, phone } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Vui lòng điền đầy đủ thông tin' },
                { status: 400 }
            );
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return NextResponse.json(
                { message: 'Email này đã được đăng ký' },
                { status: 400 }
            );
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
        });

        if (user) {
            return NextResponse.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            }, { status: 201 });
        } else {
            return NextResponse.json(
                { message: 'Không thể tạo tài khoản' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { message: 'Lỗi server' },
            { status: 500 }
        );
    }
}
