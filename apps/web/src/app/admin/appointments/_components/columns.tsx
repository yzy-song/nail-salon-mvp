'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { format } from 'date-fns';

import { CellAction } from './cell-action';
// This type is manually created for the frontend.
// In a real project, you would share this from a @repo/types package.
export type Appointment = {
  id: string;
  appointmentTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  user: {
    name: string | null;
    email: string;
  };
  service: {
    name: string;
  };
  employee: {
    name: string;
  };
};

export const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: 'user.name',
    header: 'Customer',
  },
  {
    accessorKey: 'service.name',
    header: 'Service',
  },
  {
    accessorKey: 'employee.name',
    header: 'Employee',
  },
  {
    accessorKey: 'appointmentTime',
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return format(new Date(row.original.appointmentTime), 'yyyy-MM-dd HH:mm');
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.original.status;
      let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
      if (status === 'CONFIRMED') variant = 'default';
      if (status === 'CANCELLED') variant = 'destructive';
      if (status === 'COMPLETED') variant = 'outline';

      return <Badge variant={variant}>{status}</Badge>;
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
    header: () => <span className="sr-only">Actions</span>,
  },
];
