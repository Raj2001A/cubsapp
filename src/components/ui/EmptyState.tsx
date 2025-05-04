import React from 'react';
import { 
  FileQuestion, 
  Search, 
  AlertCircle, 
  Filter, 
  Users, 
  FileText, 
  Calendar
} from 'lucide-react';

export type EmptyStateType = 
  | 'search' 
  | 'filter' 
  | 'data' 
  | 'employees' 
  | 'documents' 
  | 'calendar' 
  | 'error' 
  | 'custom';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'data',
  title,
  message,
  icon,
  action,
  className = '',
}) => {
  // Default content based on type
  const getDefaultContent = () => {
    switch (type) {
      case 'search':
        return {
          icon: <Search className="h-12 w-12 text-gray-400" />,
          title: title || 'No results found',
          message: message || "We couldn't find any matches for your search term. Try adjusting your search or filters.",
        };
      case 'filter':
        return {
          icon: <Filter className="h-12 w-12 text-gray-400" />,
          title: title || 'No matching results',
          message: message || 'No items match your current filter criteria. Try changing or clearing your filters.',
        };
      case 'employees':
        return {
          icon: <Users className="h-12 w-12 text-gray-400" />,
          title: title || 'No employees found',
          message: message || 'There are no employees to display at this time.',
        };
      case 'documents':
        return {
          icon: <FileText className="h-12 w-12 text-gray-400" />,
          title: title || 'No documents found',
          message: message || 'There are no documents to display at this time.',
        };
      case 'calendar':
        return {
          icon: <Calendar className="h-12 w-12 text-gray-400" />,
          title: title || 'No events scheduled',
          message: message || 'There are no events scheduled for the selected time period.',
        };
      case 'error':
        return {
          icon: <AlertCircle className="h-12 w-12 text-red-400" />,
          title: title || 'Something went wrong',
          message: message || 'We encountered an error while loading this content. Please try again later.',
        };
      case 'custom':
        return {
          icon: icon || <FileQuestion className="h-12 w-12 text-gray-400" />,
          title: title || 'No content available',
          message: message || 'There is no content to display at this time.',
        };
      case 'data':
      default:
        return {
          icon: <FileQuestion className="h-12 w-12 text-gray-400" />,
          title: title || 'No data available',
          message: message || 'There is no data to display at this time.',
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div 
      className={`text-center py-12 px-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex justify-center mb-4">
        {content.icon}
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">
        {content.title}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {content.message}
      </p>
      {action && (
        <div className="mt-6">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
