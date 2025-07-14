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

const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={
                                        <AuthLayout>
                                            <DashboardPage />
                                        </AuthLayout>
                                    } />
                                    <Route path="/" element={
                                        <AuthLayout>
                                            <DashboardPage />
                                        </AuthLayout>
                                    } />
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
