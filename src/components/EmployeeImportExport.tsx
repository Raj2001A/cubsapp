import React, { useState } from 'react';
import { companies } from '../data/companies';

interface EmployeeImportExportProps {
  onImport: (employees: any[]) => void;
  onExport: () => void;
  employeeCount: number;
}

const EmployeeImportExport: React.FC<EmployeeImportExportProps> = ({
  onImport,
  onExport,
  employeeCount
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [showImportHelp, setShowImportHelp] = useState(false);

  // Handle file selection for import
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportFile(file);
    setImportError(null);
    setImportPreview(null);
    
    if (file) {
      // Check file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        setImportError('Please select a CSV or Excel file');
        return;
      }
      
      // For CSV files, show preview
      if (file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const csvData = event.target?.result as string;
            const lines = csvData.split('\n');
            const headers = lines[0].split(',').map(header => header.trim());
            
            const previewData = [];
            for (let i = 1; i < Math.min(6, lines.length); i++) {
              if (lines[i].trim() === '') continue;
              
              const values = lines[i].split(',').map(value => value.trim());
              const row: Record<string, string> = {};
              
              headers.forEach((header, index) => {
                row[header] = values[index] || '';
              });
              
              previewData.push(row);
            }
            
            setImportPreview(previewData);
          } catch (error) {
            setImportError('Error parsing CSV file. Please check the format.');
          }
        };
        reader.readAsText(file);
      }
    }
  };

  // Handle import
  const handleImport = () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }
    
    setIsImporting(true);
    
    // In a real app, this would parse the file and import the data
    // For this demo, we'll simulate the import process
    setTimeout(() => {
      try {
        // Simulate importing data
        const mockImportedData = [
          { 
            id: 'imported-1',
            employeeId: 'EMP101', 
            name: 'John Smith', 
            trade: 'Carpenter', 
            nationality: 'British',
            joinDate: '2023-01-15',
            dateOfBirth: '1985-06-22',
            mobileNumber: '+971501234567',
            homePhoneNumber: '+971561234567',
            email: 'john.smith@example.com',
            companyId: '1',
            companyName: companies[0].name,
            department: 'Construction',
            position: 'Senior Carpenter',
            visaStatus: 'active',
            visaExpiryDate: '2025-01-15',
            documents: []
          },
          { 
            id: 'imported-2',
            employeeId: 'EMP102', 
            name: 'Sara Ahmed', 
            trade: 'Electrician', 
            nationality: 'Egyptian',
            joinDate: '2023-02-20',
            dateOfBirth: '1990-03-15',
            mobileNumber: '+971502345678',
            homePhoneNumber: '+971562345678',
            email: 'sara.ahmed@example.com',
            companyId: '2',
            companyName: companies[1].name,
            department: 'Electrical',
            position: 'Electrician',
            visaStatus: 'active',
            visaExpiryDate: '2025-02-20',
            documents: []
          },
          { 
            id: 'imported-3',
            employeeId: 'EMP103', 
            name: 'Raj Kumar', 
            trade: 'Plumber', 
            nationality: 'Indian',
            joinDate: '2023-03-10',
            dateOfBirth: '1988-11-05',
            mobileNumber: '+971503456789',
            homePhoneNumber: '',
            email: 'raj.kumar@example.com',
            companyId: '3',
            companyName: companies[2].name,
            department: 'Plumbing',
            position: 'Plumber',
            visaStatus: 'expiring',
            visaExpiryDate: '2024-04-10',
            documents: []
          }
        ];
        
        onImport(mockImportedData);
        alert(`Successfully imported ${mockImportedData.length} employees`);
        setImportFile(null);
        setImportPreview(null);
      } catch (error) {
        setImportError('Error importing data. Please check the file format.');
      } finally {
        setIsImporting(false);
      }
    }, 1500);
  };

  // Handle export
  const handleExport = () => {
    // In a real app, this would export the data to a file
    onExport();
    
    // Create a mock CSV file and trigger download
    const mockCsvContent = 'employeeId,name,trade,nationality,joinDate,dateOfBirth,mobileNumber,homePhoneNumber,email,companyId,companyName,department,position,visaStatus,visaExpiryDate\nEMP001,Lacey Smith,Carpenter,Egyptian,2024-11-24,1981-11-01,+971596608849,+971587701057,lacey.smith@cubstechcontracting.ae,1,"CUBS TECH CONTRACTING, SHARJAH, UAE",Construction,Senior Carpenter,active,2025-03-20\nEMP002,Ahmed Hassan,Electrician,Indian,2023-05-15,1985-07-22,+971501234567,+971561234567,ahmed.hassan@goldencubs.ae,2,"GOLDENCUBS GENERAL CONTRACTING LLC, ABUDHABI, UAE",Electrical,Lead Electrician,expiring,2024-04-15\nEMP003,Raj Patel,Plumber,Pakistani,2022-08-10,1979-03-15,+971529876543,+971549876543,raj.patel@alashbal.ae,3,"AL ASHBAL ELECTROMECHANICAL CONTRACTING LLC, AJMAN, UAE",Plumbing,Plumbing Supervisor,expired,2024-01-10';
    
    const blob = new Blob([mockCsvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate sample CSV template
  const handleDownloadTemplate = () => {
    const templateContent = 'employeeId,name,trade,nationality,joinDate,dateOfBirth,mobileNumber,homePhoneNumber,email,companyId,companyName,department,position,visaStatus,visaExpiryDate\nEMP101,John Smith,Carpenter,British,2023-01-15,1985-06-22,+971501234567,+971561234567,john.smith@example.com,1,"CUBS TECH CONTRACTING, SHARJAH, UAE",Construction,Senior Carpenter,active,2025-01-15\nEMP102,Sara Ahmed,Electrician,Egyptian,2023-02-20,1990-03-15,+971502345678,+971562345678,sara.ahmed@example.com,2,"GOLDENCUBS GENERAL CONTRACTING LLC, ABUDHABI, UAE",Electrical,Electrician,active,2025-02-20';
    
    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employee_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      borderRadius: '8px', 
      padding: '20px', 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>Database Import/Export</h3>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleExport}
            style={{
              backgroundColor: '#e3f2fd',
              color: '#1976d2',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Export All ({employeeCount})</span>
          </button>
          
          <button
            onClick={handleDownloadTemplate}
            style={{
              backgroundColor: '#f5f5f5',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Download Template
          </button>
          
          <button
            onClick={() => setShowImportHelp(!showImportHelp)}
            style={{
              backgroundColor: 'transparent',
              color: '#666',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showImportHelp ? 'Hide Help' : 'Show Help'}
          </button>
        </div>
      </div>
      
      {showImportHelp && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f9fafb', 
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '0.875rem',
          color: '#666'
        }}>
          <h4 style={{ margin: '0 0 8px', color: '#333' }}>Import Instructions</h4>
          <p style={{ margin: '0 0 8px' }}>
            To import employees, prepare a CSV file with the following columns:
          </p>
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '8px', 
            borderRadius: '4px', 
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            overflowX: 'auto',
            marginBottom: '8px'
          }}>
            employeeId, name, trade, nationality, joinDate, dateOfBirth, mobileNumber, homePhoneNumber, email, companyId, companyName, department, position, visaStatus, visaExpiryDate
          </div>
          <ul style={{ margin: '0 0 8px', paddingLeft: '20px' }}>
            <li><strong>Required fields:</strong> employeeId, name, email, companyId, companyName</li>
            <li><strong>Date format:</strong> YYYY-MM-DD (e.g., 2023-05-15)</li>
            <li><strong>Visa status values:</strong> active, expiring, expired</li>
            <li><strong>Company IDs:</strong> 1-10 (see company list)</li>
          </ul>
          <p style={{ margin: '8px 0 0' }}>
            Download the template for a properly formatted example.
          </p>
        </div>
      )}
      
      <div style={{ 
        padding: '16px', 
        backgroundColor: '#f9fafb', 
        borderRadius: '4px',
        border: '1px dashed #ddd',
        marginBottom: '16px'
      }}>
        <input
          type="file"
          onChange={handleImportFileChange}
          accept=".csv,.xlsx"
          style={{ display: 'none' }}
          id="employee-import-file"
          disabled={isImporting}
        />
        <label
          htmlFor="employee-import-file"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            border: '1px dashed #ccc',
            borderRadius: '4px',
            cursor: isImporting ? 'not-allowed' : 'pointer'
          }}
        >
          {importFile ? (
            <div>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>{importFile.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {(importFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                Click to select a CSV or Excel file
              </div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                or drag and drop file here
              </div>
            </div>
          )}
        </label>
      </div>
      
      {importError && (
        <div style={{ 
          padding: '12px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {importError}
        </div>
      )}
      
      {importPreview && importPreview.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ fontSize: '1rem', color: '#333', marginBottom: '8px' }}>Preview</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  {Object.keys(importPreview[0]).map(header => (
                    <th key={header} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: '500', color: '#6b7280' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importPreview.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {Object.values(row).map((value, i) => (
                      <td key={i} style={{ padding: '8px 12px' }}>
                        {value as string}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '8px' }}>
            Showing {importPreview.length} of {importFile?.name.endsWith('.csv') ? 'total' : 'first sheet'} rows
          </p>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleImport}
          disabled={!importFile || isImporting}
          style={{
            backgroundColor: !importFile || isImporting ? '#f5f5f5' : '#4CAF50',
            color: !importFile || isImporting ? '#bdbdbd' : 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 16px',
            cursor: !importFile || isImporting ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          {isImporting ? 'Importing...' : 'Import Employees'}
        </button>
      </div>
    </div>
  );
};

export default EmployeeImportExport;
