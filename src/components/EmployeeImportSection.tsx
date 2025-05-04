import React, { useState } from 'react';
import EmployeeExcelImport from './EmployeeExcelImport';
import ImportResultsDisplay from './ImportResultsDisplay';

interface ImportResult {
  successCount: number;
  errorCount: number;
  errors: string[];
  importedEmployees: any[];
}

interface EmployeeImportSectionProps {
  onImportComplete: (employees: any[]) => Promise<void>;
  onClose: () => void;
}

const EmployeeImportSection: React.FC<EmployeeImportSectionProps> = ({
  onImportComplete,
  onClose
}) => {
  const [importResults, setImportResults] = useState<ImportResult | null>(null);

  const handleImportComplete = async (result: ImportResult) => {
    setImportResults(result);
    
    // Call the parent's onImportComplete with the imported employees
    if (result.importedEmployees && result.importedEmployees.length > 0) {
      await onImportComplete(result.importedEmployees);
    }
  };

  const handleCloseResults = () => {
    setImportResults(null);
  };

  return (
    <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Employee Import</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">Close</span>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {importResults ? (
        <ImportResultsDisplay 
          results={importResults} 
          onClose={handleCloseResults} 
        />
      ) : (
        <EmployeeExcelImport onImportComplete={handleImportComplete} />
      )}
    </div>
  );
};

export default EmployeeImportSection;
