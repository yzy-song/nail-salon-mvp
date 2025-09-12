'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth.store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { navItems as adminNavItems } from '@/components/shared/Sidebar';
// 导入 Sidebar 中定义的 navItems

export const Navbar = () => {
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    setIsClient(true);
  }, []);

  const { isLoggedIn, user, logout } = useAuthStore();

  const navLinks = (
    <>
      <Link href="/services" className="text-gray-600 hover:text-pink-500 transition-colors">
        Services
      </Link>
      <Link href="/book" className="text-gray-600 hover:text-pink-500 transition-colors">
        Book Now
      </Link>
      {isClient && user?.role === 'ADMIN' && (
        <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
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
        <span className="text-sm text-gray-700 hidden sm:inline">Welcome, {user.name || user.email}!</span>
        <Button variant="ghost" onClick={logout}>
          Logout
        </Button>
      </div>
    ) : (
      isClient && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Sign up</Link>
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
        <nav className="hidden md:flex gap-6 items-center">{navLinks}</nav>
        <div className="hidden md:flex items-center gap-2">
          {/* PC端显示登录和注册 */}
          {!isLoggedIn && isClient && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
          {isLoggedIn && authLinks}
        </div>

        {/* Mobile Navigation (Hamburger Menu) */}
        {/* 登录按钮在菜单按钮左侧，菜单按钮fixed右上角 */}
        <div className="md:hidden flex items-center gap-2">
          {/* 登录按钮用margin-right给菜单按钮留空间 */}
          {!isLoggedIn && isClient && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mr-14" // 给右侧菜单按钮留出宽度
            >
              <Link href="/login">Sign In</Link>
            </Button>
          )}
          {/* 菜单按钮用fixed定位，始终在右上角 */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="fixed top-4 right-4 z-50 p-2 rounded bg-white border shadow size-10 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent className="inset-0 w-full h-full max-w-full p-0 bg-white flex flex-col items-center justify-center transition-all duration-300">
              <SheetHeader>
                <SheetTitle className="text-pink-500">NailSalon</SheetTitle>
              </SheetHeader>
              {/* 判断是否在 /admin 区，显示不同菜单 */}
              <div className="flex flex-col items-center justify-center h-full space-y-6 text-lg w-full">
                {/* 主站菜单 */}
                <Link
                  href="/services"
                  onClick={() => setOpen(false)}
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Services
                </Link>
                <Link
                  href="/book"
                  onClick={() => setOpen(false)}
                  className="text-gray-600 hover:text-pink-500 transition-colors"
                >
                  Book Now
                </Link>
                {isClient && user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                {/* 如果在admin区，显示分割线和Sidebar菜单 */}
                {pathname.startsWith('/admin') && (
                  <>
                    <hr className="w-2/3 my-4 border-gray-200" />
                    <div className="w-full flex flex-col items-center space-y-4">
                      <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Admin Panel</div>
                      {adminNavItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`transition-colors ${pathname === item.href ? 'text-pink-600 font-semibold' : 'text-gray-600 hover:text-pink-500'}`}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* 只在已登录时显示欢迎和登出 */}
              {isLoggedIn && isClient && (
                <div className="flex flex-col space-y-4 pt-4 border-t items-center pb-8 mt-8">
                  <span className="text-sm text-gray-700">Welcome, {user?.name || user?.email}!</span>
                  <Button
                    variant="outline"
                    className="w-32"
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
