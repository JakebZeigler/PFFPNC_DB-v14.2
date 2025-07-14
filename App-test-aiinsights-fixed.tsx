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

// Import AiInsightsCard with PROPER PROPS to fix the crash
import { AiInsightsCard } from './components/AiInsightsCard';

// Test Dashboard with Header + Icons + AiInsightsCard (with proper props)
const DashboardWithAiInsightsFixed = () => {
    // Create mock data for AiInsightsCard props to prevent crash
    const mockWtdStats = {
        wtdSales: { value: '$1,234.56', count: 5 },
        wtdPayments: { value: '$987.65', count: 3 },
        wtdResSales: '$500.00',
        wtdBizSales: '$734.56',
        wtdColdSales: '$200.00',
        wtdPcSales: '$534.56'
    };

    const mockTopAgents = [
        {
            agent: { firstName: 'John', lastName: 'Doe' },
            sales: 1234.56,
            payments: 987.65
        },
        {
            agent: { firstName: 'Jane', lastName: 'Smith' },
            sales: 876.54,
            payments: 543.21
        }
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
            <h1>Testing Dashboard with Header + Icons + AiInsightsCard (FIXED)</h1>
            <p>✅ Basic Dashboard component works!</p>
            <p>✅ Header component works!</p>
            <p>✅ Icon components work!</p>
            <p>🔧 Now testing AiInsightsCard with PROPER PROPS...</p>
            
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
            
            {/* Test AiInsightsCard component WITH PROPER PROPS */}
            <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
                <h3>AiInsightsCard Component Test (WITH PROPS):</h3>
                <AiInsightsCard wtdStats={mockWtdStats} topAgents={mockTopAgents} />
            </div>
            
            <p>✅ If you see this, AiInsightsCard component works with proper props!</p>
        </div>
    );
};

// Test with all contexts + routing + REAL LoginPage + Header + Icons + AiInsightsCard (FIXED)
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔧 Testing Dashboard with AiInsightsCard FIXED (proper props)</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithAiInsightsFixed />} />
                                    <Route path="/" element={<DashboardWithAiInsightsFixed />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d4edda' }}>
                                    <h2>AiInsightsCard FIXED Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>✅ Simple dashboard works</p>
                                    <p>✅ Header component works</p>
                                    <p>✅ Icon components work</p>
                                    <p>🔧 Testing AiInsightsCard with proper props</p>
                                    <p><strong>If you see this, the crash is FIXED!</strong></p>
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
