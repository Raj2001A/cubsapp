import React, { useState, useRef } from 'react';

interface ImportExportDataProps {
  onImport: (data: any, type: 'employees' | 'documents') => void;
  onExport: (type: 'employees' | 'documents', format: 'csv' | 'json' | 'excel') => void;
  employeeCount: number;
  documentCount: number;
}

const ImportExportData: React.FC<ImportExportDataProps> = ({
  onImport,
  onExport,
  employeeCount,
  documentCount
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('export');
  const [dataType, setDataType] = useState<'employees' | 'documents'>('employees');
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [importFormat, setImportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImportError(null);
    setImportSuccess(null);
    setIsLoading(true);
    
    // Check file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = {
      csv: ['csv'],
      json: ['json'],
      excel: ['xlsx', 'xls']
    };
    
    if (!validExtensions[importFormat].includes(fileExtension || '')) {
      setImportError(`Invalid file format. Please select a ${importFormat.toUpperCase()} file.`);
      setIsLoading(false);
      return;
    }
    
    // Read file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        let data;
        
        if (importFormat === 'json') {
          data = JSON.parse(event.target?.result as string);
        } else {
          // For CSV and Excel, we'd normally use a library to parse
          // For this mock, we'll just pass the raw content
          data = event.target?.result;
        }
        
        // Simulate processing delay
        setTimeout(() => {
          onImport(data, dataType);
          setImportSuccess(`Successfully imported ${dataType} data.`);
          setIsLoading(false);
          
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }, 1500);
      } catch (error) {
        setImportError(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };
    
    reader.onerror = () => {
      setImportError('Error reading file.');
      setIsLoading(false);
    };
    
    if (importFormat === 'json' || importFormat === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };
  
  // Handle export
  const handleExport = () => {
    setIsLoading(true);
    
    // Simulate export delay
    setTimeout(() => {
      onExport(dataType, exportFormat);
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ margin: '0 0 16px', color: '#333' }}>Import/Export Data</h2>
      
      {/* Tabs */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('export')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'export' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'export' ? '#1976d2' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'export' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'export' ? '500' : 'normal'
          }}
        >
          Export Data
        </button>
        <button
          onClick={() => setActiveTab('import')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'import' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'import' ? '#1976d2' : '#6b7280',
            border: 'none',
            borderBottom: activeTab === 'import' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'import' ? '500' : 'normal'
          }}
        >
          Import Data
        </button>
      </div>
      
      {/* Export Tab */}
      {activeTab === 'export' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
              Data to Export
            </label>
            <div style={{ 
              display: 'flex',
              gap: '12px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="exportDataType"
                  checked={dataType === 'employees'}
                  onChange={() => setDataType('employees')}
                  style={{ marginRight: '8px' }}
                />
                Employees ({employeeCount})
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="exportDataType"
                  checked={dataType === 'documents'}
                  onChange={() => setDataType('documents')}
                  style={{ marginRight: '8px' }}
                />
                Documents ({documentCount})
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
              Export Format
            </label>
            <div style={{ 
              display: 'flex',
              gap: '12px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  style={{ marginRight: '8px' }}
                />
                CSV
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  style={{ marginRight: '8px' }}
                />
                JSON
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="exportFormat"
                  checked={exportFormat === 'excel'}
                  onChange={() => setExportFormat('excel')}
                  style={{ marginRight: '8px' }}
                />
                Excel
              </label>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.875rem',
            color: '#4b5563'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Export Information:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>This will export all {dataType} data in {exportFormat.toUpperCase()} format.</li>
              <li>Sensitive information will be properly encrypted.</li>
              <li>Large exports may take a few moments to generate.</li>
            </ul>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleExport}
              disabled={isLoading}
              style={{
                backgroundColor: isLoading ? '#d1d5db' : '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {isLoading ? 'Exporting...' : 'Export Data'}
              {!isLoading && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Import Tab */}
      {activeTab === 'import' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
              Data to Import
            </label>
            <div style={{ 
              display: 'flex',
              gap: '12px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="importDataType"
                  checked={dataType === 'employees'}
                  onChange={() => setDataType('employees')}
                  style={{ marginRight: '8px' }}
                />
                Employees
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="importDataType"
                  checked={dataType === 'documents'}
                  onChange={() => setDataType('documents')}
                  style={{ marginRight: '8px' }}
                />
                Documents
              </label>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', color: '#4b5563', marginBottom: '8px', fontWeight: '500' }}>
              Import Format
            </label>
            <div style={{ 
              display: 'flex',
              gap: '12px'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="importFormat"
                  checked={importFormat === 'csv'}
                  onChange={() => setImportFormat('csv')}
                  style={{ marginRight: '8px' }}
                />
                CSV
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="importFormat"
                  checked={importFormat === 'json'}
                  onChange={() => setImportFormat('json')}
                  style={{ marginRight: '8px' }}
                />
                JSON
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}>
                <input
                  type="radio"
                  name="importFormat"
                  checked={importFormat === 'excel'}
                  onChange={() => setImportFormat('excel')}
                  style={{ marginRight: '8px' }}
                />
                Excel
              </label>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: '#f9fafb',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '0.875rem',
            color: '#4b5563'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Import Guidelines:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>File must be in {importFormat.toUpperCase()} format.</li>
              <li>Required fields for employees: ID, Name, Trade, Company ID.</li>
              <li>Required fields for documents: Name, Type, Employee ID.</li>
              <li>Maximum file size: 10MB.</li>
              <li>
                <a 
                  href="#" 
                  style={{ color: '#1976d2', textDecoration: 'none' }}
                  onClick={(e) => {
                    e.preventDefault();
                    // In a real app, this would download a template
                    alert(`Template for ${dataType} in ${importFormat.toUpperCase()} format would be downloaded.`);
                  }}
                >
                  Download template
                </a>
              </li>
            </ul>
          </div>
          
          {/* File Upload */}
          <div style={{ marginBottom: '20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={
                importFormat === 'csv' ? '.csv' :
                importFormat === 'json' ? '.json' :
                '.xlsx,.xls'
              }
              style={{ display: 'none' }}
              disabled={isLoading}
            />
            
            <div
              onClick={() => !isLoading && fileInputRef.current?.click()}
              style={{
                border: '2px dashed #d1d5db',
                borderRadius: '8px',
                padding: '30px 20px',
                textAlign: 'center',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <div style={{ marginBottom: '12px', color: '#6b7280' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto' }}>
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" fill="currentColor" />
                </svg>
              </div>
              <p style={{ margin: '0 0 8px', color: '#4b5563', fontWeight: '500' }}>
                {isLoading ? 'Uploading...' : 'Click to select file or drag and drop'}
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                {importFormat.toUpperCase()} file (Max. 10MB)
              </p>
            </div>
          </div>
          
          {/* Error/Success Messages */}
          {importError && (
            <div style={{ 
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '0.875rem'
            }}>
              {importError}
            </div>
          )}
          
          {importSuccess && (
            <div style={{ 
              backgroundColor: '#d1fae5',
              color: '#047857',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              fontSize: '0.875rem'
            }}>
              {importSuccess}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportExportData;
