import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle } from 'lucide-react';

const TestApiConnection: React.FC = () => {
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState<{ status: 'success' | 'error' | 'loading'; message: string }>({
    status: 'loading',
    message: 'Testing connection...'
  });

  const testConnection = async () => {
    try {
      setTestResult({ status: 'loading', message: 'Testing connection...' });
      const response = await fetch('/api/health');
      if (!response.ok) {
        throw new Error('API returned an error');
      }
      setTestResult({ status: 'success', message: 'Connection successful!' });
    } catch (error) {
      setTestResult({ status: 'error', message: 'Connection failed. Please check the backend server.' });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">API Connection Test</h1>
        <button
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-gray-700"
        >
          Back
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Connection Status</h2>
            <div className="flex items-center">
              {testResult.status === 'success' && (
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              )}
              {testResult.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              )}
              {testResult.status === 'loading' && (
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              )}
              <span>{testResult.message}</span>
            </div>
          </div>

          <div className="pt-4 border-t">
            <button
              onClick={testConnection}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApiConnection;
