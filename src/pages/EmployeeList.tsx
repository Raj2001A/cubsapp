import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { useUI } from '../context/UIContext';
import { Employee } from '../types/employees';
import { Trash2, Eye, Search, Loader2, UserPlus, Download, ArrowUpDown } from 'lucide-react';
import { apiService } from '../services/apiService'; // Import apiService

interface EmployeeListProps {
  onViewEmployee?: (employeeId: string) => void;
  companyFilter?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ 
  onViewEmployee,
  companyFilter
}) => {
  const navigate = useNavigate();
  const { 
    employees, 
    isLoading, 
    deleteEmployee, 
    searchEmployees,
    filterEmployeesByCompany 
  } = useEmployees();
  const { showToast } = useUI();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortField, setSortField] = useState<keyof Employee>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isDeleting, setIsDeleting] = useState(false); // Add isDeleting state
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false); // Add local loading state for bulk delete

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmployeeIds(filteredEmployees.map(emp => emp.id));
    } else {
      setSelectedEmployeeIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedEmployeeIds(prev =>
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedEmployeeIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedEmployeeIds.length} selected employees?`)) return;
    setBulkDeleteLoading(true);
    try {
      await Promise.all(selectedEmployeeIds.map(id => apiService.delete(`/employees/${id}`)));
      setFilteredEmployees(prev => prev.filter(emp => !selectedEmployeeIds.includes(emp.id)));
      setSelectedEmployeeIds([]);
      showToast(`${selectedEmployeeIds.length} employees deleted successfully`, 'success');
    } catch {
      showToast('Failed to delete some employees', 'error');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        if (companyFilter) {
          const result = await filterEmployeesByCompany(companyFilter);
          setFilteredEmployees(result.employees);
        } else if (searchQuery) {
          setIsSearching(true);
          const result = await searchEmployees(searchQuery);
          setFilteredEmployees(result.employees);
          setIsSearching(false);
        } else {
          setFilteredEmployees(employees);
        }
      } catch (error) {
        console.error("Error loading employees:", error);
        setIsSearching(false);
      }
    };

    loadEmployees();
  }, [employees, searchQuery, companyFilter, searchEmployees, filterEmployeesByCompany]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const result = await searchEmployees(searchQuery);
      setFilteredEmployees(result.employees);
    } catch (error) {
      console.error("Error searching employees:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Delete employee functionality
  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete employee '${name}'?`)) return;
    setIsDeleting(true); // Set isDeleting to true
    try {
      const response = await apiService.delete(`/employees/${id}`);
      if (response.status === 200) {
        setFilteredEmployees((prev) => prev.filter(emp => emp.id !== id));
        showToast('Employee deleted successfully', 'success');
      } else {
        showToast(response.message || 'Failed to delete employee', 'error');
      }
    } catch (error) {
      showToast('Error deleting employee', 'error');
    } finally {
      setIsDeleting(false); // Set isDeleting to false
    }
  };

  const handleViewDetails = (id: string) => {
    if (onViewEmployee) {
      onViewEmployee(id);
    } else {
      navigate(`/employee/${id}`);
    }
  };

  const handleSort = (field: keyof Employee) => {
    const newDirection = field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);

    const sorted = [...filteredEmployees].sort((a, b) => {
      const aValue = a[field] as string;
      const bValue = b[field] as string;

      if (!aValue) return 1;
      if (!bValue) return -1;

      if (newDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    setFilteredEmployees(sorted);
  };

  const exportEmployees = () => {
    try {
      const csvContent = 
        "data:text/csv;charset=utf-8," + 
        "ID,Name,Position,Company,Email,Phone\n" +
        filteredEmployees.map(emp => 
          `${emp.id},"${emp.name}","${emp.position || ''}","${emp.company || ''}","${emp.email || ''}","${emp.phone || ''}"`
        ).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "employees.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Employee list exported successfully', 'success');
    } catch (error) {
      console.error("Error exporting employees:", error);
      showToast('Failed to export employee list', 'error');
    }
  };

  return (
    <div className="p-6 min-h-screen"
         style={{ 
           backgroundImage: 'url(/bg1.jpg)', 
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/employee-add')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New
            </button>
            <button
              onClick={exportEmployees}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search employees by name, ID, or company..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isSearching}
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          </form>
        </div>

        {selectedEmployeeIds.length > 0 && (
          <div className="mb-4 flex justify-end" role="region" aria-live="polite">
            <button
              onClick={handleBulkDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              aria-label="Delete selected employees"
              disabled={bulkDeleteLoading}
            >
              {bulkDeleteLoading ? 'Deleting...' : `Delete Selected (${selectedEmployeeIds.length})`}
            </button>
          </div>
        )}
        {isLoading || isDeleting ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No employees found matching your criteria.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden text-sm align-middle">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0}
                      onChange={handleSelectAll}
                      aria-label="Select all employees"
                      tabIndex={0}
                    />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Emp. ID</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Company</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Position</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Nationality</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Date of Birth</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Join Date</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Visa Status</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Visa Expiry</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 text-left font-semibold tracking-wider whitespace-nowrap">Phone</th>
                  <th className="px-4 py-3 text-right font-semibold tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployeeIds.includes(employee.id)}
                        onChange={() => handleSelectOne(employee.id)}
                        aria-label={`Select employee ${employee.name}`}
                        tabIndex={0}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.employeeId || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{employee.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.company}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.position}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.nationality}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.dateOfBirth}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.joinDate}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.visaStatus}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.visaExpiryDate || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.email || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{employee.phone || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button onClick={e => { e.stopPropagation(); handleViewDetails(employee.id); }} className="text-blue-600 hover:text-blue-900 mr-4" title="View"><Eye className="w-5 h-5" /></button>
                      <button onClick={e => { e.stopPropagation(); navigate(`/employee-edit/${employee.id}`); }} className="text-yellow-600 hover:text-yellow-900 mr-4 focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500" title="Edit" aria-label={`Edit ${employee.name}`} tabIndex={0}><svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13l6.293-6.293a1 1 0 011.414 0l2.586 2.586a1 1 0 010 1.414L13 17H9v-4z" /></svg></button>
                      <button onClick={e => { e.stopPropagation(); navigate(`/employee-delete/${employee.id}`); }} className="text-red-600 hover:text-red-900" title="Delete"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
