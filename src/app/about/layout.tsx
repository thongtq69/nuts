import { Metadata } from 'next';
import { getRequestLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';
    return {
    title: isEnglish ? 'About Go Nuts | Our Story' : 'Về chúng tôi - Go Nuts | Câu chuyện thương hiệu hạt dinh dưỡng',
    description: isEnglish ? 'Discover Go Nuts, a premium natural-food brand connecting more than 5,000 Vietnamese farmers with customers.' : 'Tìm hiểu câu chuyện Go Nuts - thương hiệu hạt dinh dưỡng, thực phẩm sạch kết nối 5000+ nông dân Việt Nam với người tiêu dùng. 100% tự nhiên, cam kết chất lượng.',
    keywords: isEnglish ? ['Go Nuts', 'about us', 'premium nuts', 'Vietnamese farmers', 'natural food'] : ['Go Nuts', 'về chúng tôi', 'hạt dinh dưỡng', 'thực phẩm sạch', 'nông dân Việt Nam', 'thương hiệu organic'],
    alternates: {
        canonical: `https://gonuts.vn${isEnglish ? '/en' : ''}/about`,
        languages: { 'vi-VN': 'https://gonuts.vn/about', 'en-US': 'https://gonuts.vn/en/about', 'x-default': 'https://gonuts.vn/about' },
    },
    openGraph: {
        title: isEnglish ? 'About Go Nuts | Premium Natural Foods' : 'Về chúng tôi | Go Nuts - Hạt dinh dưỡng, Thực phẩm sạch',
        description: isEnglish ? 'Our story: connecting more than 5,000 Vietnamese farmers with customers through premium natural foods.' : 'Câu chuyện Go Nuts - thương hiệu hạt dinh dưỡng kết nối 5000+ nông dân Việt Nam. 100% tự nhiên, cam kết chất lượng.',
        url: `https://gonuts.vn${isEnglish ? '/en' : ''}/about`,
        images: [
            {
                url: 'https://gonuts.vn/assets/images/gonuts-banner-member.png?v=5',
                width: 1200,
                height: 630,
                alt: isEnglish ? 'About Go Nuts' : 'Go Nuts - Về chúng tôi',
            },
        ],
    },
    };
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
