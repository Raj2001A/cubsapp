/**
 * Mock Employees Data
 * 
 * This file contains sample employee data for development and testing purposes.
 * In production, this data would come from the backend API.
 */

import { Employee } from '../types/employees';

// Removed unused OperationType, ErrorSeverity imports

// Sample employee data
export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'Lacey Smith',
    trade: 'Carpenter',
    nationality: 'Egyptian',
    joinDate: '2024-11-24',
    dateOfBirth: '1981-11-01',
    mobileNumber: '+971596608849',
    homePhoneNumber: '+971587701057',
    email: 'lacey.smith@cubstechcontracting.ae',
    companyId: '1',
    companyName: 'CUBS TECH CONTRACTING, SHARJAH, UAE',
    department: 'Construction',
    position: 'Senior Carpenter',
    visaStatus: 'active',
    visaExpiryDate: '2025-03-20',
    documents: [
      {
        id: '1',
        name: 'Passport Copy',
        type: 'Identity',
        uploadDate: '2023-11-30',
        expiryDate: '2028-11-29',
        employeeId: 'EMP001'
      },
      {
        id: '2',
        name: 'Visa Copy',
        type: 'Visa',
        uploadDate: '2023-03-20',
        expiryDate: '2025-03-20',
        employeeId: 'EMP001'
      },
      {
        id: '3',
        name: 'Employment Contract',
        type: 'Contract',
        uploadDate: '2023-11-24',
        employeeId: 'EMP001'
      },
      {
        id: '4',
        name: 'Emirates ID',
        type: 'Identity',
        uploadDate: '2023-12-05',
        expiryDate: '2025-12-04',
        employeeId: 'EMP001'
      }
    ]
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Ahmed Hassan',
    trade: 'Electrician',
    nationality: 'Indian',
    joinDate: '2023-05-15',
    dateOfBirth: '1985-07-22',
    mobileNumber: '+971501234567',
    homePhoneNumber: '+971561234567',
    email: 'ahmed.hassan@goldencubs.ae',
    companyId: '2',
    companyName: 'GOLDENCUBS GENERAL CONTRACTING LLC, ABUDHABI, UAE',
    department: 'Electrical',
    position: 'Lead Electrician',
    visaStatus: 'expiring',
    visaExpiryDate: '2024-04-15',
    documents: [
      {
        id: '5',
        name: 'Passport Copy',
        type: 'Identity',
        uploadDate: '2022-05-20',
        expiryDate: '2027-05-19',
        employeeId: 'EMP002'
      },
      {
        id: '6',
        name: 'Visa Copy',
        type: 'Visa',
        uploadDate: '2022-04-15',
        expiryDate: '2024-04-15',
        employeeId: 'EMP002'
      },
      {
        id: '7',
        name: 'Employment Contract',
        type: 'Contract',
        uploadDate: '2023-05-15',
        employeeId: 'EMP002'
      }
    ]
  },
  {
    id: '3',
    employeeId: 'EMP003',
    name: 'Raj Patel',
    trade: 'Plumber',
    nationality: 'Pakistani',
    joinDate: '2022-08-10',
    dateOfBirth: '1979-03-15',
    mobileNumber: '+971529876543',
    homePhoneNumber: '+971549876543',
    email: 'raj.patel@alashbal.ae',
    companyId: '3',
    companyName: 'AL ASHBAL ELECTROMECHANICAL CONTRACTING LLC, AJMAN, UAE',
    department: 'Plumbing',
    position: 'Plumbing Supervisor',
    visaStatus: 'expired',
    visaExpiryDate: '2024-01-10',
    documents: [
      {
        id: '8',
        name: 'Passport Copy',
        type: 'Identity',
        uploadDate: '2021-08-10',
        expiryDate: '2026-08-09',
        employeeId: 'EMP003'
      },
      {
        id: '9',
        name: 'Visa Copy',
        type: 'Visa',
        uploadDate: '2022-01-10',
        expiryDate: '2024-01-10',
        employeeId: 'EMP003'
      },
      {
        id: '10',
        name: 'Labour Card',
        type: 'Identity',
        uploadDate: '2022-08-15',
        expiryDate: '2024-08-14',
        employeeId: 'EMP003'
      }
    ]
  },
  {
    id: '4',
    employeeId: 'EMP004',
    name: 'Mohammed Ali',
    trade: 'Civil Engineer',
    nationality: 'Jordanian',
    joinDate: '2023-02-15',
    dateOfBirth: '1988-05-20',
    mobileNumber: '+971505551234',
    homePhoneNumber: '+971565551234',
    email: 'mohammed.ali@fluid.ae',
    companyId: '4',
    companyName: 'FLUID ENGINEERING SERVICES LLC, ABUDHABI, UAE',
    department: 'Engineering',
    position: 'Project Engineer',
    visaStatus: 'active',
    visaExpiryDate: '2025-02-15',
    documents: []
  },
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'Sanjay Kumar',
    trade: 'Carpenter',
    nationality: 'Indian',
    joinDate: '2022-06-10',
    dateOfBirth: '1990-11-15',
    mobileNumber: '+971507778888',
    homePhoneNumber: '+971567778888',
    email: 'sanjay.kumar@ashbal.ae',
    companyId: '5',
    companyName: 'ASHBAL AL KHALEEJ CONCRETE CARPENTER CONT, SHARJAH, UAE',
    department: 'Construction',
    position: 'Carpenter',
    visaStatus: 'active',
    visaExpiryDate: '2024-06-10',
    documents: []
  },
  {
    id: '6',
    employeeId: 'EMP006',
    name: 'Abdul Rahman',
    trade: 'Plumber',
    nationality: 'Pakistani',
    joinDate: '2023-01-05',
    dateOfBirth: '1985-03-25',
    mobileNumber: '+971509998877',
    homePhoneNumber: '+971569998877',
    email: 'abdul.rahman@rukin.ae',
    companyId: '6',
    companyName: 'RUKIN AL ASHBAL SANITARY CONT, SHARJAH, UAE',
    department: 'Plumbing',
    position: 'Senior Plumber',
    visaStatus: 'active',
    visaExpiryDate: '2025-01-05',
    documents: []
  },
  {
    id: '7',
    employeeId: 'EMP007',
    name: 'Fahad Al-Mansoori',
    trade: 'Tour Guide',
    nationality: 'Emirati',
    joinDate: '2023-03-15',
    dateOfBirth: '1992-07-10',
    mobileNumber: '+971504445555',
    homePhoneNumber: '+971564445555',
    email: 'fahad@alhana.ae',
    companyId: '9',
    companyName: 'AL HANA TOURS, SHARJAH, UAE',
    department: 'Tourism',
    position: 'Senior Tour Guide',
    visaStatus: 'active',
    visaExpiryDate: '2025-03-15',
    documents: []
  },
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Ali Hassan',
    trade: 'Project Manager',
    nationality: 'Qatari',
    joinDate: '2022-11-20',
    dateOfBirth: '1980-12-05',
    mobileNumber: '+97450123456',
    homePhoneNumber: '+97450123457',
    email: 'ali.hassan@cubsqatar.com',
    companyId: '7',
    companyName: 'CUBS CONTRACTING AND SERVICES W.L.L, QATAR',
    department: 'Management',
    position: 'Project Manager',
    visaStatus: 'active',
    visaExpiryDate: '2024-11-20',
    documents: []
  },
  {
    id: '9',
    employeeId: 'EMP009',
    name: 'John Smith',
    trade: 'Electrician',
    nationality: 'British',
    joinDate: '2023-09-01',
    dateOfBirth: '1975-08-15',
    mobileNumber: '+97455667788',
    homePhoneNumber: '+97455667789',
    email: 'john.smith@almacen.com',
    companyId: '8',
    companyName: 'AL MACEN TRADING & CONTRACTING W.L.L., QATAR',
    department: 'Electrical',
    position: 'Electrical Supervisor',
    visaStatus: 'active',
    visaExpiryDate: '2025-09-01',
    documents: []
  },
  {
    id: '10',
    employeeId: 'EMP010',
    name: 'Temporary Worker',
    trade: 'Helper',
    nationality: 'Bangladeshi',
    joinDate: '2024-01-15',
    dateOfBirth: '1995-05-20',
    mobileNumber: '+971501112222',
    homePhoneNumber: '',
    email: 'temp.worker@temp.ae',
    companyId: '10',
    companyName: 'TEMPORARY WORKER',
    department: '',
    position: 'Helper',
    visaStatus: 'active',
    visaExpiryDate: '2024-07-15',
    documents: []
  }
];
