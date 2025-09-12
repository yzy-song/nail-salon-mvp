'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { columns } from './_components/columns';
import { DataTable } from '../appointments/_components/data-table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmployeeForm } from './_components/employee-form';
import { useState } from 'react';
import { toast } from 'sonner';

const EmployeesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: employees,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-employees'],
    queryFn: async () => {
      const response = await api.get('/employees');
      return response.data.data;
    },
  });

  const { mutate: createEmployee, isPending } = useMutation({
    mutationFn: (values: any) => api.post('/employees', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
      toast.success('Employee created successfully!');
      setIsCreateDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error('Creation failed', { description: error.response?.data?.message });
    },
  });

  if (isLoading) return <div>Loading employees...</div>;
  if (isError) return <div>Failed to load employees.</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employees Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Employee</DialogTitle>
            </DialogHeader>
            <EmployeeForm onSubmit={createEmployee} isPending={isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={employees || []} />
    </div>
  );
};

export default EmployeesPage;
