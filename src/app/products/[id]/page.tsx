import { Metadata } from 'next';
import ProductDetailView from '@/components/products/ProductDetailView';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { IProduct } from '@/models/Product';
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { getRequestLocale } from '@/i18n/server';
import { isPublishedForLocale, localizeProduct } from '@/lib/localized-content';
import type { Locale } from '@/i18n/config';
import { translate } from '@/i18n/messages';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://gonuts.vn';

async function getProduct(id: string, locale: Locale) {
    await dbConnect();
    const product = await Product.findById(id).lean();
    if (!product || !isPublishedForLocale(product as any, locale)) return null;
    return localizeProduct({ ...product, id: product._id.toString(), _id: product._id.toString() } as any, locale) as unknown as IProduct;
}

async function getRelatedProducts(currentId: string, locale: Locale) {
    await dbConnect();
    const products = await Product.find({
        _id: { $ne: currentId },
        ...(locale === 'en' ? { 'translations.en.isPublished': { $ne: false } } : {}),
    }).limit(4).lean();
    return products.map((p: any) => localizeProduct({ ...p, id: p._id.toString(), _id: p._id.toString() }, locale)) as unknown as IProduct[];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';
    const product = await getProduct(id, locale);

    if (!product) {
        return {
            title: isEnglish ? 'Product Not Found' : 'Sản phẩm không tìm thấy',
        };
    }

    const title = product.name;
    const description = product.shortDescription || product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || (isEnglish
        ? `${product.name} – a quality nutritious product from Go Nuts`
        : `${product.name} - Hạt dinh dưỡng chất lượng cao từ Go Nuts`);
    const imageUrl = product.image?.startsWith('http') ? product.image : `${BASE_URL}${product.image}`;
    const productUrl = `${BASE_URL}${isEnglish ? '/en' : ''}/products/${id}`;

    return {
        title,
        description,
        alternates: {
            canonical: productUrl,
            languages: {
                'vi-VN': `${BASE_URL}/products/${id}`,
                en: `${BASE_URL}/en/products/${id}`,
                'x-default': `${BASE_URL}/products/${id}`,
            },
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
            locale: isEnglish ? 'en_US' : 'vi_VN',
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
    const locale = await getRequestLocale();
    const isEnglish = locale === 'en';

    // Direct DB calls instead of API
    let product = null;
    try {
        product = await getProduct(id, locale);
    } catch (e) {
        console.error('Error fetching product', e);
    }

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(id, locale);
    const productUrl = `${BASE_URL}${isEnglish ? '/en' : ''}/products/${id}`;

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
                    { name: translate(locale, 'Trang chủ'), url: `${BASE_URL}${isEnglish ? '/en' : ''}` },
                    { name: translate(locale, 'Sản phẩm'), url: `${BASE_URL}${isEnglish ? '/en' : ''}/products` },
                    { name: product.name },
                ]}
            />
            <ProductDetailView product={product} relatedProducts={relatedProducts} />
        </>
    );
}
