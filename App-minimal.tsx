import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';
import AuthLayout from './components/AuthLayout';

// Import only essential pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

const AppContainer: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
            
            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <AppContainer />
                        </DataProvider>
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;
