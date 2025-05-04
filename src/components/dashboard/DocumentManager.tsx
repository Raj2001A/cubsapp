import React from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { Box, Button, Table, Tbody, Td, Th, Thead, Tr, Input, Spinner } from '@chakra-ui/react';

interface DocumentManagerProps {
  employeeId: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({ employeeId }) => {
  const { documents, uploadDocument, uploading, downloadDocument } = useDocuments(employeeId);

  if (!documents) return <Spinner />;

  return (
    <Box p={4} bg="background" minH="screen" className="animate-fade-in">
      <div className="headline-large mb-4">Document Manager</div>
      <Box className="card mb-4">
        <label className="body-text font-semibold">Upload Document</label>
        <Input type="file" className="input" onChange={(e: React.ChangeEvent<HTMLInputElement>) => e.target.files && uploadDocument(e.target.files[0])} disabled={uploading} />
      </Box>
      <Box className="card">
        <div className="font-bold mb-2">Documents</div>
        <Table variant="simple" className="w-full text-left">
          <Thead>
            <Tr>
              <Th className="headline-medium pb-2">Name</Th>
              <Th className="headline-medium pb-2">Status</Th>
              <Th className="headline-medium pb-2">Download</Th>
            </Tr>
          </Thead>
          <Tbody>
            {documents.map((doc: any) => {
              let statusClass = 'badge-status-active', statusLabel = 'Valid';
              if (doc.expired) {
                statusClass = 'badge-status-expired';
                statusLabel = 'Expired';
              } else if (doc.missing) {
                statusClass = 'badge-status-other';
                statusLabel = 'Missing';
              }
              return (
                <Tr key={doc.id}>
                  <Td className="body-text">{doc.name}</Td>
                  <Td><span className={`caption ${statusClass}`}>{statusLabel}</span></Td>
                  <Td><Button className="button-secondary" onClick={() => doc.url && downloadDocument(doc.url)}>Download</Button></Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DocumentManager;
