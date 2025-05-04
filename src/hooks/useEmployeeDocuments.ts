import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  category: DocumentCategory;
  uploadedAt: string;
  expiryDate?: string;
}

export type DocumentCategory =
  | 'passport'
  | 'visa'
  | 'emiratesId'
  | 'workPermit'
  | 'medical'
  | 'other';

export const useEmployeeDocuments = (employeeId: string) => {
  return useQuery({
    queryKey: ['documents', employeeId],
    queryFn: async () => {
      const response = await api.get(`/employees/${employeeId}/documents`);
      return response.data as Document[];
    },
    enabled: !!employeeId,
  });
};
