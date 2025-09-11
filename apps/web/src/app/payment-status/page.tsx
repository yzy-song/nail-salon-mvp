'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertTriangle, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

const StatusContent = () => {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');

  // Use the paymentIntentId to fetch the true status from our backend
  const { data: appointment, isLoading, isError } = useQuery({
    queryKey: ['payment-status', paymentIntentId],
    queryFn: async () => {
      if (!paymentIntentId) return null;
      const response = await api.get(`/appointments/by-intent/${paymentIntentId}`);
      return response.data.data;
    },
    // Keep refetching until we get a final status from the webhook
    refetchInterval: (query) => 
      query.state.data?.paymentStatus === 'unpaid' ? 2000 : false,
    enabled: !!paymentIntentId,
  });

  if (isLoading || !paymentIntentId) {
    return <div className="flex flex-col items-center"><Loader className="h-16 w-16 animate-spin text-blue-600" /><p className="mt-4">Confirming payment status...</p></div>;
  }

  if (isError) {
    return <div className="text-red-600">Failed to retrieve payment status. Please check &quot;My Appointments&quot;.</div>;
  }

  const status = appointment?.paymentStatus;
  let title = '', message = '', icon = null, color = '';

  switch (status) {
    case 'paid':
      title = 'Payment Successful!';
      message = 'Your appointment is confirmed. We have sent you a confirmation email.';
      icon = <CheckCircle2 className="h-16 w-16" />;
      color = 'text-green-600';
      break;
    case 'failed':
    case 'canceled':
      title = 'Payment Failed';
      message = 'Your payment was not successful. Please try again from the "My Appointments" page.';
      icon = <AlertTriangle className="h-16 w-16" />;
      color = 'text-red-600';
      break;
    default: // 'unpaid' or any other status
      title = 'Payment Processing';
      message = 'Your payment is processing. This page will update automatically.';
      icon = <Loader className="h-16 w-16 animate-spin" />;
      color = 'text-blue-600';
      break;
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