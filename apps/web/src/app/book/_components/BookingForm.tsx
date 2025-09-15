'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Service } from '@/components/services/ServiceCard';
import { Employee } from '@/app/admin/employees/_components/columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { format, formatISO, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

export const BookingForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuthStore();

  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(
    searchParams.get('serviceId') || undefined,
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  // 1. Fetch services and employees
  const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => (await api.get('/services')).data.data,
  });
  const { data: employees, isLoading: employeesLoading } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data.data,
  });

  // 2. Fetch availability, enabled only when dependencies are selected
  const { data: availableTimes, isLoading: timesLoading } = useQuery<string[]>({
    queryKey: ['availability', selectedEmployeeId, selectedDate, selectedServiceId],
    queryFn: async () => {
      const dateString = formatISO(selectedDate!, { representation: 'date' });
      const response = await api.get(
        `/employees/${selectedEmployeeId}/availability?date=${dateString}&serviceId=${selectedServiceId}`,
      );
      return response.data.data;
    },
    enabled: !!selectedEmployeeId && !!selectedDate && !!selectedServiceId,
  });

  const selectedService = services?.find((s) => s.id === selectedServiceId);
  const selectedEmployee = employees?.find((e) => e.id === selectedEmployeeId);

  const { mutate: createAppointment, isPending } = useMutation({
    mutationFn: async () => {
      const [hours, minutes] = selectedTime!.split(':');
      const appointmentTime = new Date(selectedDate!);
      appointmentTime.setHours(parseInt(hours), parseInt(minutes));
      return api.post('/appointments', {
        serviceId: selectedServiceId,
        employeeId: selectedEmployeeId,
        appointmentTime: appointmentTime.toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Booking Successful!');
      router.push('/my-appointments');
    },
    onError: (error: any) => {
      toast.error('Booking Failed', { description: error?.message });
    },
  });

  const handleBooking = () => {
    if (!isLoggedIn) {
      toast.error('Please log in to complete your booking.');
      router.push('/login');
      return;
    }
    if (!selectedServiceId || !selectedEmployeeId || !selectedDate || !selectedTime) {
      toast.error('Please select a service, employee, date, and time.');
      return;
    }
    createAppointment();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <div className="space-y-2">
          <Label className="text-lg font-semibold">1. Select Service</Label>
          <Select onValueChange={setSelectedServiceId} defaultValue={selectedServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a service..." />
            </SelectTrigger>
            <SelectContent>
              {services?.map((service) => (
                <SelectItem key={service.id} value={service.id}>
                  {service.name} (€{service.price})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-lg font-semibold">2. Select an Employee</Label>
          <Select onValueChange={setSelectedEmployeeId} defaultValue={selectedEmployeeId} disabled={!selectedServiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees?.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedEmployeeId && (
          <div className="grid md:grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">3. Select a Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => date < startOfDay(new Date())}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-lg font-semibold">4. Select a Time</Label>
              <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timesLoading && <p className="col-span-full">Loading times...</p>}
                {availableTimes &&
                  availableTimes.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? 'default' : 'outline'}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </Button>
                  ))}
                {availableTimes?.length === 0 && !timesLoading && (
                  <p className="col-span-full text-sm text-gray-500">
                    No available times for this date. Please select another date.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedService ? (
              <p className="text-sm text-gray-500">Please make your selections.</p>
            ) : (
              <>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Service:</span> <span className="font-semibold text-right">{selectedService.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Employee:</span>{' '}
                    <span className="font-semibold text-right">{selectedEmployee?.name || '...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>{' '}
                    <span className="font-semibold text-right">
                      {selectedDate ? format(selectedDate, 'PPP') : '...'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span> <span className="font-semibold text-right">{selectedTime || '...'}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2 text-base">
                    <strong>Total Price:</strong> <strong className="text-pink-500">€{selectedService.price}</strong>
                  </div>
                </div>
                <Button onClick={handleBooking} className="w-full" disabled={isPending || !selectedTime}>
                  {isPending ? <Loader2 className="animate-spin" /> : 'Confirm & Book'}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
