'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './_components/checkout-form';
import api from '@/lib/api';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPage = ({ params }: { params: { appointmentId: string } }) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      try {
        const response = await api.post('/payments/create-intent', {
          appointmentId: params.appointmentId,
        });
        setClientSecret(response.data.data.clientSecret);
      } catch (error) {
        console.error("Failed to create payment intent", error);
      }
    };
    createIntent();
  }, [params.appointmentId]);

  const options = { clientSecret };

  return (
    <div className="container mx-auto py-12 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Complete Your Payment</h1>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </div>
  );
};

export default CheckoutPage;