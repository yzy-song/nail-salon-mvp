'use client';

import { useBookingStore } from '@/store/booking.store';
import { SelectService } from './_components/SelectService';
import { SelectEmployeeAndDate } from './_components/SelectEmployeeAndDate';
import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ConfirmationStep } from './_components/ConfirmationStep';
import { BookingProgress } from './_components/BookingProgress';

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
};

const BookingPage = () => {
  return (
    <Suspense fallback={<div className="container mx-auto py-12">Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
};

export default BookingPage;
