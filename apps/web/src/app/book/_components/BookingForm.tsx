'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import { Service } from '@/components/services/ServiceCard';
import { Employee } from '@/app/admin/employees/_components/columns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { format, formatISO, startOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { GuestInfoDialog } from './GuestInfoDialog';

// 分时段分组函数
const groupTimesByPeriod = (times: string[]) => {
  const groups: { [key: string]: string[] } = {
    Morning: [],
    Afternoon: [],
    Evening: [],
  };
  times.forEach((time) => {
    const hour = parseInt(time.split(':')[0], 10);
    if (hour < 12) {
      groups.Morning.push(time);
    } else if (hour < 17) {
      groups.Afternoon.push(time);
    } else {
      groups.Evening.push(time);
    }
  });
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });
  return groups;
};

// 判断是否为移动端
const useIsMobile = () => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
};

export const BookingForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoggedIn } = useAuthStore();
  const [isGuestDialogOpen, setIsGuestDialogOpen] = useState(false);

  const [selectedServiceId, setSelectedServiceId] = useState<string | undefined>(
    searchParams.get('serviceId') || undefined,
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(false);

  // 响应式监听
  useMemo(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  // 获取服务和员工
  const { data: services } = useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => (await api.get('/services')).data.data,
  });
  const { data: employees } = useQuery<Employee[]>({
    queryKey: ['employees'],
    queryFn: async () => (await api.get('/employees')).data.data,
  });

  // 获取可预约时间
  const { data: availableTimes = [], isLoading: timesLoading } = useQuery<string[]>({
    queryKey: ['availability', selectedEmployeeId, selectedDate, selectedServiceId],
    queryFn: async () => {
      if (!selectedEmployeeId || !selectedDate || !selectedServiceId) return [];
      const dateString = formatISO(selectedDate, { representation: 'date' });
      const response = await api.get(
        `/employees/${selectedEmployeeId}/availability?date=${dateString}&serviceId=${selectedServiceId}`,
      );
      return response.data.data;
    },
    enabled: !!selectedEmployeeId && !!selectedDate && !!selectedServiceId,
  });

  const timeGroups = useMemo(() => groupTimesByPeriod(availableTimes), [availableTimes]);
  const selectedService = useMemo(
    () => services?.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId],
  );
  const selectedEmployee = useMemo(
    () => employees?.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
  );

  // 创建预约
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
      toast.error('Booking Failed', { description: error.response?.data?.message });
    },
  });

  const { mutate: createGuestAppointment, isPending: isGuestBookingPending } = useMutation({
    mutationFn: (values: any) => api.post('/appointments/guest', values),
    onSuccess: () => {
      toast.success('Booking Successful!', {
        description: "We've sent an email with your new account details.",
      });
      router.push('/login'); // Redirect to login after guest booking
    },
    onError: (error: any) => {
      toast.error('Booking Failed', { description: error.response?.data?.message });
    },
  });

  const handleBooking = () => {
    if (!selectedServiceId || !selectedEmployeeId || !selectedDate || !selectedTime) {
      toast.error('Please complete your selection.');
      return;
    }

    if (isLoggedIn) {
      createAppointment();
    } else {
      // If user is a guest, open the dialog to ask for name/email
      setIsGuestDialogOpen(true);
    }
  };

  const handleGuestSubmit = (guestData: { customerName: string; customerEmail: string }) => {
    const [hours, minutes] = selectedTime!.split(':');
    const appointmentTime = new Date(selectedDate!);
    appointmentTime.setHours(parseInt(hours), parseInt(minutes));

    createGuestAppointment({
      serviceId: selectedServiceId,
      employeeId: selectedEmployeeId,
      appointmentTime: appointmentTime.toISOString(),
      ...guestData,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区 */}
      <main className="container mx-auto py-6 flex flex-col lg:flex-row gap-8">
        {/* 左侧选择区 */}
        <section className="flex-1 space-y-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Book Your Appointment</h1>
          <Card className="p-6 border rounded-lg space-y-6 bg-white shadow-sm">
            {/* Service & Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-semibold">Service</Label>
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
                <Label className="font-semibold">Employee</Label>
                <Select onValueChange={setSelectedEmployeeId} defaultValue={selectedEmployeeId} disabled={!services}>
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
            </div>

            {/* Date & Time Selection */}
            {selectedServiceId && selectedEmployeeId && (
              <div className="space-y-6 pt-4 border-t">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="font-semibold">Select a Date</Label>
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="rounded-md border self-start"
                      disabled={(date) => date < startOfDay(new Date())}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="font-semibold">Select a Time</Label>
                    {timesLoading ? (
                      <div className="flex items-center pt-4">
                        <Loader2 className="animate-spin mr-2" />
                        Loading times...
                      </div>
                    ) : isMobile ? (
                      // 移动端：分时段横向滚动，按钮不会超出屏幕
                      Object.entries(timeGroups).map(([period, times]) => (
                        <div key={period} className="mb-2">
                          <h4 className="font-medium text-sm text-gray-500 mb-2">{period}</h4>
                          <ScrollArea className="w-full whitespace-nowrap rounded-md">
                            <div className="flex space-x-2 pb-4">
                              {times.map((time) => (
                                <Button
                                  key={time}
                                  variant={selectedTime === time ? 'default' : 'outline'}
                                  onClick={() => setSelectedTime(time)}
                                  className="min-w-[72px] px-4 py-2 text-base"
                                >
                                  {time}
                                </Button>
                              ))}
                            </div>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))
                    ) : (
                      // PC端：全部时间网格展示，不分时段
                      <div className="grid grid-cols-4 gap-4">
                        {availableTimes.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(time)}
                            className="w-full py-3 text-base"
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    )}
                    {availableTimes.length === 0 && !timesLoading && (
                      <p className="text-sm text-gray-500 pt-4">
                        No available times for this date. Please select another date.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* 右侧预约摘要区（桌面端显示，移动端在主内容区底部） */}
        <aside className="lg:w-96 w-full lg:sticky lg:top-24">
          <Card className="p-6 space-y-4 shadow-lg">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
              <CardDescription>Review your selections.</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedService ? (
                <p className="text-sm text-gray-500">Please select a service to begin.</p>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span> <span className="font-semibold text-right">{selectedService.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Employee:</span>{' '}
                      <span className="font-semibold text-right">{selectedEmployee?.name || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>{' '}
                      <span className="font-semibold text-right">
                        {selectedDate ? format(selectedDate, 'PPP') : 'Not selected'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>{' '}
                      <span className="font-semibold text-right">{selectedTime || 'Not selected'}</span>
                    </div>
                    <div className="flex justify-between border-t pt-4 mt-4 text-lg">
                      <strong>Total Price:</strong> <strong className="text-pink-500">€{selectedService.price}</strong>
                    </div>
                  </div>
                  <Button onClick={handleBooking} className="w-full" disabled={isPending || !selectedTime}>
                    {isPending ? <Loader2 className="animate-spin" /> : 'Confirm & Book'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
      <GuestInfoDialog
        isOpen={isGuestDialogOpen}
        onClose={() => setIsGuestDialogOpen(false)}
        onConfirm={handleGuestSubmit}
        isPending={isGuestBookingPending}
      />
    </div>
  );
};
