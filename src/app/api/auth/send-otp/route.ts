import { NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/lib/email';
import dbConnect from '@/lib/db';

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map<string, { otp: string; expires: number }>();

export async function POST(req: Request) {
    try {
        await dbConnect();
        
        const { email, purpose } = await req.json();
        
        if (!email) {
            return NextResponse.json({ message: 'Email là bắt buộc' }, { status: 400 });
        }
        
        // Generate OTP
        const otp = generateOTP();
        
        // Store OTP with 5 minute expiry
        otpStore.set(email, {
            otp,
            expires: Date.now() + 5 * 60 * 1000
        });
        
        // Send OTP email
        await sendOTPEmail(email, otp, purpose || 'xác thực tài khoản');
        
        return NextResponse.json({ 
            message: 'Mã OTP đã được gửi đến email của bạn',
            success: true 
        });
        
    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ message: 'Lỗi khi gửi OTP' }, { status: 500 });
    }
}

// Verify OTP endpoint
export async function PUT(req: Request) {
    try {
        const { email, otp } = await req.json();
        
        if (!email || !otp) {
            return NextResponse.json({ message: 'Email và OTP là bắt buộc' }, { status: 400 });
        }
        
        const stored = otpStore.get(email);
        
        if (!stored) {
            return NextResponse.json({ message: 'OTP không tồn tại hoặc đã hết hạn' }, { status: 400 });
        }
        
        if (Date.now() > stored.expires) {
            otpStore.delete(email);
            return NextResponse.json({ message: 'OTP đã hết hạn' }, { status: 400 });
        }
        
        if (stored.otp !== otp) {
            return NextResponse.json({ message: 'OTP không chính xác' }, { status: 400 });
        }
        
        // OTP verified, remove from store
        otpStore.delete(email);
        
        return NextResponse.json({ 
            message: 'Xác thực OTP thành công',
            verified: true 
        });
        
    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ message: 'Lỗi khi xác thực OTP' }, { status: 500 });
    }
}
