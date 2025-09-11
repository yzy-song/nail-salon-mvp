'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { ImageType } from '../media/_components/image-card'; // Reuse type

interface MediaLibraryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  initialSelectedIds: string[];
}

export const MediaLibraryDialog: React.FC<MediaLibraryDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialSelectedIds,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  // Sync state when initial props change
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  const { data: images, isLoading } = useQuery<ImageType[]>({
    queryKey: ['admin-media'],
    queryFn: async () => {
      const response = await api.get('/media');
      return response.data.data;
    },
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedIds);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Images from Media Library</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          {isLoading ? (
            <p>Loading images...</p>
          ) : (
            <div className="grid grid-cols-4 gap-4 p-4">
              {images?.map((image) => {
                const isSelected = selectedIds.includes(image.id);
                return (
                  <Card
                    key={image.id}
                    onClick={() => handleToggleSelect(image.id)}
                    className={`relative group transition-all duration-200 cursor-pointer ${
                      isSelected ? 'ring-2 ring-pink-500' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <Image
                        src={image.url}
                        alt={image.altText || ''}
                        width={150}
                        height={150}
                        className="aspect-square object-cover w-full rounded-md"
                      />
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-pink-500 rounded-full text-white">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Confirm Selection</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};