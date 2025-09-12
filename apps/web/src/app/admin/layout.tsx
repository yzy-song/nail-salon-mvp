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
  {/* 移动端不再显示admin侧边栏菜单按钮，只保留桌面端Sidebar */}
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