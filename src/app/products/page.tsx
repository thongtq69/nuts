import { Metadata } from "next";
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import ProductList from '@/components/products/ProductList';

export const metadata: Metadata = {
    title: "Tất cả sản phẩm | Go Nuts",
    description: "Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.",
    openGraph: {
        title: "Tất cả sản phẩm | Go Nuts",
        description: "Khám phá danh mục các loại hạt dinh dưỡng, trái cây sấy và combo quà tặng từ Go Nuts.",
        images: [
            {
                url: "/assets/images/promotion.png",
                width: 1200,
                height: 630,
                alt: "Go Nuts Products",
            },
        ],
    },
};

export const dynamic = 'force-dynamic';

// Direct database query for server-side rendering (more reliable than API call)
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

export default async function ProductsPage() {
    const products = await getProducts();
    return <ProductList products={products} />;
}
