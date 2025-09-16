// apps/web/src/lib/nav-config.ts
import { Home, Calendar, Scissors, Users, Image as ImageIcon } from 'lucide-react';

export const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/employees', label: 'Employees', icon: Users },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon },
];
