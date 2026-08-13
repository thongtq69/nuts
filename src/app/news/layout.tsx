import { Metadata } from 'next';
import { getRequestLocale } from '@/i18n/server';

export async function generateMetadata(): Promise<Metadata> {
    const isEnglish = (await getRequestLocale()) === 'en';
    return {
    title: isEnglish ? 'News & Promotions | Go Nuts' : 'Tin tức & Khuyến mãi | Go Nuts',
    description: isEnglish ? 'Latest Go Nuts stories, healthy-living guides, product news and special offers.' : 'Cập nhật tin tức mới nhất về hạt dinh dưỡng, thực phẩm sạch, các chương trình khuyến mãi và ưu đãi hấp dẫn từ Go Nuts.',
    keywords: isEnglish ? ['Go Nuts news', 'healthy food guides', 'Go Nuts promotions'] : ['tin tức Go Nuts', 'khuyến mãi hạt dinh dưỡng', 'ưu đãi Go Nuts', 'review hạt dinh dưỡng'],
    alternates: {
        canonical: `https://gonuts.vn${isEnglish ? '/en' : ''}/news`,
        languages: { 'vi-VN': 'https://gonuts.vn/news', 'en-US': 'https://gonuts.vn/en/news', 'x-default': 'https://gonuts.vn/news' },
    },
    openGraph: {
        title: isEnglish ? 'News & Promotions | Go Nuts' : 'Tin tức & Khuyến mãi | Go Nuts',
        description: isEnglish ? 'Latest Go Nuts news, healthy-living guides and special offers.' : 'Cập nhật tin tức và khuyến mãi mới nhất từ Go Nuts - Hạt dinh dưỡng, thực phẩm sạch.',
        url: `https://gonuts.vn${isEnglish ? '/en' : ''}/news`,
    },
    };
}

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
