import { supabase } from '../supabaseClient';
import { b2Service } from './b2Service';

interface TestResult {
  success: boolean;
  error?: string;
  details?: any;
}

/**
 * Test file to verify connectivity to both Supabase and Backblaze B2
 */

export async function testSupabaseConnection(): Promise<TestResult> {
  try {
    // Try to ping Supabase with a simple query
    const { data, error } = await supabase.from('employees').select('count()', { count: 'exact' }).limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    console.log('✅ Supabase connection successful!', data);
    return {
      success: true,
      details: data
    };
  } catch (err) {
    const error = err as Error;
    console.error('Unexpected error testing Supabase connection:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

export async function testB2Connection(): Promise<TestResult> {
  try {
    const testFileName = `test_connection_${Date.now()}.json`;
    const testData = JSON.stringify({ test: true, timestamp: new Date().toISOString() });
    
    // Try to upload a file to B2
    console.log('Testing B2 connection by uploading a file...');
    const uploadUrl = await b2Service.uploadFile(testFileName, testData);
    if (!uploadUrl || uploadUrl.includes('error=')) {
      console.error('B2 upload test failed:', uploadUrl);
      return {
        success: false,
        error: 'Upload failed',
        details: { uploadUrl }
      };
    }
    
    // Try to download the file back
    console.log('Testing B2 connection by downloading the file...');
    const downloadedData = await b2Service.downloadFile(testFileName);
    if (!downloadedData) {
      console.error('B2 download test failed.');
      return {
        success: false,
        error: 'Download failed',
        details: { uploadUrl }
      };
    }
    
    // Try to delete the test file
    console.log('Testing B2 connection by deleting the file...');
    const deleteResult = await b2Service.deleteFile(testFileName);
    if (!deleteResult) {
      console.error('B2 delete test failed.');
      return {
        success: false,
        error: 'Delete failed',
        details: { uploadUrl, downloadedData }
      };
    }
    
    console.log('✅ B2 connection successful!');
    return {
      success: true,
      details: {
        uploadUrl,
        downloadedData,
        deleteResult
      }
    };
  } catch (err) {
    const error = err as Error;
    console.error('Unexpected error testing B2 connection:', error);
    return {
      success: false,
      error: error.message,
      details: error
    };
  }
}

export async function runConnectionTests(): Promise<{
  supabase: TestResult;
  b2: TestResult;
  timestamp: string;
}> {
  const supabaseResult = await testSupabaseConnection();
  const b2Result = await testB2Connection();
  
  return {
    supabase: supabaseResult,
    b2: b2Result,
    timestamp: new Date().toISOString()
  };
}

// Simple function to test connections from browser console
(window as any).testConnections = async () => {
  console.log('Testing connections to Supabase and Backblaze B2...');
  const results = await runConnectionTests();
  console.log('Connection test results:', results);
  return results;
};

// Log that this module has been loaded
console.log('Connection test module loaded. Run window.testConnections() in console to test connections.'); 