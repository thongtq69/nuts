import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import PromotionBanner from '@/components/home/PromotionBanner';
import ProductSection from '@/components/home/ProductSection';
import LargePromoBanner from '@/components/home/LargePromoBanner';
import FeaturesSection from '@/components/home/FeaturesSection';
import AffiliateRegisterSection from '@/components/home/AffiliateRegisterSection';
import LatestNews from '@/components/home/LatestNews';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';
import { HOMEPAGE_SECTION_CONFIG } from '@/lib/homepage-products';
import { getRequestLocale } from '@/i18n/server';
import { localizeProduct } from '@/lib/localized-content';

export const dynamic = 'force-dynamic';

async function getProductsByTag(tag: string, limit = 4) {
  try {
    console.log(`🔍 Fetching products by tag: ${tag}`);

    await dbConnect();
    console.log('✅ Database connected for tag query');

    // Sort logic: priority first, then newest first
    const sortParams: { [key: string]: any } = { sortOrder: -1, createdAt: -1 };

    // For best-seller tag, we might want to prioritize soldCount if sortOrder is equal
    if (tag === 'best-seller') {
      sortParams.soldCount = -1;
    }

    const sectionByTag = {
      'best-seller': HOMEPAGE_SECTION_CONFIG.bestSeller,
      new: HOMEPAGE_SECTION_CONFIG.new,
      promo: HOMEPAGE_SECTION_CONFIG.promo,
    } as const;
    const sectionConfig = sectionByTag[tag as keyof typeof sectionByTag];
    const hasHomepageSelection = sectionConfig
      ? Boolean(await Product.exists({ [sectionConfig.field]: { $exists: true } }))
      : false;
    const productFilter = hasHomepageSelection && sectionConfig
      ? { [sectionConfig.field]: true, isLinkedProduct: { $ne: true } }
      : { tags: tag, isLinkedProduct: { $ne: true } };

    const products = await Product.find(productFilter)
      .sort(sortParams as any)
      .limit(limit)
      .lean();
    console.log(`✅ Found ${products.length} products for tag: ${tag}`);

    // If no products found with specific tag, get any products as fallback
    if (products.length === 0 && !hasHomepageSelection) {
      console.log(`⚠️ No products found for tag: ${tag}, getting fallback products`);
      const fallbackProducts = await Product.find({ isLinkedProduct: { $ne: true } })
        .sort({ sortOrder: -1, createdAt: -1 } as any)
        .limit(limit)
        .lean();
      console.log(`✅ Found ${fallbackProducts.length} fallback products`);

      return fallbackProducts.map((p: any) => ({
        ...p,
        id: p._id.toString(),
        _id: p._id.toString()
      })) as unknown as IProduct[];
    }

    return products.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      _id: p._id.toString()
    })) as unknown as IProduct[];
  } catch (error: any) {
    console.error(`❌ Error fetching products for tag ${tag}:`, error.message);

    // Final fallback: try to get any products
    try {
      await dbConnect();
      const anyProducts = await Product.find({ isLinkedProduct: { $ne: true } }).limit(limit).lean();
      console.log(`🔄 Fallback: Found ${anyProducts.length} any products`);

      return anyProducts.map((p: any) => ({
        ...p,
        id: p._id.toString(),
        _id: p._id.toString()
      })) as unknown as IProduct[];
    } catch (fallbackError) {
      console.error(`❌ Fallback also failed:`, fallbackError);
      return [];
    }
  }
}

async function getLinkedProducts(limit = 6) {
  try {
    await dbConnect();

    const config = HOMEPAGE_SECTION_CONFIG.linked;
    const hasHomepageSelection = Boolean(
      await Product.exists({ [config.field]: { $exists: true } }),
    );
    const products = await Product.find(
      hasHomepageSelection
        ? { isLinkedProduct: true, [config.field]: true }
        : { isLinkedProduct: true },
    )
      .sort({ sortOrder: -1, createdAt: -1 } as any)
      .limit(limit)
      .lean();

    return products.map((product: any) => ({
      ...product,
      id: product._id.toString(),
      _id: product._id.toString(),
    })) as unknown as IProduct[];
  } catch (error: any) {
    console.error('Failed to fetch linked products for homepage:', error.message);
    return [];
  }
}

export default async function Home() {
  console.log('🏠 Home page: Starting to fetch products...');

  const locale = await getRequestLocale();
  const [bestSellerData, newProductData, promotionProductData, linkedProductData] = await Promise.all([
    getProductsByTag('best-seller', 8),
    getProductsByTag('new', 8),
    getProductsByTag('promo', 8),
    getLinkedProducts(6),
  ]);
  const bestSellers = bestSellerData.map(product => localizeProduct(product as any, locale)) as unknown as IProduct[];
  const newProducts = newProductData.map(product => localizeProduct(product as any, locale)) as unknown as IProduct[];
  const promotionProducts = promotionProductData.map(product => localizeProduct(product as any, locale)) as unknown as IProduct[];
  const linkedProducts = linkedProductData.map(product => localizeProduct(product as any, locale)) as unknown as IProduct[];

  console.log('🏠 Home page: Products fetched:', {
    bestSellers: bestSellers.length,
    newProducts: newProducts.length,
    promotionProducts: promotionProducts.length,
    linkedProducts: linkedProducts.length,
  });

  return (
    <main>
      <h1 className="sr-only">Go Nuts - Hạt dinh dưỡng, Trái cây sấy & Thực phẩm sạch từ nông dân Việt Nam</h1>
      <Header />
      <Navbar />
      <ErrorBoundary>
        <HeroSlider />
      </ErrorBoundary>
      <PromotionBanner />
      {bestSellers.length > 0 && (
        <ErrorBoundary>
          <ProductSection title="Sản phẩm bán chạy" products={bestSellers as any} />
        </ErrorBoundary>
      )}
      <LargePromoBanner />
      {newProducts.length > 0 && (
        <ErrorBoundary>
          <ProductSection title="Sản phẩm mới" products={newProducts as any} />
        </ErrorBoundary>
      )}
      {promotionProducts.length > 0 && (
        <ErrorBoundary>
          <ProductSection title="Khuyến mãi" products={promotionProducts as any} />
        </ErrorBoundary>
      )}
      {linkedProducts.length > 0 && (
        <ErrorBoundary>
          <ProductSection
            title="Sản phẩm liên kết"
            products={linkedProducts as any}
            viewMoreHref="/products?linked=1"
            paginate={false}
          />
        </ErrorBoundary>
      )}
      <FeaturesSection />
      <ErrorBoundary>
        <LatestNews />
      </ErrorBoundary>
      <AffiliateRegisterSection />
      <Footer />
    </main>
  );
}
