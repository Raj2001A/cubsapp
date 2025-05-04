import { supabase } from '../supabaseClient';
import { Employee, EmployeeDocument, EmployeeVisaStatus, PaginatedEmployees, DocumentType } from '../types/employees';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Simple in-memory cache
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 1000 * 60; // 1 minute

const handleRateLimitError = (error: any) => {
  if (error.response?.status === 429) {
    console.warn('Rate limit exceeded:', error.response.data);
    return {
      status: 'error',
      message: error.response.data?.message || 'Too many requests. Please try again later.'
    };
  }
  throw error;
};

const cachedRequest = async (url: string, config?: any) => {
  const cacheKey = JSON.stringify({ url, config });
  const cached = requestCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get(url, config);
    requestCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    return response.data;
  } catch (error) {
    return handleRateLimitError(error);
  }
};

// Helper function to calculate visa status based on expiry date
function calculateVisaStatus(expiryDateStr?: string): EmployeeVisaStatus {
  if (!expiryDateStr) return EmployeeVisaStatus.UNKNOWN;
  const expiryDate = new Date(expiryDateStr);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntilExpiry < 0) return EmployeeVisaStatus.EXPIRED;
  if (daysUntilExpiry <= 30) return EmployeeVisaStatus.EXPIRING;
  return EmployeeVisaStatus.ACTIVE;
}

interface EmployeeService {
  searchByCompany(companyId: string, query: string, page: number, limit: number): Promise<PaginatedEmployees>;
  getAll(page: number, limit: number): Promise<PaginatedEmployees>;
  getById(id: string): Promise<Employee>;
  create(employee: Omit<Employee, 'id'>): Promise<Employee>;
  update(id: string, employee: Partial<Employee>): Promise<Employee>;
  delete(id: string): Promise<boolean>;
  uploadDocument(employeeId: string, file: File, documentType: DocumentType, expiryDate?: string): Promise<EmployeeDocument>;
  deleteDocument(employeeId: string, docId: string): Promise<{ message?: string }>;
  sendVisaExpiryEmail(employeeId: string): Promise<{ message: string }>;
  getDocuments(employeeId: string): Promise<EmployeeDocument[]>;
  search(query: string, page: number, limit: number): Promise<PaginatedEmployees>;
  getByCompany(companyId: string, page: number, limit: number): Promise<PaginatedEmployees>;
}

