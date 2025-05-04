import React, { useState, useRef } from 'react';
import api from '../services/api';

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  importedEmployees: any[];
}

interface EmployeeExcelImportProps {
  onImportComplete: (result: ImportResult) => void;
}

const EmployeeExcelImport: React.FC<EmployeeExcelImportProps> = ({ onImportComplete }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);

    if (selectedFile) {
      // Validate file type
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setError('Please select an Excel file (.xlsx or .xls)');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Support both possible response shapes: array or object with data
      let response = await api.import.importEmployees(formData);
      let importedEmployees: any[] = [];
      if (Array.isArray(response)) {
        importedEmployees = response;
      }

      // Simulate a result structure as expected by onImportComplete
      if (importedEmployees.length > 0) {
        onImportComplete({
          successCount: importedEmployees.length,
          errorCount: 0,
          errors: [],
          importedEmployees
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError('No employees imported. Please check the file format.');
      }
      return;
    } catch (err) {
      console.error('Import error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during import');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      // Use the API service to get the template
      const response = await api.import.getTemplate();

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Template download error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while downloading the template');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Import Employees from Excel</h2>

      <div className="mb-4">
        <p className="text-gray-600 mb-2">
          Upload an Excel file (.xlsx or .xls) containing employee data.
        </p>
        <button
          onClick={handleDownloadTemplate}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          disabled={isUploading}
        >
          Download template
        </button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4 text-center">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".xlsx,.xls"
          className="hidden"
          id="excel-file-input"
          disabled={isUploading}
        />

        <label
          htmlFor="excel-file-input"
          className={`block cursor-pointer ${isUploading ? 'opacity-50' : ''}`}
        >
          {file ? (
            <div>
              <div className="font-medium mb-1">{file.name}</div>
              <div className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          ) : (
            <div>
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-1 text-sm text-gray-500">
                Click to select an Excel file or drag and drop
              </p>
            </div>
          )}
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {isUploading && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleImport}
          disabled={!file || isUploading}
          className={`px-4 py-2 rounded-md text-white font-medium ${
            !file || isUploading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {isUploading ? 'Importing...' : 'Import Employees'}
        </button>
      </div>
    </div>
  );
};

export default EmployeeExcelImport;
