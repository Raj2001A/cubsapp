import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useEmployeeDetails(id: string) {
  return useQuery(['employee', id], () => api.employees.detail(id), { enabled: !!id });
}
