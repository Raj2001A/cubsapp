import React, { useState } from 'react';
import EmployeeForm from './EmployeeForm';
import { useEmployees } from './context/EmployeeContext';
import { useUI } from './context/UIContext';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employeeData: any) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addEmployee } = useEmployees();
  const { showToast } = useUI();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      // Call the API to add the employee
      await addEmployee(data);

      // Call the callback function
      onAddEmployee(data);

      // Show success toast
      showToast('Employee added successfully', 'success');

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error adding employee:', error);
      showToast('Failed to add employee', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Add New Employee</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#666'
            }}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default AddEmployeeModal;
