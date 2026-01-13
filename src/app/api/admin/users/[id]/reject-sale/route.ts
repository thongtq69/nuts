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
        const { reason } = await req.json();

        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.saleApplicationStatus !== 'pending') {
            return NextResponse.json({ error: 'No pending application' }, { status: 400 });
        }

        user.saleApplicationStatus = 'rejected';
        user.saleRejectedAt = new Date();
        user.saleRejectionReason = reason || '';
        await user.save();

        return NextResponse.json({ message: 'Sale application rejected', user });
    } catch (error) {
        console.error('Error rejecting sale:', error);
        return NextResponse.json({ error: 'Failed to reject sale' }, { status: 500 });
    }
}
