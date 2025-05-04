// User type for authentication and employee context
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'employee';
  department?: string;
  position?: string;
  visaStatus?: string;
  visaExpiryDate?: string;
  phoneNumber?: string;
  employeeId?: string;
  uid?: string;
  // Add other properties as needed by your codebase
}
