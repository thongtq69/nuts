import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

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

        const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();

        return NextResponse.json(blogs.map((blog: any) => ({
            ...blog,
            _id: blog._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
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

        const blog = await Blog.create(body);

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
