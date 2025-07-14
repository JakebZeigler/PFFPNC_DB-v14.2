import React, { useState, useCallback } from 'react';
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

// Import AiInsightsCard dependencies (all confirmed working)
import Spinner from './components/Spinner';
import Modal from './components/Modal';
import { useToast } from './components/Toast';
import PencilIcon from './components/icons/PencilIcon';
import SparklesIcon from './components/icons/SparklesIcon';

// STEP 1: Basic AiInsightsCard Structure (no logic)
const StepByStepAiInsightsCard: React.FC<{ wtdStats: any; topAgents: any[] }> = ({ wtdStats, topAgents }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <SparklesIcon />
                    <span className="ml-2">AI Insights</span>
                </h2>
            </div>
            
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                    🎉 Step 1: Basic AiInsightsCard structure works!
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Week-to-Date Stats:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                        <li>Sales: {wtdStats?.wtdSales?.value || 'N/A'}</li>
                        <li>Payments: {wtdStats?.wtdPayments?.value || 'N/A'}</li>
                        <li>Residential: {wtdStats?.wtdResSales || 'N/A'}</li>
                    </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Top Agents:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                        {topAgents?.slice(0, 3).map((agent, index) => (
                            <li key={index}>
                                {agent?.agent?.firstName} {agent?.agent?.lastName}: ${agent?.sales?.toFixed(2) || '0.00'}
                            </li>
                        )) || <li>No agents data</li>}
                    </ul>
                </div>
                
                <p className="text-green-600 font-medium">
                    ✅ If you see this, Step 1 (Basic Structure) works!
                </p>
            </div>
        </div>
    );
};

// Test Dashboard with Step-by-Step AiInsightsCard
const DashboardWithStepByStepAI = () => {
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
        },
        {
            agent: { firstName: 'Bob', lastName: 'Johnson' },
            sales: 654.32,
            payments: 321.09
        }
    ];

    return (
        <div style={{ padding: '20px', backgroundColor: '#f0f8ff' }}>
            <h1>Testing Step-by-Step AiInsightsCard</h1>
            <p>✅ All dependencies work individually!</p>
            <p>🔧 Now testing AiInsightsCard logic step by step...</p>
            
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
            
            {/* Test Step-by-Step AiInsightsCard */}
            <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
                <h3>Step-by-Step AiInsightsCard Test:</h3>
                <StepByStepAiInsightsCard wtdStats={mockWtdStats} topAgents={mockTopAgents} />
            </div>
            
            <p>🎉 If you see this, Step 1 AiInsightsCard basic structure works!</p>
        </div>
    );
};

// Test with all contexts + routing + Step-by-Step AI
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔧 Testing AiInsightsCard Logic Step by Step</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithStepByStepAI />} />
                                    <Route path="/" element={<DashboardWithStepByStepAI />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f5e8' }}>
                                    <h2>Step-by-Step AiInsightsCard Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ LoginPage works</p>
                                    <p>✅ Simple dashboard works</p>
                                    <p>✅ Header component works</p>
                                    <p>✅ Icon components work</p>
                                    <p>✅ All dependencies work individually</p>
                                    <p>🔧 Testing AiInsightsCard basic structure (Step 1)</p>
                                    <p><strong>Next: Add state management, then buttons, then API calls</strong></p>
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
