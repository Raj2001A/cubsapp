import { useMemo } from 'react';
import { useEmployees } from './useEmployees';
import type { Employee, Document } from '../types/employee';

/**
 * useAnalytics - aggregates analytics for dashboard
 * Returns visa expiry stats, document compliance, and per-employee document status
 */
export type EmployeeDocStatus = {
  id: string;
  name: string;
  uploaded: number;
  missing: number;
  expired: number;
};

export function useAnalytics() {
  // For demo/mock, useEmployees returns an array of employees with docs/visaExpiryDate fields
  const { data: employees = [] } = useEmployees();

  // Visa expiry buckets
  const visaStats = useMemo(() => {
    const now = Date.now();
    const buckets = { '30': 0, '60': 0, '90': 0 };
    (employees as Employee[]).forEach((emp: Employee) => {
      if (!emp.visaExpiryDate) return;
      const days = Math.ceil((new Date(emp.visaExpiryDate).getTime() - now) / (1000*60*60*24));
      if (days <= 30) buckets['30']++;
      else if (days <= 60) buckets['60']++;
      else if (days <= 90) buckets['90']++;
    });
    return buckets;
  }, [employees]);

  // Document compliance
  const employeeDocStatus: EmployeeDocStatus[] = useMemo(() => {
    return (employees as Employee[]).map((emp: Employee) => {
      let uploaded = 0, missing = 0, expired = 0;
      if (Array.isArray(emp.documents)) {
        emp.documents.forEach((doc: Document) => {
          if (doc.expired) expired++;
          else if (doc.missing) missing++;
          else uploaded++;
        });
      }
      return { id: emp.id, name: emp.name, uploaded, missing, expired };
    });
  }, [employees]);

  const total = employeeDocStatus.length;
  const compliant = employeeDocStatus.filter((e: EmployeeDocStatus) => e.missing === 0 && e.expired === 0).length;
  const percentCompliant = total > 0 ? Math.round((compliant / total) * 100) : 100;

  return { visaStats, percentCompliant, employeeDocStatus };
}
