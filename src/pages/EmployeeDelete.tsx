import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ui/use-toast';

const EmployeeDelete: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      const response = await apiService.delete(`/employees/${id}`);
      if (response.status === 200) {
        showToast('Employee deleted successfully', 'success');
        navigate('/employees');
      } else {
        showToast(response.message || 'Failed to delete employee', 'error');
      }
    } catch (error) {
      showToast('Error deleting employee', 'error');
    }
  };

  return (
    <div className="p-6 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md space-y-6 text-center">
        <h2 className="text-xl font-bold mb-4" tabIndex={0} aria-label="Delete Employee">Delete Employee</h2>
        <p>Are you sure you want to delete this employee?</p>
        <div className="flex justify-center gap-2 mt-4">
          <button onClick={() => navigate('/employees')} className="btn btn-secondary focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" aria-label="Cancel delete">Cancel</button>
          <button onClick={handleDelete} className="btn btn-danger focus:ring-2 focus:ring-offset-2 focus:ring-red-500" aria-label="Confirm delete">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDelete;
