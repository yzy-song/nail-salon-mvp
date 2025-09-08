'use client';

import { useBookingStore } from '@/store/booking.store';
import { SelectService } from './_components/SelectService';
import { SelectEmployeeAndDate } from './_components/SelectEmployeeAndDate';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmationStep } from './_components/ConfirmationStep';
import { BookingProgress } from './_components/BookingProgress';

// Create a client
const queryClient = new QueryClient();

const BookingPageContent = () => {
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
      case 3: // Steps 2 and 3 are combined in one component
        return <SelectEmployeeAndDate />;
      case 4:
        return <ConfirmationStep />;
      default:
        return <SelectService />;
    }
  };

  return (
    <div className="container mx-auto py-12">
      <BookingProgress />
      {renderStep()}
    </div>
  );
}


const BookingPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BookingPageContent />
    </QueryClientProvider>
  )
}

export default BookingPage;