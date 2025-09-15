'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg } from '@fullcalendar/core';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';

// This is the raw type from the API
type RawAppointment = {
  id: string;
  appointmentTime: string;
  status: string;
  service: { name: string };
  employee: { name: string };
  user: { name: string | null; email: string };
};

// This is the type for the event we will show in the dialog
type SelectedEvent = {
  title: string;
  start: Date;
  extendedProps: {
    status: string;
    customer: string;
    employee: string;
  };
};

const fetchAppointments = async () => {
  const response = await api.get('/appointments');
  return response.data.data; // Adjust if your structure is different
};

export const AppointmentCalendar = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);

  const { data: appointments, isLoading } = useQuery<RawAppointment[]>({
    queryKey: ['admin-appointments'],
    queryFn: fetchAppointments,
  });

  // Transform our API data into the format FullCalendar expects
  const events =
    appointments?.map((app) => ({
      title: `${app.service.name} - ${app.user.name || app.user.email}`,
      start: new Date(app.appointmentTime),
      // You would also calculate an 'end' time here in a real app
      extendedProps: {
        status: app.status,
        customer: app.user.name || app.user.email,
        employee: app.employee.name,
      },
    })) || [];

  const handleEventClick = (clickInfo: EventClickArg) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: clickInfo.event.start!,
      extendedProps: clickInfo.event.extendedProps as SelectedEvent['extendedProps'],
    });
    setIsDialogOpen(true);
  };

  return (
    <>
      {isLoading ? (
        <div>Loading calendar...</div>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
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
