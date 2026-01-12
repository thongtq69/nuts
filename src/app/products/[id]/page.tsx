import { getProductById, getProducts } from '@/lib/api';
import ProductDetailView from '@/components/products/ProductDetailView';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
    // If we want SSG for all products. 
    // For many products, we might want to skip this or only generate popular ones.
    const products = await getProducts();
    return products.map((product) => ({
        id: product.id || (product as any)._id,
    }));
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProductById(id);

    // Fetch related products (mock logic: just get first 4)
    const allProducts = await getProducts();
    const relatedProducts = allProducts
        .filter(p => (p.id || (p as any)._id) !== id)
        .slice(0, 4);

    if (!product) {
        notFound();
    }

    return (
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
    );
}
