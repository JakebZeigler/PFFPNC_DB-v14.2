import React from 'react';

const SimpleTestPage: React.FC = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: 'white', minHeight: '100vh' }}>
            <h1 style={{ color: 'black', fontSize: '24px', marginBottom: '20px' }}>
                Simple Test Page
            </h1>
            <p style={{ color: 'black', fontSize: '16px', marginBottom: '10px' }}>
                This is a minimal test page with no dependencies.
            </p>
            <p style={{ color: 'black', fontSize: '16px', marginBottom: '10px' }}>
                If you can see this text, basic React routing is working.
            </p>
            <div style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '20px' }}>
                <strong>Test Results:</strong>
                <ul style={{ marginTop: '10px' }}>
                    <li>✅ React component renders</li>
                    <li>✅ Routing works</li>
                    <li>✅ Basic styling works</li>
                </ul>
            </div>
        </div>
    );
};

export default SimpleTestPage;
