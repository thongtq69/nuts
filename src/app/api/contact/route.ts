import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export async function POST(req: Request) {
    try {
        await dbConnect();

        const body = await req.json();
        const { name, email, phone, message } = body;

        // Basic validation
        if (!name || !email || !phone || !message) {
            return NextResponse.json(
                { success: false, message: 'Vui lòng điền đầy đủ các thông tin (Tên, Email, Số điện thoại, Nội dung)' },
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

        // Phone validation (Vietnam format)
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(phone)) {
            return NextResponse.json(
                { success: false, message: 'Số điện thoại không hợp lệ' },
                { status: 400 }
            );
        }

        const newContact = await Contact.create({
            name,
            email,
            phone,
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

        // Trả về thông báo lỗi thân thiện bằng tiếng Việt
        let message = 'Đã xảy ra lỗi máy chủ. Vui lòng thử lại sau.';

        if (error.name === 'ValidationError') {
            message = 'Thông tin gửi đi không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.';
        } else if (error.code === 11000) {
            message = 'Dữ liệu này đã tồn tại trong hệ thống.';
        }

        return NextResponse.json(
            { success: false, message },
            { status: 500 }
        );
    }
}
