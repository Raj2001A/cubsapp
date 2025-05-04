import React, { useEffect, useState, useCallback } from 'react';
import type { Employee } from '../types/employees';
import { employeeService } from '@/services/employeeService';
import Button from '@/components/ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface EmployeeListProps {
  companyId?: string;
  searchQuery?: string;
  onViewEmployee?: (employeeId: string) => void;
  pageSize?: number;
}



const EmployeeList: React.FC<EmployeeListProps> = ({ companyId, searchQuery, onViewEmployee, pageSize = 10 }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      
      try {
        if (!companyId) {
          setError('Company ID is required to fetch employees');
          return;
        }
        const result = searchQuery?.trim()
          ? await employeeService.searchByCompany(companyId, searchQuery, page, pageSize)
          : await employeeService.getByCompany(companyId, page, pageSize);
        if (result) {
          setEmployees(result.employees);
          setTotalPages(result.totalPages);
        } else {
          setError('Failed to fetch employees. Please try again.');
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to fetch employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchEmployees();
    }
  }, [companyId, page, pageSize, setEmployees, setError, searchQuery]);

  const handleDelete = useCallback(async (employeeId: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    
    try {
      const success = await employeeService.delete(employeeId);
      if (success) {
        setEmployees(prev => prev.filter(e => e.id !== employeeId));
        setError(null);
      }
    } catch (err) {
      console.error('[EmployeeList] Delete failed:', {
        error: err,
        employeeId,
        timestamp: new Date().toISOString()
      });
      setError(err instanceof Error 
        ? err.message 
        : 'Failed to delete employee');
    }
  }, []);

  if (!companyId) {
    return <div className="text-gray-500">Please select a company to view employees</div>;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (employees.length === 0) {
    return <div className="text-gray-500">No employees found</div>;
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>{employee.name}</TableCell>
              <TableCell>{employee.email}</TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onViewEmployee?.(employee.id)}
                  >
                    View
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-center">
        <Button
          variant="default"
          size="sm"
          onClick={() => setPage(prev => prev - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => setPage(prev => prev + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default EmployeeList;
