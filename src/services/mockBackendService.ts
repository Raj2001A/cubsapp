/**
 * Mock Backend Service
 * 
 * This service simulates a backend API for authentication and data storage.
 * In a real application, these functions would make actual API calls.
 */

import { Employee, EmployeeDocument } from '../types/employees';
import { AuthResponse } from '../types/auth';
import { User } from '../types/user';

// Mock storage (simulates a database)
class MockDatabase {
  private static instance: MockDatabase;
  private employees: Record<string, Employee> = {};
  private users: Record<string, User> = {};
  private documents: Record<string, EmployeeDocument[]> = {};
  private tokens: Record<string, string> = {}; // userId -> token
  private passwords: Record<string, string> = {}; // userId -> password

  private constructor() {
    // Initialize with some mock data
    this.addEmployee({
      id: '1',
      email: 'john.doe@example.com',
      name: 'John Doe',
      department: 'Engineering',
      position: 'Senior Developer',
      visaStatus: 'active',
      visaExpiryDate: '2025-03-20',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, San Francisco, CA 94105',
      employeeId: 'EMP001',
      joinDate: '2022-01-15',
      nationality: 'United States',
      passportNumber: 'P123456789',
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1 (555) 987-6543'
      },
      dateOfBirth: '1985-07-15',
      companyId: 'CUBS001',
      companyName: 'CUBS Technical Contracting',
      documents: []
    });

    this.addEmployee({
      id: '2',
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      department: 'Marketing',
      position: 'Marketing Manager',
      visaStatus: 'expiring',
      visaExpiryDate: '2024-04-15',
      phone: '+1 (555) 234-5678',
      address: '456 Oak St, San Francisco, CA 94105',
      employeeId: 'EMP002',
      joinDate: '2022-02-01',
      nationality: 'Canada',
      passportNumber: 'P987654321',
      emergencyContact: {
        name: 'John Smith',
        relationship: 'Spouse',
        phone: '+1 (555) 876-5432'
      },
      dateOfBirth: '1988-10-10',
      companyId: 'CUBS001',
      companyName: 'CUBS Technical Contracting',
      documents: []
    });

    this.addEmployee({
      id: '3',
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      department: 'Sales',
      position: 'Sales Representative',
      visaStatus: 'expired',
      visaExpiryDate: '2024-02-01',
      phone: '+1 (555) 345-6789',
      address: '789 Pine St, San Francisco, CA 94105',
      employeeId: 'EMP003',
      joinDate: '2022-03-01',
      nationality: 'United Kingdom',
      passportNumber: 'P567891234',
      emergencyContact: {
        name: 'Sarah Johnson',
        relationship: 'Spouse',
        phone: '+1 (555) 765-4321'
      },
      dateOfBirth: '1990-03-22',
      companyId: 'CUBS001',
      companyName: 'CUBS Technical Contracting',
      documents: []
    });

    // Add admin user
    this.addUser({
      id: 'admin1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'Administrator',
      employeeId: undefined
    });
    this.passwords['admin1'] = 'password123'; // In a real app, this would be hashed

    // Create a user account for each employee
    Object.values(this.employees).forEach(employee => {
      this.addUser({
        id: employee.id,
        email: employee.email,
        name: employee.name,
        role: 'employee',
        employeeId: employee.id
      });
      this.passwords[employee.id] = 'password123'; // Default password, would be randomly generated in a real app
    });
  }

  public static getInstance(): MockDatabase {
    if (!MockDatabase.instance) {
      MockDatabase.instance = new MockDatabase();
    }
    return MockDatabase.instance;
  }

  // Employee methods
  public addEmployee(employee: Employee): void {
    this.employees[employee.id] = employee;
  }

  public getEmployeeById(id: string): Employee | null {
    return this.employees[id] || null;
  }

  public getEmployeeByEmail(email: string): Employee | null {
    return Object.values(this.employees).find(emp => emp.email === email) || null;
  }

  public getAllEmployees(): Employee[] {
    return Object.values(this.employees);
  }

  public updateEmployee(id: string, data: Partial<Employee>): Employee | null {
    if (this.employees[id]) {
      this.employees[id] = { ...this.employees[id], ...data };
      return this.employees[id];
    }
    return null;
  }

  // User methods
  public addUser(user: User): void {
    this.users[user.id] = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role === 'Administrator' ? 'Administrator' : 'employee',
      ...(user.employeeId ? { employeeId: user.employeeId } : {})
    };
  }

  public getUserById(id: string): User | null {
    return this.users[id] || null;
  }

  public getUserByEmail(email: string): User | null {
    return Object.values(this.users).find(user => user.email === email) || null;
  }

  // Authentication methods
  public authenticateUser(email: string, password: string): User | null {
    const user = this.getUserByEmail(email);
    if (user && this.passwords[user.id] === password) {
      return user;
    }
    return null;
  }

  public generateToken(userId: string): string {
    const token = `mock-jwt-token-${Date.now()}-${userId}`;
    this.tokens[userId] = token;
    return token;
  }

  public validateToken(token: string): User | null {
    const userId = Object.keys(this.tokens).find(id => this.tokens[id] === token);
    if (userId) {
      return this.getUserById(userId);
    }
    return null;
  }

  // Document methods
  public addDocument(employeeId: string, document: EmployeeDocument): void {
    if (!this.documents[employeeId]) {
      this.documents[employeeId] = [];
    }
    this.documents[employeeId].push(document);
  }

  public getDocumentsByEmployeeId(employeeId: string): EmployeeDocument[] {
    return this.documents[employeeId] || [];
  }

  public getDocumentById(employeeId: string, documentId: string): EmployeeDocument | null {
    const docs = this.getDocumentsByEmployeeId(employeeId);
    return docs.find(doc => doc.id === documentId) || null;
  }
}

