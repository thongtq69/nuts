import { Metadata } from 'next';
import ProductDetailView from '@/components/products/ProductDetailView';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { IProduct } from '@/models/Product';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://gonuts.vn';

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        return {
            title: 'Sản phẩm không tìm thấy',
        };
    }

    const title = product.name;
    const description = product.shortDescription || product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || `${product.name} - Hạt dinh dưỡng chất lượng cao từ Go Nuts`;
    const imageUrl = product.image?.startsWith('http') ? product.image : `${BASE_URL}${product.image}`;
    const productUrl = `${BASE_URL}/products/${id}`;

    return {
        title,
        description,
        alternates: {
            canonical: productUrl,
        },
        openGraph: {
            title: `${title} | Go Nuts`,
            description,
            url: productUrl,
            siteName: 'Go Nuts',
            images: [
                {
                    url: imageUrl,
                    width: 800,
                    height: 800,
                    alt: title,
                },
            ],
            locale: 'vi_VN',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | Go Nuts`,
            description,
            images: [imageUrl],
        },
    };
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
    const productUrl = `${BASE_URL}/products/${id}`;

    const availabilityMap: Record<string, 'InStock' | 'OutOfStock' | 'LimitedAvailability'> = {
        'in_stock': 'InStock',
        'out_of_stock': 'OutOfStock',
        'low_stock': 'LimitedAvailability',
    };

    return (
        <>
            <ProductJsonLd
                name={product.name}
                description={product.shortDescription || product.description?.replace(/<[^>]*>/g, '').substring(0, 300) || product.name}
                image={product.images?.length ? product.images : product.image}
                price={product.currentPrice}
                originalPrice={product.originalPrice}
                availability={availabilityMap[product.stockStatus || 'in_stock'] || 'InStock'}
                sku={product.sku}
                rating={product.rating}
                reviewCount={product.reviewsCount}
                url={productUrl}
            />
            <BreadcrumbJsonLd
                items={[
                    { name: 'Trang chủ', url: BASE_URL },
                    { name: 'Sản phẩm', url: `${BASE_URL}/products` },
                    { name: product.name },
                ]}
            />
            <ProductDetailView product={product} relatedProducts={relatedProducts} />
        </>
    );
}
