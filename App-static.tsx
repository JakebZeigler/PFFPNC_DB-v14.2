import React from 'react';

// Ultra-simple static app with no contexts or routing
const App: React.FC = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
            <h1>PFFPNC Database Management System</h1>
            <p>🔍 Static Test - No Contexts, No Routing</p>
            <p>If you see this, the basic React app works!</p>
            <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
                <h2>Static Content Test</h2>
                <p>✅ React rendering works</p>
                <p>✅ Basic styling works</p>
                <p>✅ No contexts loaded</p>
                <p>✅ No routing loaded</p>
            </div>
        </div>
    );
};

export default App;