// Mock API service
export class MockBackendService {
  private db = MockDatabase.getInstance();

  // Authentication
  public async login(email: string, password: string): Promise<AuthResponse> {
    // Simulate network delay
    await this.delay(500);

    const user = this.db.authenticateUser(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const token = this.db.generateToken(user.id);
    
    // If user is an employee, fetch their employee details
    let employeeDetails = null;
    if (user.role === 'employee' && user.employeeId) {
      employeeDetails = this.db.getEmployeeById(user.employeeId);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      employeeDetails
    };
  }

  public async validateToken(token: string): Promise<AuthResponse | null> {
    // Simulate network delay
    await this.delay(300);

    const user = this.db.validateToken(token);
    if (!user) {
      return null;
    }

    // If user is an employee, fetch their employee details
    let employeeDetails = null;
    if (user.role === 'employee' && user.employeeId) {
      employeeDetails = this.db.getEmployeeById(user.employeeId);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      employeeDetails
    };
  }

  // Employee management
  public async getEmployees(): Promise<{ data: Employee[] }> {
    // Simulate network delay
    await this.delay(500);
    try {
      const employees = this.db.getAllEmployees();
      return { data: employees };
    } catch (e) {
      throw new Error('Failed to fetch employees');
    }
  }

  public async getEmployeeById(id: string): Promise<{ data: Employee } | { error: string }> {
    // Simulate network delay
    await this.delay(300);
    try {
      const employee = this.db.getEmployeeById(id);
      if (!employee) throw new Error('Employee not found');
      return { data: employee };
    } catch (e) {
      throw new Error('Failed to fetch employee by ID');
    }
  }

  public async getEmployeeByEmail(email: string): Promise<{ data: Employee } | { error: string }> {
    // Simulate network delay
    await this.delay(300);
    try {
      const employee = this.db.getEmployeeByEmail(email);
      if (!employee) throw new Error('Employee not found');
      return { data: employee };
    } catch (e) {
      throw new Error('Failed to fetch employee by email');
    }
  }

  public async addEmployee(employee: Omit<Employee, 'id'>): Promise<{ data: Employee }> {
    // Simulate network delay
    await this.delay(500);
    try {
      const id = Math.random().toString(36).substring(2, 11);
      const newEmployee = { ...employee, id };
      this.db.addEmployee(newEmployee);
      return { data: newEmployee };
    } catch (e) {
      throw new Error('Failed to create employee');
    }
  }

  public async updateEmployee(id: string, data: Partial<Employee>): Promise<{ data: Employee } | { error: string }> {
    // Simulate network delay
    await this.delay(500);
    try {
      const updated = this.db.updateEmployee(id, data);
      if (!updated) throw new Error('Employee not found');
      return { data: updated };
    } catch (e) {
      throw new Error('Failed to update employee');
    }
  }

  // Document management
  public async addDocument(employeeId: string, document: Omit<EmployeeDocument, 'id'>): Promise<{ data: EmployeeDocument }> {
    // Simulate network delay
    await this.delay(500);
    try {
      const id = Math.random().toString(36).substring(2, 11);
      const newDocument = { ...document, id };
      this.db.addDocument(employeeId, newDocument);
      return { data: newDocument };
    } catch (e) {
      throw new Error('Failed to create document');
    }
  }

  public async getDocumentsByEmployeeId(employeeId: string): Promise<{ data: EmployeeDocument[] }> {
    // Simulate network delay
    await this.delay(300);
    try {
      const documents = this.db.getDocumentsByEmployeeId(employeeId);
      return { data: documents };
    } catch (e) {
      throw new Error('Failed to fetch documents by employee ID');
    }
  }

  // Search
  public async search(query: string, page: number = 1, limit: number = 10): Promise<{ data: Employee[], count: number, success: boolean }> {
    try {
      const employees = this.db.getAllEmployees();
      const q = query.trim().toLowerCase();
      const filtered = q
        ? employees.filter(e =>
            e.name.toLowerCase().includes(q) ||
            (e.email && e.email.toLowerCase().includes(q)) ||
            (e.department && e.department.toLowerCase().includes(q)) ||
            (e.position && e.position.toLowerCase().includes(q))
          )
        : employees;
      const start = (page - 1) * limit;
      const paginated = filtered.slice(start, start + limit);
      return { data: paginated, count: filtered.length, success: true };
    } catch (e) {
      throw new Error('Failed to search employees');
    }
  }

  public async getVisaExpiryReminders(limit: number = 10): Promise<{ success: boolean, count: number, data: Employee[] }> {
    try {
      const employees = this.db.getAllEmployees();
      const today = new Date('2025-04-28'); // Use provided local time
      const filtered = employees.filter(emp => {
        if (!emp.visaExpiryDate) return false;
        const expiry = new Date(emp.visaExpiryDate);
        const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 90; // expiring within 90 days
      });
      return { success: true, count: filtered.length, data: filtered.slice(0, limit) };
    } catch (e) {
      throw new Error('Failed to fetch visa expiry reminders');
    }
  }

  public async getDocumentsByVisaId(visaId: string): Promise<{ data: EmployeeDocument[] }> {
    try {
      // Simulate that visaId maps to employeeId for mock
      const employees = this.db.getAllEmployees();
      const emp = employees.find(e => e.id === visaId);
      if (!emp) throw new Error('Employee not found for visa');
      const docs = this.db.getDocumentsByEmployeeId(emp.id);
      return { data: docs };
    } catch (e) {
      throw new Error('Failed to fetch documents by visa ID');
    }
  }

  public async getAllDocuments(): Promise<{ data: EmployeeDocument[] }> {
    try {
      const employees = this.db.getAllEmployees();
      let allDocs: EmployeeDocument[] = [];
      for (const e of employees) {
        allDocs = allDocs.concat(this.db.getDocumentsByEmployeeId(e.id));
      }
      return { data: allDocs };
    } catch (e) {
      throw new Error('Failed to fetch all documents');
    }
  }

  public async getExpiringDocuments(daysThreshold: number = 30): Promise<{ data: EmployeeDocument[] }> {
    try {
      const employees = this.db.getAllEmployees();
      let expiringDocs: EmployeeDocument[] = [];
      const today = new Date('2025-04-28');
      for (const e of employees) {
        const docs = this.db.getDocumentsByEmployeeId(e.id);
        expiringDocs = expiringDocs.concat(
          docs.filter(doc => {
            if (!doc.expiryDate) return false;
            const expiry = new Date(doc.expiryDate);
            const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
            return diff >= 0 && diff <= daysThreshold;
          })
        );
      }
      return { data: expiringDocs };
    } catch (e) {
      throw new Error('Failed to fetch expiring documents');
    }
  }

  // Helper method to simulate network delay
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// --- MOCK BACKEND SERVICE OBJECT ---
export const mockBackendService = {
  backend: {
    getStatus: async () => ({
      status: 'mock',
      backends: [],
      message: 'Mock backend status',
    }),
    checkDatabaseConnection: async () => ({
      connected: true,
      message: 'Mock database always connected',
    }),
    switchBackend: async () => ({
      success: true,
      message: 'Switched mock backend',
    }),
    setStrategy: async () => ({
      success: true,
      message: 'Mock strategy set',
    }),
    toggleBackend: async () => ({
      success: true,
      message: 'Mock backend toggled',
    }),
  },
  health: {
    check: async () => ({
      status: 'ok',
      message: 'Mock health check OK',
    }),
    getStatus: async () => ({
      status: 'ok',
      uptime: 999999,
      message: 'Mock health status',
    }),
  },
  employees: {
    getAll: async () => {
      try {
        const employees = MockDatabase.getInstance().getAllEmployees();
        return { data: employees };
      } catch (e) {
        throw new Error('Failed to fetch employees');
      }
    },
    getById: async (id: string) => {
      try {
        const employee = MockDatabase.getInstance().getEmployeeById(id);
        if (!employee) throw new Error('Employee not found');
        return { data: employee };
      } catch (e) {
        throw new Error('Failed to fetch employee by ID');
      }
    },
    create: async (employee: any) => {
      try {
        const db = MockDatabase.getInstance();
        const id = Math.random().toString(36).substring(2, 11);
        const newEmployee = { ...employee, id };
        db.addEmployee(newEmployee);
        return { data: newEmployee };
      } catch (e) {
        throw new Error('Failed to create employee');
      }
    },
    update: async (id: string, data: any) => {
      try {
        const db = MockDatabase.getInstance();
        const updated = db.updateEmployee(id, data);
        if (!updated) throw new Error('Employee not found');
        return { data: updated };
      } catch (e) {
        throw new Error('Failed to update employee');
      }
    },
    delete: async (_id: string) => {
      // For mock, just return success
      return { success: true };
    },
    search: async (query: string) => {
      const employees = MockDatabase.getInstance().getAllEmployees();
      if (!query.trim()) return employees;
      // Use Fuse.js for fuzzy search on key fields
      const { fuzzySearch } = await import('../utils/fuzzySearch');
      return fuzzySearch(employees, query, {
        keys: ['name', 'email', 'department', 'position', 'mobileNumber', 'passportNumber'],
        threshold: 0.4,
        ignoreLocation: true,
      });
    },
    getByCompany: async (companyId: string, page: number = 1, limit: number = 20) => {
      const employees = MockDatabase.getInstance().getAllEmployees();
      const filtered = employees.filter(e => e.companyId === companyId);
      const paginated = filtered.slice((page - 1) * limit, page * limit);
      return {
        data: paginated,
        total: filtered.length,
        page,
        limit,
        totalPages: Math.ceil(filtered.length / limit),
        hasNextPage: page * limit < filtered.length,
        hasPrevPage: page > 1
      };
    },
    getVisaExpiryReminders: async (limit: number = 10) => {
      try {
        const employees = MockDatabase.getInstance().getAllEmployees();
        // Simulate visa expiry reminders by filtering employees whose visa expires within limit days
        const today = new Date();
        const reminders = employees.filter(e => {
          if (!e.visaExpiryDate) return false;
          const expiry = new Date(e.visaExpiryDate);
          const diff = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= limit;
        });
        return { success: true, count: reminders.length, data: reminders };
      } catch (e) {
        throw new Error('Failed to fetch visa expiry reminders');
      }
    },
  },
  companies: {
    getAll: async () => {
      try {
        // Simulate companies from employees' companyId/companyName
        const employees = MockDatabase.getInstance().getAllEmployees();
        const companiesMap = new Map();
        employees.forEach(e => {
          if (e.companyId && e.companyName) {
            companiesMap.set(e.companyId, {
              id: e.companyId,
              name: e.companyName,
              employeeCount: employees.filter(emp => emp.companyId === e.companyId).length
            });
          }
        });
        const companies = Array.from(companiesMap.values());
        return { success: true, count: companies.length, data: companies };
      } catch (e) {
        throw new Error('Failed to fetch companies');
      }
    },
    getById: async (id: string) => {
      try {
        const employees = MockDatabase.getInstance().getAllEmployees();
        const company = employees.find(e => e.companyId === id);
        if (!company) throw new Error('Company not found');
        return { success: true, data: { id: company.companyId, name: company.companyName } };
      } catch (e) {
        throw new Error('Failed to fetch company by ID');
      }
    },
    create: async (companyData: any) => {
      // For mock, just return what was sent with a random id
      return { success: true, data: { ...companyData, id: Math.random().toString(36).substring(2, 11) } };
    },
    update: async (id: string, companyData: any) => {
      // For mock, just return the updated data
      return { success: true, data: { ...companyData, id } };
    },
    delete: async (_id: string) => {
      // For mock, just return success
      return { success: true };
    },
    getWithEmployeeCount: async () => {
      try {
        const employees = MockDatabase.getInstance().getAllEmployees();
        const companiesMap = new Map();
        employees.forEach(e => {
          if (e.companyId && e.companyName) {
            companiesMap.set(e.companyId, {
              id: e.companyId,
              name: e.companyName,
              employeeCount: employees.filter(emp => emp.companyId === e.companyId).length
            });
          }
        });
        const companies = Array.from(companiesMap.values());
        return { success: true, data: companies };
      } catch (e) {
        throw new Error('Failed to fetch companies with employee count');
      }
    }
  },
  import: {
    importEmployees: async (_formData: FormData) => {
      // Simulate import: just return a success with a random imported count
      return Promise.resolve({ success: true, imported: 5 });
    },
    getTemplate: async () => {
      // Simulate: return a Blob with empty data
      const blob = new Blob(["Employee Name,Email,Department\n"], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return {
        blob: () => Promise.resolve(blob)
      };
    },
    exportEmployees: async () => {
      // Simulate export: return a Blob with mock employee data
      const blob = new Blob(["Employee Name,Email,Department\nJohn Doe,john@example.com,Engineering\n"], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return {
        blob: () => Promise.resolve(blob)
      };
    }
  },
  // Add other top-level keys as needed (import, etc.)
};
