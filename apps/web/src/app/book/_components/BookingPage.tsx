'use client';

import { useBookingStore } from '@/store/booking.store';

import { useAuthStore } from '@/store/auth.store';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SelectService } from './SelectService';
import { SelectEmployeeAndDate } from './SelectEmployeeAndDate';

// Confirmation Step Component
const ConfirmationStep = () => {
  const { serviceId, employeeId, date, time, reset } = useBookingStore();
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();

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
      router.push('/'); // Redirect to homepage
    } catch (error: any) {
      toast.error('Booking Failed', {
        description: error.response?.data?.message || 'Please try again.',
      });
    }
  };

  // You would typically show a summary of the booking here
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Step 4: Confirm Your Booking</h2>
      <Card>
        <CardHeader>
          <CardTitle>Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Service ID: {serviceId}</p>
          <p>Employee ID: {employeeId}</p>
          <p>Date: {date?.toLocaleDateString()}</p>
          <p>Time: {time}</p>
          <Button
            onClick={() => {
              void handleSubmitBooking();
            }}
            className="w-full"
          >
            Confirm & Book Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const BookingPage = () => {
  const { step, serviceId, setServiceId } = useBookingStore();

  const searchParams = useSearchParams();

  // This effect runs once to check if a serviceId was passed in the URL
  useEffect(() => {
    const urlServiceId = searchParams.get('serviceId');
    if (urlServiceId && !serviceId) {
      setServiceId(urlServiceId);
    }
  }, [searchParams, serviceId, setServiceId]);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <SelectService />;
      case 2:
      case 3:
        return <SelectEmployeeAndDate />;
      case 4:
        return <ConfirmationStep />;
      default:
        return <SelectService />;
    }
  };

  return <div className="container mx-auto py-12">{renderStep()}</div>;
};

export default BookingPage;