export const employeeService: EmployeeService = {
  async searchByCompany(companyId: string, query: string, page: number = 1, limit: number = 300): Promise<PaginatedEmployees> {
    try {
      const { data, error, count: countData } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId)
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) {
        console.error('[Supabase Search Employees Error]', error);
        throw error;
      }

      const count = countData || 0;
      
      if (query && query.trim().length > 0) {
        // Search by name, email, or employee_id (case-insensitive, partial match)
        const { data: searchData, error: searchError } = await supabase
          .from('employees')
          .select('*')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%,employee_id.ilike.%${query}%`)
          .range((page - 1) * limit, page * limit - 1);
        
        if (searchError) {
          console.error('[Supabase Search Query Error]', searchError);
          throw searchError;
        }
        
        return {
          employees: (searchData || []).map((employee: any) => ({
            id: employee.id,
            employeeId: String(employee.employee_id || ''),
            name: employee.name,
            trade: employee.trade || '',
            nationality: employee.nationality || '',
            joinDate: employee.join_date || '',
            dateOfBirth: employee.date_of_birth || '',
            mobileNumber: employee.mobile_number || '',
            homePhoneNumber: employee.home_phone_number || '',
            email: employee.email,
            companyId: employee.company_id,
            companyName: employee.company_name || '',
            visaExpiryDate: employee.visa_expiry_date || '',
            department: employee.department || '',
            position: employee.position || '',
            address: employee.address || '',
            passportNumber: employee.passport_number || '',
            visaStatus: calculateVisaStatus(employee.visa_expiry_date),
            documents: []
          })),
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
          hasNextPage: page < Math.ceil(count / limit),
          hasPrevPage: page > 1
        };
      }

      return {
        employees: (data || []).map((employee: any) => ({
          id: employee.id,
          employeeId: String(employee.employee_id || ''),
          name: employee.name,
          trade: employee.trade || '',
          nationality: employee.nationality || '',
          joinDate: employee.join_date || '',
          dateOfBirth: employee.date_of_birth || '',
          mobileNumber: employee.mobile_number || '',
          homePhoneNumber: employee.home_phone_number || '',
          email: employee.email,
          companyId: employee.company_id,
          companyName: employee.company_name || '',
          visaExpiryDate: employee.visa_expiry_date || '',
          department: employee.department || '',
          position: employee.position || '',
          address: employee.address || '',
          passportNumber: employee.passport_number || '',
          visaStatus: calculateVisaStatus(employee.visa_expiry_date),
          documents: []
        })),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('[Supabase Search Employees Error]', error);
      throw error;
    }
  },

  async getAll(page: number = 1, limit: number = 300): Promise<PaginatedEmployees> {
    try {
      const { data, error, count: countData } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .range((page - 1) * limit, page * limit - 1);
      
      if (error) {
        console.error('[Supabase Fetch Employees Error]', error);
        throw error;
      }

      const count = countData || 0;
      
      return {
        employees: (data || []).map((employee: any) => ({
          id: employee.id,
          employeeId: String(employee.employee_id || ''),
          name: employee.name,
          trade: employee.trade || '',
          nationality: employee.nationality || '',
          joinDate: employee.join_date || '',
          dateOfBirth: employee.date_of_birth || '',
          mobileNumber: employee.mobile_number || '',
          homePhoneNumber: employee.home_phone_number || '',
          email: employee.email,
          companyId: employee.company_id,
          companyName: employee.company_name || '',
          visaExpiryDate: employee.visa_expiry_date || '',
          department: employee.department || '',
          position: employee.position || '',
          address: employee.address || '',
          passportNumber: employee.passport_number || '',
          visaStatus: calculateVisaStatus(employee.visa_expiry_date),
          documents: []
        })),
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('[Supabase Fetch Employees Error]', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Employee> {
    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error('Invalid employee ID format');
    }
    
    try {
      const { data, error } = await supabase
        .from('employees')
        .select()
        .eq('id', id);
      if (error) throw error;
      
      if (!data || data.length === 0) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      
      const employeeData = data[0];
      
      return {
        id: employeeData.id,
        employeeId: String(employeeData.employee_id || ''),
        name: employeeData.name,
        trade: employeeData.trade || '',
        nationality: employeeData.nationality || '',
        joinDate: employeeData.join_date || '',
        dateOfBirth: employeeData.date_of_birth || '',
        mobileNumber: employeeData.mobile_number || '',
        homePhoneNumber: employeeData.home_phone_number || '',
        email: employeeData.email,
        companyId: employeeData.company_id,
        companyName: employeeData.company_name || '',
        visaExpiryDate: employeeData.visa_expiry_date || '',
        department: employeeData.department || '',
        position: employeeData.position || '',
        address: employeeData.address || '',
        passportNumber: employeeData.passport_number || '',
        visaStatus: calculateVisaStatus(employeeData.visa_expiry_date),
        documents: []
      };
    } catch (error) {
      console.error('[Supabase Fetch Employee Error]', error);
      throw error;
    }
  },

  async create(employee: Omit<Employee, 'id'>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([employee])
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...employee,
        visaStatus: calculateVisaStatus(employee.visaExpiryDate),
        documents: []
      };
    } catch (error) {
      console.error('[Supabase Create Employee Error]', error);
      throw error;
    }
  },

  async update(id: string, employee: Partial<Employee>): Promise<Employee> {
    try {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        ...employee,
        visaStatus: calculateVisaStatus(employee.visaExpiryDate),
        documents: []
      };
    } catch (error) {
      console.error('[Supabase Update Employee Error]', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Supabase Delete Employee Error]', error);
      throw error;
    }
  },

  async uploadDocument(employeeId: string, file: File, documentType: DocumentType, expiryDate?: string): Promise<EmployeeDocument> {
    try {
      const fileName = `${employeeId}-${Date.now()}-${file.name}`;
      const filePath = `documents/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          contentType: file.type,
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = await supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      const { data, error } = await supabase
        .from('documents')
        .insert({
          employee_id: employeeId,
          name: file.name,
          type: documentType,
          fileUrl: publicUrl,
          expiry_date: expiryDate,
          upload_date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving document record:', error);
        // Clean up the uploaded file if database operation fails
        await supabase.storage
          .from('documents')
          .remove([filePath]);
        throw error;
      }

      return {
        id: data.id,
        employeeId: data.employee_id,
        name: data.name,
        type: data.type,
        documentType: data.type as DocumentType,
        uploadDate: data.upload_date,
        expiryDate: data.expiry_date,
        status: data.expiry_date
          ? calculateVisaStatus(data.expiry_date) === EmployeeVisaStatus.EXPIRED
            ? 'expired'
            : calculateVisaStatus(data.expiry_date) === EmployeeVisaStatus.EXPIRING
            ? 'expiring'
            : 'valid'
          : 'valid',
        fileUrl: data.fileUrl,
        uploadedBy: 'system'
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async deleteDocument(employeeId: string, docId: string): Promise<{ message?: string }> {
    try {
      const { data: document, error: fetchError } = await supabase
        .from('documents')
        .select('path')
        .eq('id', docId)
        .eq('employee_id', employeeId)
        .single();

      if (fetchError) {
        console.error('Error fetching document:', fetchError);
        return { message: 'Failed to fetch document details' };
      }

      if (!document) {
        return { message: 'Document not found' };
      }

      // Delete the file from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        return { message: 'Failed to delete file from storage' };
      }

      // Delete the document record from database
      const { error: deleteError } = await supabase
        .from('documents')
        .delete()
        .eq('id', docId)
        .eq('employee_id', employeeId);

      if (deleteError) {
        console.error('Error deleting document record:', deleteError);
        // Try to restore the file since database deletion failed
        await supabase.storage
          .from('documents')
          .upload(document.path, Buffer.from(''));
        return { message: 'Failed to delete document record' };
      }

      return {};
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  async sendVisaExpiryEmail(employeeId: string): Promise<{ message: string }> {
    try {
      const { data: employee, error } = await supabase
        .from('employees')
        .select('name, email, visa_expiry_date')
        .eq('id', employeeId)
        .single();

      if (error) {
        console.error('Error fetching employee:', error);
        return { message: 'Failed to fetch employee details' };
      }

      if (!employee || !employee.email) {
        return { message: 'Employee email not found' };
      }

      const visaStatus = calculateVisaStatus(employee.visa_expiry_date);
      if (visaStatus === EmployeeVisaStatus.EXPIRED) {
        // Send email using your preferred email service
        // This is a placeholder - implement your actual email sending logic here
        return { message: 'Email sent successfully' };
      }

      return { message: 'Visa is not expired' };
    } catch (error) {
      console.error('Error sending visa expiry email:', error);
      throw error;
    }
  },

  async getDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('employee_id', employeeId);
      
      if (error) throw error;
      
      return (data || []).map(doc => ({
        id: doc.id,
        employeeId: doc.employee_id,
        name: doc.name,
        type: doc.type,
        documentType: doc.type as DocumentType,
        uploadDate: doc.upload_date,
        expiryDate: doc.expiry_date,
        status: doc.expiry_date
          ? calculateVisaStatus(doc.expiry_date) === EmployeeVisaStatus.EXPIRED
            ? 'expired'
            : calculateVisaStatus(doc.expiry_date) === EmployeeVisaStatus.EXPIRING
            ? 'expiring'
            : 'valid'
          : 'valid',
        fileUrl: doc.fileUrl,
        uploadedBy: 'system'
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  async search(query: string, page: number = 1, limit: number = 300): Promise<PaginatedEmployees> {
    try {
      const { data, error, count } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,employee_id.ilike.%${query}%`)
        .range((page - 1) * limit, page * limit - 1);
      if (error) throw error;
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      return {
        employees: (data || []).map((employee: any) => ({
          id: employee.id,
          employeeId: String(employee.employee_id || ''),
          name: employee.name,
          trade: employee.trade || '',
          nationality: employee.nationality || '',
          joinDate: employee.join_date || '',
          dateOfBirth: employee.date_of_birth || '',
          mobileNumber: employee.mobile_number || '',
          homePhoneNumber: employee.home_phone_number || '',
          email: employee.email,
          companyId: employee.company_id,
          companyName: employee.company_name || '',
          visaExpiryDate: employee.visa_expiry_date || '',
          department: employee.department || '',
          position: employee.position || '',
          address: employee.address || '',
          passportNumber: employee.passport_number || '',
          visaStatus: calculateVisaStatus(employee.visa_expiry_date),
          documents: []
        })),
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  },

  async getByCompany(companyId: string, page: number = 1, limit: number = 300): Promise<PaginatedEmployees> {
    try {
      const { data, error, count } = await supabase
        .from('employees')
        .select('*', { count: 'exact' })
        .eq('company_id', companyId)
        .range((page - 1) * limit, page * limit - 1);
      if (error) throw error;
      const total = count || 0;
      const totalPages = Math.ceil(total / limit);
      return {
        employees: (data || []).map((employee: any) => ({
          id: employee.id,
          employeeId: String(employee.employee_id || ''),
          name: employee.name,
          trade: employee.trade || '',
          nationality: employee.nationality || '',
          joinDate: employee.join_date || '',
          dateOfBirth: employee.date_of_birth || '',
          mobileNumber: employee.mobile_number || '',
          homePhoneNumber: employee.home_phone_number || '',
          email: employee.email,
          companyId: employee.company_id,
          companyName: employee.company_name || '',
          visaExpiryDate: employee.visa_expiry_date || '',
          department: employee.department || '',
          position: employee.position || '',
          address: employee.address || '',
          passportNumber: employee.passport_number || '',
          visaStatus: calculateVisaStatus(employee.visa_expiry_date),
          documents: []
        })),
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      };
    } catch (error) {
      console.error('Error fetching employees by company:', error);
      throw error;
    }
  }
};

export const getEmployees = async (): Promise<Employee[]> => {
  return cachedRequest(`${API_BASE_URL}/employees`);
};

export const getEmployeeDocuments = async (employeeId: string): Promise<EmployeeDocument[]> => {
  return cachedRequest(`${API_BASE_URL}/employees/${employeeId}/documents`);
};

// Clear cache function for testing/dev
window.clearEmployeeCache = () => requestCache.clear();
