'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We wait for the store to be rehydrated from localStorage
    if (typeof window !== 'undefined') {
      if (!isLoggedIn) {
        router.replace('/login');
      } else {
        setIsLoading(false); // User is logged in, allow access
      }
    }
  }, [isLoggedIn, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};
