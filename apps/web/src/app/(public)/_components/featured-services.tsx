'use client';

import { Service, ServiceCard } from '@/components/services/ServiceCard';
import api from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { motion, Variants } from 'framer-motion'; // 1. Import the 'Variants' type

// 2. Explicitly type the variants objects
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Makes cards appear one by one
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut', // This is now correctly typed
    },
  },
};

export const FeaturedServices = () => {
  const { data: services, isLoading } = useQuery<Service[]>({
    queryKey: ['featured-services'],
    queryFn: async () => {
      // Fetch data. Note: The backend /services endpoint is not paginated.
      const response = await api.get('/services');
      const servicesFromApi = response.data.data;

      if (!Array.isArray(servicesFromApi)) {
        console.error('Fetched data is not an array:', servicesFromApi);
        return [];
      }

      // Flatten the data structure to match what ServiceCard expects
      const servicesData = servicesFromApi.map((service: any) => {
        if (!service.serviceImages) return { ...service, images: [] };
        const { serviceImages, ...restService } = service;
        const images = serviceImages.map((si: any) => si.image);
        return { ...restService, images };
      });

      // Return only the first 3 services for the homepage
      return servicesData.slice(0, 3);
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
          // 3. Re-introduce the motion.div wrappers
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible" // Animate when the section scrolls into view
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
