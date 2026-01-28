import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Contact from '@/models/Contact';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const { status } = body;

        const updatedContact = await Contact.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedContact) {
            return NextResponse.json({ error: 'Không tìm thấy liên hệ' }, { status: 404 });
        }

        return NextResponse.json(updatedContact);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedContact = await Contact.findByIdAndDelete(id);

        if (!deletedContact) {
            return NextResponse.json({ error: 'Không tìm thấy liên hệ' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
