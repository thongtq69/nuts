import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';

export const dynamic = 'force-dynamic';

/**
 * @route GET /api/staff/blogs
 * @description Lấy danh sách tất cả bài viết (sắp xếp theo ngày tạo mới nhất)
 * @returns {Array} Danh sách bài viết với thông tin _id, createdAt, updatedAt, publishedAt đã được chuyển đổi sang string
 */
export async function GET() {
    try {
        await dbConnect();
        const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json(blogs.map((blog: any) => ({
            ...blog,
            _id: blog._id?.toString(),
            createdAt: blog.createdAt?.toString(),
            updatedAt: blog.updatedAt?.toString(),
            publishedAt: blog.publishedAt?.toString()
        })));
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
    }
}

/**
 * @route POST /api/staff/blogs
 * @description Tạo bài viết mới
 * @body {string} title - Tiêu đề bài viết (bắt buộc)
 * @body {string} slug - Đường dẫn tĩnh (tự động tạo từ title nếu không cung cấp)
 * @body {string} content - Nội dung HTML từ Quill editor
 * @body {string} category - Danh mục (Tin tức, Hướng dẫn, Review, Khuyến mãi)
 * @body {string} coverImage - URL ảnh bìa
 * @body {string} excerpt - Mô tả ngắn
 * @body {boolean} isPublished - Trạng thái xuất bản
 * @body {number} order - Thứ tự hiển thị
 * @returns {Object} Bài viết vừa tạo (status 201)
 */
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

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

        if (body.isPublished && !body.publishedAt) {
            body.publishedAt = new Date();
        }

        const blog = await Blog.create(body);
        
        return NextResponse.json({
            ...blog.toObject(),
            _id: blog._id.toString(),
            createdAt: blog.createdAt?.toString(),
            updatedAt: blog.updatedAt?.toString(),
            publishedAt: blog.publishedAt?.toString()
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating blog:', error);
        return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
    }
}

/**
 * @route PATCH /api/staff/blogs
 * @description Cập nhật bài viết
 * @body {string} id - ID bài viết cần cập nhật (bắt buộc)
 * @body {Object} updates - Các trường cần cập nhật
 * @returns {Object} Bài viết sau khi cập nhật
 */
export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, ...updates } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        if (updates.isPublished && !updates.publishedAt) {
            updates.publishedAt = new Date();
        }

        const blog = await Blog.findByIdAndUpdate(
            id, 
            { ...updates, updatedAt: new Date() }, 
            { new: true }
        );

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...blog.toObject(),
            _id: blog._id.toString(),
            createdAt: blog.createdAt?.toString(),
            updatedAt: blog.updatedAt?.toString(),
            publishedAt: blog.publishedAt?.toString()
        });
    } catch (error) {
        console.error('Error updating blog:', error);
        return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 });
    }
}

/**
 * @route DELETE /api/staff/blogs
 * @description Xóa bài viết
 * @body {string} id - ID bài viết cần xóa (bắt buộc)
 * @returns {Object} { success: true, message: 'Blog deleted successfully' }
 */
export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
    }
}
