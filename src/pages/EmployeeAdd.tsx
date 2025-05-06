import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Employee, EmployeeVisaStatus } from '../types/employees';
import { useToast } from '../components/ui/use-toast';

const initialEmployee: Partial<Employee> = {
  employeeId: '',
  name: '',
  company: '',
  position: '',
  nationality: '',
  dateOfBirth: '',
  joinDate: '',
  visaStatus: EmployeeVisaStatus.UNKNOWN,
  visaExpiryDate: '',
  email: '',
  phone: '',
};

const EmployeeAdd: React.FC = () => {
  const [employee, setEmployee] = useState<Partial<Employee>>(initialEmployee);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({ ...prev, [name]: value }));
  };

  const validate = async () => {
    const newErrors: Record<string, string> = {};
    if (!employee.employeeId) newErrors.employeeId = 'Employee ID is required';
    if (!employee.name) newErrors.name = 'Name is required';
    if (!employee.company) newErrors.company = 'Company is required';
    if (!employee.position) newErrors.position = 'Position is required';
    if (!employee.nationality) newErrors.nationality = 'Nationality is required';
    if (!employee.dateOfBirth) newErrors.dateOfBirth = 'Date of Birth is required';
    if (!employee.joinDate) newErrors.joinDate = 'Join Date is required';
    if (employee.email && !/^\S+@\S+\.\S+$/.test(employee.email)) newErrors.email = 'Invalid email format';
    if (employee.phone && !/^\+?[0-9\-\s()]{7,}$/.test(employee.phone)) newErrors.phone = 'Invalid phone number';
    // Uniqueness check for employeeId
    if (employee.employeeId) {
      try {
        const res = await apiService.get(`/employees?employeeId=${encodeURIComponent(employee.employeeId)}`);
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          newErrors.employeeId = 'Employee ID must be unique';
        }
      } catch {}
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = await validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      const response = await apiService.post<Employee>('/employees', employee);
      if (response.data) {
        showToast('Employee added successfully', 'success');
        navigate('/employees');
      } else {
        showToast(response.message || 'Failed to add employee', 'error');
      }
    } catch (error) {
      showToast('Error adding employee', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 w-full max-w-xl space-y-6">
        <h2 className="text-xl font-bold mb-4" tabIndex={0} aria-label="Add Employee">Add Employee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input name="employeeId" value={employee.employeeId || ''} onChange={handleChange} required placeholder="Employee ID" className="input" />
            {errors.employeeId && <div className="text-red-500 text-xs mt-1">{errors.employeeId}</div>}
          </div>
          <div>
            <input name="name" value={employee.name || ''} onChange={handleChange} required placeholder="Name" className="input" />
            {errors.name && <div className="text-red-500 text-xs mt-1">{errors.name}</div>}
          </div>
          <div>
            <input name="company" value={employee.company || ''} onChange={handleChange} required placeholder="Company" className="input" />
            {errors.company && <div className="text-red-500 text-xs mt-1">{errors.company}</div>}
          </div>
          <div>
            <input name="position" value={employee.position || ''} onChange={handleChange} required placeholder="Position" className="input" />
            {errors.position && <div className="text-red-500 text-xs mt-1">{errors.position}</div>}
          </div>
          <div>
            <input name="nationality" value={employee.nationality || ''} onChange={handleChange} required placeholder="Nationality" className="input" />
            {errors.nationality && <div className="text-red-500 text-xs mt-1">{errors.nationality}</div>}
          </div>
          <div>
            <input name="dateOfBirth" value={employee.dateOfBirth || ''} onChange={handleChange} required placeholder="Date of Birth" type="date" className="input" />
            {errors.dateOfBirth && <div className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</div>}
          </div>
          <div>
            <input name="joinDate" value={employee.joinDate || ''} onChange={handleChange} required placeholder="Join Date" type="date" className="input" />
            {errors.joinDate && <div className="text-red-500 text-xs mt-1">{errors.joinDate}</div>}
          </div>
          <div>
            <select name="visaStatus" value={employee.visaStatus || EmployeeVisaStatus.UNKNOWN} onChange={handleChange} className="input">
              {Object.values(EmployeeVisaStatus).map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <input name="visaExpiryDate" value={employee.visaExpiryDate || ''} onChange={handleChange} placeholder="Visa Expiry Date" type="date" className="input" />
          </div>
          <div>
            <input name="email" value={employee.email || ''} onChange={handleChange} placeholder="Email" type="email" className="input" />
            {errors.email && <div className="text-red-500 text-xs mt-1">{errors.email}</div>}
          </div>
          <div>
            <input name="phone" value={employee.phone || ''} onChange={handleChange} placeholder="Phone" type="tel" className="input" />
            {errors.phone && <div className="text-red-500 text-xs mt-1">{errors.phone}</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={() => navigate('/employees')} className="btn btn-secondary focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Cancel add employee">Cancel</button>
          <button type="submit" className="btn btn-primary focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={loading} aria-label="Submit new employee">{loading ? 'Saving...' : 'Add Employee'}</button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeAdd;
