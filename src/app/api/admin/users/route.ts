import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(users.map((user: any) => ({
            ...user,
            _id: user._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
