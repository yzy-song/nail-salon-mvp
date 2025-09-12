'use client';

import { useBookingStore } from '@/store/booking.store';
import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query'; // We'll add this for fetching details

// A simple fetcher function
const fetcher = (url: string) => api.get(url).then((res) => res.data.data);

export const ConfirmationStep = () => {
  const { serviceId, employeeId, date, time, reset } = useBookingStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

  // Fetch details for a better summary display
  const { data: service, isLoading: isServiceLoading } = useQuery({
    queryKey: ['service', serviceId],
    queryFn: () => fetcher(`/services/${serviceId}`),
    enabled: !!serviceId,
  });

  const { data: employee, isLoading: isEmployeeLoading } = useQuery({
    queryKey: ['employee', employeeId],
    queryFn: () => fetcher(`/employees/${employeeId}`),
    enabled: !!employeeId,
  });

  const handleSubmitBooking = async () => {
    if (!isLoggedIn) {
      toast.error('Please log in to complete your booking.');
      router.push('/login');
      return;
    }

    if (!serviceId || !employeeId || !date || !time) {
      toast.error('Please complete all previous steps.');
      return;
    }

    const [hours, minutes] = time.split(':');
    const appointmentTime = new Date(date);
    appointmentTime.setHours(parseInt(hours), parseInt(minutes));

    try {
      await api.post('/appointments', {
        serviceId,
        employeeId,
        appointmentTime: appointmentTime.toISOString(),
      });
      toast.success('Booking Successful!', {
        description: 'You will receive a confirmation email shortly.',
      });
      reset(); // Reset the form
      router.push('/my-appointments'); // Redirect to my appointments page
    } catch (error: any) {
      toast.error('Booking Failed', {
        description: error.response?.data?.message || 'Please try again.',
      });
    }
  };

  const isLoading = isServiceLoading || isEmployeeLoading;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Step 4: Confirm Your Booking</h2>
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
          <CardDescription>Please review your appointment details below.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p>Loading summary...</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Service:</span> <span className="font-semibold">{service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Employee:</span> <span className="font-semibold">{employee?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span> <span className="font-semibold">{date?.toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span> <span className="font-semibold">{time}</span>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2 text-base">
                <strong>Total Price:</strong> <strong className="text-pink-500">€{service?.price}</strong>
              </div>
            </div>
          )}
          <Button onClick={() => void handleSubmitBooking()} className="w-full" disabled={isLoading}>
            Confirm & Book Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
