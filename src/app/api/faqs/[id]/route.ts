import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FAQ from '@/models/FAQ';

// PUT - Update FAQ
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await request.json();

        const faq = await FAQ.findByIdAndUpdate(id, body, { new: true });

        if (!faq) {
            return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            faq
        });
    } catch (error: any) {
        console.error('Error updating FAQ:', error);
        return NextResponse.json({ error: error.message || 'Failed to update FAQ' }, { status: 500 });
    }
}

// DELETE - Delete FAQ
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const faq = await FAQ.findByIdAndDelete(id);

        if (!faq) {
            return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'FAQ deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete FAQ' }, { status: 500 });
    }
}
