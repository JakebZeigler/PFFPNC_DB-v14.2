import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import the REAL LoginPage (confirmed working)
import LoginPage from './pages/LoginPage';

// Import Header (confirmed working)
import Header from './components/Header';

// Import Icon components to test if they cause the crash
import UploadIcon from './components/icons/UploadIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import ChartBarIcon from './components/icons/ChartBarIcon';
import UsersIcon from './components/icons/UsersIcon';

// Test Dashboard with Header + Icon components
const DashboardWithIcons = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
            <h1>Testing Dashboard with Header + Icons</h1>
            <p>✅ Basic Dashboard component works!</p>
            <p>✅ Header component works!</p>
            <p>🔍 Now testing with Icon components...</p>
            
            {/* Test Header component */}
            <div style={{ border: '2px solid #007bff', padding: '10px', margin: '10px 0' }}>
                <h3>Header Component Test:</h3>
                <Header />
            </div>
            
            {/* Test Icon components */}
            <div style={{ border: '2px solid #28a745', padding: '10px', margin: '10px 0' }}>
                <h3>Icon Components Test:</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <UploadIcon />
                        <p>Upload</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <DownloadIcon />
                        <p>Download</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <ChartBarIcon />
                        <p>Chart</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <UsersIcon />
                        <p>Users</p>
                    </div>
                </div>
            </div>
            
            <p>✅ If you see this, Icon components work!</p>
        </div>
    );
};

// Test with all contexts + routing + REAL LoginPage + Header + Icons
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing Dashboard with Header + Icon Components</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithIcons />} />
                                    <Route path="/" element={<DashboardWithIcons />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>Header + Icons Component Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>✅ Simple dashboard works</p>
                                    <p>✅ Header component works</p>
                                    <p>🔍 Testing Icon components</p>
                                    <p>If you see this, Icons are not the problem!</p>
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
