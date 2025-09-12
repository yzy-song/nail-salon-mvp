'use client';

import { useEffect, useState } from 'react';
import { useBookingStore } from '@/store/booking.store';
import api from '@/lib/api';
import { Calendar } from '@/components/ui/calendar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// A mock list of available times. In a real app, this would come from the backend.
const MOCK_AVAILABLE_TIMES = [
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
];

export const SelectEmployeeAndDate = () => {
  const { employeeId, date, setEmployeeId, setDate, setTime } = useBookingStore();
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await api.get('/employees');
        setEmployees(response.data.data);
      } catch (error) {
        console.error('Failed to fetch employees', error);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Step 2: Select an Employee</h2>
        <Select onValueChange={setEmployeeId} defaultValue={employeeId || ''}>
          <SelectTrigger>
            <SelectValue placeholder="Choose an employee" />
          </SelectTrigger>
          <SelectContent>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {employeeId && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Step 3: Select Date & Time</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date || undefined}
                onSelect={(day) => day && setDate(day)}
                className="rounded-md border"
              />
            </div>
            {date && (
              <RadioGroup onValueChange={setTime} className="space-y-2">
                <h3 className="font-semibold">Available Times:</h3>
                <div className="grid grid-cols-3 gap-2">
                  {MOCK_AVAILABLE_TIMES.map((time) => (
                    <div key={time}>
                      <RadioGroupItem value={time} id={time} className="peer sr-only" />
                      <Label
                        htmlFor={time}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        {time}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
