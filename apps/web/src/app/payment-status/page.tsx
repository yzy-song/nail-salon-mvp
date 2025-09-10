'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader } from 'lucide-react';

const StatusContent = () => {
  const searchParams = useSearchParams();
  const status = searchParams.get('redirect_status');

  let title = '';
  let message = '';
  let icon = null;
  let color = '';

  switch (status) {
    case 'succeeded':
      title = 'Payment Successful!';
      message = 'Thank you for your payment. Your appointment is confirmed and you will receive an email shortly.';
      icon = <CheckCircle2 className="h-16 w-16" />;
      color = 'text-green-600';
      break;
    case 'processing':
      title = 'Payment Processing';
      message = 'Your payment is being processed. We will notify you once it is confirmed.';
      icon = <Loader className="h-16 w-16 animate-spin" />;
      color = 'text-blue-600';
      break;
    case 'requires_payment_method':
      title = 'Payment Failed';
      message = 'Your payment failed. Please try again with a different payment method.';
      icon = <AlertTriangle className="h-16 w-16" />;
      color = 'text-red-600';
      break;
    default:
      title = 'Something went wrong';
      message = 'An unknown error occurred. Please check your appointments or contact support.';
      icon = <AlertTriangle className="h-16 w-16" />;
      color = 'text-gray-600';
  }

  return (
    <div className={`flex flex-col items-center justify-center text-center ${color}`}>
      {icon}
      <h1 className="text-3xl font-bold mt-4">{title}</h1>
      <p className="mt-2 text-gray-600 max-w-md">{message}</p>
      <Button asChild className="mt-8">
        <Link href="/my-appointments">Go to My Appointments</Link>
      </Button>
    </div>
  );
};

const PaymentStatusPage = () => {
  return (
    <div className="container mx-auto py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Suspense fallback={<div>Loading status...</div>}>
        <StatusContent />
      </Suspense>
    </div>
  );
};

export default PaymentStatusPage;