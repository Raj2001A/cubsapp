/**
 * Employee and related types
 */
import { Document } from './documents';
import { VisaApplication } from '../types';

/**
 * Employee visa status enum
 */
export enum EmployeeVisaStatus {
  ACTIVE = 'ACTIVE',
  EXPIRING = 'EXPIRING',
  EXPIRED = 'EXPIRED',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Employee type
 */
export type Employee = {
  id: string;
  employeeId: string;
  name: string;
  company: string;
  companyId: string;
  companyName: string;
  position: string;
  nationality: string;
  dateOfBirth: string;
  joinDate: string;
  visaExpiryDate?: string;
  visaStatus: EmployeeVisaStatus;
  documents: Document[];
  [key: string]: unknown;
};

/**
 * Emergency contact interface
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

/**
 * Unified Employee interface
 *
 * This is the comprehensive Employee interface used throughout the application.
 * It combines all properties from different employee interfaces to ensure consistency.
 */
export interface UnifiedEmployee {
  // Identifiers
  id: string;
  employeeId: string; // Company employee ID (different from the system ID)
  userId?: string; // Reference to user account if applicable

  // Personal information
  name: string;
  firstName?: string; // Some interfaces use firstName/lastName instead of name
  lastName?: string;
  email: string;
  dateOfBirth: string; // ISO date string
  nationality: string;
  passportNumber?: string;

  // Contact information
  phone?: string;
  mobileNumber?: string; // Alternative name for phone
  homePhoneNumber?: string;
  address?: string;
  emergencyContact?: EmergencyContact;

  // Employment information
  companyId: string;
  companyName: string;
  department?: string;
  position?: string;
  trade?: string; // Job trade/skill
  joinDate: string; // ISO date string
  status?: string;

  // Visa information
  visaStatus: EmployeeVisaStatus | string;
  visaExpiryDate: string; // ISO date string

  // Related data
  documents: Document[];
  visaApplications?: VisaApplication[];
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  name: string;
  type: string; // MIME type
  documentType: string;
  uploadDate: string;
  expiryDate?: string;
  status: 'valid' | 'expiring' | 'expired';
  fileUrl: string;
  uploadedBy: string;
}

/**
 * Paginated employees interface
 */
export interface PaginatedEmployees {
  employees: Employee[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  'PASSPORT_COPY': 'Passport Copy',
  'EMIRATES_ID': 'Emirates ID',
  'LABOUR_CARD': 'Labour Card',
  'MEDICAL_INSURANCE': 'Medical Insurance',
  'WORKMEN_COMPENSATION': 'Workmen Compensation',
  'VISA_COPY': 'Visa Copy',
  'ILOE': 'ILOE', // Immigration Letter of Employment
  'CICPA': 'CICPA', // Critical Infrastructure & Coastal Protection Authority
  'TEMPORARY_WORK_PERMIT': 'Temporary Work Permit',
  'DRIVING_LICENSE': 'Driving License',
  'OTHER_CERTIFICATES': 'Other Certificates'
};
