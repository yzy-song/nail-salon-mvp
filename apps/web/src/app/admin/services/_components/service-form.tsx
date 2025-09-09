'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Service } from '@/components/services/ServiceCard';
import { useState } from 'react';
import { MediaLibraryDialog } from '../../_shared/media-library-dialog';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { ImageType } from '../../media/_components/image-card';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  duration: z.coerce.number().min(1),
  imageIds: z.array(z.string()).optional(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  initialData?: Service | null;
  onSubmit: (values: ServiceFormValues) => void;
  isPending: boolean;
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  initialData,
  onSubmit,
  isPending,
}) => {
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema as any),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      price: initialData?.price || 0,
      duration: initialData?.duration || 30,
      imageIds: initialData?.images?.map((img) => img.id) || [],
    },
  });

  const imageIds = form.watch('imageIds') || [];
  const { data: selectedImages } = useQuery<ImageType[]>({
    queryKey: ['images', imageIds],
    queryFn: async () => {
      if (imageIds.length === 0) return [];
      const response = await api.get('/media');
      return response.data.data.filter((img: ImageType) =>
        imageIds.includes(img.id),
      );
    },
    enabled: imageIds.length > 0,
  });

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* 👇 --- The missing fields are now back --- 👇 */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Gel Manicure" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe the service..."
                    {...field}
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (€)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (mins)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* --- Image Management Section --- */}
          <FormItem>
            <FormLabel>Images</FormLabel>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsMediaDialogOpen(true)}
              >
                Manage Images
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedImages?.map((image) => (
                <div key={image.id} className="relative w-20 h-20">
                  <Image
                    src={image.url}
                    alt={image.altText || 'Service image'}
                    fill
                    className="rounded-md object-cover"
                  />
                </div>
              ))}
            </div>
          </FormItem>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>

      <MediaLibraryDialog
        isOpen={isMediaDialogOpen}
        onClose={() => setIsMediaDialogOpen(false)}
        initialSelectedIds={form.getValues('imageIds') || []}
        onConfirm={(selectedIds) => {
          form.setValue('imageIds', selectedIds);
          setIsMediaDialogOpen(false);
        }}
      />
    </>
  );
};