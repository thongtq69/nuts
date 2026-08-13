import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

const BASE_URL = 'https://gonuts.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticDefinitions = [
        { path: '', changeFrequency: 'daily' as const, priority: 1.0 },
        { path: '/products', changeFrequency: 'daily' as const, priority: 0.9 },
        { path: '/about', changeFrequency: 'monthly' as const, priority: 0.7 },
        { path: '/contact', changeFrequency: 'monthly' as const, priority: 0.6 },
        { path: '/news', changeFrequency: 'daily' as const, priority: 0.8 },
        { path: '/policy', changeFrequency: 'yearly' as const, priority: 0.3 },
        { path: '/subscriptions', changeFrequency: 'monthly' as const, priority: 0.6 },
        { path: '/tra-cuu-don-hang', changeFrequency: 'monthly' as const, priority: 0.4 },
    ];
    const staticPages: MetadataRoute.Sitemap = staticDefinitions.flatMap(page => {
        const viUrl = `${BASE_URL}${page.path}`;
        const enUrl = `${BASE_URL}/en${page.path}`;
        const alternates = { languages: { vi: viUrl, en: enUrl, 'x-default': viUrl } };
        return [
            { url: viUrl, lastModified: new Date(), changeFrequency: page.changeFrequency, priority: page.priority, alternates },
            { url: enUrl, lastModified: new Date(), changeFrequency: page.changeFrequency, priority: page.priority, alternates },
        ];
    });

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        await dbConnect();
        const products = await Product.find({})
            .select('_id translations.en.isPublished updatedAt')
            .lean();

        productPages = products.flatMap((product: any) => {
            const viUrl = `${BASE_URL}/products/${product._id.toString()}`;
            const enUrl = `${BASE_URL}/en/products/${product._id.toString()}`;
            const hasEnglishVersion = product.translations?.en?.isPublished === true;
            const alternates = {
                languages: hasEnglishVersion
                    ? { vi: viUrl, en: enUrl, 'x-default': viUrl }
                    : { vi: viUrl, 'x-default': viUrl },
            };
            const entries: MetadataRoute.Sitemap = [
                { url: viUrl, lastModified: product.updatedAt || new Date(), changeFrequency: 'weekly', priority: 0.8, alternates },
            ];
            if (hasEnglishVersion) {
                entries.push({ url: enUrl, lastModified: product.updatedAt || new Date(), changeFrequency: 'weekly', priority: 0.8, alternates });
            }
            return entries;
        });
    } catch (error) {
        console.error('Error generating product sitemap:', error);
    }

    // Dynamic blog/news pages
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        await dbConnect();
        const blogs = await Blog.find({ isPublished: true })
            .select('slug translations.en.slug translations.en.isPublished updatedAt')
            .lean();

        blogPages = blogs.flatMap((blog: any) => {
            const viUrl = `${BASE_URL}/news/${blog.slug}`;
            const enSlug = blog.translations?.en?.slug || blog.slug;
            const enUrl = `${BASE_URL}/en/news/${enSlug}`;
            const hasEnglishVersion = blog.translations?.en?.isPublished === true;
            const alternates = {
                languages: hasEnglishVersion
                    ? { vi: viUrl, en: enUrl, 'x-default': viUrl }
                    : { vi: viUrl, 'x-default': viUrl },
            };
            const entries: MetadataRoute.Sitemap = [
                { url: viUrl, lastModified: blog.updatedAt || new Date(), changeFrequency: 'weekly', priority: 0.7, alternates },
            ];
            if (hasEnglishVersion) {
                entries.push({ url: enUrl, lastModified: blog.updatedAt || new Date(), changeFrequency: 'weekly', priority: 0.7, alternates });
            }
            return entries;
        });
    } catch (error) {
        console.error('Error generating blog sitemap:', error);
    }

    return [...staticPages, ...productPages, ...blogPages];
}
