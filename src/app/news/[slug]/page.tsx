import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import BlogDetailClient from './BlogDetailClient';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://gonuts.vn';

async function getBlog(slug: string) {
    try {
        await dbConnect();
        const blog = await Blog.findOne({ slug, isPublished: true }).lean();
        if (!blog) return null;
        return {
            ...blog,
            _id: blog._id.toString(),
            createdAt: blog.createdAt?.toISOString?.() || new Date().toISOString(),
            updatedAt: blog.updatedAt?.toISOString?.() || new Date().toISOString(),
            publishedAt: blog.publishedAt?.toISOString?.() || undefined,
        } as any;
    } catch (error) {
        console.error('Error fetching blog:', error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) {
        return {
            title: 'Bài viết không tìm thấy',
        };
    }

    const title = blog.title;
    const description = blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '';
    const imageUrl = blog.coverImage || `${BASE_URL}/assets/images/gonuts-banner-member.png`;
    const articleUrl = `${BASE_URL}/news/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: articleUrl,
        },
        openGraph: {
            title: `${title} | Go Nuts`,
            description,
            url: articleUrl,
            siteName: 'Go Nuts',
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            locale: 'vi_VN',
            type: 'article',
            publishedTime: blog.publishedAt || blog.createdAt,
            modifiedTime: blog.updatedAt,
            authors: ['Go Nuts'],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Go Nuts`,
            description,
            images: [imageUrl],
        },
    };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const blog = await getBlog(slug);

    if (!blog) {
        return <BlogDetailClient blog={null} />;
    }

    const articleUrl = `${BASE_URL}/news/${slug}`;

    return (
        <>
            <ArticleJsonLd
                title={blog.title}
                description={blog.excerpt || ''}
                image={blog.coverImage}
                datePublished={blog.publishedAt || blog.createdAt}
                dateModified={blog.updatedAt}
                url={articleUrl}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'Trang chủ', url: BASE_URL },
                    { name: 'Tin tức', url: `${BASE_URL}/news` },
                    { name: blog.title },
                ]}
            />
            <BlogDetailClient blog={blog} />
        </>
    );
}
