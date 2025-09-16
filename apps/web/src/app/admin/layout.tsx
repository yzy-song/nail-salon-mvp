import { AdminGuard } from '@/components/auth/AdminGuard';
import { Sidebar } from '@/components/shared/Sidebar';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-50">
        {/* The Sidebar component now handles its own desktop/mobile versions */}
        <Sidebar />

        {/* Main content area */}
        {/* On desktop, we add left PADDING to make space for the fixed sidebar */}
        {/* On mobile, the padding is reset to normal */}
        <main className="p-4 md:pl-72 md:py-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
