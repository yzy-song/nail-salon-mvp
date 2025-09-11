import { CheckoutClient } from './_components/checkout-client';
import { Suspense } from 'react';

// This is the main Page, a simple Server Component.
// It receives params directly from Next.js.
export default async function CheckoutPage({
  params,
}: {
  params: { appointmentId: string };
}) {
  const { appointmentId } = await params;
  // It passes the ID down to the client component.
  // We wrap it in Suspense as a best practice for client components.
  return (
    <Suspense fallback={<div className="container mx-auto py-12 text-center">Loading...</div>}>
      <CheckoutClient appointmentId={appointmentId} />
    </Suspense>
  );
}