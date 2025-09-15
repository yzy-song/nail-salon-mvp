'use client';

import { Suspense } from 'react';
import { BookingForm } from './_components/BookingForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const BookingPage = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-12">
        <Suspense fallback={<div className="text-center">Loading Booking Form...</div>}>
          <BookingForm />
        </Suspense>
      </div>
    </QueryClientProvider>
  );
};

export default BookingPage;
