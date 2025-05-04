import React, { useState } from 'react';
import {
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Plus,
  Mail,
  Download,
  Edit,
  Upload,
  AlertCircle
} from 'lucide-react';
import type { VisaApplication } from '../../types';
import VisaFormModal from './VisaFormModal';
import EmailService from '../../services/emailService';
import DocumentService from '../../services/documentService';
import { employees } from '../../data';
import { EMAIL } from '../../config';

// Initialize services
const emailService = new EmailService({
  smtpHost: EMAIL.SMTP_HOST,
  smtpPort: EMAIL.SMTP_PORT,
  smtpUser: EMAIL.SMTP_USER,
  smtpPass: EMAIL.SMTP_PASS,
  fromEmail: EMAIL.FROM_EMAIL
});

const documentService = new DocumentService();

// Mock data for demonstration
const mockVisaApplications: VisaApplication[] = [
  {
    id: '1',
    employeeId: '1',
    type: 'work',
    status: 'approved',
    startDate: '2024-01-01',
    endDate: '2026-01-01',
    country: 'UAE',
    applicationNumber: 'UAE2024001',
    processingTime: 15,
    notes: 'Standard work visa',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    employeeId: '2',
    type: 'work',
    status: 'pending',
    startDate: '2024-03-01',
    endDate: '2026-03-01',
    country: 'UAE',
    applicationNumber: 'UAE2024002',
    processingTime: 10,
    notes: 'Renewal application',
    createdAt: '2024-02-15',
    updatedAt: '2024-02-15'
  },
  {
    id: '3',
    employeeId: '3',
    type: 'work',
    status: 'expired',
    startDate: '2022-01-01',
    endDate: '2024-01-01',
    country: 'UAE',
    applicationNumber: 'UAE2022001',
    processingTime: 12,
    notes: 'Expired - needs renewal',
    createdAt: '2022-01-01',
    updatedAt: '2024-01-01'
  }
];

const VisaManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedVisa, setSelectedVisa] = useState<VisaApplication | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [visas, setVisas] = useState<VisaApplication[]>(mockVisaApplications);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [emailStatus, setEmailStatus] = useState<{ [key: string]: string }>({});

  const filteredVisas = visas.filter(visa => {
    const matchesSearch = visa.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || visa.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'expired':
        return 'text-error';
      case 'rejected':
        return 'text-error';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-warning" />;
      case 'expired':
        return <AlertTriangle className="h-5 w-5 text-error" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-error" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddVisa = () => {
    setSelectedVisa(null);
    setIsModalOpen(true);
  };

  const handleEditVisa = (visa: VisaApplication) => {
    setSelectedVisa(visa);
    setIsModalOpen(true);
  };

  const handleSubmitVisa = (visaData: Partial<VisaApplication>) => {
    if (selectedVisa) {
      // Update existing visa
      setVisas(visas.map(v =>
        v.id === selectedVisa.id
          ? { ...v, ...visaData, updatedAt: new Date().toISOString() }
          : v
      ));
    } else {
      // Add new visa
      const newVisa: VisaApplication = {
        id: (visas.length + 1).toString(),
        employeeId: '1', // Default to first employee
        type: visaData.type || 'work',
        status: visaData.status || 'pending',
        startDate: visaData.startDate || new Date().toISOString().split('T')[0],
        endDate: visaData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        country: visaData.country || 'UAE',
        applicationNumber: `UAE${new Date().getFullYear()}${String(visas.length + 1).padStart(3, '0')}`,
        processingTime: visaData.processingTime || 15,
        notes: visaData.notes || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setVisas([...visas, newVisa]);
    }
  };

  const handleSendReminder = async (visa: VisaApplication) => {
    const employee = employees.find(emp => emp.id === visa.employeeId);
    if (employee) {
      try {
        const emailId = await emailService.sendVisaExpiryReminder(visa, employee.email);

        // Track email status
        setEmailStatus(prev => ({
          ...prev,
          [emailId]: 'pending'
        }));

        // Start polling for email status
        const statusInterval = setInterval(async () => {
          const status = emailService.getEmailStatus(emailId);
          if (status) {
            setEmailStatus(prev => ({
              ...prev,
              [emailId]: status.status
            }));

            if (status.status !== 'pending') {
              clearInterval(statusInterval);
            }
          }
        }, 1000);
      } catch (error) {
        console.error('Failed to send reminder:', error);
      }
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get the selected visa
      const visa = selectedVisa || visas[0];

      // Upload the document
      await documentService.uploadDocument(visa.id, file);

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);

      alert('Document uploaded successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadDocument = async (documentId: string, userId: string) => {
    try {
      await documentService.downloadDocument(documentId, userId);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search visa applications..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 block w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <select
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 block w-full"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="expired">Expired</option>
              <option value="rejected">Rejected</option>
            </select>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>

          <button
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            onClick={handleAddVisa}
          >
            <Plus className="h-5 w-5 mr-2" />
            New Visa Application
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredVisas.map((visa) => {
            const employee = employees.find(emp => emp.id === visa.employeeId);
            return (
              <li key={visa.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getStatusIcon(visa.status)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-primary-600">
                          {visa.applicationNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee ? `${employee.firstName} ${employee.lastName}` : 'Unknown Employee'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-sm text-gray-500">
                        {visa.type.charAt(0).toUpperCase() + visa.type.slice(1)} Visa
                      </div>
                      <div className={`text-sm font-medium ${getStatusColor(visa.status)}`}>
                        {visa.status.charAt(0).toUpperCase() + visa.status.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <p>
                          Valid from {formatDate(visa.startDate)} to {formatDate(visa.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditVisa(visa)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleSendReminder(visa)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadDocument('doc1', visa.employeeId)}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Document Upload Section */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Upload Documents
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Upload visa-related documents for the selected application.</p>
          </div>
          <div className="mt-5">
            <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
              </div>
            </div>
            {isUploading && (
              <div className="mt-4">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary-600 bg-primary-200">
                        Uploading...
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-primary-600">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-200">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500"
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visa Form Modal */}
      <VisaFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitVisa}
        visa={selectedVisa || undefined}
      />

      {/* Email Status Notifications */}
      {Object.entries(emailStatus).map(([id, status]) => {
        const emailItem = emailService.getEmailStatus(id);
        if (!emailItem) return null;

        return (
          <div
            key={id}
            className={`rounded-md p-4 ${
              status === 'sent'
                ? 'bg-green-50'
                : status === 'failed'
                ? 'bg-red-50'
                : 'bg-yellow-50'
            }`}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                {status === 'sent' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : status === 'failed' ? (
                  <AlertCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-gray-900">
                  {status === 'sent'
                    ? 'Reminder email sent successfully'
                    : status === 'failed'
                    ? 'Failed to send reminder email'
                    : 'Sending reminder email...'}
                </h3>
                {emailItem.error && (
                  <div className="mt-2 text-sm text-red-700">
                    <p>{emailItem.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VisaManagement;