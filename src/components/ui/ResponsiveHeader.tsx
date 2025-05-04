import React from 'react';

interface Action {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface ResponsiveHeaderProps {
  title: string;
  actions?: Action[];
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({ title, actions = [] }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={`
                flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium
                ${action.primary 
                  ? 'bg-primary-600 text-white hover:bg-primary-700 border-transparent' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}
                ${action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                w-full sm:w-auto
              `}
            >
              {action.icon && <span className="mr-2">{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResponsiveHeader;
