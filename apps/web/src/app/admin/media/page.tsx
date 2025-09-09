'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ImageCard, ImageType } from './_components/image-card';
import { UploadDialog } from './_components/upload-dialog';
import { toast } from 'sonner';

const MediaPage = () => {
  const queryClient = useQueryClient();

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

  // We add a delete mutation here, though it's not implemented on the backend yet.
  // This is for UI completeness.
  const { mutate: deleteImage, isPending: isDeleting } = useMutation({
    mutationFn: (id: string) => api.delete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('Image deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Delete failed', { description: error.response?.data?.message });
    },
  });

  if (isLoading) return <div>Loading media...</div>;
  if (isError) return <div>Failed to load media.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Media Library</h1>
        <UploadDialog />
      </div>
      {images && images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {images.map((image) => (
            <ImageCard 
              key={image.id} 
              image={image} 
              onDelete={deleteImage}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>Your media library is empty.</p>
          <p className="text-sm mt-2">Click "Upload Images" to get started.</p>
        </div>
      )}
    </div>
  );
};

export default MediaPage;