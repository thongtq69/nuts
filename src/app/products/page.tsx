import { Metadata } from "next";
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import SiteSettings, { ISiteSettings } from '@/models/SiteSettings';
import ProductList from '@/components/products/ProductList';

export const metadata: Metadata = {
    title: "Tất cả sản phẩm | Go Nuts",
    description: "Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.",
    openGraph: {
        title: "Tất cả sản phẩm | Go Nuts",
        description: "Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.",
        images: [
            {
                url: "https://gonuts.vn/assets/images/gonuts-banner-member.png?v=5",
                width: 1200,
                height: 630,
                alt: "Go Nuts Products",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Tất cả sản phẩm | Go Nuts",
        description: "Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.",
        images: ["https://gonuts.vn/assets/images/gonuts-banner-member.png?v=5"],
    },
};

export const dynamic = 'force-dynamic';

// Direct database query for server-side rendering
async function getProducts(): Promise<IProduct[]> {
    try {
        await dbConnect();
        const products = await Product.find({}).sort({ sortOrder: -1, createdAt: -1 } as any).lean();

        // Serialize MongoDB documents
        return products.map((product: any) => ({
            ...product,
            _id: product._id.toString(),
            id: product._id.toString(),
            createdAt: product.createdAt?.toISOString(),
            updatedAt: product.updatedAt?.toISOString(),
        }));
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        return [];
    }
}

async function getSiteSettings(): Promise<Partial<ISiteSettings>> {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne().sort({ updatedAt: -1 }).lean();
        if (settings) {
            return {
                productsBannerUrl: settings.productsBannerUrl,
                productsBannerEnabled: settings.productsBannerEnabled
            };
        }
    } catch (error) {
        console.error('❌ Error fetching site settings:', error);
    }
    return {
        productsBannerUrl: '/assets/images/gonuts-banner-member.png',
        productsBannerEnabled: true
    };
}

export default async function ProductsPage() {
    const [products, settings] = await Promise.all([
        getProducts(),
        getSiteSettings()
    ]);

    return <ProductList products={products} initialSettings={settings} />;
}
