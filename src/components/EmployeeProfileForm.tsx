import React, { useState } from 'react';
import Button from './ui/Button';
import Input from './ui/Input';

interface EmployeeProfileFormProps {
  employee: any;
  onUpdate: (data: any) => void;
  onDelete: () => void;
}

const EmployeeProfileForm: React.FC<EmployeeProfileFormProps> = ({ employee, onUpdate, onDelete }) => {
  const [form, setForm] = useState(employee);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded shadow p-4 mb-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" name="name" value={form.name || ''} onChange={handleChange} required />
        <Input label="Email" name="email" value={form.email || ''} onChange={handleChange} required />
        <Input label="Department" name="department" value={form.department || ''} onChange={handleChange} />
        <Input label="Position" name="position" value={form.position || ''} onChange={handleChange} />
      </div>
      <div className="flex justify-between mt-4">
        <Button type="submit" variant="primary">Save Changes</Button>
        <Button type="button" variant="danger" onClick={onDelete}>Delete Employee</Button>
      </div>
    </form>
  );
};

export default EmployeeProfileForm;
