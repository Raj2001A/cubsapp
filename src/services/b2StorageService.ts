import axios from 'axios';
import { AppError } from '../utils/errorUtils';

interface B2AuthResponse {
  absoluteMinimumPartSize: number;
  accountId: string;
  allowed: {
    capabilities: string[];
    bucketId: string;
    bucketName: string;
    namePrefix: string;
  };
  apiUrl: string;
  authorizationToken: string;
  downloadUrl: string;
  recommendedPartSize: number;
  s3ApiUrl: string;
}

interface B2UploadUrlResponse {
  authorizationToken: string;
  bucketId: string;
  uploadUrl: string;
}

interface B2FileInfo {
  accountId: string;
  action: string;
  bucketId: string;
  contentLength: number;
  contentMd5?: string;
  contentSha1: string;
  contentType: string;
  fileId: string;
  fileInfo: Record<string, string>;
  fileName: string;
  uploadTimestamp: number;
}

class B2StorageService {
  private keyId: string;
  private applicationKey: string;
  private bucketId: string;
  private authToken: string = '';
  private apiUrl: string = '';
  private downloadUrl: string = '';
  private authPromise: Promise<void> | null = null;

  constructor() {
    this.keyId = import.meta.env.VITE_B2_KEY_ID || '';
    this.applicationKey = import.meta.env.VITE_B2_APPLICATION_KEY || '';
    this.bucketId = import.meta.env.VITE_B2_BUCKET_ID || '';

    if (!this.keyId || !this.applicationKey || !this.bucketId) {
      console.error('B2 credentials not properly configured');
    }
  }

  /**
   * Authorize with B2 API
   */
  async authorize(): Promise<void> {
    if (this.authPromise) {
      return this.authPromise;
    }

    this.authPromise = new Promise<void>(async (resolve, reject) => {
      try {
        const authString = `${this.keyId}:${this.applicationKey}`;
        const encodedAuth = btoa(authString);

        const response = await axios.get<B2AuthResponse>(
          'https://api.backblazeb2.com/b2api/v2/b2_authorize_account',
          {
            headers: {
              Authorization: `Basic ${encodedAuth}`,
            },
          }
        );

        this.authToken = response.data.authorizationToken;
        this.apiUrl = response.data.apiUrl;
        this.downloadUrl = response.data.downloadUrl;
        resolve();
      } catch (error) {
        console.error('B2 authorization failed:', error);
        reject(new AppError('Failed to authorize with B2 storage', {
          code: 'B2_AUTH_ERROR',
          isOperational: true
        }));
      } finally {
        this.authPromise = null;
      }
    });

    return this.authPromise;
  }

