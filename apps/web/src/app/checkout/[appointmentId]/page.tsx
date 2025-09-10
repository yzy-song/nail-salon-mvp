'use client';

import { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './_components/checkout-form';
import api from '@/lib/api';

// 1. 明确定义 Page Props 类型
interface CheckoutPageProps {
  params: {
    appointmentId: string;
  };
}

// 2. 将 Stripe Promise 的加载移到组件外部，确保只执行一次
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const CheckoutPage = ({ params }: CheckoutPageProps) => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    const createIntent = async () => {
      if (!params.appointmentId) return;
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