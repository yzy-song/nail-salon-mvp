'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { adminNavItems } from '@/lib/nav-config';

import { useUiStore } from '@/store/ui.store';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DialogTitle } from '@radix-ui/react-dialog';
const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col bg-gray-100 dark:bg-gray-800">
      <div className={`flex items-center p-4 border-b ${collapsed ? 'justify-center' : ''}`} style={{ minHeight: 56 }}>
        <Link href="/">
          <h2
            className={`font-semibold text-pink-600 transition-all duration-300 ${collapsed ? 'text-lg' : 'text-2xl'}`}
            style={{
              transition: 'font-size 0.3s',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              width: collapsed ? 0 : 'auto',
              opacity: collapsed ? 0 : 1,
            }}
          >
            NailSalon
          </h2>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-pink-100 text-pink-700' : 'text-gray-600 hover:bg-gray-200'
              } ${collapsed ? 'justify-center' : 'justify-start'}`}
            >
              {/* 图标始终保持大小 */}
              <span className="flex-shrink-0 flex items-center justify-center h-5 w-5">
                <item.icon className="h-5 w-5" />
              </span>
              {/* 文字动画，仅隐藏文字 */}
              <span
                className={`transition-all duration-300 ml-3`}
                style={{
                  width: collapsed ? 0 : 'auto',
                  opacity: collapsed ? 0 : 1,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  transition: 'opacity 0.3s, width 0.3s',
                }}
              >
                {!collapsed && item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export const Sidebar = () => {
  const { isSidebarCollapsed, toggleSidebar } = useUiStore();
  return (
    <>
      {/* Mobile Sidebar (Drawer using Sheet) */}
      <div className="md:hidden p-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <DialogTitle className="sr-only">Menu</DialogTitle>
            <SidebarContent collapsed={false} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar (Fixed Position) */}
      <aside
        className={`hidden md:block fixed top-0 left-0 h-full border-r bg-gray-50 z-40 transition-all duration-300 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <SidebarContent collapsed={isSidebarCollapsed} />
        <div className="absolute -right-3 top-1/2">
          <Button onClick={toggleSidebar} size="icon" className="rounded-full h-6 w-6">
            {isSidebarCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          </Button>
        </div>
      </aside>
    </>
  );
};
