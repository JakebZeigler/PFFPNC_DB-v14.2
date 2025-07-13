import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import the REAL LoginPage (confirmed working)
import LoginPage from './pages/LoginPage';

// Create a MINIMAL DashboardPage to test step by step
const SimpleDashboardPage = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
            <h1>Simple Dashboard Test</h1>
            <p>✅ Basic Dashboard component works!</p>
            <p>✅ All contexts loaded!</p>
            <p>🔍 Testing minimal dashboard without complex components</p>
        </div>
    );
};

// Test with all contexts + routing + REAL LoginPage + SIMPLE DashboardPage
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing Simple Dashboard Component</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<SimpleDashboardPage />} />
                                    <Route path="/" element={<SimpleDashboardPage />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>Simple Dashboard Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>🔍 Testing simple dashboard</p>
                                    <p>If you see this, simple dashboard works!</p>
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
