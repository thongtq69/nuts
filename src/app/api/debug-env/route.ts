import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    const jwtSecret = process.env.JWT_SECRET || 'NOT_SET';
    
    let decoded = null;
    let decodeError = null;
    
    if (token) {
        try {
            decoded = jwt.verify(token, jwtSecret);
        } catch (e: any) {
            decodeError = e.message;
            // Try with fallback secret
            try {
                decoded = jwt.verify(token, 'fallback_secret_change_me');
            } catch (e2: any) {
                decodeError += ' | Fallback also failed: ' + e2.message;
            }
        }
    }
    
    return NextResponse.json({
        timestamp: new Date().toISOString(),
        jwtSecret: jwtSecret,
        hasToken: !!token,
        tokenLength: token?.length || 0,
        decoded: decoded,
        decodeError: decodeError,
        cookieHeader: cookieStore.toString(),
    });
}
