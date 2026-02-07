import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const roles = searchParams.get('role')?.split(',') || [];

        const query: any = {};
        if (roles.length > 0) {
            query.role = { $in: roles };
        }

        const users = await User.find(query)
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
