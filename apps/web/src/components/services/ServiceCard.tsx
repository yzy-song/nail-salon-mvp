import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// 定义图片类型
interface ServiceImage {
  id: string;
  url: string;
}

// 接口定义中的核心修改
export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  images: ServiceImage[]; // <-- 从 serviceImages 修改为 images
}

interface ServiceCardProps {
  service: Service;
}


export const ServiceCard = ({ service }: ServiceCardProps) => {
  // 获取封面图代码中的核心修改
  const coverImage = service.images?.[0]?.url || 'https://placehold.co/400x400.png?text=NailSalon';
  
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="relative w-full h-48 mb-4">
          <Image
            src={coverImage}
            alt={service.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
        <CardTitle>{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Duration:</span>
          <span className="font-semibold">{service.duration} mins</span>
        </div>
        <div className="flex justify-between items-center text-lg font-bold mt-2 text-pink-500">
          <span>Price:</span>
          <span>€{service.price}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/book?serviceId=${service.id}`}>Book Now</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};