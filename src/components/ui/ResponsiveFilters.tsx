import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOption {
  id: string;
  label: string;
  options?: { value: string; label: string }[];
  type: 'select' | 'search' | 'custom';
  component?: React.ReactNode;
}

interface ResponsiveFiltersProps {
  filters: FilterOption[];
  onFilterChange: (filterId: string, value: string) => void;
  filterValues: Record<string, string>;
}

const ResponsiveFilters: React.FC<ResponsiveFiltersProps> = ({
  filters,
  onFilterChange,
  filterValues
}) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const renderFilterInput = (filter: FilterOption) => {
    switch (filter.type) {
      case 'search':
        return (
          <input
            type="text"
            placeholder={`Search ${filter.label.toLowerCase()}...`}
            value={filterValues[filter.id] || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        );
      case 'select':
        return (
          <select
            value={filterValues[filter.id] || ''}
            onChange={(e) => onFilterChange(filter.id, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'custom':
        return filter.component;
      default:
        return null;
    }
  };

  return (
    <div className="mb-6">
      {/* Desktop Filters */}
      <div className="hidden md:flex flex-wrap gap-4 items-end">
        {filters.map((filter) => (
          <div key={filter.id} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            {renderFilterInput(filter)}
          </div>
        ))}
      </div>

      {/* Mobile Filters Toggle */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={toggleMobileFilters}
          className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <Filter className="h-4 w-4 mr-2" />
          {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
        </button>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="mt-4 p-4 bg-white rounded-md shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <button
                type="button"
                onClick={toggleMobileFilters}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              {filters.map((filter) => (
                <div key={filter.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {filter.label}
                  </label>
                  {renderFilterInput(filter)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponsiveFilters;
