import { ServiceCard, Service } from '@/components/services/ServiceCard';
import api from '@/lib/api';

// Define the raw type coming from the backend API
interface RawServiceData {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  serviceImages: {
    image: {
      id: string;
      url: string;
    };
  }[];
}
// This is a Server Component, so we can make it async and fetch data directly.
async function getServices(): Promise<Service[]> {
  try {
    // The response data will be an array of our raw type
    const response = await api.get<{ data: RawServiceData[] }>('/services');
    
    // 3. Map the raw data to the clean component type, no `any` needed!
    const servicesData = response.data.data.map((service) => {
      // TypeScript now understands the shape of `service` perfectly
      const { serviceImages, ...restService } = service;
      const images = serviceImages.map((si) => si.image);
      return { ...restService, images };
    });

    return servicesData;
  } catch (error) {
    console.error('Failed to fetch services:', error);
    return []; // Return an empty array on error
  }
}

const ServicesPage = async () => {
  const services = await getServices();

  return (
    <div className="container mx-auto py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Our Services</h1>
        <p className="mt-4 text-lg text-gray-600">
          Choose from our wide range of professional nail services.
        </p>
      </div>
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          <p>No services available at the moment. Please check back later.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;