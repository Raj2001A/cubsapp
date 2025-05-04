import React, { useState, useEffect } from 'react';
import api from '../services/api';

const TestApiConnection: React.FC = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch employees
        const employeesResponse = await api.employees.getAll();
        let employeesArray: any[] = [];
        if (Array.isArray(employeesResponse)) {
          employeesArray = employeesResponse;
        } else if (employeesResponse && Array.isArray(employeesResponse.data)) {
          employeesArray = employeesResponse.data;
        }
        setEmployees(employeesArray);

        // Fetch companies
        const companiesResponse = await api.companies.getAll();
        let companiesArray: any[] = [];
        if (Array.isArray(companiesResponse)) {
          companiesArray = companiesResponse;
        } else if (companiesResponse && Array.isArray(companiesResponse.data)) {
          companiesArray = companiesResponse.data;
        }
        setCompanies(companiesArray);

        console.log('API Connection Test - Employees:', employeesResponse);
        console.log('API Connection Test - Companies:', companiesResponse);
      } catch (err) {
        console.error('API Connection Test - Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to connect to the API');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
          <h2 className="text-lg font-medium text-red-700">Database Connection Error</h2>
          <p className="text-red-600">{error}</p>
          <p className="mt-2 text-sm text-red-500">
            The backend server is running at http://localhost:5002 but cannot connect to the Neon PostgreSQL database.
          </p>
          <p className="mt-2 text-sm text-red-500">
            This is expected behavior during development. The application will use mock data where available.
          </p>
          <div className="mt-4 p-3 bg-yellow-50 rounded-md">
            <h3 className="text-md font-medium text-yellow-700">Database Connection Troubleshooting</h3>
            <ul className="list-disc pl-5 mt-2 text-sm text-yellow-600">
              <li>Check that your Neon PostgreSQL database is running and accessible</li>
              <li>Verify the connection string in the backend .env file</li>
              <li>Make sure your network allows connections to the database</li>
              <li>Check for any firewall or VPN issues that might block the connection</li>
            </ul>
          </div>
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
              {employees.map((employee) => (
                <li key={employee.id} className="py-3">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-gray-500">
                    {employee.trade} | {employee.email}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestApiConnection;
