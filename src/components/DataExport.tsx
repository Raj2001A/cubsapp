import React, { useState } from 'react';

interface DataExportProps {
  onExport: (options: ExportOptions) => void;
  employeeCount: number;
  isFiltered: boolean;
}

export interface ExportOptions {
  dataType: 'all_employees' | 'filtered_employees' | 'visa_expiry';
  format: 'csv' | 'excel' | 'pdf';
  includeFields: string[];
}

const DataExport: React.FC<DataExportProps> = ({ 
  onExport, 
  employeeCount,
  isFiltered
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    dataType: 'all_employees',
    format: 'csv',
    includeFields: ['employeeId', 'name', 'trade', 'nationality', 'companyName', 'joinDate', 'visaStatus', 'visaExpiryDate']
  });

  // Available fields for export
  const availableFields = [
    { id: 'employeeId', label: 'Employee ID' },
    { id: 'name', label: 'Name' },
    { id: 'trade', label: 'Trade' },
    { id: 'nationality', label: 'Nationality' },
    { id: 'companyName', label: 'Company' },
    { id: 'joinDate', label: 'Join Date' },
    { id: 'dateOfBirth', label: 'Date of Birth' },
    { id: 'visaStatus', label: 'Visa Status' },
    { id: 'visaExpiryDate', label: 'Visa Expiry Date' },
    { id: 'email', label: 'Email' },
    { id: 'mobileNumber', label: 'Mobile Number' },
    { id: 'homePhoneNumber', label: 'Home Phone' },
    { id: 'department', label: 'Department' },
    { id: 'position', label: 'Position' }
  ];

  // Handle option change
  const handleOptionChange = (field: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [field]: value }));
  };

  // Handle field toggle
  const handleFieldToggle = (fieldId: string) => {
    setExportOptions(prev => {
      const includeFields = [...prev.includeFields];
      
      if (includeFields.includes(fieldId)) {
        // Remove field if already included
        return { ...prev, includeFields: includeFields.filter(id => id !== fieldId) };
      } else {
        // Add field if not included
        return { ...prev, includeFields: [...includeFields, fieldId] };
      }
    });
  };

  // Handle export
  const handleExport = () => {
    onExport(exportOptions);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <h3 style={{ margin: '0 0 16px', color: '#333' }}>Export Employee Data</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
            Data to Export
          </label>
          <select
            value={exportOptions.dataType}
            onChange={(e) => handleOptionChange('dataType', e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="all_employees">All Employees ({employeeCount})</option>
            {isFiltered && (
              <option value="filtered_employees">Current Filtered Employees</option>
            )}
            <option value="visa_expiry">Visa Expiry Report</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
            Export Format
          </label>
          <select
            value={exportOptions.format}
            onChange={(e) => handleOptionChange('format', e.target.value as 'csv' | 'excel' | 'pdf')}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#555' }}>
          Fields to Include
        </label>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '8px'
        }}>
          {availableFields.map(field => (
            <label 
              key={field.id}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                fontSize: '14px',
                padding: '4px',
                borderRadius: '4px',
                backgroundColor: exportOptions.includeFields.includes(field.id) ? '#f1f8e9' : 'transparent'
              }}
            >
              <input
                type="checkbox"
                checked={exportOptions.includeFields.includes(field.id)}
                onChange={() => handleFieldToggle(field.id)}
                style={{ marginRight: '8px' }}
              />
              {field.label}
            </label>
          ))}
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#f9fafb', 
        padding: '12px', 
        borderRadius: '4px',
        marginBottom: '20px',
        fontSize: '0.875rem',
        color: '#666'
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Export Preview:</p>
        <p style={{ margin: 0 }}>
          {exportOptions.dataType === 'all_employees' && `All ${employeeCount} employees`}
          {exportOptions.dataType === 'filtered_employees' && 'Currently filtered employees'}
          {exportOptions.dataType === 'visa_expiry' && 'Employees with visa expiry information'}
          {' will be exported as '}
          {exportOptions.format.toUpperCase()}
          {' with '}
          {exportOptions.includeFields.length}
          {' selected fields.'}
        </p>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleExport}
          disabled={exportOptions.includeFields.length === 0}
          style={{
            backgroundColor: exportOptions.includeFields.length === 0 ? '#f5f5f5' : '#4CAF50',
            color: exportOptions.includeFields.length === 0 ? '#bdbdbd' : 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: exportOptions.includeFields.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Export Data
        </button>
      </div>
    </div>
  );
};

export default DataExport;
