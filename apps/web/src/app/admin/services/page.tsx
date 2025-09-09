'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { columns } from './_components/columns';
import { DataTable } from '../appointments/_components/data-table'; // Reusing the data-table component
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ServiceForm } from './_components/service-form';
import { useState } from 'react';
import { toast } from 'sonner';

const ServicesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const response = await api.get('/services');
      // Flatten the response
      return response.data.data.map((service: any) => {
        const { serviceImages, ...restService } = service;
        const images = serviceImages.map((si: any) => si.image);
        return { ...restService, images };
      });
    },
  });

  const { mutate: createService, isPending } = useMutation({
    mutationFn: (values: any) => api.post('/services', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service created successfully!');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error('Creation failed', { description: error.response?.data?.message });
    },
  });

  if (isLoading) return <div>Loading services...</div>;
  if (isError) return <div>Failed to load services.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm onSubmit={createService} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={services || []} />
    </div>
  );
};

export default ServicesPage;