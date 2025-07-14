import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import AgentsPage from './pages/AgentsPage';
import ImportPage from './pages/ImportPage';
import TextImportPage from './pages/TextImportPage';
import ExportPage from './pages/ExportPage';
import DispositionsPage from './pages/DispositionsPage';
import ShowsPage from './pages/ShowsPage';
import AssociationsPage from './pages/AssociationsPage';
import UsersPage from './pages/UsersPage';
import DiagnosticPage from './pages/DiagnosticPage';
import SimpleTestPage from './pages/SimpleTestPage';

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
                                        
                                        {/* Full functionality pages with fixed imports */}
                                        <Route path="customers" element={<CustomersPage />} />
                                        <Route path="reports" element={<ReportsPage />} />
                                        <Route path="import" element={<ImportPage />} />
                                        <Route path="advanced-imports" element={<TextImportPage />} />
                                        <Route path="export" element={<ExportPage />} />
                                        <Route path="agents" element={<AgentsPage />} />
                                        <Route path="dispositions" element={<DispositionsPage />} />
                                        <Route path="shows" element={<ShowsPage />} />
                                        <Route path="associations" element={<AssociationsPage />} />
                                        <Route path="users" element={<UsersPage />} />
                                        <Route path="diagnostic" element={<DiagnosticPage />} />
                                        <Route path="test" element={<SimpleTestPage />} />
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
