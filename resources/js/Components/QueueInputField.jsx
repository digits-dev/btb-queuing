import React from 'react';

export default function QueueInputField({ type = 'text', label, placeholder, name, value, onChange }) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
