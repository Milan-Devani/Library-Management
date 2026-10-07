import React from 'react';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#1e293b',
            fontSize: '13px',
            fontWeight: '500',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#2563eb',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <AppRoutes />
    </>
  );
}

export default App;
