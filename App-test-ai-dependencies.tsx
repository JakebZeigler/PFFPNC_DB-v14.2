import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './components/Toast';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/FirebaseDataContext';

// Import the REAL LoginPage (confirmed working)
import LoginPage from './pages/LoginPage';

// Import Header (confirmed working)
import Header from './components/Header';

// Import Icon components (confirmed working)
import UploadIcon from './components/icons/UploadIcon';
import DownloadIcon from './components/icons/DownloadIcon';
import ChartBarIcon from './components/icons/ChartBarIcon';
import UsersIcon from './components/icons/UsersIcon';

// Import AiInsightsCard dependencies one by one
import Spinner from './components/Spinner';
import Modal from './components/Modal';
import { useToast } from './components/Toast';
import PencilIcon from './components/icons/PencilIcon';
import SparklesIcon from './components/icons/SparklesIcon';

// Test each dependency individually
const TestSpinner = () => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h4>Testing Spinner Component:</h4>
            <Spinner />
            <p>✅ Spinner works!</p>
        </div>
    );
};

const TestModal = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h4>Testing Modal Component:</h4>
            <button onClick={() => setIsOpen(true)}>Open Modal</button>
            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Test Modal">
                <p>Modal content works!</p>
            </Modal>
            <p>✅ Modal works!</p>
        </div>
    );
};

const TestToastHook = () => {
    const { showToast } = useToast();
    
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h4>Testing useToast Hook:</h4>
            <button onClick={() => showToast('Test toast message', 'success')}>Show Toast</button>
            <p>✅ useToast hook works!</p>
        </div>
    );
};

const TestIcons = () => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
            <h4>Testing PencilIcon and SparklesIcon:</h4>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <PencilIcon />
                    <p>Pencil</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <SparklesIcon />
                    <p>Sparkles</p>
                </div>
            </div>
            <p>✅ PencilIcon and SparklesIcon work!</p>
        </div>
    );
};

// Test Dashboard with all AiInsightsCard dependencies
const DashboardWithAIDependencies = () => {
    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
            <h1>Testing AiInsightsCard Dependencies</h1>
            <p>✅ Basic Dashboard component works!</p>
            <p>✅ Header component works!</p>
            <p>✅ Icon components work!</p>
            <p>✅ Minimal AI Insights works!</p>
            <p>🔍 Now testing ALL AiInsightsCard dependencies individually...</p>
            
            {/* Test Header component */}
            <div style={{ border: '2px solid #007bff', padding: '10px', margin: '10px 0' }}>
                <h3>Header Component Test:</h3>
                <Header />
            </div>
            
            {/* Test Icon components */}
            <div style={{ border: '2px solid #28a745', padding: '10px', margin: '10px 0' }}>
                <h3>Icon Components Test:</h3>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                        <UploadIcon />
                        <p>Upload</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <DownloadIcon />
                        <p>Download</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <ChartBarIcon />
                        <p>Chart</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <UsersIcon />
                        <p>Users</p>
                    </div>
                </div>
            </div>
            
            {/* Test AiInsightsCard Dependencies */}
            <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
                <h3>AiInsightsCard Dependencies Test:</h3>
                
                <TestSpinner />
                <TestModal />
                <TestToastHook />
                <TestIcons />
            </div>
            
            <p>🎉 If you see this, ALL AiInsightsCard dependencies work individually!</p>
        </div>
    );
};

// Test with all contexts + routing + dependencies
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing ALL AiInsightsCard Dependencies Individually</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithAIDependencies />} />
                                    <Route path="/" element={<DashboardWithAIDependencies />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff3cd' }}>
                                    <h2>AiInsightsCard Dependencies Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>✅ Simple dashboard works</p>
                                    <p>✅ Header component works</p>
                                    <p>✅ Icon components work</p>
                                    <p>✅ Minimal AI Insights works</p>
                                    <p>🔍 Testing individual AiInsightsCard dependencies</p>
                                    <p><strong>This will show which specific dependency causes the crash!</strong></p>
                                </div>
                            </div>
                        </DataProvider>
                    </AuthProvider>
                </ToastProvider>
            </ThemeProvider>
        </HashRouter>
    );
};

export default App;
