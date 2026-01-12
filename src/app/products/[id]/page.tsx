import ProductDetailView from '@/components/products/ProductDetailView';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { IProduct } from '@/models/Product';

export async function generateStaticParams() {
    await dbConnect();
    const products = await Product.find({}).select('_id id').lean();
    return products.map((product: any) => ({
        id: product.id || String(product._id),
    }));
}

async function getProduct(id: string) {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product) return null;
    return { ...product, id: product._id.toString(), _id: product._id.toString() } as unknown as IProduct;
}

async function getRelatedProducts(currentId: string) {
    await dbConnect();
    const products = await Product.find({ _id: { $ne: currentId } }).limit(4).lean();
    return products.map((p: any) => ({ ...p, id: p._id.toString(), _id: p._id.toString() })) as unknown as IProduct[];
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Direct DB calls instead of API
    let product = null;
    try {
        product = await getProduct(id);
    } catch (e) {
        console.error('Error fetching product', e);
    }

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(id);

    return (
        <ProductDetailView product={product} relatedProducts={relatedProducts} />
    );
}
