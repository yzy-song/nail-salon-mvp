'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Appointment } from './columns';
import { AppointmentStatus } from '@repo/types';

interface CellActionProps {
  data: Appointment;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: AppointmentStatus) =>
      api.patch(`/appointments/${data.id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Appointment status updated!');
    },
    onError: (error: any) => {
      toast.error('Update failed', {
        description: error.response?.data?.message,
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(data.id)}>
          Copy ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
        <DropdownMenuItem
          disabled={isPending || data.status === 'CONFIRMED'}
          onClick={() => updateStatus(AppointmentStatus.CONFIRMED)}
        >
          Mark as Confirmed
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending || data.status === 'COMPLETED'}
          onClick={() => updateStatus(AppointmentStatus.COMPLETED)}
        >
          Mark as Completed
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isPending || data.status === 'CANCELLED'}
          onClick={() => updateStatus(AppointmentStatus.CANCELLED)}
        >
          Mark as Cancelled
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};