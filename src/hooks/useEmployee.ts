import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface Employee {
  id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  employeeId: string;
  joiningDate: string;
  phone: string;
  address: string;
  emergencyContact: string;
  photoUrl?: string;
}

export const useEmployee = (employeeId: string) => {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      const response = await api.get(`/employees/${employeeId}`);
      return response.data as Employee;
    },
    enabled: !!employeeId,
  });
};
