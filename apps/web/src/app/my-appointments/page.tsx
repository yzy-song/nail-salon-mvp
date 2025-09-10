'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';

// This type should ideally be in @repo/types
type Appointment = {
  id: string;
  appointmentTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: string | null;
  service: { name: string; price: number };
  employee: { name: string };
}

const fetchMyAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments/mine');
  return response.data.data;
}

const MyAppointmentsContent = () => {
  const { data: appointments, isLoading, isError } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: fetchMyAppointments,
  });

  if (isLoading) return <div>Loading your appointments...</div>;
  if (isError) return <div>Failed to load appointments.</div>;

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      <div className="space-y-4">
        {appointments && appointments.length > 0 ? (
          appointments.map(app => (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle>{app.service.name}</CardTitle>
                <CardDescription>
                  With {app.employee.name} on {format(new Date(app.appointmentTime), 'eeee, MMMM do, yyyy @ h:mm a')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <Badge>{app.status}</Badge>
                  <p className="font-bold text-lg">€{app.service.price}</p>
                </div>
                {app.status === 'PENDING' && app.paymentStatus !== 'paid' && (
                  <Button asChild>
                    <Link href={`/checkout/${app.id}`}>Pay Now</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p>You have no appointments scheduled.</p>
        )}
      </div>
    </div>
  );
}

const MyAppointmentsPage = () => {
  return (
    <AuthGuard>
      <MyAppointmentsContent />
    </AuthGuard>
  )
}

export default MyAppointmentsPage;