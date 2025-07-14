import React from 'react';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>PFFPNC Database Management System</h1>
      <p>Testing step by step...</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Debug Status:</h2>
        <p>✅ Basic React rendering works</p>
        <p>🔍 Now testing with minimal routing...</p>
      </div>
      
      {/* Test basic routing without complex contexts */}
      <div style={{ marginTop: '20px' }}>
        <h3>Navigation Test:</h3>
        <button onClick={() => console.log('Login clicked')}>Login</button>
        <button onClick={() => console.log('Dashboard clicked')}>Dashboard</button>
      </div>
    </div>
  );
}

export default App;
