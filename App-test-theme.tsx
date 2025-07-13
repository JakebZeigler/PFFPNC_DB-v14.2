import React from 'react';
import { ThemeProvider } from './context/ThemeContext';

// Test with just ThemeProvider
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                <h1>PFFPNC Database Management System</h1>
                <p>🔍 Testing ThemeProvider Only</p>
                <p>If you see this, ThemeProvider works!</p>
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
                    <h2>ThemeProvider Test</h2>
                    <p>✅ React rendering works</p>
                    <p>✅ ThemeProvider loaded</p>
                    <p>❌ No other contexts</p>
                </div>
            </div>
        </ThemeProvider>
    );
};

export default App;
