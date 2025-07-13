import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { FirebaseDataProvider } from './context/FirebaseDataContext';

// Simple test components
const LoginPage = () => <div style={{ padding: '20px' }}><h2>Login Page</h2><p>Login component loaded successfully!</p></div>;
const DashboardPage = () => <div style={{ padding: '20px' }}><h2>Dashboard Page</h2><p>Dashboard component loaded successfully!</p></div>;

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FirebaseDataProvider>
            <div>
              <h1 style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>PFFPNC Database Management System</h1>
              <p style={{ padding: '0 20px' }}>✅ All contexts working | 🔍 Testing FirebaseDataContext...</p>
              
              <HashRouter>
                <Routes>
                  <Route path="/" element={<LoginPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                </Routes>
              </HashRouter>
              
              <div style={{ padding: '20px', fontSize: '12px', color: '#666' }}>
                <p>Test navigation: <a href="#/login">Login</a> | <a href="#/dashboard">Dashboard</a></p>
                <p style={{ marginTop: '10px', color: '#28a745' }}>🎉 If you see this, all contexts are working!</p>
              </div>
            </div>
          </FirebaseDataProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
