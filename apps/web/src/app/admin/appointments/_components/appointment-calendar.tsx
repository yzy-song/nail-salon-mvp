'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, EventDropArg } from '@fullcalendar/core';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { addMinutes, format } from 'date-fns';
import { toast } from 'sonner';
type RawAppointment = {
  id: string;
  appointmentTime: string;
  status: string;
  service: { name: string; duration: number }; // 确保 duration 被获取
  employee: { name: string };
  user: { name: string | null; email: string };
};

type SelectedEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  extendedProps: {
    status: string;
    customer: string;
    employee: string;
  };
};

const fetchAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data.data;
};

// 根据状态分配颜色
const getEventColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return '#2563eb'; // 蓝色
    case 'COMPLETED':
      return '#16a34a'; // 绿色
    case 'CANCELLED':
      return '#dc2626'; // 红色
    case 'PENDING':
    default:
      return '#f97316'; // 橙色
  }
};

export const AppointmentCalendar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const queryClient = useQueryClient();

  const { data: appointments, isLoading } = useQuery<RawAppointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: fetchAppointments,
  });

  const { mutate: rescheduleAppointment } = useMutation({
    mutationFn: ({ id, newAppointmentTime }: { id: string; newAppointmentTime: Date }) =>
      api.patch(`/appointments/${id}/reschedule`, { newAppointmentTime }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      toast.success('Rescheduled successfully');
    },
    onError: (error: any, variables, context) => {
      toast.error('Failed to reschedule', { description: error.response?.data?.message });
      // 如果后端更新失败，则将事件还原回其原始位置
      (context as any)?.revert();
    },
  });

  const events =
    appointments?.map((app) => ({
      id: app.id,
      title: `${app.service.name} - ${app.user.name || app.user.email}`,
      start: new Date(app.appointmentTime),
      end: addMinutes(new Date(app.appointmentTime), app.service.duration),
      backgroundColor: getEventColor(app.status),
      borderColor: getEventColor(app.status),
      extendedProps: {
        status: app.status,
        customer: app.user.name || app.user.email,
        employee: app.employee.name,
      },
    })) || [];

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      id: clickInfo.event.id,
      title: clickInfo.event.title,
      start: clickInfo.event.start!,
      end: clickInfo.event.end!,
      extendedProps: clickInfo.event.extendedProps as SelectedEvent['extendedProps'],
    });
    setIsDialogOpen(true);
  };

  const handleEventDrop = (dropInfo: EventDropArg) => {
    const { event } = dropInfo;
    rescheduleAppointment(
      { id: event.id, newAppointmentTime: event.start! },
      // @ts-expect-error 防止eslint报错
      { context: { revert: dropInfo.revert } },
    );
  };

  return (
    <>
      {isLoading ? (
        <div>Loading calendar...</div>
      ) : (
        <FullCalendar
          themeSystem="bootstrap5"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          editable={true} // 启用拖拽和缩放
          eventDrop={handleEventDrop} // 处理拖拽事件
          height="auto"
          slotMinTime="09:00:00" // 营业开始时间
          slotMaxTime="20:00:00" // 营业结束时间
          allDaySlot={false} // 隐藏 all-day 行
          slotDuration="00:10:00" // 每个时间段为10分钟
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              {selectedEvent && format(selectedEvent.start, 'eeee, MMMM do, yyyy @ h:mm a')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p>
              <strong>Status:</strong> {selectedEvent?.extendedProps.status}
            </p>
            <p>
              <strong>Customer:</strong> {selectedEvent?.extendedProps.customer}
            </p>
            <p>
              <strong>Technician:</strong> {selectedEvent?.extendedProps.employee}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
