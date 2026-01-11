'use client';

import ReactSelect, { StylesConfig, GroupBase } from 'react-select';
import { Option } from '@/types/select.types';

interface SelectProps {
  options: Option[];
  value?: Option | null;
  onChange?: (option: Option | null) => void;
  placeholder?: string;
  isSearchable?: boolean;
  isClearable?: boolean;
  className?: string;
  error?: string;
}

const customStyles: StylesConfig<Option, false, GroupBase<Option>> = {
  control: (provided, state) => ({
    ...provided,
    minHeight: '48px',
    border:
      state.hasValue && state.isFocused
        ? '2px solid #D7F50A'
        : state.isFocused
          ? '2px solid #D7F50A'
          : '2px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(215, 245, 10, 0.1)' : 'none',
    '&:hover': {
      border: '2px solid #D7F50A',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#94A3B8',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#0F172A',
  }),
  input: (provided) => ({
    ...provided,
    color: '#0F172A',
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: '12px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#D7F50A'
      : state.isFocused
        ? '#F6F9FF'
        : 'white',
    color: state.isSelected ? '#0F172A' : '#0F172A',
    padding: '12px 16px',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: '#D7F50A',
    },
  }),
};

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  isSearchable = false,
  isClearable = false,
  className = '',
  error,
}: SelectProps) {
  return (
    <div className={`w-full ${className}`}>
      <ReactSelect<Option, false>
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isSearchable={isSearchable}
        isClearable={isClearable}
        styles={customStyles}
        classNamePrefix="react-select"
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
