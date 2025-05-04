import { useState } from 'react';
import { useEmployees } from './useEmployees';
import type { Employee, Document } from '../types/employee';

export function useDocuments(employeeId: string): {
  documents: Document[];
  uploadDocument: () => void;
  downloadDocument: (url?: string) => void;
  uploading: boolean;
  progress: number;
} {
  // Demo/mock: get employee docs from useEmployees
  const { data: employees = [] } = useEmployees();
  const employee = (employees as Employee[]).find((e: Employee) => e.id === employeeId);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const documents: Document[] = Array.isArray(employee?.documents) ? employee.documents : [];

  function uploadDocument(): void {
    setUploading(true);
    setProgress(0);
    // Simulate upload
    setTimeout(() => {
      setProgress(100);
      setUploading(false);
    }, 1000);
  }

  function downloadDocument(url?: string): void {
    if (url) window.open(url, '_blank');
  }

  return { documents, uploadDocument, downloadDocument, uploading, progress };
}
