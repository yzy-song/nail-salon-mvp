'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {Dialog,DialogContent, DialogHeader,DialogTitle,DialogTrigger} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';

export const UploadDialog = () => {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: uploadFiles, isPending } = useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-media'] });
      toast.success('Images uploaded successfully!');
      setIsOpen(false);
      setFiles(null);
    },
    onError: (error: any) => {
      toast.error('Upload failed', { description: error.response?.data?.message });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files || files.length === 0) {
      toast.warning('Please select at least one file to upload.');
      return;
    }

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    uploadFiles(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Upload Images
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Images</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="pictures">Pictures</Label>
            <Input
              id="pictures"
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files)}
            />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};