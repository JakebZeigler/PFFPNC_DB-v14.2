import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';

// Test with ThemeProvider + ToastProvider + AuthProvider
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                        <h1>PFFPNC Database Management System</h1>
                        <p>🔍 Testing Theme + Toast + AuthProvider</p>
                        <p>If you see this, all three providers work!</p>
                        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
                            <h2>Context Provider Test</h2>
                            <p>✅ React rendering works</p>
                            <p>✅ ThemeProvider loaded</p>
                            <p>✅ ToastProvider loaded</p>
                            <p>✅ AuthProvider loaded</p>
                            <p>❌ No Data context or routing</p>
                        </div>
                    </div>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
