'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './checkout-form';
import api from '@/lib/api';

// This component now receives the ID as a simple string prop
interface CheckoutClientProps {
  appointmentId: string;
}

// Load Stripe once outside the component
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export const CheckoutClient = ({ appointmentId }: CheckoutClientProps) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      if (!appointmentId) return;
      try {
        const response = await api.post('/payments/create-intent', {
          appointmentId: appointmentId,
        });
        setClientSecret(response.data.data.clientSecret);
      } catch (error) {
        console.error("Failed to create payment intent", error);
      }
    };
    createIntent();
  }, [appointmentId]);

  const options = { clientSecret };

  return (
    <div className="container mx-auto py-12 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Payment</h1>
      {clientSecret ? ( // Render the form only when clientSecret is available
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <div>Loading payment details...</div>
      )}
    </div>
  );
};