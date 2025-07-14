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
import CustomerDetailPage from './pages/CustomerDetailPage';
import CustomerFormPage from './pages/CustomerFormPage';
import ReportsPage from './pages/ReportsPage';
import ImportPage from './pages/ImportPage';
import TextImportPage from './pages/TextImportPage';
import ExportPage from './pages/ExportPage';
import AgentsPage from './pages/AgentsPage';
import DispositionsPage from './pages/DispositionsPage';
import DispositionDetailPage from './pages/DispositionDetailPage';
import DispositionFormPage from './pages/DispositionFormPage';
import ShowsPage from './pages/ShowsPage';
import ShowDetailPage from './pages/ShowDetailPage';
import AssociationsPage from './pages/AssociationsPage';
import AssociationDetailPage from './pages/AssociationDetailPage';
import AssociationFormPage from './pages/AssociationFormPage';
import UsersPage from './pages/UsersPage';

// Import layouts
import AuthLayout from './components/AuthLayout';

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
                                        
                                        {/* Customer routes */}
                                        <Route path="customers" element={<CustomersPage />} />
                                        <Route path="customers/:id" element={<CustomerDetailPage />} />
                                        <Route path="customers/new" element={<CustomerFormPage />} />
                                        <Route path="customers/:id/edit" element={<CustomerFormPage />} />
                                        
                                        {/* Reports */}
                                        <Route path="reports" element={<ReportsPage />} />
                                        
                                        {/* Import/Export */}
                                        <Route path="import" element={<ImportPage />} />
                                        <Route path="advanced-imports" element={<TextImportPage />} />
                                        <Route path="export" element={<ExportPage />} />
                                        
                                        {/* Agents */}
                                        <Route path="agents" element={<AgentsPage />} />
                                        
                                        {/* Dispositions */}
                                        <Route path="dispositions" element={<DispositionsPage />} />
                                        <Route path="dispositions/:id" element={<DispositionDetailPage />} />
                                        <Route path="dispositions/new" element={<DispositionFormPage />} />
                                        <Route path="dispositions/:id/edit" element={<DispositionFormPage />} />
                                        
                                        {/* Shows */}
                                        <Route path="shows" element={<ShowsPage />} />
                                        <Route path="shows/:id" element={<ShowDetailPage />} />
                                        
                                        {/* Associations */}
                                        <Route path="associations" element={<AssociationsPage />} />
                                        <Route path="associations/:id" element={<AssociationDetailPage />} />
                                        <Route path="associations/new" element={<AssociationFormPage />} />
                                        <Route path="associations/:id/edit" element={<AssociationFormPage />} />
                                        
                                        {/* Admin-only routes */}
                                        <Route path="users" element={<AuthLayout adminOnly={true} />}>
                                            <Route index element={<UsersPage />} />
                                        </Route>
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
