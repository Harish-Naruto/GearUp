import { useState, useEffect } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  // Helper function to create a unique ID
  const generateId = () => Math.random().toString(36).substring(2, 9);
  
  // Function to show a toast notification
  const showToast = (type, message, duration = 3000) => {
    const id = generateId();
    const newToast = {
      id,
      type,
      message,
      duration
    };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      dismissToast(id);
    }, duration);
    
    return id;
  };
  
  // Function to dismiss a toast notification
  const dismissToast = (id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };
  
  // Render the toast UI component
  const ToastContainer = () => {
    return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={dismissToast}
          />
        ))}
      </div>
    );
  };
  
  // Individual toast component
  const Toast = ({ id, type, message, onDismiss }) => {
    const getToastClasses = () => {
      switch (type) {
        case 'success':
          return 'bg-green-500 text-white';
        case 'error':
          return 'bg-red-500 text-white';
        case 'warning':
          return 'bg-yellow-500 text-white';
        case 'info':
          return 'bg-blue-500 text-white';
        default:
          return 'bg-gray-700 text-white';
      }
    };
    
    return (
      <div className={`px-4 py-3 rounded-md shadow-md flex items-center justify-between min-w-64 max-w-md ${getToastClasses()}`}>
        <p>{message}</p>
        <button
          className="ml-4 text-white hover:text-gray-200"
          onClick={() => onDismiss(id)}
        >
          &times;
        </button>
      </div>
    );
  };
  
  return {
    showToast,
    dismissToast,
    ToastContainer
  };
};