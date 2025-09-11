import { AdminGuard } from '@/components/auth/AdminGuard';
import { Sidebar } from '@/components/shared/Sidebar';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100">
        <Sidebar />
        {/* Main content area */}
        {/* On desktop, add left padding to make space for the fixed sidebar */}
        {/* On mobile, padding is normal as sidebar is a drawer */}
        <main className="p-4 md:pl-72 md:py-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}