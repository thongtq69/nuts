import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tin tức & Khuyến mãi | Go Nuts',
    description: 'Cập nhật tin tức mới nhất về hạt dinh dưỡng, thực phẩm sạch, các chương trình khuyến mãi và ưu đãi hấp dẫn từ Go Nuts.',
    keywords: ['tin tức Go Nuts', 'khuyến mãi hạt dinh dưỡng', 'ưu đãi Go Nuts', 'review hạt dinh dưỡng'],
    alternates: {
        canonical: 'https://gonuts.vn/news',
    },
    openGraph: {
        title: 'Tin tức & Khuyến mãi | Go Nuts',
        description: 'Cập nhật tin tức và khuyến mãi mới nhất từ Go Nuts - Hạt dinh dưỡng, thực phẩm sạch.',
        url: 'https://gonuts.vn/news',
    },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
