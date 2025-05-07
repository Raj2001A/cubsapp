import React, { useEffect } from 'react';
import ConnectionStatusWidget from '../components/ConnectionStatusWidget';
import { getEnv } from '../utils/env';
import '../services/connectionTest'; // Make sure this is loaded for console testing

const ConnectionCheck: React.FC = () => {
  useEffect(() => {
    document.title = 'Connection Status Check';
  }, []);

  return (
    <div className="p-6 min-h-screen flex flex-col items-center bg-gray-50">
      <div className="w-full max-w-3xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">System Connection Status</h1>
          <p className="text-gray-600 mt-2">
            This page lets you check connectivity to Supabase and Backblaze B2 services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Backblaze B2 Configuration</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">Key ID:</span>{' '}
                <code className="bg-gray-100 p-1 rounded text-xs">
                  {getEnv('VITE_B2_KEY_ID', '').substring(0, 10)}...
                </code>
              </div>
              <div>
                <span className="font-medium">Key Name:</span>{' '}
                <code className="bg-gray-100 p-1 rounded text-xs">
                  {getEnv('VITE_B2_KEY_NAME', '')}
                </code>
              </div>
              <div>
                <span className="font-medium">Bucket Name:</span>{' '}
                <code className="bg-gray-100 p-1 rounded text-xs">
                  {getEnv('VITE_B2_BUCKET_NAME', '')}
                </code>
              </div>
              <div>
                <span className="font-medium">Mock Mode:</span>{' '}
                <code className={`p-1 rounded text-xs ${
                  getEnv('VITE_B2_USE_MOCK', 'true') === 'true' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {getEnv('VITE_B2_USE_MOCK', 'true') === 'true' ? 'Enabled' : 'Disabled'}
                </code>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Supabase Configuration</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium">URL:</span>{' '}
                <code className="bg-gray-100 p-1 rounded text-xs">
                  {getEnv('VITE_SUPABASE_URL', '').substring(0, 20)}...
                </code>
              </div>
              <div>
                <span className="font-medium">Anonymous Key:</span>{' '}
                <code className="bg-gray-100 p-1 rounded text-xs">
                  {getEnv('VITE_SUPABASE_ANON_KEY', '').substring(0, 15)}...
                </code>
              </div>
              <div>
                <span className="font-medium">API URL:</span>{' '}
                <code className="bg-gray-100 p-1 rounded text-xs">
                  {getEnv('VITE_API_URL', '')}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <ConnectionStatusWidget />
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Advanced Testing</h2>
          <p className="text-sm text-gray-600 mb-4">
            Run <code className="bg-gray-100 p-1 rounded">window.testConnections()</code> from your browser console to perform a full connection test.
          </p>
          
          <div className="bg-gray-800 text-white p-4 rounded-md text-sm font-mono overflow-x-auto">
            <div><span className="text-blue-400">{'>'}</span> window.testConnections()</div>
            <div><span className="text-yellow-400">Testing connections to Supabase and Backblaze B2...</span></div>
            <div><span className="text-green-400">✓ Supabase connection successful!</span></div>
            <div><span className="text-green-400">✓ B2 connection successful!</span></div>
            <div><span className="text-gray-400">{'{'} supabase: true, b2: true {'}'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCheck; 