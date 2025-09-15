'use client';

import { AppointmentCalendar } from './_components/appointment-calendar';

const AppointmentsPage = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Appointments Calendar</h1>
      <div className="p-4 bg-white rounded-lg shadow-md">
        <AppointmentCalendar />
      </div>
    </div>
  );
};

export default AppointmentsPage;
