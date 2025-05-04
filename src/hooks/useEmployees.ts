import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useEmployees() {
  return useQuery(['employees'], () => api.employees.list());
}
