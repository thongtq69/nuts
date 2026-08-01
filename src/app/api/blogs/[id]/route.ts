import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
import { getAuthUser, requireAdminAuth } from '@/lib/auth-permissions';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        let blog;
        if (mongoose.Types.ObjectId.isValid(id)) {
            blog = await Blog.findById(id);
        } else {
            blog = await Blog.findOne({ slug: id });
        }

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const authUser = await getAuthUser();
        const isOwner = authUser && blog.authorId && blog.authorId.toString() === authUser._id;
        if (!blog.isPublished && authUser?.role !== 'admin' && !isOwner) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        // Set publishedAt if publishing for the first time
        if (body.isPublished) {
            const existingBlog = await Blog.findById(id);
            if (existingBlog && !existingBlog.isPublished) {
                body.publishedAt = new Date();
            }
        }

        const isRejected = body.moderationStatus === 'rejected';
        body.moderationStatus = isRejected ? 'rejected' : body.isPublished ? 'published' : 'draft';
        if (body.isPublished) {
            body.approvedBy = auth.user._id;
            body.approvedAt = new Date();
            body.rejectionReason = undefined;
        } else {
            body.isPublished = false;
            body.publishedAt = undefined;
        }

        const blog = await Blog.findByIdAndUpdate(id, body, { new: true });

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json(blog);
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
