import React from 'react';

const BookingStatusBadge = ({ status }) => {
  const getStatusStyles = () => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'IN_PROGRESS':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <span className={`px-2 py-1 text-sm font-medium rounded-full border ${getStatusStyles()}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

export default BookingStatusBadge;