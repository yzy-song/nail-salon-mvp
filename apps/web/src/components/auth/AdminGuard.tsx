'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, user } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure we don't check on the server or before the store is hydrated
    if (typeof window !== 'undefined') {
      if (!isLoggedIn) {
        router.replace('/login');
      } else if (user?.role !== 'ADMIN') {
        router.replace('/'); // Redirect non-admins to homepage
      } else {
        setIsLoading(false); // User is an admin, allow access
      }
    }
  }, [isLoggedIn, user, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};