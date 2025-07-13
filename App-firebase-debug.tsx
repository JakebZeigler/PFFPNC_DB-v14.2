import React from 'react';

function App() {
  const [status, setStatus] = React.useState('Loading...');
  const [errorDetails, setErrorDetails] = React.useState('');
  const [configDetails, setConfigDetails] = React.useState('');

  React.useEffect(() => {
    // Test Firebase initialization with detailed error reporting
    const testFirebase = async () => {
      try {
        // Show the actual config values (first few chars only for security)
        const config = {
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
          appId: import.meta.env.VITE_FIREBASE_APP_ID
        };

        setConfigDetails(`
          API Key: ${config.apiKey?.substring(0, 10)}...
          Auth Domain: ${config.authDomain}
          Project ID: ${config.projectId}
          Storage Bucket: ${config.storageBucket}
          App ID: ${config.appId?.substring(0, 15)}...
        `);

        // Try to initialize Firebase
        const { initializeApp } = await import('firebase/app');
        const { getFirestore } = await import('firebase/firestore');
        
        console.log('Attempting Firebase initialization with config:', config);
        const app = initializeApp(config);
        const db = getFirestore(app);
        
        setStatus('✅ Firebase initialized successfully!');
      } catch (error: any) {
        setStatus('❌ Firebase initialization failed');
        setErrorDetails(`Error: ${error.message}\nCode: ${error.code}\nStack: ${error.stack?.substring(0, 200)}...`);
        console.error('Detailed Firebase error:', error);
      }
    };

    testFirebase();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>PFFPNC Database Management System</h1>
      <p>Firebase Detailed Debugging...</p>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <h2>Firebase Status:</h2>
        <p>{status}</p>
      </div>
      
      {errorDetails && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffe6e6', whiteSpace: 'pre-wrap' }}>
          <h3>Error Details:</h3>
          <p style={{ fontSize: '12px', fontFamily: 'monospace' }}>{errorDetails}</p>
        </div>
      )}
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4fd', whiteSpace: 'pre-wrap' }}>
        <h3>Config Values (partial):</h3>
        <p style={{ fontSize: '12px', fontFamily: 'monospace' }}>{configDetails}</p>
      </div>
    </div>
  );
}

export default App;
