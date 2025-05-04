import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Employee, EmployeeVisaStatus } from '../types/employees';
import { Document } from '../types/documents';
import { useUI } from './UIContext';
import { OperationType, ErrorSeverity } from '../types/ui';
import { employeeService } from '../services/employeeService';

// Define pagination state
interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Define the context state type
interface EmployeeContextState {
  employees: Employee[];
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;

  // CRUD operations
  addEmployee: (employee: Omit<Employee, 'id'>) => Promise<Employee>;
  updateEmployee: (id: string, employee: Partial<Employee>) => Promise<Employee>;
  deleteEmployee: (id: string) => Promise<boolean>;
  getEmployeeById: (id: string) => Employee | undefined;

  // Document operations
  addDocument: (employeeId: string, document: Omit<Document, 'id'>) => Promise<Document>;
  updateDocument: (employeeId: string, documentId: string, document: Partial<Document>) => Promise<Document>;
  deleteDocument: (employeeId: string, documentId: string) => Promise<boolean>;

  // Filtering and searching with pagination
  searchEmployees: (query: string, page?: number, limit?: number) => Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>;
  filterEmployeesByCompany: (companyId: string, page?: number, limit?: number) => Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }>;
  filterEmployeesByVisaStatus: (status: EmployeeVisaStatus) => Employee[];

  // Pagination
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  loadPage: (page: number, limit?: number) => Promise<void>;

  // Import/Export
  importEmployees: (employees: Employee[]) => Promise<boolean>;
  exportEmployees: () => Employee[];
}

const EmployeeContext = createContext<EmployeeContextState | undefined>(undefined);

interface EmployeeContextProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

