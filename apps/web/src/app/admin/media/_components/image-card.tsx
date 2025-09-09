// apps/web/src/app/admin/media/_components/image-card.tsx
'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash,CheckCircle2 } from 'lucide-react';

export type ImageType = {
  id: string;
  url: string;
  altText: string | null;
};

interface ImageCardProps {
  image: ImageType;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({ 
  image, 
  isSelected, 
  onSelect, 
  onDelete, 
  isDeleting 
}) => {
  return (
    <Card 
      className={`relative group transition-all duration-200 ${isSelected ? 'ring-2 ring-pink-500' : ''}`}
      onClick={() => onSelect(image.id)}
    >
      <CardContent className="p-0 cursor-pointer">
        <Image
          src={image.url}
          alt={image.altText || 'Uploaded image'}
          width={300}
          height={300}
          className="aspect-square object-cover w-full rounded-md"
        />
        {/* Selection Checkbox */}
        <div className={`absolute top-2 left-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
           <div className={`h-6 w-6 rounded-md flex items-center justify-center ${isSelected ? 'bg-pink-500 border-pink-500' : 'bg-white/50 border-gray-400 border'}`}>
            {isSelected && <CheckCircle2 className="h-5 w-5 text-white" />}
          </div>
        </div>

        {/* Delete Button (still works for single delete) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => { e.stopPropagation(); onDelete(image.id); }}
            disabled={isDeleting}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};