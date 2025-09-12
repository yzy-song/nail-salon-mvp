'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Service } from '@/components/services/ServiceCard'; // We can reuse this type
import { CellAction } from './cell-action';

export const columns: ColumnDef<Service>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `€${row.original.price}`,
  },
  {
    accessorKey: 'duration',
    header: 'Duration (mins)',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
