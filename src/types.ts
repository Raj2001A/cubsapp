export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'manager';
  department?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface VisaApplication {
  id: string;
  employeeId: string;
  type: 'work' | 'business' | 'tourist' | 'student';
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  startDate: string;
  endDate: string;
  country: string;
  applicationNumber: string;
  processingTime?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export the unified Employee interface from types/employees.ts
export type { Employee, EmergencyContact } from './types/employees';

export interface Notification {
  id: string;
  type: 'visa_expiry' | 'document_expiry' | 'application_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface DashboardStats {
  totalEmployees: number;
  activeVisas: number;
  expiringVisas: number;
  pendingApplications: number;
  documentsExpiring: number;
  recentActivities: {
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }[];
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
  category: 'visa' | 'passport' | 'contract' | 'other';
}

export interface Department {
  id: string;
  name: string;
  description: string;
  manager: string;
  employeeCount: number;
}
