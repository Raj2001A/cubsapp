import { useState, useMemo } from 'react';
import { useEmployees } from './useEmployees';
import type { Employee } from '../types/employee';

export interface VisaReminder {
  id: string;
  name: string;
  department: string;
  visaExpiryDate?: string;
}

export function useVisaReminders(): {
  reminders: VisaReminder[];
  sendReminder: (id: string) => void;
  threshold: number;
  setThreshold: (threshold: number) => void;
  isLoading: boolean;
} {
  const { data: employees = [] } = useEmployees();
  const [threshold, setThreshold] = useState<number>(30);
  const reminders: VisaReminder[] = useMemo(() => {
    const now = Date.now();
    return (employees as Employee[]).filter((emp: Employee) => {
      if (!emp.visaExpiryDate) return false;
      const days = Math.ceil((new Date(emp.visaExpiryDate).getTime() - now) / (1000*60*60*24));
      return days >= 0 && days <= threshold;
    }).map((emp: Employee) => ({
      id: emp.id,
      name: emp.name,
      department: emp.department,
      visaExpiryDate: emp.visaExpiryDate,
    }));
  }, [employees, threshold]);

  function sendReminder(id: string): void {
    // Simulate sending
    alert('Reminder sent for ' + id);
  }

  return { reminders, sendReminder, threshold, setThreshold, isLoading: false };
}
