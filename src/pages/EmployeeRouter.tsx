import React from 'react';
import { useParams } from 'react-router-dom';
import { EmployeeDetails } from './EmployeeDetails';
import { EmployeeDocuments } from './EmployeeDocuments';
import { EmployeeNotifications } from './EmployeeNotifications';

export const EmployeeRouter: React.FC = () => {
  const { id } = useParams();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Details</h1>
        <div className="flex space-x-4">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Edit Profile
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Add Document
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <EmployeeDetails employeeId={id} />
        <EmployeeDocuments employeeId={id} />
        <EmployeeNotifications employeeId={id} />
      </div>
    </div>
  );
};
