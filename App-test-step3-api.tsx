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

// Import the FIXED geminiService (this might be the crash point)
import { generateDashboardSummaryFromPrompt } from './services/geminiService';

// STEP 3: Add API Calls to AiInsightsCard
const Step3AiInsightsCard: React.FC<{ wtdStats: any; topAgents: any[] }> = ({ wtdStats, topAgents }) => {
    // Add all the state management from Step 2
    const [isGenerating, setIsGenerating] = useState(false);
    const [summary, setSummary] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const { showToast } = useToast();

    // Default prompt (from original AiInsightsCard)
    const DEFAULT_PROMPT = `You are a data analyst and strategic advisor for PFFPNC, a fundraising organization. Your audience is the management team.
Analyze the provided week-to-date performance data and generate a concise, actionable summary.

Your output **MUST** use the following markdown format strictly:
## Key Performance Insights
* [Insight 1]
* [Insight 2]
* [Insight 3]

## Recommendations
* [Recommendation 1]
* [Recommendation 2]
* [Recommendation 3]

Week-to-Date Data:
- Total Sales: ${wtdStats?.wtdSales?.value || 'N/A'} (${wtdStats?.wtdSales?.count || 0} transactions)
- Total Payments: ${wtdStats?.wtdPayments?.value || 'N/A'} (${wtdStats?.wtdPayments?.count || 0} transactions)
- Residential Sales: ${wtdStats?.wtdResSales || 'N/A'}
- Business Sales: ${wtdStats?.wtdBizSales || 'N/A'}
- Cold Sales: ${wtdStats?.wtdColdSales || 'N/A'}
- PC Sales: ${wtdStats?.wtdPcSales || 'N/A'}

Top Performing Agents:
${topAgents?.slice(0, 5).map((agent, index) => 
    `${index + 1}. ${agent?.agent?.firstName} ${agent?.agent?.lastName}: $${agent?.sales?.toFixed(2) || '0.00'} in sales, $${agent?.payments?.toFixed(2) || '0.00'} in payments`
).join('\n') || 'No agent data available'}`;

    // Add REAL API call with error handling
    const handleGenerateSummary = useCallback(async () => {
        console.log('Step 3: Starting API call to geminiService...');
        setIsGenerating(true);
        setSummary('');
        
        try {
            console.log('Step 3: Calling generateDashboardSummaryFromPrompt...');
            const result = await generateDashboardSummaryFromPrompt(DEFAULT_PROMPT);
            console.log('Step 3: API call successful, result:', result);
            
            setSummary(result);
            showToast('AI summary generated successfully!', 'success');
        } catch (error) {
            console.error('Step 3: API call failed:', error);
            setSummary('Error generating AI summary. Please check the console for details.');
            showToast('Failed to generate AI summary. Check console for details.', 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [DEFAULT_PROMPT, showToast]);

    const handleCustomPromptSubmit = useCallback(async () => {
        if (!customPrompt.trim()) {
            showToast('Please enter a custom prompt', 'error');
            return;
        }

        console.log('Step 3: Starting custom prompt API call...');
        setIsGenerating(true);
        setSummary('');
        
        try {
            console.log('Step 3: Calling generateDashboardSummaryFromPrompt with custom prompt...');
            const result = await generateDashboardSummaryFromPrompt(customPrompt);
            console.log('Step 3: Custom prompt API call successful, result:', result);
            
            setSummary(result);
            showToast('Custom AI summary generated successfully!', 'success');
            setIsModalOpen(false);
        } catch (error) {
            console.error('Step 3: Custom prompt API call failed:', error);
            setSummary('Error generating custom AI summary. Please check the console for details.');
            showToast('Failed to generate custom AI summary. Check console for details.', 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [customPrompt, showToast]);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <SparklesIcon />
                    <span className="ml-2">AI Insights (Step 3 - API Calls)</span>
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
                    🎉 Step 3: API calls added successfully!
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">State Variables:</h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400">
                        <li>isGenerating: {isGenerating.toString()}</li>
                        <li>summary length: {summary.length} characters</li>
                        <li>isModalOpen: {isModalOpen.toString()}</li>
                        <li>customPrompt length: {customPrompt.length} characters</li>
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
                
                {/* Test buttons with REAL API calls */}
                <div className="flex gap-2">
                    <button
                        onClick={handleGenerateSummary}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating && <Spinner />}
                        {isGenerating ? 'Generating...' : 'Generate AI Summary (REAL API)'}
                    </button>
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Edit Prompt
                    </button>
                </div>
                
                {/* Display AI Summary */}
                {summary && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">AI Summary:</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {summary}
                        </div>
                    </div>
                )}
                
                {/* Test Modal with REAL API call */}
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit AI Prompt">
                    <div className="space-y-4">
                        <p className="text-gray-600">Step 3: Custom prompt with REAL API call</p>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full p-3 border rounded-lg"
                            rows={6}
                            placeholder="Enter custom prompt for AI analysis..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleCustomPromptSubmit}
                                disabled={isGenerating}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isGenerating && <Spinner />}
                                {isGenerating ? 'Generating...' : 'Generate Custom Summary'}
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
                    ✅ If you see this, Step 3 (API Calls) works!
                </p>
            </div>
        </div>
    );
};

// Test Dashboard with Step 3 AiInsightsCard
const DashboardWithStep3AI = () => {
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
            <h1>Testing Step 3: AiInsightsCard API Calls</h1>
            <p>✅ Step 1: Basic structure works!</p>
            <p>✅ Step 2: State management works!</p>
            <p>🔧 Now testing Step 3: REAL API calls...</p>
            
            {/* Test Header component */}
            <div style={{ border: '2px solid #007bff', padding: '10px', margin: '10px 0' }}>
                <h3>Header Component Test:</h3>
                <Header />
            </div>
            
            {/* Test Step 3 AiInsightsCard */}
            <div style={{ border: '2px solid #dc3545', padding: '10px', margin: '10px 0' }}>
                <h3>Step 3 AiInsightsCard Test (REAL API Calls):</h3>
                <Step3AiInsightsCard wtdStats={mockWtdStats} topAgents={mockTopAgents} />
            </div>
            
            <p>🎉 If you see this, Step 3 AiInsightsCard API calls work!</p>
        </div>
    );
};

// Test with all contexts + routing + Step 3 AI
const App: React.FC = () => {
    return (
        <HashRouter>
            <ThemeProvider>
                <ToastProvider>
                    <AuthProvider>
                        <DataProvider>
                            <div style={{ padding: '20px', backgroundColor: '#f0f0f0' }}>
                                <h1>PFFPNC Database Management System</h1>
                                <p>🔧 Testing AiInsightsCard Step 3: REAL API Calls</p>
                                
                                <Routes>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/dashboard" element={<DashboardWithStep3AI />} />
                                    <Route path="/" element={<DashboardWithStep3AI />} />
                                </Routes>
                                
                                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff8e1' }}>
                                    <h2>Step 3: API Calls Test</h2>
                                    <p>✅ All contexts loaded</p>
                                    <p>✅ All dependencies work individually</p>
                                    <p>✅ Step 1: Basic structure works</p>
                                    <p>✅ Step 2: State management works</p>
                                    <p>🔧 Testing Step 3: REAL API calls to geminiService</p>
                                    <p><strong>Click "Generate AI Summary" to test the REAL API!</strong></p>
                                    <p><em>Note: API may return error message if VITE_API_KEY not set in Vercel</em></p>
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
