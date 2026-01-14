import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Notification from '@/models/Notification';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Params must be awaited in Next.js 15+ (and likely 16)
) {
    try {
        const resolvedParams = await params;
        await dbConnect();

        const notification = await Notification.findByIdAndUpdate(
            resolvedParams.id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
