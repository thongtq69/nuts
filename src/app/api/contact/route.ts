import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();
        const { name, email, phone, message } = body;

        // Basic validation (phone is now optional)
        if (!name || !email || !message) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Tên, Email, Nội dung)' },
                { status: 400 }
            );
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { success: false, message: 'Email không hợp lệ' },
                { status: 400 }
            );
        }

        // Phone validation (Vietnam format) - Only if provided
        if (phone) {
            const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
            if (!phoneRegex.test(phone)) {
                return NextResponse.json(
                    { success: false, message: 'Số điện thoại không hợp lệ' },
                    { status: 400 }
                );
            }
        }

        const newContact = await Contact.create({
            name,
            email,
            phone: phone?.trim() || '',
            message,
            status: 'pending'
        });

        return NextResponse.json({
            success: true,
            data: newContact,
            message: 'Gửi liên hệ thành công'
        });

    } catch (error: any) {
        console.error('API Contact Error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Lỗi server' },
            { status: 500 }
        );
    }
}
