import React, { useState, useRef, useEffect } from 'react';
import { Employee } from '../../types/employees';
import FormInput from '../ui/FormInput';
import { validateField } from '../../utils/validation';
import { AlertCircle, Upload } from 'lucide-react';
// import EmptyState from '../ui/EmptyState'; // Removed unused import

// Document types
const DOCUMENT_TYPES = [
  'Passport',
  'Emirates ID',
  'Labour Card',
  'Medical Insurance',
  'Workmen Compensation',
  'Visa Copy',
  'ILOE',
  'CICPA',
  'Temporary Work Permit',
  'Driving License',
  'Other Certificates'
];

interface DocumentFormData {
  name: string;
  type: string;
  employeeId: string;
  employeeName: string;
  file?: File;
  expiryDate?: string;
  notes?: string;
}

interface AccessibleDocumentUploadFormProps {
  employees: Employee[];
  onSubmit: (data: DocumentFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const AccessibleDocumentUploadForm: React.FC<AccessibleDocumentUploadFormProps> = ({
  employees,
  onSubmit,
  onCancel,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<DocumentFormData>({
    name: '',
    type: '',
    employeeId: '',
    employeeName: '',
    expiryDate: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Focus the first input with an error after submission
  useEffect(() => {
    if (formSubmitted && Object.keys(errors).length > 0) {
      const firstErrorField = document.getElementById(Object.keys(errors)[0]);
      if (firstErrorField) {
        firstErrorField.focus();
      }
    }
  }, [errors, formSubmitted]);

  // Update employee name when employee ID changes
  useEffect(() => {
    if (formData.employeeId) {
      const employee = employees.find(e => e.id === formData.employeeId);
      if (employee) {
        setFormData(prev => ({
          ...prev,
          employeeName: employee.name
        }));
      }
    }
  }, [formData.employeeId, employees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate field on change
    const fieldError = validateField(name, value, name !== 'notes' && name !== 'expiryDate');
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      
      // Auto-fill name if not already filled
      if (!formData.name) {
        // Remove file extension from name
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData(prev => ({
          ...prev,
          name: fileName
        }));
      }
      
      // Clear file error if exists
      if (errors.file) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.file;
          return newErrors;
        });
      }
    } else {
      setSelectedFile(null);
    }
  };

  const validateFormData = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name) newErrors.name = 'Document name is required';
    if (!formData.type) newErrors.type = 'Document type is required';
    if (!formData.employeeId) newErrors.employeeId = 'Employee is required';
    
    // File is required
    if (!selectedFile) newErrors.file = 'Document file is required';
    
    // Validate expiry date if provided
    if (formData.expiryDate) {
      const expiryDateError = validateField('expiry date', formData.expiryDate, false);
      if (expiryDateError) newErrors.expiryDate = expiryDateError;
    }
    
    // Visa Copy requires expiry date
    if (formData.type === 'Visa Copy' && !formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required for Visa documents';
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

    // Prepare data for submission
    const dataToSubmit: DocumentFormData = {
      ...formData,
      file: selectedFile || undefined
    };

    // Announce submission to screen readers
    if (statusRef.current) {
      statusRef.current.textContent = 'Document uploaded successfully.';
    }

    onSubmit(dataToSubmit);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6"
      noValidate
      aria-labelledby="document-upload-title"
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

      {/* Document Information Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            {/* <FileText className="h-5 w-5 mr-2 text-blue-500" /> */}
            Document Information
          </div>
        </legend>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            id="name"
            name="name"
            label="Document Name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.name}
            validateOnBlur
          />

          <FormInput
            id="type"
            name="type"
            label="Document Type"
            type="select"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.type}
            validateOnBlur
            options={[
              { value: '', label: 'Select document type' },
              ...DOCUMENT_TYPES.map(type => ({
                value: type,
                label: type
              }))
            ]}
          />

          <FormInput
            id="employeeId"
            name="employeeId"
            label="Employee"
            type="select"
            value={formData.employeeId}
            onChange={handleChange}
            required
            disabled={isSubmitting}
            error={errors.employeeId}
            validateOnBlur
            options={[
              { value: '', label: 'Select employee' },
              ...employees.map(employee => ({
                value: employee.id,
                label: `${employee.name} (${employee.employeeId})`
              }))
            ]}
          />

          <FormInput
            id="expiryDate"
            name="expiryDate"
            label={formData.type === 'Visa Copy' ? "Expiry Date*" : "Expiry Date (if applicable)"}
            type="date"
            value={formData.expiryDate || ''}
            onChange={handleChange}
            required={formData.type === 'Visa Copy'}
            disabled={isSubmitting}
            error={errors.expiryDate}
            validateOnBlur
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
      </fieldset>

      {/* File Upload Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            <Upload className="h-5 w-5 mr-2 text-blue-500" />
            Document File
          </div>
        </legend>
        
        <div className="space-y-4">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="hidden"
            aria-describedby="file-description"
            disabled={isSubmitting}
          />
          
          {/* Custom file upload button */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:bg-gray-50"
               onClick={triggerFileInput}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' || e.key === ' ') {
                   e.preventDefault();
                   triggerFileInput();
                 }
               }}
               tabIndex={0}
               role="button"
               aria-controls="file"
               aria-label="Upload document file"
          >
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600" id="file-description">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, Word, or Image files up to 10MB
            </p>
          </div>
          
          {/* Selected file display */}
          {selectedFile && (
            <div className="bg-blue-50 p-3 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                {/* <FileText className="h-5 w-5 text-blue-500 mr-2" /> */}
                <div>
                  <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Remove file"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {errors.file && formSubmitted && (
            <p className="mt-2 text-sm text-red-600" role="alert">
              {errors.file}
            </p>
          )}
        </div>
      </fieldset>

      {/* Notes Section */}
      <fieldset className="border border-gray-200 rounded-md p-4">
        <legend className="text-lg font-medium text-gray-900 px-2">
          <div className="flex items-center">
            {/* <FileText className="h-5 w-5 mr-2 text-blue-500" /> */}
            Additional Notes
          </div>
        </legend>
        
        <div className="space-y-4">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes || ''}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2"
            placeholder="Add any additional information about this document"
            disabled={isSubmitting}
          />
        </div>
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
          {isSubmitting ? 'Uploading...' : 'Upload Document'}
        </button>
      </div>
    </form>
  );
};

export default AccessibleDocumentUploadForm;
