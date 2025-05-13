import { Toaster } from 'react-hot-toast';

export default function ToastContainer() {
  return <Toaster 
    position="top-right" 
    toastOptions={{
      duration: 5000,
      style: {
        background: '#333',
        color: '#fff',
        border: '1px solid #555',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
      success: {
        style: {
          background: '#10b981',
        },
      },
      error: {
        style: {
          background: '#ef4444',
        },
      },
    }}
  />;
} 