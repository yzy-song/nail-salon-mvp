// apps/web/src/app/admin/services/_components/cell-action.tsx
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Trash } from 'lucide-react';
import { Service } from '@/components/services/ServiceCard';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ServiceForm, ServiceFormValues } from './service-form';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';

interface CellActionProps {
  data: Service;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: updateService, isPending: isUpdatePending } = useMutation({

    mutationFn: (values: ServiceFormValues) => {
    // Convert price and duration back to numbers before sending to API
    const numericValues = {
      ...values,
      price: parseFloat(values.price),
      duration: parseInt(values.duration, 10),
    };
    return api.patch(`/services/${data.id}`, numericValues);
  },
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service updated successfully!');
      setIsEditDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error('Update failed', { description: error.response?.data?.message });
    },
  });

  const { mutate: deleteService, isPending: isDeletePending } = useMutation({
    mutationFn: () => api.delete(`/services/${data.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      toast.success('Service deleted successfully!');
    },
    onError: (error: any) => {
      toast.error('Delete failed', { description: error.response?.data?.message });
    },
  });

  const formDefaultValues = {
    name: data.name,
    description: data.description ?? undefined,
    price: data.price.toString(),
    duration: data.duration.toString(),
  };

  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DialogTrigger asChild>
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
            </DialogTrigger>
            <DropdownMenuItem onClick={() => deleteService()} disabled={isDeletePending}>
              <Trash className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          <ServiceForm
            defaultValues={formDefaultValues}
            onSubmit={updateService}
            isPending={isUpdatePending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};