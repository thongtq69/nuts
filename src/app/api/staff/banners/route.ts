import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Banner from '@/models/Banner';

export const dynamic = 'force-dynamic';

/**
 * @route GET /api/staff/banners
 * @description Lấy danh sách tất cả banner (sắp xếp theo trường order tăng dần)
 * @returns {Array} Danh sách banner với thông tin _id, createdAt, updatedAt đã được chuyển đổi sang string
 */
export async function GET() {
    try {
        await dbConnect();
        const banners = await Banner.find().sort({ order: 1 }).lean();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return NextResponse.json(banners.map((banner: any) => ({
            ...banner,
            _id: banner._id?.toString(),
            createdAt: banner.createdAt?.toString(),
            updatedAt: banner.updatedAt?.toString()
        })));
    } catch (error) {
        console.error('Error fetching banners:', error);
        return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
    }
}

/**
 * @route POST /api/staff/banners
 * @description Tạo banner mới
 * @body {string} title - Tiêu đề banner (bắt buộc)
 * @body {string} imageUrl - URL hình ảnh (bắt buộc)
 * @body {string} link - Đường dẫn khi click vào banner
 * @body {boolean} isActive - Trạng thái hoạt động (mặc định true)
 * @body {number} order - Thứ tự hiển thị (mặc định 0)
 * @body {string} position - Vị trí hiển thị (home, sidebar, etc.)
 * @returns {Object} Banner vừa tạo (status 201)
 */
export async function POST(req: Request) {
    try {
        await dbConnect();
        const body = await req.json();

        if (!body.title || !body.imageUrl) {
            return NextResponse.json({ error: 'Title and imageUrl are required' }, { status: 400 });
        }

        const banner = await Banner.create(body);
        
        return NextResponse.json({
            ...banner.toObject(),
            _id: banner._id.toString(),
            createdAt: banner.createdAt?.toString(),
            updatedAt: banner.updatedAt?.toString()
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating banner:', error);
        return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
    }
}

/**
 * @route PATCH /api/staff/banners
 * @description Cập nhật thông tin banner
 * @body {string} id - ID banner cần cập nhật (bắt buộc)
 * @body {Object} updates - Các trường cần cập nhật
 * @returns {Object} Banner sau khi cập nhật
 */
export async function PATCH(req: Request) {
    try {
        await dbConnect();
        const { id, ...updates } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const banner = await Banner.findByIdAndUpdate(
            id, 
            { ...updates, updatedAt: new Date() }, 
            { new: true }
        );

        if (!banner) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...banner.toObject(),
            _id: banner._id.toString(),
            createdAt: banner.createdAt?.toString(),
            updatedAt: banner.updatedAt?.toString()
        });
    } catch (error) {
        console.error('Error updating banner:', error);
        return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
    }
}

/**
 * @route PUT /api/staff/banners
 * @description Sắp xếp lại thứ tự hiển thị của nhiều banner
 * @body {Array} banners - Mảng các object chứa id và order mới
 * @example body: { banners: [{ id: 'abc123', order: 1 }, { id: 'def456', order: 2 }] }
 * @returns {Object} { success: true, message: 'Banners reordered successfully' }
 */
export async function PUT(req: Request) {
    try {
        await dbConnect();
        const { banners } = await req.json();

        if (!Array.isArray(banners)) {
            return NextResponse.json({ error: 'Banners array is required' }, { status: 400 });
        }

        for (const item of banners) {
            if (item.id && typeof item.order === 'number') {
                await Banner.findByIdAndUpdate(item.id, { order: item.order });
            }
        }

        return NextResponse.json({ success: true, message: 'Banners reordered successfully' });
    } catch (error) {
        console.error('Error reordering banners:', error);
        return NextResponse.json({ error: 'Failed to reorder banners' }, { status: 500 });
    }
}

/**
 * @route DELETE /api/staff/banners
 * @description Xóa banner
 * @body {string} id - ID banner cần xóa (bắt buộc)
 * @returns {Object} { success: true, message: 'Banner deleted successfully' }
 */
export async function DELETE(req: Request) {
    try {
        await dbConnect();
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const banner = await Banner.findByIdAndDelete(id);

        if (!banner) {
            return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error deleting banner:', error);
        return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
    }
}
