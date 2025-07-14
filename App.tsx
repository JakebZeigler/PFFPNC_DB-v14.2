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

// Create a MINIMAL AiInsightsCard that doesn't use geminiService
const MinimalAiInsightsCard: React.FC<{ wtdStats: any; topAgents: any[] }> = ({ wtdStats, topAgents }) => {
    return (
        <div style={{ 
            border: '1px solid #ccc', 
            borderRadius: '8px', 
            padding: '16px', 
            backgroundColor: '#f9f9f9',
            margin: '10px 0'
        }}>
            <h3 style={{ color: '#333', marginBottom: '12px' }}>🤖 AI Insights Card (Minimal Test)</h3>
            <div style={{ marginBottom: '8px' }}>
                <strong>Week-to-Date Stats:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    <li>Sales: {wtdStats?.wtdSales?.value || 'N/A'}</li>
                    <li>Payments: {wtdStats?.wtdPayments?.value || 'N/A'}</li>
                    <li>Residential: {wtdStats?.wtdResSales || 'N/A'}</li>
                </ul>
            </div>
            <div>
                <strong>Top Agents:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                    {topAgents?.map((agent, index) => (
                        <li key={index}>
                            {agent?.agent?.firstName} {agent?.agent?.lastName}: ${agent?.sales?.toFixed(2) || '0.00'}
                        </li>
                    )) || <li>No agents data</li>}
                </ul>
            </div>
            <p style={{ 
                marginTop: '12px', 
                padding: '8px', 
                backgroundColor: '#e8f5e8', 
                borderRadius: '4px',
                fontSize: '14px'
            }}>
                ✅ Minimal AI Insights Card works! (No geminiService dependency)
            </p>
        </div>
    );
};

// Test Dashboard with Header + Icons + Minimal AiInsightsCard
const DashboardWithMinimalAI = () => {
    // Create mock data for AiInsightsCard props
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
            <h1>Testing Dashboard with Minimal AI Insights</h1>
            <p>✅ Basic Dashboard component works!</p>
            <p>✅ Header component works!</p>
            <p>✅ Icon components work!</p>
            <p>🔍 Now testing MINIMAL AiInsightsCard (no geminiService)...</p>
            
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
            
            {/* Test Minimal AiInsightsCard component */}
            <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
                <h3>Minimal AiInsightsCard Test:</h3>
                <MinimalAiInsightsCard wtdStats={mockWtdStats} topAgents={mockTopAgents} />
            </div>
            
            <p>✅ If you see this, Minimal AiInsightsCard works!</p>
        </div>
    );
};

// Test with all contexts + routing + REAL LoginPage + Header + Icons + Minimal AI
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔍 Testing Dashboard with Minimal AI Insights (No geminiService)</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithMinimalAI />} />
                                    <Route path="/" element={<DashboardWithMinimalAI />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#d1ecf1' }}>
                                    <h2>Minimal AI Insights Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>✅ Simple dashboard works</p>
                                    <p>✅ Header component works</p>
                                    <p>✅ Icon components work</p>
                                    <p>🔍 Testing Minimal AI Insights (no geminiService)</p>
                                    <p><strong>If you see this, the issue is in geminiService!</strong></p>
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
