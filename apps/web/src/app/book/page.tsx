import { Suspense } from 'react';
import { BookingForm } from './_components/BookingForm';

const BookingPage = () => {
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-4xl font-bold tracking-tight text-center mb-12">Book Your Appointment</h1>
      {/* Suspense is needed because BookingForm uses useSearchParams */}
      <Suspense fallback={<div className="text-center">Loading Booking Form...</div>}>
        <BookingForm />
      </Suspense>
    </div>
  );
};

export default BookingPage;
