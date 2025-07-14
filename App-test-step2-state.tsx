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

// STEP 2: Add State Management to AiInsightsCard
const Step2AiInsightsCard: React.FC<{ wtdStats: any; topAgents: any[] }> = ({ wtdStats, topAgents }) => {
    // Add all the state management from original AiInsightsCard
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const { showToast } = useToast();

    // Add useCallback hooks
    const handleGenerateSummary = useCallback(async () => {
        console.log('Generate summary clicked - Step 2 test');
        showToast('Step 2: State management works!', 'success');
    }, [showToast]);

    const handleCustomPromptSubmit = useCallback(async () => {
        console.log('Custom prompt submitted - Step 2 test');
        showToast('Step 2: Custom prompt state works!', 'success');
        setIsModalOpen(false);
    }, [showToast]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <SparklesIcon />
                    <span className="ml-2">AI Insights (Step 2)</span>
                </h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    title="Edit prompt"
                >
                    <PencilIcon />
                </button>
            </div>
            
            <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                    🎉 Step 2: State management added successfully!
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">State Variables:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                        <li>isGenerating: {isGenerating.toString()}</li>
                        <li>summary: {summary || 'empty'}</li>
                        <li>isModalOpen: {isModalOpen.toString()}</li>
                        <li>customPrompt: {customPrompt || 'empty'}</li>
                    </ul>
                </div>
                
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
                
                {/* Test buttons with state management */}
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isGenerating ? 'Generating...' : 'Generate AI Summary'}
                    </button>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Edit Prompt
                    </button>
                </div>
                
                {/* Test Modal with state */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit AI Prompt">
                    <div className="space-y-4">
                        <p className="text-gray-600">Step 2: Modal state management test</p>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            rows={4}
                            placeholder="Enter custom prompt..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCustomPromptSubmit}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </Modal>
                
                <p className="text-green-600 font-medium">
                    ✅ If you see this, Step 2 (State Management) works!
                </p>
            </div>
        </div>
    );
};

// Test Dashboard with Step 2 AiInsightsCard
const DashboardWithStep2AI = () => {
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
            <h1>Testing Step 2: AiInsightsCard State Management</h1>
            <p>✅ Step 1: Basic structure works!</p>
            <p>🔧 Now testing Step 2: State management...</p>
            
            {/* Test Header component */}
            <div style={{ border: '2px solid #007bff', padding: '10px', margin: '10px 0' }}>
                <h3>Header Component Test:</h3>
                <Header />
            </div>
            
            {/* Test Step 2 AiInsightsCard */}
            <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
                <h3>Step 2 AiInsightsCard Test (State Management):</h3>
                <Step2AiInsightsCard wtdStats={mockWtdStats} topAgents={mockTopAgents} />
            </div>
            
            <p>🎉 If you see this, Step 2 AiInsightsCard state management works!</p>
        </div>
    );
};

// Test with all contexts + routing + Step 2 AI
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔧 Testing AiInsightsCard Step 2: State Management</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithStep2AI />} />
                                    <Route path="/" element={<DashboardWithStep2AI />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e1f5fe' }}>
                                    <h2>Step 2: State Management Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ Routing works</p>
                                    <p>✅ All dependencies work individually</p>
                                    <p>✅ Step 1: Basic structure works</p>
                                    <p>🔧 Testing Step 2: State management (useState, useCallback, useToast)</p>
                                    <p><strong>Test buttons and modal to verify state works!</strong></p>
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
