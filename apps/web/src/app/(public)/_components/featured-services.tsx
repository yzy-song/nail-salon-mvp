'use client';

import { Service, ServiceCard } from '@/components/services/ServiceCard';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion'; // 1. 导入 Variants 类型

const containerVariants: Variants = { // 2. 添加显式类型
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = { // 3. 添加显式类型
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut', // 现在 TypeScript 能正确理解这个值了
    },
  },
};

export const FeaturedServices = () => {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['featured-services'],
    queryFn: async () => {
      const response = await api.get('/services?page=1&limit=3');
      const paginatedData = response.data.data;
      const servicesFromApi = paginatedData.list || paginatedData;

      if (!Array.isArray(servicesFromApi)) {
        return [];
      }

      return servicesFromApi.map((service: any) => {
        if (!service.serviceImages) return { ...service, images: [] };
        const { serviceImages, ...restService } = service;
        const images = serviceImages.map((si: any) => si.image);
        return { ...restService, images };
      });
    },
  });

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-center mb-12"
        >
          Our Featured Services
        </motion.h2>
        {isLoading ? (
          <p className="text-center">Loading services...</p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {services?.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <ServiceCard service={service} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};