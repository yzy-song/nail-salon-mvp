import { FeaturedServices } from '@/app/(public)/_components/featured-services';
import { HeroSection } from '@/app/(public)/_components/hero-section';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturedServices />
      {/* We can add more sections here later */}
    </div>
  );
}