import React from 'react';
import { useParams } from 'react-router-dom';
import { useEmployee } from '../hooks/useEmployee';

export const EmployeeDetails: React.FC<{ employeeId: string }> = ({ employeeId }) => {
  const { data: employee, isLoading } = useEmployee(employeeId);

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading...</div>;
  }

  if (!employee) {
    return <div>Employee not found</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center mb-6">
        <div className="flex-shrink-0">
          <img
            src={employee.photoUrl || '/default-avatar.png'}
            alt={employee.name}
            className="h-32 w-32 rounded-full object-cover"
          />
        </div>
        <div className="ml-6">
          <h2 className="text-2xl font-bold">{employee.name}</h2>
          <p className="text-gray-600">{employee.position}</p>
          <p className="text-sm text-gray-500">{employee.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Employee ID</label>
              <p className="mt-1 text-gray-900">{employee.employeeId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="mt-1 text-gray-900">{employee.department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Joining Date</label>
              <p className="mt-1 text-gray-900">
                {new Date(employee.joiningDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="mt-1 text-gray-900">{employee.phone}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <p className="mt-1 text-gray-900">{employee.address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <p className="mt-1 text-gray-900">{employee.emergencyContact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
