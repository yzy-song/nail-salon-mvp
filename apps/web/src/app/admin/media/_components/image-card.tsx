'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

// Define the Image type for the frontend
export type ImageType = {
  id: string;
  url: string;
  altText: string | null;
};

interface ImageCardProps {
  image: ImageType;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, onDelete, isDeleting }) => {
  return (
    <Card className="relative group">
      <CardContent className="p-0">
        <Image
          src={image.url}
          alt={image.altText || 'Uploaded image'}
          width={300}
          height={300}
          className="aspect-square object-cover w-full rounded-md"
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="icon"
            onClick={() => onDelete(image.id)}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};