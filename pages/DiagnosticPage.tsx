import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const DiagnosticPage: React.FC = () => {
    const [testResults, setTestResults] = useState<{[key: string]: string}>({});

    const pages = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Customers', path: '/customers' },
        { name: 'Reports', path: '/reports' },
        { name: 'Import', path: '/import' },
        { name: 'Advanced Imports', path: '/advanced-imports' },
        { name: 'Export', path: '/export' },
        { name: 'Agents', path: '/agents' },
        { name: 'Dispositions', path: '/dispositions' },
        { name: 'Shows', path: '/shows' },
        { name: 'Associations', path: '/associations' },
        { name: 'Users', path: '/users' }
    ];

    const testPage = (pageName: string, path: string) => {
        try {
            // Open page in new tab to test
            window.open(window.location.origin + window.location.pathname + '#' + path, '_blank');
            setTestResults(prev => ({...prev, [pageName]: 'Opened - Check manually'}));
        } catch (error) {
            setTestResults(prev => ({...prev, [pageName]: `Error: ${error}`}));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
            <Header title="Page Diagnostics" />
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            Page Diagnostic Tool
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Test each navigation page to identify which ones are working properly.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pages.map((page) => (
                                <div key={page.name} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        {page.name}
                                    </h3>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => testPage(page.name, page.path)}
                                            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Test in New Tab
                                        </button>
                                        <Link
                                            to={page.path}
                                            className="block w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 text-center"
                                        >
                                            Navigate Here
                                        </Link>
                                        {testResults[page.name] && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                {testResults[page.name]}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                Testing Instructions:
                            </h3>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                <li>• Click "Test in New Tab" to open each page in a new tab</li>
                                <li>• Click "Navigate Here" to navigate directly to the page</li>
                                <li>• Check if the page loads properly or shows a blank/error screen</li>
                                <li>• Report back which pages work and which don't</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DiagnosticPage;
