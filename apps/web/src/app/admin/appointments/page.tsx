'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { columns, Appointment } from './_components/columns';
import { DataTable } from './_components/data-table';

async function getAppointments(): Promise<Appointment[]> {
  const response = await api.get('/appointments');
  console.log('Fetched 222appointments:', response.data.data);
  return response.data.data;
}

const AppointmentsPage = () => {
  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: getAppointments,
  });

  if (isLoading) return <div>Loading appointments...</div>;
  if (isError) return <div>Failed to load appointments.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Appointments Management</h1>
      <DataTable columns={columns} data={appointments || []} />
    </div>
  );
};

export default AppointmentsPage;