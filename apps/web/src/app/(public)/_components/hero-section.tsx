'use client';

import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import * as React from 'react';

const mobileBanners = [
  '/images/banner/mobile/banner01.jpg',
  '/images/banner/mobile/banner02.jpg',
  '/images/banner/mobile/banner03.jpg',
  '/images/banner/mobile/banner04.jpg',
];

const pcBanners = [
  '/images/banner/pc/banner01.jpg',
  '/images/banner/pc/banner02.jpg',
  '/images/banner/pc/banner03.jpg',
  '/images/banner/pc/banner04.jpg',
];

export const HeroSection = () => {
  const [activeMobile, setActiveMobile] = React.useState(0);
  const [activePc, setActivePc] = React.useState(0);

  // 移动端自动切换
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveMobile((prev) => (prev + 1) % mobileBanners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // PC端自动切换
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActivePc((prev) => (prev + 1) % pcBanners.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden">
      {/* PC端淡入淡出轮播，仅md及以上显示 */}
      <div className="hidden md:block absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={pcBanners[activePc]}
            src={pcBanners[activePc]}
            alt={`PC Banner ${activePc + 1}`}
            className="object-cover w-full h-full absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black opacity-40 z-10" />
      </div>

      {/* 移动端淡入淡出轮播，仅md以下显示 */}
      <div className="block md:hidden absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={mobileBanners[activeMobile]}
            src={mobileBanners[activeMobile]}
            alt={`Mobile Banner ${activeMobile + 1}`}
            className="object-cover w-full h-full absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-black opacity-40 z-10" />
      </div>

      {/* 内容区，始终居中显示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeInOut' }}
        className="relative z-20 text-center p-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-lg">Artistry at Your Fingertips</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-gray-200 text-shadow">
          Experience unparalleled nail care and design from our expert technicians.
        </p>
        <div className="mt-8">
          <Button size="lg" className="bg-pink-500 hover:bg-pink-600 text-white" asChild>
            <Link href="/book">Book Your Appointment Now</Link>
          </Button>
        </div>
      </motion.div>
    </section>
  );
};
