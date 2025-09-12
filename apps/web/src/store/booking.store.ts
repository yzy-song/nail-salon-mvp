import { create } from 'zustand';

interface BookingState {
  step: number;
  serviceId: string | null;
  employeeId: string | null;
  date: Date | null;
  time: string | null;

  setStep: (step: number) => void;
  setServiceId: (id: string) => void;
  setEmployeeId: (id: string) => void;
  setDate: (date: Date) => void;
  setTime: (time: string) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  serviceId: null,
  employeeId: null,
  date: null,
  time: null,

  setStep: (step) => set({ step }),
  setServiceId: (id) => set({ serviceId: id, step: 2 }), // Select service, auto go to step 2
  setEmployeeId: (id) => set({ employeeId: id, step: 3 }), // Select employee, auto go to step 3
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time, step: 4 }), // Select time, auto go to step 4
  reset: () => set({ step: 1, serviceId: null, employeeId: null, date: null, time: null }),
}));
