import employeeApi from './employeeApi';
import documentApi from './documentApi';
import userApi from './userApi';
import systemApi from './systemApi';

/**
 * Combined API service
 *
 * NOTE: The `documents` property must match the named export in documentApi.ts.
 * This ensures employeeService and other consumers can use `api.documents` safely.
 */
const api = {
  employees: employeeApi,
  documents: documentApi, // Fix: ensure this matches the named export in documentApi.ts
  users: userApi,
  system: systemApi
};

export default api;
