import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Về chúng tôi - Go Nuts | Câu chuyện thương hiệu hạt dinh dưỡng',
    description: 'Tìm hiểu câu chuyện Go Nuts - thương hiệu hạt dinh dưỡng, thực phẩm sạch kết nối 5000+ nông dân Việt Nam với người tiêu dùng. 100% tự nhiên, cam kết chất lượng.',
    keywords: ['Go Nuts', 'về chúng tôi', 'hạt dinh dưỡng', 'thực phẩm sạch', 'nông dân Việt Nam', 'thương hiệu organic'],
    alternates: {
        canonical: 'https://gonuts.vn/about',
    },
    openGraph: {
        title: 'Về chúng tôi | Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch',
        description: 'Câu chuyện Go Nuts - thương hiệu hạt dinh dưỡng kết nối 5000+ nông dân Việt Nam. 100% tự nhiên, cam kết chất lượng.',
        url: 'https://gonuts.vn/about',
        images: [
            {
                url: 'https://gonuts.vn/assets/images/gonuts-banner-member.png?v=5',
                width: 1200,
                height: 630,
                alt: 'Go Nuts - Về chúng tôi',
            },
        ],
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
