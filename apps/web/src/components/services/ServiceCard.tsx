import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ServiceImage {
  id: string;
  url: string;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  images: ServiceImage[];
}

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
  const hasImages = service.images && service.images.length > 0;
  const placeholderImage = 'https://placehold.co/400x400.png?text=NailSalon';

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg">
      {/* --- Image Carousel is now the first direct child --- */}
      <Carousel className="w-full">
        <CarouselContent>
          {hasImages ? (
            service.images.map((image) => (
              <CarouselItem key={image.id}>
                <div className="relative w-full aspect-[4/3]">
                  <Image src={image.url} alt={service.name} fill style={{ objectFit: 'cover' }} />
                </div>
              </CarouselItem>
            ))
          ) : (
            <CarouselItem>
              <div className="relative w-full aspect-[4/3]">
                <Image src={placeholderImage} alt="Placeholder" fill style={{ objectFit: 'cover' }} />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        {hasImages && service.images.length > 1 && (
          <>
            <CarouselPrevious className="absolute left-4" />
            <CarouselNext className="absolute right-4" />
          </>
        )}
      </Carousel>

      {/* --- Text content is now separate and properly padded --- */}
      <div className="p-6 flex flex-col flex-grow">
        <CardHeader className="p-0">
          <CardTitle>{service.name}</CardTitle>
          <CardDescription className="mt-1">{service.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-4 flex-grow">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Duration:</span>
            <span className="font-semibold">{service.duration} mins</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold mt-2 text-pink-500">
            <span>Price:</span>
            <span>€{service.price}</span>
          </div>
        </CardContent>
        <CardFooter className="p-0 pt-4">
          <Button asChild className="w-full">
            <Link href={`/book?serviceId=${service.id}`}>Book Now</Link>
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
};
