/**
 * Utility functions for storage-related operations
 */

/**
 * Check if B2 storage is properly configured
 */
export const isB2Configured = (): boolean => {
  const keyId = import.meta.env.VITE_B2_KEY_ID;
  const applicationKey = import.meta.env.VITE_B2_APPLICATION_KEY;
  const bucketId = import.meta.env.VITE_B2_BUCKET_ID;

  return Boolean(keyId && applicationKey && bucketId);
};

/**
 * Get B2 configuration status message
 */
export const getB2ConfigStatus = (): { isConfigured: boolean; message: string } => {
  const keyId = import.meta.env.VITE_B2_KEY_ID;
  const applicationKey = import.meta.env.VITE_B2_APPLICATION_KEY;
  const bucketId = import.meta.env.VITE_B2_BUCKET_ID;

  const missingFields = [];
  if (!keyId) missingFields.push('B2 Key ID');
  if (!applicationKey) missingFields.push('B2 Application Key');
  if (!bucketId) missingFields.push('B2 Bucket ID');

  if (missingFields.length === 0) {
    return {
      isConfigured: true,
      message: 'Backblaze B2 storage is properly configured.'
    };
  }

  return {
    isConfigured: false,
    message: `Backblaze B2 storage is not properly configured. Missing: ${missingFields.join(', ')}.`
  };
};

/**
 * Format file size in a human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};
