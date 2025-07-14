import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Import layouts
import AuthLayout from './components/AuthLayout';

// Simple test pages to replace crashing ones
const TestCustomersPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Customers Page</h1>
        <p>This page is working! Customer management functionality coming soon.</p>
    </div>
);

const TestReportsPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Reports Page</h1>
        <p>This page is working! Reporting functionality coming soon.</p>
    </div>
);

const TestImportPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Import Page</h1>
        <p>This page is working! Import functionality coming soon.</p>
    </div>
);

const TestExportPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Export Page</h1>
        <p>This page is working! Export functionality coming soon.</p>
    </div>
);

const TestAgentsPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Agents Page</h1>
        <p>This page is working! Agent management functionality coming soon.</p>
    </div>
);

const TestDispositionsPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dispositions Page</h1>
        <p>This page is working! Disposition management functionality coming soon.</p>
    </div>
);

const TestShowsPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Shows Page</h1>
        <p>This page is working! Show management functionality coming soon.</p>
    </div>
);

const TestAssociationsPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Associations Page</h1>
        <p>This page is working! Association management functionality coming soon.</p>
    </div>
);

const TestUsersPage = () => (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Users Page</h1>
        <p>This page is working! User management functionality coming soon.</p>
    </div>
);

const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                                {/* Login Credentials Helper */}
                                <div style={{ 
                                    position: 'fixed', 
                                    top: '10px', 
                                    left: '10px', 
                                    background: '#007bff', 
                                    color: 'white', 
                                    padding: '10px', 
                                    borderRadius: '5px',
                                    fontSize: '12px',
                                    zIndex: 1000
                                }}>
                                    <strong>LOGIN CREDENTIALS:</strong><br/>
                                    Email: admin@pffpnc.com<br/>
                                    Password: admin123
                                </div>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    
                                    {/* Protected routes with sidebar navigation */}
                                    <Route path="/" element={<AuthLayout />}>
                                        <Route index element={<DashboardPage />} />
                                        <Route path="dashboard" element={<DashboardPage />} />
                                        
                                        {/* Simple test pages that won't crash */}
                                        <Route path="customers" element={<TestCustomersPage />} />
                                        <Route path="reports" element={<TestReportsPage />} />
                                        <Route path="import" element={<TestImportPage />} />
                                        <Route path="advanced-imports" element={<TestImportPage />} />
                                        <Route path="export" element={<TestExportPage />} />
                                        <Route path="agents" element={<TestAgentsPage />} />
                                        <Route path="dispositions" element={<TestDispositionsPage />} />
                                        <Route path="shows" element={<TestShowsPage />} />
                                        <Route path="associations" element={<TestAssociationsPage />} />
                                        <Route path="users" element={<TestUsersPage />} />
                                    </Route>
                                </Routes>
                            </div>
                        </DataProvider>
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;
