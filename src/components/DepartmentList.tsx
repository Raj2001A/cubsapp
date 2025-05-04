import React from 'react';
    import { departments } from '../data';
    import { Building2, Users, Plus } from 'lucide-react';

    const DepartmentList: React.FC = () => {
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">All Departments</h3>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
              <Plus className="h-5 w-5 mr-2" />
              Add Department
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((department) => (
              <div key={department.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 p-3 rounded-md bg-primary-100">
                      <Building2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {department.name}
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {department.employeeCount} employees
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">Manager: {department.manager}</p>
                    <p className="text-gray-500 mt-1">{department.description}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 bg-white px-5 py-3">
                  <div className="flex justify-between items-center">
                    <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">
                      View Details
                    </button>
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {department.employeeCount}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    export default DepartmentList;
