import React from 'react';

const Input = ({ label, type = 'text', placeholder, value, onChange, error, name, required = false, className = '' }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chase-blue focus:border-chase-blue outline-none transition-all ${error ? 'border-red-500' : 'border-gray-300'}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
