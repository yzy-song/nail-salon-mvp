import { CheckoutClient } from './_components/checkout-client';

// This is the main Page, a simple Server Component
interface CheckoutPageProps {
  params: {
    appointmentId: string;
  };
}

const CheckoutPage = ({ params }: CheckoutPageProps) => {
  // It receives the params from Next.js...
  // ...and passes the ID down to the client component.
  return <CheckoutClient appointmentId={params.appointmentId} />;
};

export default CheckoutPage;