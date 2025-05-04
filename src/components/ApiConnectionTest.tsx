import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ApiConnectionTest: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Test the employees endpoint
        const employeesResponse = await api.employees.getAll();
        setEmployees(Array.isArray(employeesResponse) ? employeesResponse : []);
        
        // Test the companies endpoint
        const companiesResponse = await api.companies.getAll();
        setCompanies(Array.isArray(companiesResponse.data) ? companiesResponse.data : []);
        
      } catch (err) {
        console.error('API connection test failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to the API');
      } finally {
        setLoading(false);
      }
    };
    
    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Connection Test</h1>
      
      {loading && (
        <div className="bg-blue-50 p-4 rounded-md mb-6">
          <p className="text-blue-700">Loading data from API...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-medium text-red-700">Connection Error</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-2 text-sm text-red-500">
            Make sure your backend server is running at http://localhost:5000
          </p>
        </div>
      )}
      
      {!loading && !error && (
        <div className="bg-green-50 p-4 rounded-md mb-6">
          <h2 className="text-lg font-medium text-green-700">Connection Successful!</h2>
          <p className="text-green-600">
            Successfully connected to the backend API.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Companies Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Companies ({companies.length})</h2>
          
          {companies.length === 0 && !loading ? (
            <p className="text-gray-500">No companies found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {companies.map((company) => (
                <li key={company.id} className="py-3">
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-gray-500">{company.location}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Employees Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Employees ({employees.length})</h2>
          
          {employees.length === 0 && !loading ? (
            <p className="text-gray-500">No employees found.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {employees.slice(0, 5).map((employee) => (
                <li key={employee.id} className="py-3">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-500">
                    {employee.trade} | {employee.email}
                  </p>
                </li>
              ))}
              {employees.length > 5 && (
                <li className="py-3 text-center text-sm text-gray-500">
                  ...and {employees.length - 5} more employees
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiConnectionTest;
