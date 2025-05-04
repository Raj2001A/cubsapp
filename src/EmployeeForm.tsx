import React, { useState } from 'react';
import { User, Briefcase, Phone, Calendar, Mail, FileText, Globe, Home, AlertCircle } from 'lucide-react';
import FormInput from './components/ui/FormInput';

interface EmployeeFormData {
  employeeId: string;
  name: string;
  trade: string;
  nationality: string;
  joinDate: string;
  dateOfBirth: string;
  mobileNumber: string;
  homePhoneNumber?: string;
  email: string;
  companyId: string;
  companyName: string;
  visaExpiryDate: string;
  department?: string;
  position?: string;
  address?: string;
  passportNumber?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface EmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    employeeId: initialData.employeeId || generateEmployeeId(),
    name: initialData.name || '',
    trade: initialData.trade || '',
    nationality: initialData.nationality || '',
    joinDate: initialData.joinDate || new Date().toISOString().split('T')[0],
    dateOfBirth: initialData.dateOfBirth || '',
    mobileNumber: initialData.mobileNumber || '',
    homePhoneNumber: initialData.homePhoneNumber || '',
    email: initialData.email || '',
    companyId: initialData.companyId || '1',
    companyName: initialData.companyName || 'CUBS TECH CONTRACTING, SHARJAH, UAE',
    visaExpiryDate: initialData.visaExpiryDate || '',
    department: initialData.department || '',
    position: initialData.position || '',
    address: initialData.address || '',
    passportNumber: initialData.passportNumber || '',
    emergencyContact: initialData.emergencyContact || {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  // Generate a unique employee ID
  function generateEmployeeId() {
    const prefix = 'EMP';
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `${prefix}${randomNum}`;
  }

  const [hasEmergencyContact, setHasEmergencyContact] = useState(
    Boolean(initialData.emergencyContact?.name)
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.startsWith('emergencyContact.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact!,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If emergency contact is disabled, remove it from the data
    const dataToSubmit = {
      ...formData,
      emergencyContact: hasEmergencyContact ? formData.emergencyContact : undefined
    };

    onSubmit(dataToSubmit as EmployeeFormData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
          Basic Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <FormInput
            id="employeeId"
            name="employeeId"
            label="Employee ID"
            type="text"
            value={formData.employeeId}
            onChange={handleChange}
            required
            icon={<User className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            icon={<User className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="trade"
            name="trade"
            label="Trade"
            type="text"
            value={formData.trade}
            onChange={handleChange}
            required
            icon={<Briefcase className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="nationality"
            name="nationality"
            label="Nationality"
            type="text"
            value={formData.nationality}
            onChange={handleChange}
            required
            icon={<Globe className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="joinDate"
            name="joinDate"
            label="Join Date"
            type="date"
            value={formData.joinDate}
            onChange={handleChange}
            required
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="dateOfBirth"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
          Contact Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <FormInput
            id="mobileNumber"
            name="mobileNumber"
            label="Mobile Number"
            type="tel"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            icon={<Phone className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="homePhoneNumber"
            name="homePhoneNumber"
            label="Home Phone Number"
            type="tel"
            value={formData.homePhoneNumber || ''}
            onChange={handleChange}
            icon={<Phone className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="email"
            name="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            icon={<Mail className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="address"
            name="address"
            label="Address"
            type="text"
            value={formData.address || ''}
            onChange={handleChange}
            icon={<Home className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
          Company Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <FormInput
            id="companyId"
            name="companyId"
            label="Company ID"
            type="text"
            value={formData.companyId}
            onChange={handleChange}
            required
            icon={<Briefcase className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="companyName"
            name="companyName"
            label="Company Name"
            type="text"
            value={formData.companyName}
            onChange={handleChange}
            required
            icon={<Briefcase className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="department"
            name="department"
            label="Department"
            type="text"
            value={formData.department || ''}
            onChange={handleChange}
            icon={<Briefcase className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="position"
            name="position"
            label="Position"
            type="text"
            value={formData.position || ''}
            onChange={handleChange}
            icon={<Briefcase className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', marginBottom: '16px' }}>
          Visa & Passport Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          <FormInput
            id="visaExpiryDate"
            name="visaExpiryDate"
            label="Visa Expiry Date"
            type="date"
            value={formData.visaExpiryDate}
            onChange={handleChange}
            required
            icon={<Calendar className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
          <FormInput
            id="passportNumber"
            name="passportNumber"
            label="Passport Number"
            type="text"
            value={formData.passportNumber || ''}
            onChange={handleChange}
            icon={<FileText className="h-5 w-5 text-gray-400" />}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
            Emergency Contact
          </h3>
          <div style={{ marginLeft: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={hasEmergencyContact}
                onChange={(e) => setHasEmergencyContact(e.target.checked)}
                style={{ marginRight: '8px' }}
                disabled={isSubmitting}
              />
              <span style={{ fontSize: '0.875rem', color: '#555' }}>Add emergency contact</span>
            </label>
          </div>
        </div>

        {hasEmergencyContact && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            <FormInput
              id="emergencyContact.name"
              name="emergencyContact.name"
              label="Contact Name"
              type="text"
              value={formData.emergencyContact?.name || ''}
              onChange={handleChange}
              required={hasEmergencyContact}
              icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
              disabled={isSubmitting}
            />
            <FormInput
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              label="Relationship"
              type="text"
              value={formData.emergencyContact?.relationship || ''}
              onChange={handleChange}
              required={hasEmergencyContact}
              icon={<AlertCircle className="h-5 w-5 text-gray-400" />}
              disabled={isSubmitting}
            />
            <FormInput
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              label="Contact Phone"
              type="tel"
              value={formData.emergencyContact?.phone || ''}
              onChange={handleChange}
              required={hasEmergencyContact}
              icon={<Phone className="h-5 w-5 text-gray-400" />}
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: '10px 16px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            backgroundColor: 'white',
            color: '#333',
            fontSize: '14px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            borderRadius: '4px',
            border: 'none',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '14px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1
          }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : initialData.name ? 'Update Employee' : 'Add Employee'}
        </button>
      </div>
    </form>
  );
};

export default EmployeeForm;
