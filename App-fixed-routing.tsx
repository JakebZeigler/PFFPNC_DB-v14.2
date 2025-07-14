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
                                    {/* Use nested routes with AuthLayout */}
                                    <Route path="/" element={<AuthLayout />}>
                                        <Route index element={<DashboardPage />} />
                                        <Route path="dashboard" element={<DashboardPage />} />
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
