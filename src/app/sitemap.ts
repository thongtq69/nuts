import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Blog from '@/models/Blog';

const BASE_URL = 'https://gonuts.vn';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/news`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/search`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `${BASE_URL}/subscriptions`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${BASE_URL}/tra-cuu-don-hang`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.4,
        },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        await dbConnect();
        const products = await Product.find({})
            .select('_id updatedAt')
            .lean();

        productPages = products.map((product: any) => ({
            url: `${BASE_URL}/products/${product._id.toString()}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Error generating product sitemap:', error);
    }

    // Dynamic blog/news pages
    let blogPages: MetadataRoute.Sitemap = [];
    try {
        await dbConnect();
        const blogs = await Blog.find({ isPublished: true })
            .select('slug updatedAt')
            .lean();

        blogPages = blogs.map((blog: any) => ({
            url: `${BASE_URL}/news/${blog.slug}`,
            lastModified: blog.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Error generating blog sitemap:', error);
    }

    return [...staticPages, ...productPages, ...blogPages];
}
