import React from 'react';
import EmptyState from '../ui/EmptyState';
import { BarChart2, PieChart, Users, FileText, Calendar, AlertTriangle } from 'lucide-react';

export type DashboardWidgetType = 
  | 'employees' 
  | 'documents' 
  | 'visaStatus' 
  | 'hiringTrends' 
  | 'tradeDistribution' 
  | 'nationalityDistribution' 
  | 'companyDistribution' 
  | 'calendar';

interface DashboardEmptyStateProps {
  type: DashboardWidgetType;
  title?: string;
  message?: string;
  action?: React.ReactNode;
}

const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  type,
  title,
  message,
  action
}) => {
  // Get default content based on widget type
  const getDefaultContent = () => {
    switch (type) {
      case 'employees':
        return {
          icon: <Users className="h-12 w-12 text-gray-400" />,
          title: title || 'No employee data available',
          message: message || 'Add employees to see statistics and distribution data.',
        };
      case 'documents':
        return {
          icon: <FileText className="h-12 w-12 text-gray-400" />,
          title: title || 'No document data available',
          message: message || 'Upload employee documents to track document status and expiry dates.',
        };
      case 'visaStatus':
        return {
          icon: <AlertTriangle className="h-12 w-12 text-gray-400" />,
          title: title || 'No visa data available',
          message: message || 'Add employee visa information to track visa status and expiry dates.',
        };
      case 'hiringTrends':
        return {
          icon: <BarChart2 className="h-12 w-12 text-gray-400" />,
          title: title || 'No hiring data available',
          message: message || 'Add employees with joining dates to see hiring trends over time.',
        };
      case 'tradeDistribution':
        return {
          icon: <PieChart className="h-12 w-12 text-gray-400" />,
          title: title || 'No trade data available',
          message: message || 'Add employees with trade information to see distribution by trade.',
        };
      case 'nationalityDistribution':
        return {
          icon: <PieChart className="h-12 w-12 text-gray-400" />,
          title: title || 'No nationality data available',
          message: message || 'Add employees with nationality information to see distribution by nationality.',
        };
      case 'companyDistribution':
        return {
          icon: <PieChart className="h-12 w-12 text-gray-400" />,
          title: title || 'No company data available',
          message: message || 'Add employees with company information to see distribution by company.',
        };
      case 'calendar':
        return {
          icon: <Calendar className="h-12 w-12 text-gray-400" />,
          title: title || 'No calendar events',
          message: message || 'There are no upcoming events or deadlines to display.',
        };
      default:
        return {
          icon: <BarChart2 className="h-12 w-12 text-gray-400" />,
          title: title || 'No data available',
          message: message || 'There is no data to display for this widget.',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
      <EmptyState
        type="custom"
        title={content.title}
        message={content.message}
        icon={content.icon}
        action={action}
      />
    </div>
  );
};

export default DashboardEmptyState;
