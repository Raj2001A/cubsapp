import React, { useState, useRef, useEffect } from 'react';
import { companies } from '../../data/companies';
import FormInput from '../ui/FormInput';
import { validateField } from '../../utils/validation';
import { AlertCircle, User, Briefcase, Phone, FileText } from 'lucide-react';
import EmptyState from '../ui/EmptyState';

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

interface AccessibleEmployeeFormProps {
  initialData?: Partial<EmployeeFormData>;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AccessibleEmployeeForm: React.FC<AccessibleEmployeeFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  // Generate a unique employee ID
  function generateEmployeeId() {
    const prefix = 'EMP';
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit number
    return `${prefix}${randomNum}`;
  }

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
    companyId: initialData.companyId || '',
    companyName: initialData.companyName || '',
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasEmergencyContact, setHasEmergencyContact] = useState(
    Boolean(initialData.emergencyContact?.name)
  );
  const [formSubmitted, setFormSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // Focus the first input with an error after submission
  useEffect(() => {
    if (formSubmitted && Object.keys(errors).length > 0) {
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }, [errors, formSubmitted]);

  // Update company name when company ID changes
  useEffect(() => {
    if (formData.companyId) {
      const company = companies.find(c => c.id === formData.companyId);
      if (company) {
        setFormData(prev => ({
          ...prev,
          companyName: company.name
        }));
      }
    }
  }, [formData.companyId]);

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

    // Validate field on change
    const fieldError = validateField(name, value, true);
    if (fieldError) {
      setErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    } else {
      // Clear error if field is now valid
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateFormData = (): boolean => {
    const requiredFields = [
      'employeeId',
      'name',
      'trade',
      'nationality',
      'joinDate',
      'dateOfBirth',
      'mobileNumber',
      'email',
      'companyId',
      'visaExpiryDate'
    ];

    const optionalFields = [
      'homePhoneNumber',
      'department',
      'position',
      'address',
      'passportNumber'
    ];

    // Add emergency contact fields if enabled
    if (hasEmergencyContact) {
      requiredFields.push('emergencyContact.name');
      requiredFields.push('emergencyContact.relationship');
      requiredFields.push('emergencyContact.phone');
    }

    const newErrors: Record<string, string> = {};

    // Validate required fields
    for (const field of requiredFields) {
      let value = '';
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        value = (formData as any)[parent]?.[child] || '';
      } else {
        value = (formData as any)[field] || '';
      }

      const error = validateField(field, value, true);
      if (error) {
        newErrors[field] = error;
      }
    }

    // Validate optional fields if they have values
    for (const field of optionalFields) {
      const value = (formData as any)[field];
      if (value) {
        const error = validateField(field, value, false);
        if (error) {
          newErrors[field] = error;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    // Validate form
    if (!validateFormData()) {
      // Announce errors to screen readers
      if (statusRef.current) {
        statusRef.current.textContent = 'Form submission failed. Please correct the errors.';
      }
      return;
    }

    // If emergency contact is disabled, remove it from the data
    const dataToSubmit = {
      ...formData,
      emergencyContact: hasEmergencyContact ? formData.emergencyContact : undefined
    };

    // Announce submission to screen readers
    if (statusRef.current) {
      statusRef.current.textContent = 'Form submitted successfully.';
    }

    onSubmit(dataToSubmit as EmployeeFormData);
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-8"
      noValidate
      aria-labelledby="employee-form-title"
    >
      {/* Screen reader announcements */}
      <div 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        ref={statusRef}
      ></div>

      {/* Form error summary */}
      {Object.keys(errors).length > 0 && formSubmitted && (
        <div 
          className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-start" 
          role="alert"
          aria-labelledby="error-heading"
        >
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h2 id="error-heading" className="font-medium">Please correct the following errors:</h2>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {Object.values(errors).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Basic Information Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-500" />
            Basic Information
          </div>
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormInput
            id="employeeId"
            name="employeeId"
            label="Employee ID"
            type="text"
            value={formData.employeeId}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.employeeId}
            validateOnBlur
            helpText="Format: EMP followed by 4 digits"
          />

          <FormInput
            id="name"
            name="name"
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.name}
            validateOnBlur
          />

          <FormInput
            id="trade"
            name="trade"
            label="Trade"
            type="text"
            value={formData.trade}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.trade}
            validateOnBlur
          />

          <FormInput
            id="nationality"
            name="nationality"
            label="Nationality"
            type="text"
            value={formData.nationality}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.nationality}
            validateOnBlur
          />

          <FormInput
            id="dateOfBirth"
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.dateOfBirth}
            validateOnBlur
            max={new Date().toISOString().split('T')[0]}
          />

          <FormInput
            id="joinDate"
            name="joinDate"
            label="Joining Date"
            type="date"
            value={formData.joinDate}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.joinDate}
            validateOnBlur
          />
        </div>
      </fieldset>

      {/* Company Information Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 mr-2 text-blue-500" />
            Company Information
          </div>
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="companyId"
            name="companyId"
            label="Company"
            type="select"
            value={formData.companyId}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.companyId}
            validateOnBlur
            options={[
              { value: '', label: 'Select a company' },
              ...companies.map(company => ({
                value: company.id,
                label: `${company.name}${company.location ? `, ${company.location}` : ''}`
              }))
            ]}
          />

          <FormInput
            id="department"
            name="department"
            label="Department"
            type="text"
            value={formData.department || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.department}
            validateOnBlur
          />

          <FormInput
            id="position"
            name="position"
            label="Position"
            type="text"
            value={formData.position || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.position}
            validateOnBlur
          />

          <FormInput
            id="visaExpiryDate"
            name="visaExpiryDate"
            label="Visa Expiry Date"
            type="date"
            value={formData.visaExpiryDate}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.visaExpiryDate}
            validateOnBlur
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </fieldset>

      {/* Contact Information Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-blue-500" />
            Contact Information
          </div>
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="mobileNumber"
            name="mobileNumber"
            label="Mobile Number"
            type="tel"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.mobileNumber}
            validateOnBlur
            placeholder="+971 XX XXX XXXX"
          />

          <FormInput
            id="homePhoneNumber"
            name="homePhoneNumber"
            label="Home Phone Number"
            type="tel"
            value={formData.homePhoneNumber || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.homePhoneNumber}
            validateOnBlur
          />

          <FormInput
            id="email"
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.email}
            validateOnBlur
            autoComplete="email"
          />

          <FormInput
            id="address"
            name="address"
            label="Address"
            type="text"
            value={formData.address || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.address}
            validateOnBlur
          />
        </div>
      </fieldset>

      {/* Documents Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-500" />
            Documents
          </div>
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="passportNumber"
            name="passportNumber"
            label="Passport Number"
            type="text"
            value={formData.passportNumber || ''}
            onChange={handleChange}
            disabled={isSubmitting}
            error={errors.passportNumber}
            validateOnBlur
          />
        </div>
      </fieldset>

      {/* Emergency Contact Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
            Emergency Contact
          </div>
        </legend>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              id="hasEmergencyContact"
              type="checkbox"
              checked={hasEmergencyContact}
              onChange={(e) => setHasEmergencyContact(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting}
            />
            <label htmlFor="hasEmergencyContact" className="ml-2 block text-sm text-gray-900">
              Add emergency contact information
            </label>
          </div>
        </div>
        
        {hasEmergencyContact ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="emergencyContact.name"
              name="emergencyContact.name"
              label="Contact Name"
              type="text"
              value={formData.emergencyContact?.name || ''}
              onChange={handleChange}
              required={hasEmergencyContact}
              disabled={isSubmitting}
              error={errors['emergencyContact.name']}
              validateOnBlur
            />

            <FormInput
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              label="Relationship"
              type="text"
              value={formData.emergencyContact?.relationship || ''}
              onChange={handleChange}
              required={hasEmergencyContact}
              disabled={isSubmitting}
              error={errors['emergencyContact.relationship']}
              validateOnBlur
            />

            <FormInput
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              label="Contact Phone"
              type="tel"
              value={formData.emergencyContact?.phone || ''}
              onChange={handleChange}
              required={hasEmergencyContact}
              disabled={isSubmitting}
              error={errors['emergencyContact.phone']}
              validateOnBlur
              placeholder="+971 XX XXX XXXX"
            />
          </div>
        ) : (
          <EmptyState
            type="custom"
            title="No emergency contact"
            message="Enable the checkbox above to add emergency contact information."
            icon={<AlertCircle className="h-12 w-12 text-gray-400" />}
            className="py-6"
          />
        )}
      </fieldset>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Employee'}
        </button>
      </div>
    </form>
  );
};

export default AccessibleEmployeeForm;
