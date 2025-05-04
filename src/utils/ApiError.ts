/**
 * Custom API Error class with enhanced error information
 */
export class ApiError extends Error {
  status: number;
  data?: any;
  code?: string;
  operation?: string;
  timestamp: string;
  requestId?: string;

  constructor(
    message: string, 
    status: number, 
    data?: any, 
    code?: string, 
    operation?: string,
    requestId?: string
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = code;
    this.operation = operation;
    this.timestamp = new Date().toISOString();
    this.requestId = requestId;
  }

  // Helper method to create a formatted error message
  static format(error: ApiError): string {
    let message = `Error ${error.status}: ${error.message}`;
    
    if (error.code) {
      message += `\nCode: ${error.code}`;
    }
    
    if (error.operation) {
      message += `\nOperation: ${error.operation}`;
    }
    
    if (error.requestId) {
      message += `\nRequest ID: ${error.requestId}`;
    }
    
    return message;
  }

  // Helper method to create an error from a fetch response
  static async fromResponse(response: Response, operation?: string): Promise<ApiError> {
    let errorData: any = null;
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    let errorCode = `HTTP_${response.status}`;
    
    try {
      // Try to parse the response as JSON
      errorData = await response.json();
      
      // Use the error message from the response if available
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
      
      // Use the error code from the response if available
      if (errorData && errorData.code) {
        errorCode = errorData.code;
      }
    } catch (e) {
      // If we can't parse the response as JSON, use the status text
      errorData = { statusText: response.statusText };
    }
    
    return new ApiError(
      errorMessage,
      response.status,
      errorData,
      errorCode,
      operation
    );
  }
}
