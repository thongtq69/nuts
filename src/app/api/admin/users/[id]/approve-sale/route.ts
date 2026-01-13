import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.saleApplicationStatus !== 'pending') {
            return NextResponse.json({ error: 'No pending application' }, { status: 400 });
        }

        user.role = 'sale';
        user.saleApplicationStatus = 'approved';
        user.saleApprovedAt = new Date();
        await user.save();

        return NextResponse.json({ message: 'Sale application approved', user });
    } catch (error) {
        console.error('Error approving sale:', error);
        return NextResponse.json({ error: 'Failed to approve sale' }, { status: 500 });
    }
}
