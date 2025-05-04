import { Document } from './types/document';

declare global {
  interface Window {
    documentContextActions?: {
      setDocumentsFromEmployees: (documents: Document[]) => void;
    };
  }
}
