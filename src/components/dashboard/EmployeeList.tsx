import React, { useState } from 'react';
import { useEmployees } from '../../hooks/useEmployees';

interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  visaExpiryDate?: string;
}

interface EmployeeListProps {
  onSelect: (employeeId: string) => void;
  searchQuery?: string;
}

export const EmployeeList: React.FC<EmployeeListProps> = ({ onSelect, searchQuery = '' }) => {
  const { data: employees = [], isLoading } = useEmployees();
  const [search, setSearch] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [expiry, setExpiry] = useState<string>('');

  // Use prop searchQuery if provided, otherwise local state
  const effectiveSearch = searchQuery.length > 0 ? searchQuery : search;

  const filtered = (employees as Employee[]).filter((emp: Employee) =>
    (emp.name.toLowerCase().includes(effectiveSearch.toLowerCase())) &&
    (!department || emp.department === department) &&
    (!expiry || (emp.visaExpiryDate && emp.visaExpiryDate.startsWith(expiry)))
  );

  const departments = Array.from(new Set((employees as Employee[]).map((e: Employee) => e.department)));

  return (
    <div className="p-4 bg-background min-h-screen animate-fade-in">
      <div className="headline-large mb-4 text-primary">Employee List</div>
      <div className="card bg-surface shadow-md rounded-lg p-4 mb-4">
        <div className="flex flex-wrap gap-4 mb-4">
          <input
            className="input bg-surface border border-border rounded px-3 py-2 text-tertiary placeholder:text-secondary"
            placeholder="Search by name"
            value={searchQuery.length > 0 ? searchQuery : search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            aria-label="Search employees by name"
          />
          <select
            className="input bg-surface border border-border rounded px-3 py-2 text-tertiary"
            value={department}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartment(e.target.value)}
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {departments.map((dep: string) => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
          <input
            className="input bg-surface border border-border rounded px-3 py-2 text-tertiary"
            type="month"
            value={expiry}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpiry(e.target.value)}
            aria-label="Filter by visa expiry month"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-surface">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Visa Expiry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {filtered.map((emp: Employee) => {
                // Determine status class
                let statusClass = 'badge-status-other';
                let statusLabel = 'Unknown';
                if (emp.visaExpiryDate) {
                  const days = Math.ceil((new Date(emp.visaExpiryDate).getTime() - Date.now()) / (1000*60*60*24));
                  if (days < 0) {
                    statusClass = 'badge-status-expired';
                    statusLabel = 'Expired';
                  } else if (days <= 30) {
                    statusClass = 'badge-status-expiring';
                    statusLabel = 'Expiring Soon';
                  } else {
                    statusClass = 'badge-status-active';
                    statusLabel = 'Active';
                  }
                }
                return (
                  <tr key={emp.id} className="cursor-pointer hover:bg-primary/5 transition" onClick={() => onSelect(emp.id)}>
                    <td className="text-primary underline font-medium">{emp.name}</td>
                    <td className="text-tertiary">{emp.position}</td>
                    <td className="text-tertiary">{emp.department}</td>
                    <td className="text-tertiary">{emp.visaExpiryDate}</td>
                    <td><span className={`caption ${statusClass}`}>{statusLabel}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {isLoading && (
        <div className="card bg-surface shadow-md rounded-lg p-4 mb-4 animate-fade-in">
          <div className="text-tertiary">Loading...</div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
