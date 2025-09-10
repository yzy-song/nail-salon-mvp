// apps/web/src/app/checkout/[appointmentId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './_components/checkout-form';
import api from '@/lib/api';

// Define the props type that Next.js passes to a dynamic page
interface CheckoutPageProps {
  params: {
    appointmentId: string;
  };
}

// Load Stripe once outside the component
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPage = ({ params }: CheckoutPageProps) => {
  const [clientSecret, setClientSecret] = useState('');
  const { appointmentId } = params;

  useEffect(() => {
    // Fetch the client secret as soon as the component mounts
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

  return (
    <div className="container mx-auto py-12 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Payment</h1>
      {clientSecret ? (
        <Elements options={{ clientSecret }} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        // Show a loading state while the client secret is being fetched
        <div className="text-center">Loading payment details...</div>
      )}
    </div>
  );
};

export default CheckoutPage;