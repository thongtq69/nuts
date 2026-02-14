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

    const products = await Product.find({ tags: tag })
      .sort(sortParams as any)
      .limit(limit)
      .lean();
    console.log(`✅ Found ${products.length} products for tag: ${tag}`);

    // If no products found with specific tag, get any products as fallback
    if (products.length === 0) {
      console.log(`⚠️ No products found for tag: ${tag}, getting fallback products`);
      const fallbackProducts = await Product.find({})
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
      const anyProducts = await Product.find({}).limit(limit).lean();
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

export default async function Home() {
  console.log('🏠 Home page: Starting to fetch products...');

  const bestSellers = await getProductsByTag('best-seller', 8);
  const newProducts = await getProductsByTag('new', 8);
  const promotionProducts = await getProductsByTag('promo', 8);

  console.log('🏠 Home page: Products fetched:', {
    bestSellers: bestSellers.length,
    newProducts: newProducts.length,
    promotionProducts: promotionProducts.length
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
      <ErrorBoundary>
        <ProductSection title="Sản phẩm bán chạy" products={bestSellers as any} />
      </ErrorBoundary>
      <LargePromoBanner />
      <ErrorBoundary>
        <ProductSection title="Sản phẩm mới" products={newProducts as any} />
      </ErrorBoundary>
      <ErrorBoundary>
        <ProductSection title="Khuyến mãi" products={promotionProducts as any} />
      </ErrorBoundary>
      <FeaturesSection />
      <ErrorBoundary>
        <LatestNews />
      </ErrorBoundary>
      <AffiliateRegisterSection />
      <Footer />
    </main>
  );
}

