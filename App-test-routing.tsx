import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Simple test components
const TestLogin = () => (
    <div style={{ padding: '20px', backgroundColor: '#e8f5e8' }}>
        <h2>Test Login Page</h2>
        <p>✅ Routing works!</p>
        <p>✅ All contexts loaded!</p>
    </div>
);

const TestDashboard = () => (
    <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
        <h2>Test Dashboard Page</h2>
        <p>✅ Routing works!</p>
        <p>✅ All contexts loaded!</p>
    </div>
);

// Test with all contexts + basic routing
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing All Contexts + Basic Routing</p>
                                <p>If you see this, everything works!</p>
                                
                                <Routes>
                                    <Route path="/login" element={<TestLogin />} />
                                    <Route path="/dashboard" element={<TestDashboard />} />
                                    <Route path="/" element={<TestDashboard />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>Full System Test</h2>
                                    <p>✅ React rendering works</p>
                                    <p>✅ All context providers loaded</p>
                                    <p>✅ React Router loaded</p>
                                    <p>✅ Basic routing works</p>
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
