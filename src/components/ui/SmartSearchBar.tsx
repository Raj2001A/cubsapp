import React, { useState, useRef } from 'react';

interface SmartSearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * A11y-friendly, debounced smart search bar with clear button.
 */
const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSearch,
  placeholder = 'Search employees...',
  debounceMs = 300,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <input
        type="search"
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
        placeholder={placeholder}
        value={query}
        onChange={handleChange}
        aria-label={placeholder}
      />
      {query && (
        <button
          type="button"
          aria-label="Clear search"
          className="p-1 text-gray-500 hover:text-red-500 focus:outline-none"
          onClick={handleClear}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SmartSearchBar;
