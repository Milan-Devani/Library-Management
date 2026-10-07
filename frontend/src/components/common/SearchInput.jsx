import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchInput = ({
  value,
  onChange,
  placeholder = 'Search...',
  onClear = null,
  className = '',
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <FiSearch className="text-base" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-300 rounded-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        {...props}
      />
      {value && onClear && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <FiX className="text-sm" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
