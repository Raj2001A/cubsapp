$content = Get-Content -Path "d:\Web app\src\services\api.ts" -Raw

# Keep only the first import of USE_MOCK_BACKEND and mockBackendService
$newContent = @"
/**
 * API Service for connecting to the backend
 */
import { retryOperation, isOffline, checkApiAvailability } from '../utils/errorHandling';
import logger from '../utils/logger';
import { getOrFetchData } from '../utils/cacheUtils';
import requestQueueManager, { RequestPriority } from '../utils/requestQueueManager';

import { API_ENDPOINT, USE_MOCK_BACKEND } from '../config';
import { mockBackendService } from './mockBackendService';

"@

# Extract all the API implementation code (without the ternary assignment)
$apiImplementation = $content -replace '(?s).*const api = useMock\s+\?\s+mockBackendService\s+:\s+\{(.*)\}\s*;\s*export \{ fetchWithTimeout, safeHandleResponse \};.*', '$1'

# Add the implementation code (without the broken ternary)
$newContent += $apiImplementation

# Add the export statements back
$newContent += @"

// Export fetchWithTimeout and safeHandleResponse for use in other modules
export { fetchWithTimeout, safeHandleResponse };

// Export the API (will be properly assigned in the next step)
export { api };
export default api;
"@

# Write the cleaned content back to a temporary file
$newContent | Out-File -FilePath "d:\Web app\src\services\api.ts.clean" -Encoding utf8

Write-Host "Cleanup complete! The cleaned file is at 'd:\Web app\src\services\api.ts.clean'"
Write-Host "Review the cleaned file, and if it looks good, rename it to replace the original."
