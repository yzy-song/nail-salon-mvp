'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useState } from 'react';

interface TimePickerDialogProps {
  open: boolean;
  onClose: () => void;
  times: string[];
  selectedTime: string | null;
  onSelect: (time: string) => void;
}

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

export const TimePickerDialog: React.FC<TimePickerDialogProps> = ({ open, onClose, times, selectedTime, onSelect }) => {
  const timeGroups = groupTimesByPeriod(times);
  const periodKeys = Object.keys(timeGroups);
  const [activePeriod, setActivePeriod] = useState(periodKeys[0] || '');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="pb-8 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select a Time</DialogTitle>
        </DialogHeader>
        <Tabs value={activePeriod} onValueChange={setActivePeriod} className="w-full">
          <TabsList className="w-full flex justify-center mb-4">
            {periodKeys.map((period) => (
              <TabsTrigger key={period} value={period} className="flex-1">
                {period}
              </TabsTrigger>
            ))}
          </TabsList>
          {periodKeys.map((period) => (
            <TabsContent key={period} value={period} className="grid grid-cols-2 gap-4">
              {timeGroups[period].map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? 'default' : 'outline'}
                  onClick={() => {
                    onSelect(time);
                    onClose();
                  }}
                  className="w-full py-4 text-lg"
                >
                  {time}
                </Button>
              ))}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
