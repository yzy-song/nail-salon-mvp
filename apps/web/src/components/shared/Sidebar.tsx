'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Scissors, Users, Image as ImageIcon, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
];

const SidebarContent = () => {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-gray-50">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-pink-600">Admin Panel</h2>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  )
}


export const Sidebar = () => {
  return (
    <>
      {/* Mobile Sidebar (Drawer) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50 bg-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:block fixed top-0 left-0 h-full w-64 border-r">
        <SidebarContent />
      </aside>
    </>
  );
};