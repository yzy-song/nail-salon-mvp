'use client';

import { useBookingStore } from '@/store/booking.store';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SelectService } from './SelectService';
import { SelectEmployeeAndDate } from './SelectEmployeeAndDate';
import { ConfirmationStep } from './ConfirmationStep';

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
