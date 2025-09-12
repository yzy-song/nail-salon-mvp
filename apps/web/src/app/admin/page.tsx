'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { StatCard } from './_components/StatCard';
import { Users, Calendar, Euro, Scissors } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalAppointments: number;
  todaysAppointments: number;
  totalRevenue: number;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats');
  return response.data.data;
};

const DashboardPage = () => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) return <div>Loading dashboard...</div>;
  if (isError) return <div>Failed to load dashboard statistics.</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={`€${stats?.totalRevenue || 0}`} icon={Euro} />
        <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} icon={Calendar} />
        <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} />
        <StatCard title="Appointments Today" value={stats?.todaysAppointments || 0} icon={Scissors} />
      </div>

      <div className="mt-8">{/* We will add charts and recent activity here later */}</div>
    </div>
  );
};

export default DashboardPage;
