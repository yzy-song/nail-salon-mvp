'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

export const Navbar = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoggedIn, user, logout } = useAuthStore();

  const navLinks = (
    <>
      <Link
        href="/services"
        className="text-gray-600 hover:text-pink-500 transition-colors"
      >
        Services
      </Link>
      <Link
        href="/book"
        className="text-gray-600 hover:text-pink-500 transition-colors"
      >
        Book Now
      </Link>
      {isClient && user?.role === 'ADMIN' && (
        <Link
          href="/admin"
          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          Admin Dashboard
        </Link>
      )}
    </>
  );

  const authLinks =
    isClient && isLoggedIn && user ? (
      <div className="flex items-center gap-4">
        <Link
          href="/my-appointments"
          className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors"
        >
          My Appointments
        </Link>
        <span className="text-sm text-gray-700 hidden sm:inline">
          Welcome, {user.name || user.email}!
        </span>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    ) : (
      isClient && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )
    );
    
  const mobileAuthLinks =
    isClient && isLoggedIn && user ? (
      <div className="flex flex-col space-y-4 pt-4 border-t">
        <span className="text-sm text-gray-700">
          Welcome, {user.name || user.email}!
        </span>
        <Button variant="outline" className="w-full" onClick={logout}>
          Logout
        </Button>
      </div>
    ) : (
      isClient && (
        <div className="flex flex-col space-y-2 pt-4 border-t">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </div>
      )
    );

  return (
    <header className="py-4 border-b sticky top-0 bg-white/80 backdrop-blur-sm z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-pink-500">
          NailSalon
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks}
        </nav>
        <div className="hidden md:flex items-center gap-2">
            {authLinks}
        </div>


        {/* Mobile Navigation (Hamburger Menu) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-pink-500">NailSalon</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col items-center justify-center h-full space-y-6 text-lg">
                {navLinks}
              </div>
              {mobileAuthLinks}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};