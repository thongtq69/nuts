import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { getAuthUser, requireAdminAuth } from '@/lib/auth-permissions';
import { getUrlLocale } from '@/i18n/server';
import {
    BLOG_LOCALIZED_FIELDS,
    getMissingEnglishFields,
    localizeBlog,
} from '@/lib/localized-content';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const locale = getUrlLocale(req);
        const published = searchParams.get('published');
        const summaryOnly = searchParams.get('summary') === 'true';
        const requestedLimit = Number.parseInt(searchParams.get('limit') || '', 10);
        const limit = Number.isFinite(requestedLimit)
            ? Math.min(Math.max(requestedLimit, 1), 100)
            : 0;

        const authUser = await getAuthUser();
        const filter: { isPublished?: boolean; 'translations.en.isPublished'?: boolean } = {};
        if (published === 'true' || authUser?.role !== 'admin') {
            filter.isPublished = true;
        }
        if (locale === 'en' && (published === 'true' || authUser?.role !== 'admin')) {
            filter['translations.en.isPublished'] = true;
        }

        let query = Blog.find(filter).sort({ createdAt: -1 });

        if (summaryOnly) {
            query = query.select('-content -translations.en.content');
        }

        if (limit > 0) {
            query = query.limit(limit);
        }

        const blogs = await query.lean();

        return NextResponse.json(blogs.map((blog) => ({
            ...localizeBlog(blog, locale),
            _id: blog._id.toString(),
        })));
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await requireAdminAuth();
        if (!auth.user) {
            return NextResponse.json({ error: auth.error }, { status: 401 });
        }

        await dbConnect();
        const body = await req.json();

        if (body.translations?.en?.isPublished === true) {
            const requiredFields = BLOG_LOCALIZED_FIELDS.filter(field =>
                field !== 'tags' || (Array.isArray(body.tags) && body.tags.length > 0)
            );
            const missingFields = getMissingEnglishFields(body, requiredFields);
            if (missingFields.length > 0) {
                return NextResponse.json({
                    error: `Không thể xuất bản tiếng Anh khi còn thiếu: ${missingFields.join(', ')}`,
                }, { status: 400 });
            }
        }

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

        body.author = auth.user.name;
        body.authorId = auth.user._id;
        body.authorRole = 'admin';
        body.moderationStatus = body.isPublished ? 'published' : 'draft';
        if (body.isPublished) {
            body.approvedBy = auth.user._id;
            body.approvedAt = new Date();
        }

        const blog = await Blog.create(body);

        return NextResponse.json(blog, { status: 201 });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}
