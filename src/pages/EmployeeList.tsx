import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '../context/EmployeeContext';
import { useUI } from '../context/UIContext';
import { Employee } from '../types/employees';
import { Trash2, Eye, Search, Loader2, UserPlus, Download, ArrowUpDown } from 'lucide-react';

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

  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteEmployee(id);
        showToast(`Employee ${name} deleted successfully`, 'success');
      } catch (error) {
        console.error("Error deleting employee:", error);
        showToast(`Failed to delete ${name}`, 'error');
      }
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
        "ID,Name,Position,Department,Email,Phone\n" +
        filteredEmployees.map(emp => 
          `${emp.id},"${emp.name}","${emp.position || ''}","${emp.department || ''}","${emp.email || ''}","${emp.phone || ''}"`
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
              onClick={() => navigate('/employee/new')}
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
                placeholder="Search employees by name, ID, or department..."
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading employees...</span>
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
            <table className="min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 text-left focus:outline-none" 
                      onClick={() => handleSort('name')}
                    >
                      <span>Name</span>
                      <ArrowUpDown className={`w-4 h-4 ${sortField === 'name' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 text-left focus:outline-none" 
                      onClick={() => handleSort('position')}
                    >
                      <span>Position</span>
                      <ArrowUpDown className={`w-4 h-4 ${sortField === 'position' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button 
                      className="flex items-center space-x-1 text-left focus:outline-none" 
                      onClick={() => handleSort('department')}
                    >
                      <span>Department</span>
                      <ArrowUpDown className={`w-4 h-4 ${sortField === 'department' ? 'text-blue-600' : 'text-gray-400'}`} />
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span>Contact</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(employee.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          {employee.name?.charAt(0) || '?'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                          <div className="text-sm text-gray-500">ID: {employee.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position || 'Not specified'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {employee.department || 'Not assigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>{employee.email || 'No email'}</div>
                      <div>{employee.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(employee.id);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={(e) => handleDelete(employee.id, employee.name || 'this employee', e)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
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
