import React from 'react';

// Test Firebase import safety
try {
  // Import the safe Firebase config
  const firebaseModule = require('./src/firebase-safe');
  console.log('Firebase module loaded safely');
} catch (error) {
  console.error('Firebase module failed to load:', error);
}

function App() {
  const [status, setStatus] = React.useState('Loading...');

  React.useEffect(() => {
    // Test if we can safely access Firebase
    try {
      const firebaseModule = require('./src/firebase-safe');
      if (firebaseModule.db) {
        setStatus('✅ Firebase connected successfully');
      } else {
        setStatus('⚠️ Firebase running in offline mode');
      }
    } catch (error) {
      setStatus('❌ Firebase failed to initialize');
      console.error('Firebase error:', error);
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>PFFPNC Database Management System</h1>
      <p>Testing Firebase initialization...</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Firebase Status:</h2>
        <p>{status}</p>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4fd' }}>
        <h3>Environment Variables Check:</h3>
        <p>API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing'}</p>
        <p>Auth Domain: {import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Present' : '❌ Missing'}</p>
        <p>Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing'}</p>
        <p>Storage Bucket: {import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Present' : '❌ Missing'}</p>
        <p>App ID: {import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Present' : '❌ Missing'}</p>
      </div>
    </div>
  );
}

export default App;
