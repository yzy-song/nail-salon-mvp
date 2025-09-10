'use client';

import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isLoggedIn, user } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    if (!isLoggedIn) {
      router.replace('/login');
    } else if (user?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [isHydrated, isLoggedIn, user, router]);

  if (!isHydrated || !isLoggedIn || user?.role !== 'ADMIN') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return <>{children}</>;
};