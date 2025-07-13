import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import the REAL LoginPage to test it
import LoginPage from './pages/LoginPage';

// Simple test dashboard
const TestDashboard = () => (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
        <h2>Test Dashboard Page</h2>
        <p>✅ All contexts + routing work!</p>
        <p>✅ Testing real LoginPage component!</p>
    </div>
);

// Test with all contexts + routing + REAL LoginPage
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing Real LoginPage Component</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<TestDashboard />} />
                                    <Route path="/" element={<TestDashboard />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>LoginPage Component Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>🔍 Testing real LoginPage</p>
                                    <p>If you see this, LoginPage works!</p>
                                </div>
                            </div>
                        </DataProvider>
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;
