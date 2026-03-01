import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './src/components/AuthPage';
import Dashboard from './src/components/Dashboard';
import ProtectedRoute from './src/components/ProtectedRoute';

const App = () => {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background-color: #f7fafc;
          color: #2d3748;
          line-height: 1.5;
        }
        .app-container {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default App;
