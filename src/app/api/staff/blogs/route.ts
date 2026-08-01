import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { hasPermission, requireStaffAuth } from '@/lib/auth-permissions';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

async function authorize(permission: 'blogs:view' | 'blogs:create' | 'blogs:edit' | 'blogs:delete') {
    const auth = await requireStaffAuth();
    if (!auth.user) return { error: NextResponse.json({ message: auth.error }, { status: 401 }) };
    if (!hasPermission(auth.user, permission)) {
        return { error: NextResponse.json({ message: 'Bạn chưa được cấp quyền thực hiện thao tác bài viết này.' }, { status: 403 }) };
    }
    return { user: auth.user };
}

function createBaseSlug(title: string) {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

async function uniqueSlug(title: string) {
    const base = createBaseSlug(title) || `bai-viet-${Date.now()}`;
    let slug = base;
    let counter = 1;
    while (await Blog.exists({ slug })) {
        slug = `${base}-${counter}`;
        counter += 1;
    }
    return slug;
}

export async function GET() {
    try {
        const auth = await requireStaffAuth();
        if (!auth.user) return NextResponse.json({ message: auth.error }, { status: 401 });
        if (!hasPermission(auth.user, 'blogs:view') && !hasPermission(auth.user, 'blogs:create')) {
            return NextResponse.json({ message: 'Bạn chưa được cấp quyền xem bài viết.' }, { status: 403 });
        }

        await dbConnect();
        const filter = auth.user.role === 'admin'
            ? {}
            : { authorId: new mongoose.Types.ObjectId(auth.user._id) };
        const blogs = await Blog.find(filter).sort({ createdAt: -1 }).lean();
        return NextResponse.json(blogs.map((blog) => ({ ...blog, _id: blog._id.toString() })));
    } catch (error) {
        console.error('Error fetching staff blogs:', error);
        return NextResponse.json({ message: 'Không thể tải danh sách bài viết.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const auth = await authorize('blogs:create');
        if (auth.error || !auth.user) return auth.error;
        await dbConnect();
        const body = await req.json();
        if (!body.title || !body.excerpt || !body.content || !body.category) {
            return NextResponse.json({ message: 'Vui lòng nhập đầy đủ tiêu đề, mô tả, nội dung và danh mục.' }, { status: 400 });
        }

        const blog = await Blog.create({
            title: String(body.title).trim(),
            slug: await uniqueSlug(String(body.title)),
            excerpt: String(body.excerpt).trim(),
            content: String(body.content),
            category: String(body.category),
            coverImage: typeof body.coverImage === 'string' ? body.coverImage : '',
            tags: Array.isArray(body.tags) ? body.tags : [],
            author: auth.user.name,
            authorId: new mongoose.Types.ObjectId(auth.user._id),
            authorRole: auth.user.role === 'admin' ? 'admin' : 'staff',
            isPublished: false,
            moderationStatus: 'pending',
            viewCount: 0
        });

        return NextResponse.json({ ...blog.toObject(), _id: blog._id.toString() }, { status: 201 });
    } catch (error) {
        console.error('Error creating staff blog:', error);
        return NextResponse.json({ message: 'Không thể gửi bài viết để duyệt.' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const auth = await authorize('blogs:edit');
        if (auth.error || !auth.user) return auth.error;
        await dbConnect();
        const { id, ...body } = await req.json();
        const blog = await Blog.findById(id);
        if (!blog) return NextResponse.json({ message: 'Không tìm thấy bài viết.' }, { status: 404 });
        if (auth.user.role !== 'admin' && blog.authorId?.toString() !== auth.user._id) {
            return NextResponse.json({ message: 'Bạn chỉ được sửa bài viết do mình tạo.' }, { status: 403 });
        }

        if (typeof body.title === 'string') blog.title = body.title;
        if (typeof body.excerpt === 'string') blog.excerpt = body.excerpt;
        if (typeof body.content === 'string') blog.content = body.content;
        if (typeof body.category === 'string') blog.category = body.category;
        if (typeof body.coverImage === 'string') blog.coverImage = body.coverImage;
        blog.isPublished = false;
        blog.moderationStatus = 'pending';
        blog.publishedAt = undefined;
        blog.approvedAt = undefined;
        blog.approvedBy = undefined;
        blog.rejectionReason = undefined;
        await blog.save();

        return NextResponse.json({ ...blog.toObject(), _id: blog._id.toString() });
    } catch (error) {
        console.error('Error updating staff blog:', error);
        return NextResponse.json({ message: 'Không thể cập nhật bài viết.' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const auth = await authorize('blogs:delete');
        if (auth.error || !auth.user) return auth.error;
        await dbConnect();
        const { id } = await req.json();
        const blog = await Blog.findById(id);
        if (!blog) return NextResponse.json({ message: 'Không tìm thấy bài viết.' }, { status: 404 });
        if (auth.user.role !== 'admin' && blog.authorId?.toString() !== auth.user._id) {
            return NextResponse.json({ message: 'Bạn chỉ được xóa bài viết do mình tạo.' }, { status: 403 });
        }
        await blog.deleteOne();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting staff blog:', error);
        return NextResponse.json({ message: 'Không thể xóa bài viết.' }, { status: 500 });
    }
}
