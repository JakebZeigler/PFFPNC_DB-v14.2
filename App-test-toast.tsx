import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';

// Test with ThemeProvider + ToastProvider
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ToastProvider>
                <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                    <h1>PFFPNC Database Management System</h1>
                    <p>🔍 Testing ThemeProvider + ToastProvider</p>
                    <p>If you see this, both providers work!</p>
                    <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
                        <h2>Context Provider Test</h2>
                        <p>✅ React rendering works</p>
                        <p>✅ ThemeProvider loaded</p>
                        <p>✅ ToastProvider loaded</p>
                        <p>❌ No Auth or Data contexts</p>
                    </div>
                </div>
            </ToastProvider>
        </ThemeProvider>
    );
};

export default App;
