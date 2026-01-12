import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSlider from '@/components/home/HeroSlider';
import PromotionBanner from '@/components/home/PromotionBanner';
import ProductSection from '@/components/home/ProductSection';
import LargePromoBanner from '@/components/home/LargePromoBanner';
import FeaturesSection from '@/components/home/FeaturesSection';

// Mock Data matching index.html structure
const bestSellers = [
  { id: 1, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 2, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 3, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: 'red' as const },
  { id: 4, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: 'red' as const },
  { id: 5, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: 'green' as const, buttonColor: 'green' as const },
  { id: 6, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: 'pink' as const, buttonColor: 'pink' as const, priceColor: 'pink' as const },
];

const newProducts = [
  { id: 1, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 40.00', badgeColor: 'red' as const },
  { id: 2, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 3, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 4, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 5, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 6, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
];

const promotionProducts = [
  { id: 1, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 40.00', badgeColor: 'red' as const },
  { id: 2, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 3, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 4, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: 'red' as const },
  { id: 5, image: '/assets/images/product1.jpg', name: 'Farmley Panchmeva', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
  { id: 6, image: '/assets/images/product2.jpg', name: 'Farmley Berry Mix', currentPrice: 'From Rs. 345.00', originalPrice: 'Rs. 400.00', badgeText: 'Save Rs. 55.00', badgeColor: '' as const },
];

export default function Home() {
  return (
    <main>
      <Header />
      <Navbar />
      <HeroSlider />
      <PromotionBanner />
      <ProductSection title="Sản phẩm bán chạy" products={bestSellers} />
      <LargePromoBanner />
      <ProductSection title="Sản phẩm mới" products={newProducts} />
      <ProductSection title="Khuyến mãi" products={promotionProducts} />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
