import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import the REAL components to test them
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Test with all contexts + routing + REAL LoginPage + DashboardPage
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing Real LoginPage + DashboardPage</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardPage />} />
                                    <Route path="/" element={<DashboardPage />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>Real Components Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>🔍 Testing real DashboardPage</p>
                                    <p>If you see this, DashboardPage works!</p>
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