  /**
   * Get upload URL and authorization token
   */
  private async getUploadUrl(): Promise<B2UploadUrlResponse> {
    if (!this.authToken) {
      await this.authorize();
    }

    try {
      const response = await axios.post<B2UploadUrlResponse>(
        `${this.apiUrl}/b2api/v2/b2_get_upload_url`,
        { bucketId: this.bucketId },
        {
          headers: {
            Authorization: this.authToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get B2 upload URL:', error);
      throw new AppError('Failed to get upload URL from B2', {
        code: 'B2_UPLOAD_URL_ERROR',
        isOperational: true
      });
    }
  }

  /**
   * Upload a file to B2
   */
  async uploadFile(
    file: File,
    fileName: string,
    contentType: string = 'application/octet-stream',
    metadata: Record<string, string> = {},
    onProgress?: (progress: number) => void
  ): Promise<B2FileInfo> {
    try {
      if (!this.authToken) {
        await this.authorize();
      }

      const uploadData = await this.getUploadUrl();

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer();

      // Calculate SHA1 hash (in a real implementation, you would use a proper SHA1 library)
      // For now, we'll use a placeholder
      const sha1 = 'do_not_verify'; // In production, calculate actual SHA1

      // Prepare file info headers
      const fileInfoHeaders: Record<string, string> = {};
      Object.keys(metadata).forEach(key => {
        fileInfoHeaders[`X-Bz-Info-${key}`] = metadata[key];
      });

      // Create XMLHttpRequest to track progress
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', uploadData.uploadUrl);

        // Set headers
        xhr.setRequestHeader('Authorization', uploadData.authorizationToken);
        xhr.setRequestHeader('X-Bz-File-Name', encodeURIComponent(fileName));
        xhr.setRequestHeader('Content-Type', contentType);
        xhr.setRequestHeader('X-Bz-Content-Sha1', sha1);

        // Set file info headers
        Object.keys(fileInfoHeaders).forEach(key => {
          xhr.setRequestHeader(key, fileInfoHeaders[key]);
        });

        // Track upload progress
        if (onProgress) {
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              onProgress(percentComplete);
            }
          };
        }

        xhr.onload = () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } else {
            reject(new AppError(`Upload failed with status ${xhr.status}`, {
              code: 'B2_UPLOAD_ERROR',
              isOperational: true
            }));
          }
        };

        xhr.onerror = () => {
          reject(new AppError('Upload failed due to network error', {
            code: 'B2_NETWORK_ERROR',
            isOperational: true
          }));
        };

        // Send the file data
        xhr.send(arrayBuffer);
      });
    } catch (error) {
      console.error('B2 upload failed:', error);
      throw new AppError('Failed to upload file to B2 storage', {
        code: 'B2_UPLOAD_ERROR',
        isOperational: true
      });
    }
  }

  /**
   * Download a file from B2
   */
  async downloadFile(_fileId: string, fileName: string): Promise<void> {
    try {
      if (!this.authToken) {
        await this.authorize();
      }

      // Get download authorization
      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_get_download_authorization`,
        {
          bucketId: this.bucketId,
          fileNamePrefix: fileName,
          validDurationInSeconds: 86400, // 24 hours
        },
        {
          headers: {
            Authorization: this.authToken,
          },
        }
      );

      const downloadAuth = response.data.authorizationToken;

      // Create download URL
      const downloadUrl = `${this.downloadUrl}/file/${this.bucketId}/${encodeURIComponent(fileName)}`;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName.split('/').pop() || fileName);
      link.setAttribute('target', '_blank');

      // Add authorization header via fetch and blob
      const fileBlob = await fetch(downloadUrl, {
        headers: {
          Authorization: downloadAuth,
        },
      }).then(res => res.blob());

      const objectUrl = URL.createObjectURL(fileBlob);
      link.href = objectUrl;

      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('B2 download failed:', error);
      throw new AppError('Failed to download file from B2 storage', {
        code: 'B2_DOWNLOAD_ERROR',
        isOperational: true
      });
    }
  }

  /**
   * Delete a file from B2
   */
  async deleteFile(fileId: string, fileName: string): Promise<void> {
    try {
      if (!this.authToken) {
        await this.authorize();
      }

      await axios.post(
        `${this.apiUrl}/b2api/v2/b2_delete_file_version`,
        {
          fileId,
          fileName,
        },
        {
          headers: {
            Authorization: this.authToken,
          },
        }
      );
    } catch (error) {
      console.error('B2 delete failed:', error);
      throw new AppError('Failed to delete file from B2 storage', {
        code: 'B2_DELETE_ERROR',
        isOperational: true
      });
    }
  }

  /**
   * List files in a bucket
   */
  async listFiles(prefix: string = '', maxFileCount: number = 1000): Promise<B2FileInfo[]> {
    try {
      if (!this.authToken) {
        await this.authorize();
      }

      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_list_file_names`,
        {
          bucketId: this.bucketId,
          prefix,
          maxFileCount,
        },
        {
          headers: {
            Authorization: this.authToken,
          },
        }
      );

      return response.data.files;
    } catch (error) {
      console.error('B2 list files failed:', error);
      throw new AppError('Failed to list files from B2 storage', {
        code: 'B2_LIST_ERROR',
        isOperational: true
      });
    }
  }

  /**
   * Get file info from B2
   */
  async getFileInfo(fileId: string): Promise<B2FileInfo> {
    try {
      if (!this.authToken) {
        await this.authorize();
      }

      const response = await axios.post(
        `${this.apiUrl}/b2api/v2/b2_get_file_info`,
        { fileId },
        {
          headers: {
            Authorization: this.authToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('B2 get file info failed:', error);
      throw new AppError('Failed to get file info from B2 storage', {
        code: 'B2_FILE_INFO_ERROR',
        isOperational: true
      });
    }
  }
}

export default B2StorageService;
