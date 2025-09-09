'use client';

import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';

// Define the type for an Employee
export type Employee = {
  id: string;
  name: string;
  title: string;
};

export const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'title',
    header: 'Title',
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];