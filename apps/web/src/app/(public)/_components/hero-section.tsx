// apps/web/src/app/(public)/_components/hero-section.tsx
'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Link from 'next/link';

export const HeroSection = () => {
  return (
    <section className="relative h-[90vh] flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-110 blur-sm"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1604654894610-df62318583e7?q=80&w=2070')",
        }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-40 z-10" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="relative z-20 text-center p-4"
      >
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-shadow-lg">
          Artistry at Your Fingertips
        </h1>
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