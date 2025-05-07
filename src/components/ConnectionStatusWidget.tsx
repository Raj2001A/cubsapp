import React, { useState, useEffect } from 'react';
import { runConnectionTests } from '../services/connectionTest';
import { getEnv } from '../utils/env';

interface TestResult {
  success: boolean;
  error?: string;
  details?: any;
}

interface ConnectionStatus {
  supabase: TestResult | null;
  b2: TestResult | null;
  loading: boolean;
  lastTested: string | null;
}

export const ConnectionStatusWidget: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabase: null,
    b2: null,
    loading: false,
    lastTested: null
  });

  const checkConnections = async () => {
    setStatus(prev => ({ ...prev, loading: true }));
    try {
      const results = await runConnectionTests();
      setStatus({
        supabase: results.supabase,
        b2: results.b2,
        loading: false,
        lastTested: results.timestamp
      });
      
      // Save last test results to localStorage
      localStorage.setItem('connection_test_results', JSON.stringify({
        supabase: results.supabase,
        b2: results.b2,
        lastTested: results.timestamp
      }));
    } catch (error) {
      console.error('Error running connection tests:', error);
      setStatus(prev => ({ 
        ...prev, 
        loading: false,
        supabase: { success: false, error: 'Test failed', details: error },
        b2: { success: false, error: 'Test failed', details: error }
      }));
    }
  };

  // Load saved status from localStorage on mount
  useEffect(() => {
    const savedStatus = localStorage.getItem('connection_test_results');
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus);
        setStatus(prev => ({ 
          ...prev,
          supabase: parsed.supabase,
          b2: parsed.b2,
          lastTested: parsed.lastTested
        }));
      } catch (e) {
        console.error('Error parsing saved connection status:', e);
      }
    }
  }, []);

  // Display environment info
  const supabseUrl = getEnv('VITE_SUPABASE_URL', '').substring(0, 20) + '...';
  const b2KeyId = getEnv('VITE_B2_KEY_ID', '').substring(0, 10) + '...';
  const b2BucketName = getEnv('VITE_B2_BUCKET_NAME', '');
  const b2UseMock = getEnv('VITE_B2_USE_MOCK', 'true') === 'true';

  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Never';
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  };

  const getStatusColor = (result: TestResult | null) => {
    if (!result) return 'bg-gray-200 text-gray-800';
    return result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusText = (result: TestResult | null) => {
    if (!result) return 'Not Tested';
    return result.success ? 'Connected' : 'Failed';
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Supabase: {supabseUrl}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.supabase)}`}>
            {getStatusText(status.supabase)}
          </span>
        </div>
        
        {status.supabase?.error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Error: {status.supabase.error}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="font-medium">
            Backblaze B2: {b2BucketName} 
            {b2UseMock && <span className="text-orange-500 text-xs ml-2">(MOCK MODE)</span>}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(status.b2)}`}>
            {getStatusText(status.b2)}
          </span>
        </div>
        
        {status.b2?.error && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Error: {status.b2.error}
          </div>
        )}
        
        {status.lastTested && (
          <div className="text-xs text-gray-500 mt-2">
            Last tested: {formatTime(status.lastTested)}
          </div>
        )}
        
        <button
          onClick={checkConnections}
          disabled={status.loading}
          className={`w-full mt-2 px-4 py-2 rounded-md text-white font-medium
            ${status.loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {status.loading ? 'Testing...' : 'Test Connections'}
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatusWidget; 