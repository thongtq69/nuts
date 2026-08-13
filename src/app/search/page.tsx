import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import SearchResults from './SearchResults';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getRequestLocale } from '@/i18n/server';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const { q } = await searchParams;
    const query = q || '';
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';
    const suffix = query ? `?q=${encodeURIComponent(query)}` : '';

    return {
        title: isEnglish
            ? (query ? `Search results for "${query}" | Go Nuts` : 'Search Products | Go Nuts')
            : (query ? `Kết quả tìm kiếm cho "${query}" | Go Nuts` : 'Tìm kiếm sản phẩm | Go Nuts'),
        description: query
            ? (isEnglish ? `Find Go Nuts products matching "${query}".` : `Kết quả tìm kiếm các sản phẩm hạt dinh dưỡng, thực phẩm sạch liên quan đến "${query}" tại Go Nuts.`)
            : (isEnglish ? 'Search premium nuts, dried fruits and natural foods at Go Nuts.' : 'Tìm kiếm các sản phẩm hạt dinh dưỡng, thực phẩm sạch tại cửa hàng Go Nuts.'),
        robots: {
            index: false, // Thường không index trang search để tránh nội dung mỏng, nhưng cho phép crawl
            follow: true,
        },
        alternates: {
            canonical: `https://gonuts.vn${isEnglish ? '/en' : ''}/search${suffix}`,
            languages: {
                'vi-VN': `https://gonuts.vn/search${suffix}`,
                'en-US': `https://gonuts.vn/en/search${suffix}`,
                'x-default': `https://gonuts.vn/search${suffix}`,
            },
        },
    };
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams;
    const query = q || '';

    return (
        <main>
            <Header />
            <Navbar />
            <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tìm kiếm' }]} />

            <BreadcrumbJsonLd
                items={[
                    { name: 'Trang chủ', url: 'https://gonuts.vn' },
                    { name: 'Tìm kiếm' },
                ]}
            />

            <SearchResults query={query} />

            <Footer />
        </main>
    );
}

