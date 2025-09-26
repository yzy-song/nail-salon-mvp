'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// 类型定义
type Appointment = {
  id: string;
  appointmentTime: string;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: string | null;
  service: { name: string; price: number };
  employee: { name: string };
};

// 获取我的预约数据
const fetchMyAppointments = async (): Promise<Appointment[]> => {
  const response = await api.get('/appointments/mine');
  return response.data.data;
};

// 主要内容组件
const MyAppointmentsContent = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);
  const [modalAppointments, setModalAppointments] = useState<Appointment[]>([]);
  const [captionLayout, setCaptionLayout] = useState<'dropdown' | 'dropdown-months' | 'dropdown-years'>('dropdown'); // ✅ 新增：控制 Calendar 头部的年月显示方式

  const {
    data: appointments,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: fetchMyAppointments,
  });

  // 加载状态
  if (isLoading) return <div>Loading your appointments...</div>;
  if (isError) return <div>Failed to load appointments.</div>;

  // 按日期分组预约
  const appointmentsByDate = appointments?.reduce(
    (acc, app) => {
      const date = app.appointmentTime.split('T')[0];
      acc[date] = acc[date] || [];
      acc[date].push(app);
      return acc;
    },
    {} as Record<string, Appointment[]>,
  );

  // 弹窗：显示某一天的预约
  const renderAppointmentsModal = () => (
    <Dialog open={showAppointmentsModal} onOpenChange={setShowAppointmentsModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Appointments on {selectedDate ? format(selectedDate, 'eeee, MMMM do, yyyy') : ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {modalAppointments.length > 0 ? (
            modalAppointments.map((app) => (
              <Card key={app.id}>
                <CardHeader>
                  <CardTitle>{app.service.name}</CardTitle>
                  <CardDescription>
                    With {app.employee.name} at {format(new Date(app.appointmentTime), 'h:mm a')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <Badge>{app.status}</Badge>
                    <p className="font-bold text-lg">€{app.service.price}</p>
                  </div>
                  {app.status === 'PENDING' && app.paymentStatus !== 'paid' && (
                    <Button asChild>
                      <Link href={`/checkout/${app.id}`}>Pay Now</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <p>No appointments for this day.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
      <Tabs value={view} onValueChange={(value) => setView(value as 'list' | 'calendar')}>
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <div className="space-y-4">
            {appointments && appointments.length > 0 ? (
              appointments.map((app) => (
                <Card key={app.id}>
                  <CardHeader>
                    <CardTitle>{app.service.name}</CardTitle>
                    <CardDescription>
                      With {app.employee.name} on{' '}
                      {format(new Date(app.appointmentTime), 'eeee, MMMM do, yyyy @ h:mm a')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <Badge>{app.status}</Badge>
                      <p className="font-bold text-lg">€{app.service.price}</p>
                    </div>
                    {app.status === 'PENDING' && app.paymentStatus !== 'paid' && (
                      <Button asChild>
                        <Link href={`/checkout/${app.id}`}>Pay Now</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p>You have no appointments scheduled.</p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="calendar">
          <div className="flex flex-col items-center">
            {/* ✅ 修改：Calendar 组件加上 captionLayout={captionLayout} */}
            <Calendar
              captionLayout="dropdown"
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                const dateStr = date?.toISOString().split('T')[0];
                setShowAppointmentsModal(true);
                if (dateStr) {
                  setModalAppointments(appointmentsByDate?.[dateStr] || []);
                } else {
                  setModalAppointments([]);
                }
              }}
              className="max-w-xs w-full mx-auto"
              modifiers={{
                hasAppointment: Object.keys(appointmentsByDate || {}).map((dateStr) => new Date(dateStr)),
              }}
              modifiersClassNames={{
                hasAppointment: 'bg-pink-100 text-pink-700 font-bold border-pink-500 border-2 rounded-full',
                selected: 'bg-pink-500 text-white font-bold border-pink-700 border-2 rounded-full',
              }}
            />

            {/* 选中的日期显示预约信息 */}
            {/* {selectedDate && (
              <div className="mt-4 w-full max-w-md">
                {modalAppointments.length > 0 ? (
                  modalAppointments.map((app) => (
                    <Card key={app.id} className="mb-4">
                      <CardHeader>
                        <CardTitle>{app.service.name}</CardTitle>
                        <CardDescription>
                          With {app.employee.name} at {format(new Date(app.appointmentTime), 'h:mm a')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <Badge>{app.status}</Badge>
                          <p className="font-bold text-lg">€{app.service.price}</p>
                        </div>
                        {app.status === 'PENDING' && app.paymentStatus !== 'paid' && (
                          <Button asChild>
                            <Link href={`/checkout/${app.id}`}>Pay Now</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-center">No appointments for this day.</p>
                )}
              </div>
            )} */}
          </div>
          {renderAppointmentsModal()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// 包裹 AuthGuard 的页面组件
const MyAppointmentsPage = () => {
  return (
    <AuthGuard>
      <MyAppointmentsContent />
    </AuthGuard>
  );
};

export default MyAppointmentsPage;
