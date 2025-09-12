import { FeaturedServices } from '@/app/(public)/_components/featured-services';
import { HeroSection } from '@/app/(public)/_components/hero-section';

export default function HomePage() {
  return (
    <main className="bg-gradient-to-b from-pink-50 via-white to-white min-h-screen">
      <HeroSection />

      {/* 渐变分割线 */}
      <div className="h-12 bg-gradient-to-b from-transparent to-pink-100 w-full" />

      {/* 特色服务区块，带阴影和圆角 */}
      <section className="relative z-10 -mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="rounded-3xl shadow-2xl bg-white/90 backdrop-blur-md">
            <FeaturedServices />
          </div>
        </div>
      </section>

      {/* 品牌介绍/愿景区块 */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-pink-50 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-pink-500">美甲艺术 · 让美丽触手可及</h2>
          <p className="text-gray-600 text-lg md:text-xl mb-6">
            我们致力于为每一位顾客带来高品质的美甲体验，融合时尚与健康，让指尖成为自信的表达。无论是日常护理还是创意造型，专业团队为你量身定制专属美丽。
          </p>
        </div>
      </section>
    </main>
  );
}
