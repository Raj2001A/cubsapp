import React, { useState } from 'react';
import { useEmployeeProfile } from '../../../hooks/useEmployeeProfile'; // Fix import error
import { useDocuments } from '../../../hooks/useDocuments'; // Fix import error
import { Box, Button, Input, Table, Tbody, Td, Th, Thead, Tr, FormLabel } from '@chakra-ui/react';

interface EmployeeProfileProps {
  employeeId: string;
  onBack: () => void;
}

export const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId, onBack }) => {
  const { data: employee, isLoading, updateEmployee } = useEmployeeProfile(employeeId);
  const { documents, uploadDocument, downloadDocument, uploading, progress } = useDocuments(employeeId);
  const [editVisa, setEditVisa] = useState(employee?.visaExpiryDate || '');
  const [editContact, setEditContact] = useState(employee?.contactInfo || '');
  const [file, setFile] = useState<File | null>(null);

  if (isLoading) return <Box className="card animate-fade-in">Loading...</Box>;
  if (!employee) return <Box className="card animate-fade-in">No employee found.</Box>;

  return (
    <Box className="p-4 bg-background min-h-screen">
      <Button onClick={(e: React.MouseEvent<HTMLButtonElement>) => onBack()} className="button-secondary mb-4">Back to List</Button>
      <Box className="card animate-fade-in mb-4">
        <div className="headline-medium mb-2">{employee.name}</div>
        <div className="body-text">Role: {employee.position}</div>
        <div className="body-text">Department: {employee.department}</div>
        <div className="body-text">Email: {employee.email}</div>
        <div className="body-text flex items-center gap-2">
          Visa Expiry:
          <Input className="input w-40" value={editVisa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditVisa(e.target.value)} onBlur={() => updateEmployee({ visaExpiryDate: editVisa })} />
        </div>
        <div className="body-text flex items-center gap-2">
          Contact Info:
          <Input className="input w-40" value={editContact} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditContact(e.target.value)} onBlur={() => updateEmployee({ contactInfo: editContact })} />
        </div>
      </Box>
      <Box className="card animate-fade-in mb-4">
        <FormLabel className="body-text font-semibold">Upload Document</FormLabel>
        <Input type="file" className="input" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
        <Button className="button-primary mt-2" onClick={() => file && uploadDocument(file)} isLoading={uploading} disabled={!file}>
          Upload
        </Button>
        {progress > 0 && <div className="caption">Uploading: {progress}%</div>}
      </Box>
      <Box className="card animate-fade-in">
        <div className="font-bold mb-2">Documents</div>
        <Table className="w-full text-left" variant="simple">
          <Thead>
            <Tr>
              <Th className="headline-medium pb-2">Name</Th>
              <Th className="headline-medium pb-2">Download</Th>
            </Tr>
          </Thead>
          <Tbody>
            {documents.map((doc: any) => (
              <Tr key={doc.id}>
                <Td className="body-text">{doc.name}</Td>
                <Td><Button className="button-secondary" size="sm" onClick={(e: React.MouseEvent<HTMLButtonElement>) => downloadDocument(doc.url)}>Download</Button></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default EmployeeProfile;
