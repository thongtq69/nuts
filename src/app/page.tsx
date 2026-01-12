import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import PromotionBanner from '@/components/home/PromotionBanner';
import ProductSection from '@/components/home/ProductSection';
import LargePromoBanner from '@/components/home/LargePromoBanner';
import FeaturesSection from '@/components/home/FeaturesSection';
import dbConnect from '@/lib/db';
import Product, { IProduct } from '@/models/Product';

async function getProductsByTag(tag: string, limit = 4) {
  try {
    await dbConnect();
    const products = await Product.find({ tags: tag }).limit(limit).lean();
    return products.map((p: any) => ({
      ...p,
      id: p._id.toString(),
      _id: p._id.toString()
    })) as unknown as IProduct[];
  } catch (error) {
    console.error(`Error fetching products for tag ${tag}:`, error);
    return [];
  }
}

export default async function Home() {
  const bestSellers = await getProductsByTag('best-seller', 8);
  const newProducts = await getProductsByTag('new', 8);
  const promotionProducts = await getProductsByTag('promo', 8);

  return (
    <main>
      <Header />
      <Navbar />
      <HeroSlider />
      <PromotionBanner />
      <ProductSection title="Sản phẩm bán chạy" products={bestSellers as any} />
      <LargePromoBanner />
      <ProductSection title="Sản phẩm mới" products={newProducts as any} />
      <ProductSection title="Khuyến mãi" products={promotionProducts as any} />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
