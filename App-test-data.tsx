import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Test with all context providers including DataProvider (Firebase)
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <DataProvider>
                        <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                            <h1>PFFPNC Database Management System</h1>
                            <p>🔍 Testing All Context Providers + Firebase</p>
                            <p>If you see this, ALL providers work!</p>
                            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
                                <h2>Full Context Provider Test</h2>
                                <p>✅ React rendering works</p>
                                <p>✅ ThemeProvider loaded</p>
                                <p>✅ ToastProvider loaded</p>
                                <p>✅ AuthProvider loaded</p>
                                <p>✅ DataProvider (Firebase) loaded</p>
                                <p>❌ No routing yet</p>
                            </div>
                        </div>
                    </DataProvider>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
