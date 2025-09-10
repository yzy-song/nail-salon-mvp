'use client'; 

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';

export const Navbar = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoggedIn, user, logout } = useAuthStore();

  return (
    <header className="py-4 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-pink-500">
          NailSalon
        </Link>
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/services" className="text-gray-600 hover:text-pink-500">
            Services
          </Link>
          <Link href="/book" className="text-gray-600 hover:text-pink-500">
            Book Now
          </Link>
          {isClient && user?.role === 'ADMIN' && (
            <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold">
              Admin Dashboard
            </Link>
          )}
        </nav>
        <div className="flex gap-4 items-center"> {/* I've increased the gap slightly */}
          {isClient && isLoggedIn && user ? (
            <>
              <Link href="/my-appointments" className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors">
                My Appointments
              </Link>

              <span className="text-sm text-gray-700">Welcome, {user.name || user.email}!</span>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            isClient && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
};