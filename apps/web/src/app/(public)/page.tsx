import { FeaturedServices } from './_components/featured-services';
import { HeroSection } from './_components/hero-section';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedServices />
      {/* 未来可以在这里添加更多模块, 比如 "Why Choose Us" 或客户评价 */}
    </div>
  );
}