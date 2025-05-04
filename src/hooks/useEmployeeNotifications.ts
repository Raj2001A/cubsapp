import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export const useEmployeeNotifications = (employeeId: string) => {
  return useQuery({
    queryKey: ['notifications', employeeId],
    queryFn: async () => {
      const response = await api.get(`/employees/${employeeId}/notifications`);
      return response.data as Notification[];
    },
    enabled: !!employeeId,
  });
};
