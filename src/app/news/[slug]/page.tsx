import { Metadata } from 'next';
import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import BlogDetailClient from './BlogDetailClient';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getRequestLocale } from '@/i18n/server';
import { localizeBlog } from '@/lib/localized-content';
import type { Locale } from '@/i18n/config';
import { translate } from '@/i18n/messages';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://gonuts.vn';

async function getBlog(slug: string, locale: Locale) {
    try {
        await dbConnect();
        const blog = await Blog.findOne({
            isPublished: true,
            ...(locale === 'en' ? { 'translations.en.isPublished': true } : {}),
            $or: [{ slug }, { 'translations.en.slug': slug }],
        }).lean();
        if (!blog) return null;
        const localized = localizeBlog(blog as any, locale);
        return {
            ...localized,
            _id: blog._id.toString(),
            viSlug: blog.slug,
            enSlug: blog.translations?.en?.slug || blog.slug,
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
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';
    const blog = await getBlog(slug, locale);

    if (!blog) {
        return {
            title: isEnglish ? 'Article Not Found' : 'Bài viết không tìm thấy',
        };
    }

    const title = blog.title;
    const description = blog.excerpt || blog.content?.replace(/<[^>]*>/g, '').substring(0, 160) || '';
    const imageUrl = blog.coverImage || `${BASE_URL}/assets/images/gonuts-banner-member.png`;
    const articleUrl = `${BASE_URL}${isEnglish ? '/en' : ''}/news/${isEnglish ? blog.enSlug : blog.viSlug}`;

    return {
        title,
        description,
        alternates: {
            canonical: articleUrl,
            languages: {
                'vi-VN': `${BASE_URL}/news/${blog.viSlug}`,
                en: `${BASE_URL}/en/news/${blog.enSlug}`,
                'x-default': `${BASE_URL}/news/${blog.viSlug}`,
            },
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
            locale: isEnglish ? 'en_US' : 'vi_VN',
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
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';
    const blog = await getBlog(slug, locale);

    if (!blog) {
        return <BlogDetailClient blog={null} />;
    }

    const articleUrl = `${BASE_URL}${isEnglish ? '/en' : ''}/news/${isEnglish ? blog.enSlug : blog.viSlug}`;

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
                    { name: translate(locale, 'Trang chủ'), url: `${BASE_URL}${isEnglish ? '/en' : ''}` },
                    { name: translate(locale, 'Tin tức'), url: `${BASE_URL}${isEnglish ? '/en' : ''}/news` },
                    { name: blog.title },
                ]}
            />
            <BlogDetailClient blog={blog} />
        </>
    );
}
