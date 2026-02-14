import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Breadcrumb from '@/components/common/Breadcrumb';
import SearchResults from './SearchResults';
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string }> }): Promise<Metadata> {
    const { q } = await searchParams;
    const query = q || '';

    return {
        title: query ? `Kết quả tìm kiếm cho "${query}" | Go Nuts` : 'Tìm kiếm sản phẩm | Go Nuts',
        description: query
            ? `Kết quả tìm kiếm các sản phẩm hạt dinh dưỡng, thực phẩm sạch liên quan đến "${query}" tại Go Nuts.`
            : 'Tìm kiếm các sản phẩm hạt dinh dưỡng, thực phẩm sạch tại cửa hàng Go Nuts.',
        robots: {
            index: false, // Thường không index trang search để tránh nội dung mỏng, nhưng cho phép crawl
            follow: true,
        },
        alternates: {
            canonical: `https://gonuts.vn/search${query ? `?q=${encodeURIComponent(query)}` : ''}`,
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


