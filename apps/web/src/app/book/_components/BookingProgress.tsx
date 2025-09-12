'use client';

import { useBookingStore } from '@/store/booking.store';

const steps = ['Select Service', 'Select Employee & Date', 'Select Time', 'Confirm Booking'];

export const BookingProgress = () => {
  const { step } = useBookingStore();

  // A simple mapping from our store's step to the UI's step
  const uiStep = step <= 2 ? step : step - 1;

  return (
    <div className="w-full mb-8">
      <div className="flex justify-between">
        {steps.map((label, index) => (
          <div key={label} className="step-item text-center">
            <div
              className={`step-circle w-8 h-8 rounded-full border-2 flex items-center justify-center mx-auto ${uiStep > index + 1 ? 'bg-pink-500 border-pink-500 text-white' : uiStep === index + 1 ? 'border-pink-500' : 'border-gray-300'}`}
            >
              {uiStep > index + 1 ? '✓' : index + 1}
            </div>
            <p className={`mt-2 text-sm ${uiStep >= index + 1 ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