export const EmployeeProvider: React.FC<EmployeeContextProviderProps> = ({
  children,
  isAuthenticated = false
}) => {
  void isAuthenticated;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 300,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false
  });
  const { showToast, addError, setLoading: uiSetLoading } = useUI();

  const stableSetLoading = useCallback((type: OperationType, isLoading: boolean) => {
    uiSetLoading(type, isLoading);
  }, [uiSetLoading]);

  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  if (process.env.NODE_ENV === 'development' && renderCountRef.current % 5 === 0) {
    console.log('[EmployeeProvider] Rendered', {
      employeesCount: employees.length,
      pagination,
      renderCount: renderCountRef.current
    });
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;
    let isDataFetched = false;
    const fetchInitialEmployees = async () => {
      if (!isMounted || isDataFetched) return;
      stableSetLoading(OperationType.FETCH_EMPLOYEES, true);
      try {
        const response = await employeeService.getAll(1, 300);
        if (isMounted) {
          setEmployees(response.employees || []);
          setPagination({
            page: response.page || 1,
            limit: response.limit || 10,
            total: response.total || 0,
            totalPages: response.totalPages || 1,
            hasNextPage: response.hasNextPage || false,
            hasPrevPage: response.hasPrevPage || false
          });
          isDataFetched = true;
          if (window.documentContextActions && typeof window.documentContextActions.setDocumentsFromEmployees === 'function') {
            const allDocs = response.employees.flatMap(emp => emp.documents || []);
            window.documentContextActions.setDocumentsFromEmployees(allDocs);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching employees:', error);
          addError('Failed to fetch employees', ErrorSeverity.ERROR, OperationType.FETCH_EMPLOYEES);
        }
      } finally {
        if (isMounted) {
          stableSetLoading(OperationType.FETCH_EMPLOYEES, false);
        }
      }
    };
    fetchInitialEmployees();
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, addError, stableSetLoading]);

  const isLoading = false;

  const addEmployee = async (employee: Omit<Employee, 'id'>): Promise<Employee> => {
    try {
      stableSetLoading(OperationType.ADD_EMPLOYEE, true);
      const newEmployee = await employeeService.create(employee);
      setEmployees((prevEmployees: any) => [...prevEmployees, newEmployee]);
      showToast(`Employee ${newEmployee.name} added successfully`, 'success');
      return newEmployee;
    } catch (err) {
      addError(
        'Failed to add employee',
        ErrorSeverity.ERROR,
        OperationType.ADD_EMPLOYEE,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error adding employee:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.ADD_EMPLOYEE, false);
    }
  };

  const updateEmployee = async (id: string, employeeData: Partial<Employee>): Promise<Employee> => {
    try {
      stableSetLoading(OperationType.UPDATE_EMPLOYEE, true);
      const updatedEmployee = await employeeService.update(id, employeeData);
      setEmployees((prevEmployees: any) => {
        const index = prevEmployees.findIndex((emp: Employee) => emp.id === id);
        if (index === -1) return [...prevEmployees, updatedEmployee];

        const newEmployees = [...prevEmployees];
        newEmployees[index] = updatedEmployee;
        return newEmployees;
      });
      showToast(`Employee ${updatedEmployee.name} updated successfully`, 'success');
      return updatedEmployee;
    } catch (err) {
      addError(
        `Failed to update employee: ${err instanceof Error ? err.message : 'Unknown error'}`,
        ErrorSeverity.ERROR,
        OperationType.UPDATE_EMPLOYEE,
        err instanceof Error ? err.stack : String(err)
      );
      console.error('Error updating employee:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.UPDATE_EMPLOYEE, false);
    }
  };

  const deleteEmployee = async (id: string): Promise<boolean> => {
    try {
      stableSetLoading(OperationType.DELETE_EMPLOYEE, true);
      const employee = employees.find((emp: Employee) => emp.id === id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      await employeeService.delete(id);
      setEmployees((prevEmployees: any) => prevEmployees.filter((emp: Employee) => emp.id !== id));
      showToast(`Employee ${employee.name} deleted successfully`, 'success');
      return true;
    } catch (err) {
      addError(
        'Failed to delete employee',
        ErrorSeverity.ERROR,
        OperationType.DELETE_EMPLOYEE,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error deleting employee:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.DELETE_EMPLOYEE, false);
    }
  };

  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find((emp: Employee) => emp.id === id);
  };

  const addDocument = async (employeeId: string, document: Omit<Document, 'id'>): Promise<Document> => {
    try {
      stableSetLoading(OperationType.ADD_DOCUMENT, true);
      const newId = `doc-${Date.now()}`;
      const newDocument: Document = {
        ...document,
        id: newId
      };
      const employeeIndex = employees.findIndex((emp: Employee) => emp.id === employeeId);
      if (employeeIndex === -1) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }
      const updatedEmployee = {
        ...employees[employeeIndex],
        documents: [...employees[employeeIndex].documents, newDocument]
      };
      const updatedEmployees = [...employees];
      updatedEmployees[employeeIndex] = updatedEmployee;
      setEmployees(updatedEmployees);
      showToast(`Document added successfully`, 'success');
      return newDocument;
    } catch (err) {
      addError(
        'Failed to add document',
        ErrorSeverity.ERROR,
        OperationType.ADD_DOCUMENT,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error adding document:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.ADD_DOCUMENT, false);
    }
  };

  const updateDocument = async (employeeId: string, documentId: string, documentData: Partial<Document>): Promise<Document> => {
    try {
      stableSetLoading(OperationType.UPDATE_DOCUMENT, true);
      const employeeIndex = employees.findIndex((emp: Employee) => emp.id === employeeId);
      if (employeeIndex === -1) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }
      const documentIndex = employees[employeeIndex].documents.findIndex((doc: Document) => doc.id === documentId);
      if (documentIndex === -1) {
        throw new Error(`Document with ID ${documentId} not found`);
      }
      const updatedDocument: Document = {
        ...employees[employeeIndex].documents[documentIndex],
        ...documentData
      };
      const updatedDocuments = [...employees[employeeIndex].documents];
      updatedDocuments[documentIndex] = updatedDocument;
      const updatedEmployee = {
        ...employees[employeeIndex],
        documents: updatedDocuments
      };
      const updatedEmployees = [...employees];
      updatedEmployees[employeeIndex] = updatedEmployee;
      setEmployees(updatedEmployees);
      showToast(`Document updated successfully`, 'success');
      return updatedDocument;
    } catch (err) {
      addError(
        'Failed to update document',
        ErrorSeverity.ERROR,
        OperationType.UPDATE_DOCUMENT,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error updating document:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.UPDATE_DOCUMENT, false);
    }
  };

  const deleteDocument = async (employeeId: string, documentId: string): Promise<boolean> => {
    try {
      stableSetLoading(OperationType.DELETE_DOCUMENT, true);
      const employeeIndex = employees.findIndex((emp: Employee) => emp.id === employeeId);
      if (employeeIndex === -1) {
        throw new Error(`Employee with ID ${employeeId} not found`);
      }
      const updatedDocuments = employees[employeeIndex].documents.filter((doc: Document) => doc.id !== documentId);
      const updatedEmployee = {
        ...employees[employeeIndex],
        documents: updatedDocuments
      };
      const updatedEmployees = [...employees];
      updatedEmployees[employeeIndex] = updatedEmployee;
      setEmployees(updatedEmployees);
      showToast(`Document deleted successfully`, 'success');
      return true;
    } catch (err) {
      addError(
        'Failed to delete document',
        ErrorSeverity.ERROR,
        OperationType.DELETE_DOCUMENT,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error deleting document:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.DELETE_DOCUMENT, false);
    }
  };

  const searchEmployees = async (query: string, page: number = 1, limit: number = pagination.limit): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> => {
    if (searchEmployeesTimeoutId) {
      clearTimeout(searchEmployeesTimeoutId);
    }
    return new Promise((resolve) => {
      searchEmployeesTimeoutId = setTimeout(async () => {
        if (!query) {
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const paginatedEmployees = employees.slice(startIndex, endIndex);
          const result = {
            employees: paginatedEmployees,
            total: employees.length,
            page,
            totalPages: Math.ceil(employees.length / limit),
            hasNextPage: endIndex < employees.length,
            hasPrevPage: page > 1
          };
          resolve(result);
          return;
        }
        try {
          const loadingTimerId = setTimeout(() => {
            stableSetLoading(OperationType.SEARCH_EMPLOYEES, true);
          }, 200);
          const searchResults = await employeeService.search(query, page, limit);
          clearTimeout(loadingTimerId);
          showToast(`Found ${searchResults.total} employees matching "${query}"`, 'success');
          resolve(searchResults);
        } catch (err) {
          addError(
            'Failed to search employees',
            ErrorSeverity.ERROR,
            OperationType.SEARCH_EMPLOYEES,
            err instanceof Error ? err.message : String(err)
          );
          console.error('Error searching employees:', err);
          const lowerCaseQuery = query.toLowerCase();
          const filteredEmployees = employees.filter((employee: Employee) =>
            employee.name.toLowerCase().includes(lowerCaseQuery) ||
            employee.email.toLowerCase().includes(lowerCaseQuery) ||
            employee.employeeId.toLowerCase().includes(lowerCaseQuery) ||
            (employee.trade && employee.trade.toLowerCase().includes(lowerCaseQuery)) ||
            employee.nationality.toLowerCase().includes(lowerCaseQuery) ||
            (employee.department && employee.department.toLowerCase().includes(lowerCaseQuery)) ||
            (employee.position && employee.position.toLowerCase().includes(lowerCaseQuery))
          );
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const paginatedResults = filteredEmployees.slice(startIndex, endIndex);
          const result = {
            employees: paginatedResults,
            total: filteredEmployees.length,
            page,
            totalPages: Math.ceil(filteredEmployees.length / limit),
            hasNextPage: endIndex < filteredEmployees.length,
            hasPrevPage: page > 1
          };
          resolve(result);
        } finally {
          stableSetLoading(OperationType.SEARCH_EMPLOYEES, false);
        }
      }, 300);
    });
  };

  const filterEmployeesByCompany = async (companyId: string, page: number = 1, limit: number = pagination.limit): Promise<{
    employees: Employee[];
    total: number;
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> => {
    if (filterEmployeesByCompanyTimeoutId) {
      clearTimeout(filterEmployeesByCompanyTimeoutId);
    }
    return new Promise((resolve) => {
      filterEmployeesByCompanyTimeoutId = setTimeout(async () => {
        if (!companyId) {
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const paginatedEmployees = employees.slice(startIndex, endIndex);
          resolve({
            employees: paginatedEmployees,
            total: employees.length,
            page,
            totalPages: Math.ceil(employees.length / limit),
            hasNextPage: endIndex < employees.length,
            hasPrevPage: page > 1
          });
          return;
        }
        try {
          stableSetLoading(OperationType.FILTER_EMPLOYEES, true);
          const result = await employeeService.getByCompany(companyId, page, limit);
          showToast(`Found ${result.total} employees in the selected company`, 'success');
          resolve(result);
        } catch (err) {
          addError(
            'Failed to filter employees by company',
            ErrorSeverity.ERROR,
            OperationType.FILTER_EMPLOYEES,
            err instanceof Error ? err.message : String(err)
          );
          console.error('Error filtering employees by company:', err);
          const filteredEmployees = employees.filter((employee: Employee) => employee.companyId === companyId);
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;
          const paginatedResults = filteredEmployees.slice(startIndex, endIndex);
          resolve({
            employees: paginatedResults,
            total: filteredEmployees.length,
            page,
            totalPages: Math.ceil(filteredEmployees.length / limit),
            hasNextPage: endIndex < filteredEmployees.length,
            hasPrevPage: page > 1
          });
        } finally {
          stableSetLoading(OperationType.FILTER_EMPLOYEES, false);
        }
      }, 300);
    });
  };

  const filterEmployeesByVisaStatus = (status: EmployeeVisaStatus): Employee[] => {
    return employees.filter((employee: Employee) => employee.visaStatus === status);
  };

  const setPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    setPagination(prev => ({ ...prev, page }));
  };

  const setLimit = (limit: number) => {
    if (limit < 1 || limit > 1000) return;
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  };

  const loadPage = async (page: number, limit: number = pagination.limit): Promise<void> => {
    try {
      stableSetLoading(OperationType.FETCH_EMPLOYEES, true);
      const result = await employeeService.getAll(page, limit);
      setEmployees(result.employees);
      setPagination({
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage
      });
      showToast(`Loaded ${result.employees.length} of ${result.total} employees`, 'success');
    } catch (err) {
      addError(
        'Failed to load employees',
        ErrorSeverity.ERROR,
        OperationType.FETCH_EMPLOYEES,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error loading employees:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.FETCH_EMPLOYEES, false);
    }
  };

  const importEmployees = async (newEmployees: Employee[]): Promise<boolean> => {
    try {
      stableSetLoading(OperationType.IMPORT_DATA, true);
      const createdEmployees: Employee[] = [];
      for (const employee of newEmployees) {
        try {
          const apiEmployee = {
            employee_id: employee.employeeId,
            name: employee.name,
            trade: employee.trade,
            nationality: employee.nationality,
            join_date: employee.joinDate,
            date_of_birth: employee.dateOfBirth,
            mobile_number: employee.mobileNumber,
            home_phone_number: employee.homePhoneNumber,
            email: employee.email,
            company_id: employee.companyId,
            visa_expiry_date: employee.visaExpiryDate,
            department: employee.department,
            position: employee.position,
            address: employee.address,
            passport_number: employee.passportNumber
          };
          const response = await employeeService.create(apiEmployee);
          const createdEmployee = {
            id: response.data.id,
            employeeId: response.data.employee_id,
            name: response.data.name,
            trade: response.data.trade,
            nationality: response.data.nationality,
            joinDate: response.data.join_date,
            dateOfBirth: response.data.date_of_birth,
            mobileNumber: response.data.mobile_number,
            homePhoneNumber: response.data.home_phone_number || '',
            email: response.data.email,
            companyId: response.data.company_id,
            companyName: response.data.company_name,
            visaExpiryDate: response.data.visa_expiry_date || '',
            department: response.data.department || '',
            position: response.data.position || '',
            address: response.data.address || '',
            passportNumber: response.data.passport_number || '',
            visaStatus: calculateVisaStatus(response.data.visa_expiry_date),
            documents: []
          };
          createdEmployees.push(createdEmployee);
        } catch (error) {
          console.error(`Error creating employee ${employee.name}:`, error);
        }
      }
      setEmployees((prevEmployees: any) => [...createdEmployees, ...prevEmployees]);
      showToast(`${createdEmployees.length} employees imported successfully`, 'success');
      return true;
    } catch (err) {
      addError(
        'Failed to import employees',
        ErrorSeverity.ERROR,
        OperationType.IMPORT_DATA,
        err instanceof Error ? err.message : String(err)
      );
      console.error('Error importing employees:', err);
      throw err;
    } finally {
      stableSetLoading(OperationType.IMPORT_DATA, false);
    }
  };

  const exportEmployees = (): Employee[] => {
    return employees;
  };

  const contextValue = useMemo(() => ({
    employees,
    pagination,
    isLoading,
    error: null,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    addDocument,
    updateDocument,
    deleteDocument,
    searchEmployees,
    filterEmployeesByCompany,
    filterEmployeesByVisaStatus,
    setPage,
    setLimit,
    loadPage,
    importEmployees,
    exportEmployees
  }), [
    employees,
    pagination,
    isLoading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    addDocument,
    updateDocument,
    deleteDocument,
    searchEmployees,
    filterEmployeesByCompany,
    filterEmployeesByVisaStatus,
    setPage,
    setLimit,
    loadPage,
    importEmployees,
    exportEmployees
  ]);

  return (
    <EmployeeContext.Provider value={contextValue}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployees = (): EmployeeContextState => {
  const context = useContext(EmployeeContext);
  if (!context) {
    throw new Error('useEmployees must be used within an EmployeeProvider');
  }
  return context;
};
