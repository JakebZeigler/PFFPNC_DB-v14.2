import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';

// Simple test components
const LoginPage = () => <div style={{ padding: '20px' }}><h2>Login Page</h2><p>Login component loaded successfully!</p></div>;
const DashboardPage = () => <div style={{ padding: '20px' }}><h2>Dashboard Page</h2><p>Dashboard component loaded successfully!</p></div>;

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <div>
            <h1 style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>PFFPNC Database Management System</h1>
            <p style={{ padding: '0 20px' }}>✅ Firebase working | ✅ Routing working | ✅ ThemeContext working | ✅ ToastProvider working | 🔍 Testing AuthContext...</p>
            
            <HashRouter>
              <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
              </Routes>
            </HashRouter>
            
            <div style={{ padding: '20px', fontSize: '12px', color: '#666' }}>
              <p>Test navigation: <a href="#/login">Login</a> | <a href="#/dashboard">Dashboard</a></p>
            </div>
          </div>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
