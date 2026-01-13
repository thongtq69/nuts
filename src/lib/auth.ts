import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export interface DecodedToken {
    id: string;
    role: string;
    iat: number;
    exp: number;
}

export async function verifyToken(req?: Request): Promise<DecodedToken | null> {
    try {
        let token: string | undefined;

        // Try from cookies first via next/headers (Server Components / Route Handlers)
        const cookieStore = await cookies();
        token = cookieStore.get('token')?.value;

        if (!token && req) {
            // Fallback to request header or request cookie string if passed
            token = req.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
        }

        if (!token) return null;

        const decoded = jwt.verify(token, SECRET) as DecodedToken;
        return decoded;
    } catch (error) {
        return null; // Invalid token
    }
}

// For use in Server Components
export async function getServerSession() {
    return await verifyToken();
}
