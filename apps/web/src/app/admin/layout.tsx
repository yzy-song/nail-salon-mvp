"use client"
import { AdminGuard } from '@/components/auth/AdminGuard';
import { Sidebar } from '@/components/shared/Sidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // 用 useState 控制 Sheet 打开状态，防止内容区被遮挡
  const [open, setOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100">
        {/* 移动端 Sheet 抽屉 */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="fixed top-4 left-4 z-50 p-2 rounded bg-white border shadow">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
        {/* 桌面端固定 Sidebar */}
        <aside className="hidden md:block fixed top-0 left-0 h-full w-64 border-r bg-white">
          <Sidebar />
        </aside>
        {/* 主内容区，桌面端留出 Sidebar 宽度 */}
        <main className="p-4 md:pl-72 md:py-8">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}