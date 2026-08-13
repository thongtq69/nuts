import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import mongoose from 'mongoose';
import { getAuthUser, requireAdminAuth } from '@/lib/auth-permissions';
import { getUrlLocale } from '@/i18n/server';
import { isPublishedForLocale, localizeBlog } from '@/lib/localized-content';

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
            blog = await Blog.findOne({
                $or: [{ slug: id }, { 'translations.en.slug': id }],
            });
        }

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const authUser = await getAuthUser();
        const isOwner = authUser && blog.authorId && blog.authorId.toString() === authUser._id;
        if (!blog.isPublished && authUser?.role !== 'admin' && !isOwner) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        const locale = getUrlLocale(req);
        if (!isPublishedForLocale(blog.toObject(), locale)) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }
        return NextResponse.json(localizeBlog(blog.toObject(), locale));
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
        const blog = await Blog.findById(id);

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        if (typeof body.title === 'string') blog.title = body.title.trim();
        if (typeof body.excerpt === 'string') blog.excerpt = body.excerpt.trim();
        if (typeof body.content === 'string') blog.content = body.content;
        if (typeof body.category === 'string') blog.category = body.category.trim();
        if (typeof body.coverImage === 'string') blog.coverImage = body.coverImage;
        if (Array.isArray(body.tags)) blog.tags = body.tags.filter((tag: unknown) => typeof tag === 'string');
        if (body.translations && typeof body.translations === 'object') {
            blog.translations = body.translations;
        }

        const shouldPublish = body.isPublished === true;
        const shouldReject = body.moderationStatus === 'rejected';

        if (shouldPublish) {
            blog.isPublished = true;
            blog.moderationStatus = 'published';
            blog.approvedBy = new mongoose.Types.ObjectId(auth.user._id);
            blog.approvedAt = new Date();
            blog.publishedAt = blog.publishedAt || new Date();
            blog.rejectionReason = undefined;
        } else {
            blog.isPublished = false;
            blog.moderationStatus = shouldReject ? 'rejected' : 'draft';
            blog.publishedAt = undefined;
            blog.approvedBy = undefined;
            blog.approvedAt = undefined;
            blog.rejectionReason = shouldReject && typeof body.rejectionReason === 'string'
                ? body.rejectionReason.trim()
                : undefined;
        }

        await blog.save();

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
