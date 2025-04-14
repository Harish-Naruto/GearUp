import React from 'react';

const Spinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };
  
  return (
    <div className={`inline-block animate-spin rounded-full border-4 border-solid border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} role="status">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;