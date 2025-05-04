import { EmployeeStatus, EmployeeVisaStatus } from './types/employees';
import { Employee, Department } from './types';

export const employees: Employee[] = [
  {
    id: '1',
    userId: 'user1',
    employeeId: 'EMP001',
    name: 'Aisha Al Mansoori',
    firstName: 'Aisha',
    lastName: 'Al Mansoori',
    email: 'aisha.almansoori@example.ae',
    phone: '+971501234567',
    position: 'Senior Architect',
    department: 'Engineering',
    nationality: 'UAE',
    dateOfBirth: '1985-05-15',
    joinDate: '2021-08-10',
    documents: [],
    visaApplications: [],
    status: EmployeeStatus.ACTIVE,
    visaStatus: EmployeeVisaStatus.ACTIVE,
    companyId: '',
    companyName: '',
    visaExpiryDate: '',
    emergencyContact: {
      name: 'Mohammed Al Mansoori',
      relationship: 'Spouse',
      phone: '+971502345678'
    }
  },
  {
    id: '2',
    userId: 'user2',
    employeeId: 'EMP002',
    name: 'Omar Khan',
    firstName: 'Omar',
    lastName: 'Khan',
    email: 'omar.khan@example.ae',
    phone: '+971569876543',
    position: 'Marketing Manager',
    department: 'Marketing',
    nationality: 'Pakistan',
    dateOfBirth: '1988-11-22',
    joinDate: '2022-02-15',
    documents: [],
    visaApplications: [],
    status: EmployeeStatus.ACTIVE,
    visaStatus: EmployeeVisaStatus.ACTIVE,
    companyId: '',
    companyName: '',
    visaExpiryDate: '',
    emergencyContact: {
      name: 'Fatima Khan',
      relationship: 'Sister',
      phone: '+971503456789'
    }
  },
  {
    id: '3',
    userId: 'user3',
    employeeId: 'EMP003',
    name: 'Fatima Ali',
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatima.ali@example.ae',
    phone: '+971523456789',
    position: 'Financial Analyst',
    department: 'Finance',
    nationality: 'UAE',
    dateOfBirth: '1990-03-10',
    joinDate: '2023-05-20',
    documents: [],
    visaApplications: [],
    status: EmployeeStatus.ACTIVE,
    visaStatus: EmployeeVisaStatus.ACTIVE,
    companyId: '',
    companyName: '',
    visaExpiryDate: '',
    emergencyContact: {
      name: 'Ahmed Ali',
      relationship: 'Brother',
      phone: '+971504567890'
    }
  },
  {
    id: '4',
    userId: 'user4',
    employeeId: 'EMP004',
    name: 'Rashid Al Maktoum',
    firstName: 'Rashid',
    lastName: 'Al Maktoum',
    email: 'rashid.almaktoum@example.ae',
    phone: '+971547890123',
    position: 'Project Manager',
    department: 'Operations',
    nationality: 'UAE',
    dateOfBirth: '1982-09-05',
    joinDate: '2022-11-01',
    documents: [],
    visaApplications: [],
    status: EmployeeStatus.ACTIVE,
    visaStatus: EmployeeVisaStatus.ACTIVE,
    companyId: '',
    companyName: '',
    visaExpiryDate: '',
    emergencyContact: {
      name: 'Sheikha Al Maktoum',
      relationship: 'Wife',
      phone: '+971505678901'
    }
  },
  {
    id: '5',
    userId: 'user5',
    employeeId: 'EMP005',
    name: 'Sara Hassan',
    firstName: 'Sara',
    lastName: 'Hassan',
    email: 'sara.hassan@example.ae',
    phone: '+971582345678',
    position: 'HR Manager',
    department: 'Human Resources',
    nationality: 'UAE',
    dateOfBirth: '1987-12-18',
    joinDate: '2024-01-05',
    documents: [],
    visaApplications: [],
    status: EmployeeStatus.ACTIVE,
    visaStatus: EmployeeVisaStatus.ACTIVE,
    companyId: '',
    companyName: '',
    visaExpiryDate: '',
    emergencyContact: {
      name: 'Hassan Ahmed',
      relationship: 'Father',
      phone: '+971506789012'
    }
  }
];

export const departments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical operations',
    manager: 'Aisha Al Mansoori',
    employeeCount: 15
  },
  {
    id: '2',
    name: 'Marketing',
    description: 'Brand management and market research',
    manager: 'Omar Khan',
    employeeCount: 8
  },
  {
    id: '3',
    name: 'Finance',
    description: 'Financial planning and accounting',
    manager: 'Fatima Ali',
    employeeCount: 6
  },
  {
    id: '4',
    name: 'Operations',
    description: 'Overseeing daily business activities',
    manager: 'Rashid Al Maktoum',
    employeeCount: 10
  },
  {
    id: '5',
    name: 'Human Resources',
    description: 'Recruitment and employee relations',
    manager: 'Sara Hassan',
    employeeCount: 5
  }
];
