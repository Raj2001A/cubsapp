/**
 * Browser-safe B2 Service implementation that works with Backblaze B2
 * 
 * This service implements both a real Backblaze B2 client that works in the browser
 * and a localStorage fallback to ensure offline capability.
 */

import { getEnv } from '../utils/env';

// File storage interface
interface StoredFile {
  content: string;
  contentType: string;
  uploadedAt: string;
  metadata?: Record<string, string>;
}

class B2Service {
  private STORAGE_KEY = 'b2_files';
  private AUTH_STORAGE_KEY = 'b2_auth';
  private bucketName: string;
  private keyId: string;
  private keyName: string;
  private useMock: boolean;
  private authToken: string | null = null;
  private apiUrl: string | null = null;
  private downloadUrl: string | null = null;
  private authorizationPromise: Promise<boolean> | null = null;
  private corsAllowedOrigins: string[] = ['*']; // Allow all origins by default
  
  constructor() {
    // Read configuration from environment
    this.keyId = getEnv('VITE_B2_KEY_ID', '003de195e9b8c4d0000000002');
    this.keyName = getEnv('VITE_B2_KEY_NAME', 'VisaAppKey');
    this.bucketName = getEnv('VITE_B2_BUCKET_NAME', 'VisaDocsEU');
    this.useMock = getEnv('VITE_B2_USE_MOCK', 'true') === 'true';
    
    // Check if we should use mock mode
    if (this.useMock) {
      console.log('B2Service running in mock mode - using localStorage for storage');
    } else {
      console.log('B2Service running in real mode - using Backblaze B2 API');
      
      // Try to get the current origin for CORS settings
      try {
        if (typeof window !== 'undefined') {
          const origin = window.location.origin;
          this.corsAllowedOrigins = [origin, 'http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'];
          console.log('B2Service will use the following CORS allowed origins:', this.corsAllowedOrigins);
        }
      } catch (e) {
        console.warn('Failed to determine origin for CORS settings', e);
      }
    }
    
    // Initialize the localStorage storage if it doesn't exist
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({}));
    }
    
    // Try to load cached auth
    try {
      const cachedAuth = localStorage.getItem(this.AUTH_STORAGE_KEY);
      if (cachedAuth) {
        const parsed = JSON.parse(cachedAuth);
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          this.authToken = parsed.authToken;
          this.apiUrl = parsed.apiUrl;
          this.downloadUrl = parsed.downloadUrl;
          console.log('Using cached B2 auth credentials that expire at', parsed.expiresAt);
        } else if (parsed.expiresAt) {
          console.log('Cached B2 auth credentials expired at', parsed.expiresAt);
        }
      }
    } catch (e) {
      console.warn('Failed to load cached B2 auth', e);
    }
  }

  /**
   * Check if CORS is properly configured
   */
  private async checkCorsConfiguration(): Promise<boolean> {
    // If we're in mock mode, pretend CORS is configured
    if (this.useMock) {
      return true;
    }
    
    try {
      // We need to be authorized first
      const isAuthorized = await this.authorize();
      if (!isAuthorized) {
        console.warn('Failed to authorize with B2 for CORS check');
        return false;
      }
      
      // List the current CORS rules
      const corsListResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_list_cors_rules`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.bucketName
        })
      });
      
      if (!corsListResponse.ok) {
        console.warn('Failed to list B2 CORS rules');
        return false;
      }
      
      const corsListData = await corsListResponse.json();
      const corsRules = corsListData.corsRules;
      
      // Check if our origins are allowed
      let anyOriginAllowed = false;
      let allOriginsAllowed = false;
      
      if (corsRules && corsRules.length > 0) {
        for (const rule of corsRules) {
          if (rule.allowedOrigins.includes('*')) {
            allOriginsAllowed = true;
            break;
          }
          
          for (const origin of this.corsAllowedOrigins) {
            if (rule.allowedOrigins.includes(origin)) {
              anyOriginAllowed = true;
              break;
            }
          }
        }
      }
      
      if (allOriginsAllowed || anyOriginAllowed) {
        console.log('B2 CORS is properly configured');
        return true;
      }
      
      console.warn('B2 CORS is not properly configured for the current origin');
      console.warn('Current CORS rules:', corsRules);
      console.warn('Required origins:', this.corsAllowedOrigins);
      
      return false;
    } catch (error) {
      console.error('Failed to check B2 CORS configuration:', error);
      return false;
    }
  }

  /**
   * Authorize with B2 to get API URLs and auth token
   */
  private async authorize(): Promise<boolean> {
    // If we already have an authorization promise, wait for it
    if (this.authorizationPromise) {
      return this.authorizationPromise;
    }
    
    // If we're in mock mode, pretend authorization succeeded
    if (this.useMock) {
      return true;
    }
    
    // If we already have a valid auth token, use it
    if (this.authToken && this.apiUrl && this.downloadUrl) {
      return true;
    }
    
    // Create a new authorization promise
    this.authorizationPromise = new Promise<boolean>(async (resolve) => {
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          // Encode credentials for Basic Auth
          const credentials = btoa(`${this.keyId}:${this.keyName}`);
          
          // Make the authorization request
          const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${credentials}`
            }
          });
          
          if (!response.ok) {
            let errorMessage = 'B2 authorization failed';
            try {
              const errorData = await response.json();
              errorMessage = `B2 authorization failed: ${errorData.message || errorData.code || 'Unknown error'}`;
              console.error(errorMessage, errorData);
            } catch (e) {
              console.error('B2 authorization failed and could not parse error response', response.status, response.statusText);
            }
            
            if (retryCount < maxRetries - 1) {
              retryCount++;
              console.log(`Retrying B2 authorization (attempt ${retryCount + 1}/${maxRetries})...`);
              await new Promise(r => setTimeout(r, 1000 * retryCount)); // Exponential backoff
              continue;
            }
            
            resolve(false);
            return;
          }
          
          const data = await response.json();
          
          // Store authorization data
          this.authToken = data.authorizationToken;
          this.apiUrl = data.apiUrl;
          this.downloadUrl = data.downloadUrl;
          
          // Cache auth data
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 23);
          localStorage.setItem('b2_auth_data', JSON.stringify({
            authToken: this.authToken,
            apiUrl: this.apiUrl,
            downloadUrl: this.downloadUrl,
            expiresAt: expiresAt.toISOString()
          }));
          
          resolve(true);
          return;
        } catch (error) {
          console.error('Unexpected error during B2 authorization:', error);
          
          if (retryCount < maxRetries - 1) {
            retryCount++;
            console.log(`Retrying B2 authorization (attempt ${retryCount + 1}/${maxRetries})...`);
            await new Promise(r => setTimeout(r, 1000 * retryCount)); // Exponential backoff
            continue;
          }
          
          resolve(false);
          return;
        }
      }
      
      resolve(false);
    });
    
    return this.authorizationPromise;
  }
  
  /**
   * Get a file from local storage
   */
  private getFileFromLocalStorage(fileName: string): StoredFile | null {
    try {
      const filesStr = localStorage.getItem(this.STORAGE_KEY) || '{}';
      const files = JSON.parse(filesStr);
      
      return files[fileName] || null;
    } catch (error) {
      console.error('Failed to get file from localStorage', error);
      return null;
    }
  }
  
  /**
   * Save a file to local storage
   */
  private saveFileToLocalStorage(fileName: string, data: string, contentType: string): void {
    try {
      const fileObject: StoredFile = {
        content: data,
        contentType,
        uploadedAt: new Date().toISOString()
      };
      
      const filesStr = localStorage.getItem(this.STORAGE_KEY) || '{}';
      const files = JSON.parse(filesStr);
      
      files[fileName] = fileObject;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
    } catch (error) {
      console.error('Failed to save file to localStorage', error);
    }
  }

  /**
   * Upload a file to B2 and store it in localStorage as a fallback
   */
  async uploadFile(fileName: string, data: string): Promise<string> {
    // Validate inputs
    if (!fileName || fileName.trim() === '') {
      console.error('Invalid file name for upload');
      return `error:invalid_filename`;
    }
    
    if (!data) {
      console.error('Invalid file data for upload');
      return `error:invalid_data`;
    }
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    if (fileName.endsWith('.pdf')) {
      contentType = 'application/pdf';
    } else if (fileName.endsWith('.json')) {
      contentType = 'application/json';
    } else if (fileName.endsWith('.png')) {
      contentType = 'image/png';
    } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    }
    
    // Always save to localStorage for offline capability
    this.saveFileToLocalStorage(fileName, data, contentType);
    
    // If we're in mock mode, just use the mock implementation
    if (this.useMock) {
      console.log(`Mock uploading file: ${fileName}`);
      return `https://mock-storage.com/file/${this.bucketName}/${fileName}`;
    }
    
    try {
      // Authorize with B2
      console.log(`Uploading file to B2: ${fileName}`);
      const isAuthorized = await this.authorize();
      if (!isAuthorized) {
        console.warn('Failed to authorize with B2, using localStorage fallback');
        return `error:auth_failed`;
      }
      
      // Get upload URL
      const getUploadUrlResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.bucketName
        })
      });
      
      if (!getUploadUrlResponse.ok) {
        console.warn('Failed to get B2 upload URL, using localStorage fallback');
        const errorData = await getUploadUrlResponse.json().catch(() => ({}));
        console.error('B2 upload URL error:', errorData);
        return `error:upload_url_failed`;
      }
      
      const uploadUrlData = await getUploadUrlResponse.json();
      
      // Prepare file data - convert to binary if needed
      let fileContent: ArrayBuffer;
      
      if (contentType === 'application/json') {
        // For JSON, use the string directly
        fileContent = new TextEncoder().encode(data).buffer;
      } else if (data.startsWith('data:')) {
        // For data URIs, extract the base64 data
        const base64Data = data.split(',')[1];
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        fileContent = bytes.buffer;
      } else {
        // Assume it's already base64 encoded
        try {
          const binaryString = atob(data);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          fileContent = bytes.buffer;
        } catch (e) {
          console.error('Failed to decode base64 data, attempting to use raw data:', e);
          fileContent = new TextEncoder().encode(data).buffer;
        }
      }
      
      // Upload file
      const uploadResponse = await fetch(uploadUrlData.uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': uploadUrlData.authorizationToken,
          'Content-Type': contentType,
          'X-Bz-File-Name': encodeURIComponent(fileName),
          'X-Bz-Content-Sha1': 'do_not_verify' // For simplicity, not calculating SHA1
        },
        body: fileContent
      });
      
      if (!uploadResponse.ok) {
        console.warn('Failed to upload file to B2, using localStorage fallback');
        const errorData = await uploadResponse.json().catch(() => ({}));
        console.error('B2 upload error:', errorData);
        return `error:upload_failed`;
      }
      
      const uploadData = await uploadResponse.json();
      console.log('File uploaded successfully to B2:', fileName);
      
      // Return the file URL
      return `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading to B2:', error);
      return `error:exception`;
    }
  }
  
  /**
   * Download a file from B2 with localStorage fallback
   */
  async downloadFile(fileName: string): Promise<string | null> {
    // Validate inputs
    if (!fileName || fileName.trim() === '') {
      console.error('Invalid file name for download');
      return null;
    }
    
    // First check localStorage
    const localFile = this.getFileFromLocalStorage(fileName);
    if (localFile) {
      console.log(`Using cached version of ${fileName} from localStorage`);
      return localFile.content;
    }
    
    // If we're in mock mode, return mock data or null
    if (this.useMock) {
      console.log(`Mock downloading file: ${fileName}`);
      
      // If it's a metadata file, generate a mock file
      if (fileName.includes('metadata') && fileName.endsWith('.json')) {
        // Extract document type from filename
        const parts = fileName.split('/');
        const docTypePart = parts[parts.length - 1].split('_')[0];
        
        const mockMetadata = {
          id: `mock-${Date.now()}`,
          type: docTypePart,
          fileName: fileName.split('/').pop() || 'document.pdf',
          fileUrl: `https://mock-storage.com/file/${fileName.replace('metadata/', '')}`,
          fileSize: 12345,
          uploadedAt: new Date().toISOString(),
          status: 'valid'
        };
        
        return btoa(JSON.stringify(mockMetadata));
      }
      
      return null;
    }
    
    try {
      // Authorize with B2
      console.log(`Downloading file from B2: ${fileName}`);
      const isAuthorized = await this.authorize();
      if (!isAuthorized) {
        console.warn('Failed to authorize with B2 for download');
        return null;
      }
      
      // Download file
      const downloadUrl = `${this.downloadUrl}/file/${this.bucketName}/${fileName}`;
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': this.authToken!
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`File ${fileName} not found in B2`);
        } else {
          console.warn(`Failed to download file ${fileName} from B2: ${response.status} ${response.statusText}`);
        }
        return null;
      }
      
      // Handle different file types
      let contentType = response.headers.get('Content-Type') || 'application/octet-stream';
      let content: string;
      
      if (contentType.includes('json')) {
        // For JSON, store as a string
        const json = await response.json();
        content = JSON.stringify(json);
        
        // Save in localStorage for future use
        this.saveFileToLocalStorage(fileName, content, contentType);
        
        return content;
      } else {
        // For binary data, convert to base64
        const arrayBuffer = await response.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        content = btoa(binary);
        
        // Save in localStorage for future use
        this.saveFileToLocalStorage(fileName, content, contentType);
        
        return content;
      }
    } catch (error) {
      console.error('Error downloading from B2:', error);
      return null;
    }
  }
  
  /**
   * Delete a file from B2 with localStorage cleanup
   */
  async deleteFile(fileName: string): Promise<boolean> {
    // Validate inputs
    if (!fileName || fileName.trim() === '') {
      console.error('Invalid file name for deletion');
      return false;
    }
    
    // Delete from localStorage
    try {
      const filesStr = localStorage.getItem(this.STORAGE_KEY) || '{}';
      const files = JSON.parse(filesStr);
      
      if (files[fileName]) {
        delete files[fileName];
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(files));
      }
    } catch (error) {
      console.error('Failed to delete file from localStorage', error);
    }
    
    // If we're in mock mode, just return success
    if (this.useMock) {
      console.log(`Mock deleting file: ${fileName}`);
      return true;
    }
    
    try {
      // Authorize with B2
      console.log(`Deleting file from B2: ${fileName}`);
      const isAuthorized = await this.authorize();
      if (!isAuthorized) {
        console.warn('Failed to authorize with B2 for file deletion');
        return false;
      }
      
      // First, need to get the fileId
      const listFilesResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.bucketName,
          prefix: fileName,
          maxFileCount: 1
        })
      });
      
      if (!listFilesResponse.ok) {
        console.warn('Failed to list files for deletion');
        return false;
      }
      
      const listFilesData = await listFilesResponse.json();
      const files = listFilesData.files;
      
      if (!files || files.length === 0) {
        // File doesn't exist, consider it successfully deleted
        return true;
      }
      
      const fileId = files[0].fileId;
      
      // Delete the file
      const deleteResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_delete_file_version`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileName: fileName,
          fileId: fileId
        })
      });
      
      if (!deleteResponse.ok) {
        console.warn('Failed to delete file from B2');
        return false;
      }
      
      console.log('File deleted successfully from B2:', fileName);
      return true;
    } catch (error) {
      console.error('Error deleting file from B2:', error);
      return false;
    }
  }
  
  /**
   * List files in B2 with localStorage fallback
   */
  async listFiles(prefix: string = ''): Promise<string[]> {
    // Get files from localStorage
    let localFiles: string[] = [];
    try {
      const filesStr = localStorage.getItem(this.STORAGE_KEY) || '{}';
      const files = JSON.parse(filesStr);
      
      localFiles = Object.keys(files).filter(key => key.startsWith(prefix));
    } catch (error) {
      console.error('Failed to list files from localStorage', error);
    }
    
    // If we're in mock mode, return mock data
    if (this.useMock) {
      console.log(`Mock listing files with prefix: ${prefix}`);
      if (localFiles.length > 0) {
        return localFiles;
      }
      
      // Generate mock files for common patterns
      if (prefix.includes('employees') && prefix.includes('documents')) {
        // For employee documents, generate some mock document files
        return [
          `${prefix}/passport_123456.pdf`,
          `${prefix}/visa_987654.pdf`,
          `${prefix}/labor_card_123456.pdf`
        ];
      }
      
      // Default mock files
      return [
        `${prefix}/mock_file1.json`,
        `${prefix}/mock_file2.pdf`,
        `${prefix}/mock_file3.jpg`
      ];
    }
    
    try {
      // Authorize with B2
      console.log(`Listing files from B2 with prefix: ${prefix}`);
      const isAuthorized = await this.authorize();
      if (!isAuthorized) {
        console.warn('Failed to authorize with B2 for listing files, using localStorage fallback');
        return localFiles;
      }
      
      // List files
      const listFilesResponse = await fetch(`${this.apiUrl}/b2api/v2/b2_list_file_names`, {
        method: 'POST',
        headers: {
          'Authorization': this.authToken!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bucketId: this.bucketName,
          prefix: prefix,
          maxFileCount: 1000
        })
      });
      
      if (!listFilesResponse.ok) {
        console.warn('Failed to list files from B2, using localStorage fallback');
        return localFiles;
      }
      
      const listFilesData = await listFilesResponse.json();
      const b2Files = listFilesData.files.map((file: any) => file.fileName);
      
      // Combine B2 files and local files
      const allFiles = new Set([...b2Files, ...localFiles]);
      
      return Array.from(allFiles);
    } catch (error) {
      console.error('Error listing files from B2:', error);
      return localFiles;
    }
  }
  
  /**
   * Get system health information
   */
  async getSystemHealth(): Promise<{
    status: 'ok' | 'degraded' | 'offline',
    details: {
      mockMode: boolean,
      authorized: boolean,
      corsConfig: boolean,
      localStorage: boolean
    }
  }> {
    const details = {
      mockMode: this.useMock,
      authorized: false,
      corsConfig: false,
      localStorage: true
    };
    
    try {
      // Check localStorage
      try {
        localStorage.setItem('b2_health_check', 'test');
        localStorage.removeItem('b2_health_check');
      } catch (e) {
        details.localStorage = false;
      }
      
      // If in mock mode, we're done
      if (this.useMock) {
        return {
          status: details.localStorage ? 'ok' : 'degraded',
          details
        };
      }
      
      // Check authorization
      details.authorized = await this.authorize();
      
      // Check CORS configuration
      details.corsConfig = await this.checkCorsConfiguration();
      
      // Determine overall status
      let status: 'ok' | 'degraded' | 'offline' = 'ok';
      
      if (!details.authorized) {
        status = 'offline';
      } else if (!details.corsConfig || !details.localStorage) {
        status = 'degraded';
      }
      
      return { status, details };
    } catch (error) {
      console.error('Error checking B2 system health:', error);
      return {
        status: 'offline',
        details
      };
    }
  }
}

// Create singleton instance
export const b2Service = new B2Service(); 