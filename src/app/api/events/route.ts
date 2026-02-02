import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const published = searchParams.get('published');

        const filter: any = {};
        if (published === 'true') {
            filter.isPublished = true;
        }

        const events = await Event.find(filter).sort({ eventDate: -1 }).lean();

        return NextResponse.json(events.map((event: any) => ({
            ...event,
            _id: event._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        // Auto generate slug if not provided
        if (!body.slug && body.title) {
            body.slug = body.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd')
                .replace(/Đ/g, 'D')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }

        // Set publishedAt if publishing
        if (body.isPublished && !body.publishedAt) {
            body.publishedAt = new Date();
        }

        const event = await Event.create(body);

        return NextResponse.json(event, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}
