'use client';

import { useBookingStore } from '@/store/booking.store';
import { Service, ServiceCard } from '@/components/services/ServiceCard';
import { useEffect, useState } from 'react';
import api from '@/lib/api';

export const SelectService = () => {
  const { setServiceId } = useBookingStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/services');
        const servicesData = response.data.data.map((service: any) => {
          const { serviceImages, ...restService } = service;
          const images = serviceImages.map((si: any) => si.image);
          return { ...restService, images };
        });
        setServices(servicesData);
      } catch (error) {
        console.error('Failed to fetch services', error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Step 1: Select a Service</h2>
      {loading ? (
        <p>Loading services...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            // We need a modified ServiceCard that calls setServiceId onClick
            <div key={service.id} onClick={() => setServiceId(service.id)} className="cursor-pointer">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
