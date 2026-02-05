import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PageContent from '@/models/PageContent';

export const dynamic = 'force-dynamic';

// GET - Lấy nội dung trang theo slug
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();
        const { slug } = await params;

        let content = await PageContent.findOne({ slug }).lean();

        if (!content) {
            // Nếu là những slug mặc định, có thể khởi tạo hoặc trả về rỗng thay vì 404
            const defaultTitles: Record<string, string> = {
                'about-us': 'Về Go Nuts',
                'return-policy': 'Chính sách đổi trả',
                'privacy-policy': 'Chính sách bảo mật',
                'terms': 'Điều khoản sử dụng',
                'shipping-policy': 'Chính sách vận chuyển'
            };

            if (defaultTitles[slug]) {
                return NextResponse.json({
                    slug,
                    title: defaultTitles[slug],
                    content: '<p>Nội dung đang được cập nhật...</p>',
                });
            }

            return NextResponse.json({ error: 'Page content not found' }, { status: 404 });
        }

        return NextResponse.json(content);
    } catch (error) {
        console.error('Error fetching page content:', error);
        return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 });
    }
}

// PUT - Cập nhật nội dung trang
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        await dbConnect();
        const { slug } = await params;
        const body = await request.json();

        const content = await PageContent.findOneAndUpdate(
            { slug },
            {
                $set: {
                    ...body,
                    slug // Đảm bảo slug không bị đổi nếu gửi body khác
                }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            content
        });
    } catch (error: any) {
        console.error('Error updating page content:', error);
        return NextResponse.json({ error: error.message || 'Failed to update page content' }, { status: 500 });
    }
}
