import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import PageContent from '@/models/PageContent';

export const dynamic = 'force-dynamic';

// Default stats for about-us page
const defaultStats = [
    { label: 'Nông dân liên kết', value: '5000+', icon: 'Users', color: 'bg-blue-50 text-blue-600' },
    { label: 'Tự nhiên & Sạch', value: '100%', icon: 'Sprout', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Tỉnh thành', value: '20+', icon: 'Award', color: 'bg-amber-50 text-amber-600' },
    { label: 'Khách hàng tin dùng', value: '50K+', icon: 'Heart', color: 'bg-pink-50 text-pink-600' },
];

const defaultCommitments = [
    { text: '100% Nguyên liệu tự nhiên tuyển chọn' },
    { text: 'Không chất bảo quản - Không chất tạo màu' },
    { text: 'Quy trình chế biến đạt chuẩn ISO & HACCP' },
    { text: 'Đồng hành bền vững cùng nông dân Việt' },
];

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
            const defaultTitles: Record<string, string> = {
                'about-us': 'Về Go Nuts',
                'return-policy': 'Chính sách đổi trả',
                'privacy-policy': 'Chính sách bảo mật',
                'terms': 'Điều khoản sử dụng',
                'shipping-policy': 'Chính sách vận chuyển'
            };

            if (defaultTitles[slug]) {
                const defaultData: Record<string, any> = {
                    slug,
                    title: defaultTitles[slug],
                    content: '<p>Nội dung đang được cập nhật...</p>',
                };

                // Add extra fields for about-us page
                if (slug === 'about-us') {
                    defaultData.subtitle = 'Kết nối tinh hoa nông sản Việt với trái tim ngườI tiêu dùng toàn cầu.';
                    defaultData.stats = defaultStats;
                    defaultData.commitments = defaultCommitments;
                    defaultData.heroImage = {
                        url: '/assets/images/product1.jpg',
                        alt: 'Go Nuts Background',
                    };
                    defaultData.sideImage = {
                        url: '/assets/images/product1.jpg',
                        alt: 'Go Nuts Team',
                    };
                }

                return NextResponse.json(defaultData);
            }

            return NextResponse.json({ error: 'Page content not found' }, { status: 404 });
        }

        // Ensure stats and commitments exist for about-us
        if (slug === 'about-us') {
            if (!content.stats || (content.stats as any[]).length === 0) {
                (content as any).stats = defaultStats;
            }
            if (!content.commitments || (content.commitments as any[]).length === 0) {
                (content as any).commitments = defaultCommitments;
            }
            if (!content.heroImage) {
                (content as any).heroImage = { url: '/assets/images/product1.jpg', alt: 'Go Nuts Background' };
            }
            if (!content.sideImage) {
                (content as any).sideImage = { url: '/assets/images/product1.jpg', alt: 'Go Nuts Team' };
            }
            if (!content.subtitle) {
                (content as any).subtitle = 'Kết nối tinh hoa nông sản Việt với trái tim ngườI tiêu dùng toàn cầu.';
            }
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

        // Build update object with all possible fields
        const updateData: any = {
            title: body.title,
            content: body.content,
            slug,
        };

        // Add optional fields if they exist
        if (body.subtitle !== undefined) updateData.subtitle = body.subtitle;
        if (body.heroImage !== undefined) updateData.heroImage = body.heroImage;
        if (body.sideImage !== undefined) updateData.sideImage = body.sideImage;
        if (body.stats !== undefined) updateData.stats = body.stats;
        if (body.commitments !== undefined) updateData.commitments = body.commitments;
        if (body.metadata !== undefined) updateData.metadata = body.metadata;

        const content = await PageContent.findOneAndUpdate(
            { slug },
            { $set: updateData },
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
