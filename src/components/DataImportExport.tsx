import React, { useState } from 'react';
import { useUI } from '../context/UIContext';
import { OperationType } from '../types/ui';
import { ErrorSeverity } from '../types/ui';
import api from '../services/api';

interface DataImportExportProps {
  onImport: (data: any[]) => void;
  onExport: () => void;
  onBackup: () => void;
  onRestore: (data: any) => void;
}

const DataImportExport: React.FC<DataImportExportProps> = ({
  onImport,
  onExport,
  onBackup,
  onRestore
}) => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup'>('import');
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Get UI context for loading and error handling
  const { setLoading, addError } = useUI();

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

  // Handle file selection for restore
  const handleRestoreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setRestoreFile(file);
    setRestoreError(null);

    if (file) {
      // Check file type
      if (!file.name.endsWith('.json')) {
        setRestoreError('Please select a JSON backup file');
      }
    }
  };

  // Handle import
  const handleImport = async () => {
    if (!importFile) {
      setImportError('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setLoading(OperationType.GENERAL, true);

    try {
      // Create a FormData object to send the file
      const formData = new FormData();
      formData.append('file', importFile);

      // Call the API to import the data using safeHandleResponse
      const response = await api.import.importEmployees(formData);

      if (response && (response as any).success && typeof (response as any).imported === 'number') {
        onImport([]); // You may want to refetch or update imported data here
        alert(`Successfully imported ${response.imported} employees`);
        setImportFile(null);
        setImportPreview(null);
      } else {
        throw new Error('No data returned from import');
      }
    } catch (error: any) {
      console.error('Error importing data:', error);
      setImportError(error.message || 'Error importing data. Please check the file format.');
      addError('Import Failed', ErrorSeverity.ERROR, OperationType.GENERAL, error.message || 'Failed to import employee data');
    } finally {
      setIsImporting(false);
      setLoading(OperationType.GENERAL, false);
    }
  };

  // Handle export
  const handleExport = async () => {
    onExport();
    setLoading(OperationType.GENERAL, true);
    try {
      // Call the API to export the data using safeHandleResponse
      const response = await api.import.exportEmployees('csv');
      // Support both possible response shapes: { blob } and { success, data }
      let blob: Blob | null = null;
      if (response && typeof (response as any).blob === 'function') {
        blob = await (response as any).blob();
      } else if (response && (response as any).success && typeof (response as any).data === 'string') {
        blob = new Blob([(response as any).data], { type: 'text/csv' });
      }
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `employee_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error('No data returned from export');
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      addError('Export Failed', ErrorSeverity.ERROR, OperationType.GENERAL, error.message || 'Failed to export employee data');
    } finally {
      setLoading(OperationType.GENERAL, false);
    }
  };

  // Handle backup
  const handleBackup = async () => {
    onBackup();
    try {
      setLoading(OperationType.GENERAL, true);
      // Get the actual data from the API using safeHandleResponse
      const employeesResponse = await api.employees.getAll();
      let employees: any[] = [];
      if (Array.isArray(employeesResponse)) {
        employees = employeesResponse;
      } else if (employeesResponse && Array.isArray((employeesResponse as any).data)) {
        employees = (employeesResponse as any).data;
      }
      setLoading(OperationType.GENERAL, false);
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        employees,
        settings: {
          notificationEnabled: true,
          companyInfo: { name: 'CUBS TECH', address: 'Sharjah, UAE' }
        }
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Error creating backup:', error);
      addError('Backup Failed', ErrorSeverity.ERROR, OperationType.GENERAL, error.message || 'Failed to create backup file');
      setLoading(OperationType.GENERAL, false);
    }
  };

  // Handle restore
  const handleRestore = async () => {
    if (!restoreFile) {
      setRestoreError('Please select a backup file to restore');
      return;
    }

    setIsRestoring(true);
    setLoading(OperationType.GENERAL, true);

    try {
      // Read the file content
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = (error) => reject(error);
        reader.readAsText(restoreFile);
      });

      // Parse the backup data
      const backupData = JSON.parse(fileContent);

      // Validate backup data
      if (!backupData.timestamp || !backupData.employees) {
        throw new Error('Invalid backup file format');
      }

      // Simulate a successful restore
      onRestore(backupData);
      alert(`Successfully restored backup from ${new Date(backupData.timestamp).toLocaleString()}`);
      setRestoreFile(null);
    } catch (error) {
      console.error('Error restoring backup:', error);
      setRestoreError('Error parsing backup file. Please check the format.');
      addError('Restore Failed', ErrorSeverity.ERROR, OperationType.GENERAL, 'Failed to restore backup');
    } finally {
      setIsRestoring(false);
      setLoading(OperationType.GENERAL, false);
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Data Management</h2>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid #eee',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setActiveTab('import')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'import' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'import' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'import' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'import' ? '500' : 'normal'
          }}
        >
          Import Employees
        </button>
        <button
          onClick={() => setActiveTab('export')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'export' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'export' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'export' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'export' ? '500' : 'normal'
          }}
        >
          Export Data
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'backup' ? '#e3f2fd' : 'transparent',
            color: activeTab === 'backup' ? '#1976d2' : '#666',
            border: 'none',
            borderBottom: activeTab === 'backup' ? '2px solid #1976d2' : 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'backup' ? '500' : 'normal'
          }}
        >
          Backup & Restore
        </button>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Import employees from a CSV or Excel file. The file should have the following columns:
            employeeId, name, trade, nationality, joinDate, dateOfBirth, mobileNumber, email, companyId.
          </p>

          <div style={{
            padding: '20px',
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
              id="import-file-input"
              disabled={isImporting}
            />
            <label
              htmlFor="import-file-input"
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
              <h3 style={{ fontSize: '1rem', color: '#333', marginBottom: '8px' }}>Preview</h3>
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

          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#e8f5e9',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: '#2e7d32'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Tips:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Make sure your CSV file is properly formatted with headers</li>
              <li>Required fields: employeeId, name, trade, nationality, email</li>
              <li>Dates should be in YYYY-MM-DD format</li>
              <li>For company assignment, use the company ID</li>
            </ul>
          </div>
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Export employee data and reports to various formats. Choose what data you want to export and the format.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: '#333', marginBottom: '12px' }}>Export Options</h3>

            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #eee',
              marginBottom: '16px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>
                  Data to Export
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="all_employees">All Employees</option>
                  <option value="filtered_employees">Current Filtered Employees</option>
                  <option value="documents">Employee Documents</option>
                  <option value="visa_expiry">Visa Expiry Report</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>
                  Export Format
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    backgroundColor: 'white',
                    fontSize: '14px'
                  }}
                >
                  <option value="csv">CSV</option>
                  <option value="excel">Excel</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#555' }}>
                  Include Fields
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Employee ID
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Name
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Trade
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Nationality
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Company
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Join Date
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Visa Status
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" checked style={{ marginRight: '6px' }} />
                    Visa Expiry
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                    <input type="checkbox" style={{ marginRight: '6px' }} />
                    Contact Info
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleExport}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Export Data
            </button>
          </div>
        </div>
      )}

      {/* Backup & Restore Tab */}
      {activeTab === 'backup' && (
        <div>
          <p style={{ marginBottom: '16px', color: '#666' }}>
            Create backups of your system data or restore from a previous backup.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Backup Section */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #eee'
            }}>
              <h3 style={{ fontSize: '1rem', color: '#333', marginBottom: '12px' }}>Create Backup</h3>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '16px' }}>
                Create a complete backup of all system data including employees, documents, and settings.
              </p>
              <button
                onClick={handleBackup}
                style={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  width: '100%'
                }}
              >
                Create Backup
              </button>
            </div>

            {/* Restore Section */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #eee'
            }}>
              <h3 style={{ fontSize: '1rem', color: '#333', marginBottom: '12px' }}>Restore from Backup</h3>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '16px' }}>
                Restore system data from a previous backup file.
              </p>

              <input
                type="file"
                onChange={handleRestoreFileChange}
                accept=".json"
                style={{ display: 'none' }}
                id="restore-file-input"
                disabled={isRestoring}
              />
              <label
                htmlFor="restore-file-input"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '10px',
                  backgroundColor: '#f5f5f5',
                  border: '1px dashed #ccc',
                  borderRadius: '4px',
                  cursor: isRestoring ? 'not-allowed' : 'pointer',
                  marginBottom: '12px'
                }}
              >
                {restoreFile ? (
                  <div style={{ fontSize: '0.875rem' }}>
                    {restoreFile.name} ({(restoreFile.size / 1024).toFixed(2)} KB)
                  </div>
                ) : (
                  <div style={{ fontSize: '0.875rem' }}>
                    Select backup file
                  </div>
                )}
              </label>

              {restoreError && (
                <div style={{
                  padding: '8px',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  marginBottom: '12px'
                }}>
                  {restoreError}
                </div>
              )}

              <button
                onClick={handleRestore}
                disabled={!restoreFile || isRestoring}
                style={{
                  backgroundColor: !restoreFile || isRestoring ? '#f5f5f5' : '#ff9800',
                  color: !restoreFile || isRestoring ? '#bdbdbd' : 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 16px',
                  cursor: !restoreFile || isRestoring ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  width: '100%'
                }}
              >
                {isRestoring ? 'Restoring...' : 'Restore System'}
              </button>
            </div>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#fff3e0',
            borderRadius: '4px',
            fontSize: '0.875rem',
            color: '#e65100'
          }}>
            <p style={{ margin: '0 0 8px', fontWeight: '500' }}>Warning:</p>
            <p style={{ margin: 0 }}>
              Restoring from a backup will replace all current data. This action cannot be undone.
              Make sure to create a backup of your current data before restoring.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataImportExport;
