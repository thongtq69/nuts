import { NextResponse } from 'next/server';
import { sendOTPEmail, generateOTP } from '@/lib/email';
import { requireAdminAuth } from '@/lib/auth-permissions';

export async function GET() {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ success: false, message: auth.error }, { status: 401 });
        }

        const testEmail = process.env.GMAIL_USER;
        
        console.log('=== EMAIL TEST DEBUG ===');
        console.log('GMAIL_USER:', process.env.GMAIL_USER);
        console.log('GMAIL_CLIENT_ID:', process.env.GMAIL_CLIENT_ID ? 'SET' : 'NOT SET');
        console.log('GMAIL_CLIENT_SECRET:', process.env.GMAIL_CLIENT_SECRET ? 'SET' : 'NOT SET');
        console.log('GMAIL_REFRESH_TOKEN:', process.env.GMAIL_REFRESH_TOKEN ? 'SET (length: ' + process.env.GMAIL_REFRESH_TOKEN.length + ')' : 'NOT SET');
        console.log('GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'SET' : 'NOT SET');
        
        if (!testEmail) {
            return NextResponse.json({ 
                success: false, 
                message: 'GMAIL_USER not configured',
                debug: {
                    GMAIL_USER: process.env.GMAIL_USER || 'NOT SET',
                    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID ? 'SET' : 'NOT SET',
                    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET ? 'SET' : 'NOT SET',
                    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN ? 'SET' : 'NOT SET',
                }
            }, { status: 500 });
        }
        
        const otp = generateOTP();
        console.log('Attempting to send OTP:', otp, 'to:', testEmail);
        
        await sendOTPEmail(testEmail, otp, 'kiểm tra hệ thống email');
        
        console.log('Email sent successfully!');
        
        return NextResponse.json({ 
            success: true, 
            message: `Email kiểm tra đã được gửi đến ${testEmail}`
        });
        
    } catch (error: any) {
        console.error('=== EMAIL ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        
        return NextResponse.json({ 
            success: false, 
            message: error.message || 'Lỗi gửi email',
            errorName: error.name,
            errorCode: error.code,
            debug: {
                GMAIL_USER: process.env.GMAIL_USER || 'NOT SET',
                GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID ? 'SET' : 'NOT SET',
                GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET ? 'SET' : 'NOT SET',
                GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN ? `SET (${process.env.GMAIL_REFRESH_TOKEN.length} chars)` : 'NOT SET',
            }
        }, { status: 500 });
    }
}
