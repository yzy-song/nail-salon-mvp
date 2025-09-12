'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ImageCard, ImageType } from './_components/image-card';
import { UploadDialog } from './_components/upload-dialog';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

const MediaPage = () => {
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const {
    data: images,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-media'],
    queryFn: async (): Promise<ImageType[]> => {
      const response = await api.get('/media');
      return response.data.data;
    },
  });

  // Single delete mutation
  const { mutate: deleteImage, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
  });

  // Batch delete mutation
  const { mutate: deleteBatch, isPending: isBatchDeleting } = useMutation({
    mutationFn: (ids: string[]) => api.delete('/media/batch', { data: { ids } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success(`${selectedImages.length} images deleted successfully!`);
      setSelectedImages([]); // Clear selection
    },
    onError: (error: any) => {
      toast.error('Batch delete failed', { description: error.response?.data?.message });
    },
  });

  const handleSelectImage = (id: string) => {
    setSelectedImages((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBatchDelete = () => {
    if (selectedImages.length === 0) return;
    deleteBatch(selectedImages);
  };

  if (isLoading) return <div>Loading media...</div>;
  if (isError) return <div>Failed to load media.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <div className="flex items-center gap-2">
          {selectedImages.length > 0 && (
            <Button variant="destructive" onClick={handleBatchDelete} disabled={isBatchDeleting}>
              <Trash className="mr-2 h-4 w-4" />
              Delete ({selectedImages.length})
            </Button>
          )}
          <UploadDialog />
        </div>
      </div>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image) => (
            <ImageCard
              key={image.id}
              image={image}
              isSelected={selectedImages.includes(image.id)}
              onSelect={handleSelectImage}
              onDelete={deleteImage}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Your media library is empty.</p>
        </div>
      )}
    </div>
  );
};

export default MediaPage;
