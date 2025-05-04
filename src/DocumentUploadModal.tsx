import React, { useState } from 'react';

// Document types based on requirements
const DOCUMENT_TYPES = [
  { id: 'visa_copy', label: 'Visa Copy (requires expiry date)' },
  { id: 'passport', label: 'Passport Copy' },
  { id: 'emirates_id', label: 'Emirates ID' },
  { id: 'labour_card', label: 'Labour Card' },
  { id: 'medical_insurance', label: 'Medical Insurance' },
  { id: 'workmen_compensation', label: 'Workmen Compensation' },
  { id: 'iloe', label: 'ILOE' },
  { id: 'cicpa', label: 'CICPA' },
  { id: 'temporary_work_permit', label: 'Temporary Work Permit' },
  { id: 'driving_license', label: 'Driving License' },
  { id: 'other', label: 'Other Certificates' }
];

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
  employeeName?: string;
  employees?: Array<{ id: string; name: string }>;
  onUpload: (documentData: {
    documentType: string;
    expiryDate?: string;
    file: File;
    notes?: string;
    employeeId?: string;
    employeeName?: string;
  }) => void;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  employees = [],
  onUpload
}) => {
  const [documentType, setDocumentType] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId || '');

  // Check if document type requires expiry date - only visa documents require expiry date
  const requiresExpiryDate = ['visa_copy'].includes(documentType);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate form
    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (requiresExpiryDate && !expiryDate) {
      setError('Please enter an expiry date for this document type');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      setError(`File size exceeds the maximum limit of 10MB. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF, JPG, PNG, DOC, or DOCX file.');
      return;
    }

    setIsSubmitting(true);

    // Simulate upload process
    setTimeout(() => {
      try {
        // Get document type label for display
        const docTypeLabel = DOCUMENT_TYPES.find(type => type.id === documentType)?.label || documentType;

        // Log upload details
        console.log('Uploading document:', {
          type: docTypeLabel,
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(2)} KB`,
          fileType: file.type,
          expiryDate: expiryDate || 'N/A',
          employeeId: employeeId || 'N/A',
          employeeName: employeeName || 'N/A'
        });

        // Get the employee name if an employee is selected
        let selectedEmployeeName = employeeName;
        if (!selectedEmployeeName && selectedEmployeeId) {
          const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
          selectedEmployeeName = selectedEmployee?.name;
        }

        onUpload({
          documentType,
          expiryDate: expiryDate || undefined,
          file,
          notes: notes || undefined,
          employeeId: selectedEmployeeId || employeeId,
          employeeName: selectedEmployeeName
        });

        // Show success message
        alert(`Document "${docTypeLabel}" uploaded successfully!`);

        // Reset form and close modal
        setDocumentType('');
        setExpiryDate('');
        setFile(null);
        setNotes('');
        setError(null);
        onClose();
      } catch (err) {
        setError('Failed to upload document. Please try again.');
        console.error('Upload error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }, 1500);
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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>Upload Document</h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#666'
            }}
          >
            ×
          </button>
        </div>

        {employees.length > 0 && !employeeId ? (
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="employeeId"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              Select Employee*
            </label>
            <select
              id="employeeId"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
              disabled={isSubmitting}
              required
            >
              <option value="">Select an Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
        ) : employeeName ? (
          <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '4px' }}>
            <p style={{ margin: 0, color: '#666' }}>
              Uploading document for: <strong>{employeeName}</strong>
            </p>
          </div>
        ) : null}

        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '10px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="documentType"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              Document Type*
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                backgroundColor: 'white'
              }}
              disabled={isSubmitting}
              required
            >
              <option value="">Select Document Type</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="expiryDate"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              {requiresExpiryDate ? 'Expiry Date*' : 'Expiry Date (optional)'}
            </label>
            <input
              id="expiryDate"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              disabled={isSubmitting}
              required={requiresExpiryDate}
              min={new Date().toISOString().split('T')[0]} // Set min date to today
            />
            {requiresExpiryDate && (
              <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#666' }}>
                Visa documents require an expiry date
              </p>
            )}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label
              htmlFor="file"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              File*
            </label>
            <input
              id="file"
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px'
              }}
              disabled={isSubmitting}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              required
            />
            <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#666' }}>
              Accepted formats: PDF, JPG, PNG, DOC, DOCX
            </p>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="notes"
              style={{
                display: 'block',
                marginBottom: '5px',
                fontWeight: 'bold',
                color: '#555'
              }}
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '16px',
                minHeight: '80px',
                resize: 'vertical'
              }}
              disabled={isSubmitting}
              placeholder="Add any additional notes about this document"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 15px',
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
                padding: '10px 15px',
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
              {isSubmitting ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
