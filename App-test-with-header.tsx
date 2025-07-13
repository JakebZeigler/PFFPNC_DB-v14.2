import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import the REAL LoginPage (confirmed working)
import LoginPage from './pages/LoginPage';

// Import Header to test if it causes the crash
import Header from './components/Header';

// Test Dashboard with Header component
const DashboardWithHeader = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
            <h1>Testing Dashboard with Header</h1>
            <p>✅ Basic Dashboard component works!</p>
            <p>🔍 Now testing with Header component...</p>
            
            {/* Test Header component */}
            <div style={{ border: '2px solid #007bff', padding: '10px', margin: '10px 0' }}>
                <h3>Header Component Test:</h3>
                <Header />
            </div>
            
            <p>✅ If you see this, Header component works!</p>
        </div>
    );
};

// Test with all contexts + routing + REAL LoginPage + Header
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing Dashboard with Header Component</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithHeader />} />
                                    <Route path="/" element={<DashboardWithHeader />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>Header Component Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>✅ Simple dashboard works</p>
                                    <p>🔍 Testing Header component</p>
                                    <p>If you see this, Header is not the problem!</p>
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
