'use client';

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js has not yet loaded.
    }
    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/payment-status`,
      },
    });

    if (error.type === 'card_error' || error.type === 'validation_error') {
      toast.error(error.message);
    } else {
      toast.error('An unexpected error occurred.');
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={() => void handleSubmit} className="w-full">
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="w-full mt-4">
        <span>{isLoading ? 'Processing...' : 'Pay Now'}</span>
      </Button>
    </form>
  );
};
