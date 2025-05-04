import React, { useState } from 'react';

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  importedEmployees: any[];
}

interface ImportResultsDisplayProps {
  results: ImportResult;
  onClose: () => void;
}

const ImportResultsDisplay: React.FC<ImportResultsDisplayProps> = ({ results, onClose }) => {
  const [showErrors, setShowErrors] = useState(false);
  const [showEmployees, setShowEmployees] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Import Results</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center mb-4">
        <div className="w-1/2 p-3 bg-green-50 rounded-l-md border-r border-white">
          <div className="text-3xl font-bold text-green-600">{results.successCount}</div>
          <div className="text-sm text-green-700">Employees imported successfully</div>
        </div>
        <div className="w-1/2 p-3 bg-red-50 rounded-r-md">
          <div className="text-3xl font-bold text-red-600">{results.errorCount}</div>
          <div className="text-sm text-red-700">Employees failed to import</div>
        </div>
      </div>

      {results.successCount > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowEmployees(!showEmployees)}
            className="flex items-center justify-between w-full p-3 bg-blue-50 rounded-md text-left"
          >
            <span className="font-medium text-blue-700">
              View Imported Employees ({results.successCount})
            </span>
            <svg
              className={`h-5 w-5 text-blue-500 transform ${showEmployees ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {showEmployees && (
            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trade
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.importedEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {employee.employee_id}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {employee.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {employee.trade}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                        {employee.company_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {results.errorCount > 0 && (
        <div>
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center justify-between w-full p-3 bg-red-50 rounded-md text-left"
          >
            <span className="font-medium text-red-700">
              View Errors ({results.errorCount})
            </span>
            <svg
              className={`h-5 w-5 text-red-500 transform ${showErrors ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {showErrors && (
            <div className="mt-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
              <ul className="list-disc pl-5 space-y-1">
                {results.errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-600">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800 font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ImportResultsDisplay;
