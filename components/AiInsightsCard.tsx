
import React, { useState, useCallback } from 'react';
import { generateDashboardSummaryFromPrompt } from '../services/geminiService';
import Spinner from './Spinner';
import Modal from './Modal';
import { useToast } from './Toast';
import PencilIcon from './icons/PencilIcon';
import SparklesIcon from './icons/SparklesIcon';

interface AiInsightsCardProps {
    wtdStats: any;
    topAgents: any[];
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    // A simple renderer for basic markdown from the AI.
    const sections = content.split(/(\n## .*?\n)/).filter(Boolean);

    return (
        <div>
            {sections.map((section, sectionIndex) => {
                if (section.trim().startsWith('##')) {
                    return <h2 key={sectionIndex} className="text-xl font-bold mt-4 mb-2 text-gray-800 dark:text-gray-200">{section.replace(/##/g, '').trim()}</h2>;
                }

                const listItems = section.split('\n').filter(line => line.trim().startsWith('* '));
                if (listItems.length > 0) {
                    return (
                        <ul key={sectionIndex} className="space-y-2">
                            {listItems.map((item, itemIndex) => {
                                const cleanItem = item.trim().substring(2);
                                const parts = cleanItem.split('**').map((part, i) => 
                                    i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">{part}</strong> : <span key={i}>{part}</span>
                                );
                                return <li key={itemIndex} className="flex items-start"><span className="text-brand-red mr-2 mt-1">&#8226;</span><span>{parts}</span></li>;
                            })}
                        </ul>
                    );
                }
                
                const paragraphs = section.trim().split('\n').filter(Boolean);
                return (
                    <div key={sectionIndex}>
                        {paragraphs.map((p, pIndex) => {
                             const parts = p.split('**').map((part, i) => 
                                i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">{part}</strong> : <span key={i}>{part}</span>
                            );
                            return <p key={pIndex} className="mb-2">{parts}</p>
                        })}
                    </div>
                )
            })}
        </div>
    );
};

const DEFAULT_PROMPT = `You are a data analyst and strategic advisor for PFFPNC, a fundraising organization. Your audience is the management team.
Analyze the provided week-to-date performance data and generate a concise, actionable summary.

Your output **MUST** use the following markdown format strictly:
## Summary
A 1-2 sentence overview of the week's performance.

## Key Insights
* **Highlight:** One major positive finding. For example, mention a top agent's exceptional performance or a surprising trend in sales categories. Use the provided data to be specific.
* **Concern:** One area of concern. For example, identify underperforming categories or a drop in average payment value.
* **Trend:** An interesting trend or comparison. For example, compare Business vs. Residential sales, or PC vs. Cold call success.

## Recommendations
* **Action Item 1:** A specific, data-driven recommendation. For example, "Focus on replicating Agent X's success by analyzing their call patterns."
* **Action Item 2:** Another specific recommendation. For example, "Launch a targeted mini-campaign for Residential PCs, as this category shows high conversion rates."

Do not include any text before the "## Summary" heading or after the recommendations. Be professional, data-driven, and concise.`;

export const AiInsightsCard: React.FC<AiInsightsCardProps> = ({ wtdStats, topAgents }) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
    const [editedPrompt, setEditedPrompt] = useState(prompt);

    const constructDataPayload = () => {
        const topAgentsData = topAgents.map(a => `- ${a.agent.firstName} ${a.agent.lastName}: Sales $${a.sales.toFixed(2)}, Payments $${a.payments.toFixed(2)}`).join('\n');

        return `
--- DATA START ---
Week-to-Date Stats:
- Total Sales: ${wtdStats.wtdSales.value} (${wtdStats.wtdSales.count} transactions)
- Total Payments: ${wtdStats.wtdPayments.value} (${wtdStats.wtdPayments.count} transactions)
- Residential Sales: ${wtdStats.wtdResSales}
- Business Sales: ${wtdStats.wtdBizSales}
- Cold Sales: ${wtdStats.wtdColdSales}
- PC Sales: ${wtdStats.wtdPcSales}

Top Performing Agents:
${topAgentsData || 'No agent data for this period.'}
--- DATA END ---
        `;
    }

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setSummary('');
        setError(null);
        try {
            const dataPayload = constructDataPayload();
            const fullPrompt = `${prompt}\n\n${dataPayload}`;

            const result = await generateDashboardSummaryFromPrompt(fullPrompt);
            setSummary(result);
        } catch (e: any) {
            const errorMessage = "Failed to generate summary. Please check the console for details.";
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [prompt, wtdStats, topAgents]);

    const handleSavePrompt = () => {
        setPrompt(editedPrompt);
        setIsModalOpen(false);
        addToast("Prompt updated successfully!", "success");
    };

    return (
        <div className="bg-white dark:bg-neutral-800 shadow-lg rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-3">
                    <SparklesIcon className="h-7 w-7 text-brand-red" />
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">AI-Powered Weekly Summary</h2>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    aria-label="Edit AI prompt"
                >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Prompt</span>
                </button>
            </div>
            
            {summary && !isLoading && (
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 leading-relaxed">
                    <MarkdownRenderer content={summary} />
                </div>
            )}
            
            {isLoading && (
                <div className="flex justify-center items-center h-48">
                    <Spinner size="md" />
                </div>
            )}

            {error && !isLoading && (
                <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-4 rounded-md">
                    <p>{error}</p>
                </div>
            )}
            
            {!summary && !isLoading && !error && (
                <div className="text-center py-10">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Click the button to generate an AI-powered analysis of this week's data.</p>
                    <button
                        onClick={handleGenerate}
                        className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
                    >
                        Generate Summary
                    </button>
                </div>
            )}
            
            {summary && !isLoading && (
                 <div className="text-center mt-6">
                    <button
                        onClick={handleGenerate}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-6 rounded-lg transition-colors"
                    >
                        Regenerate
                    </button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit AI Summary Prompt">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Edit the prompt used to generate the AI summary. The system will automatically append the weekly data to your prompt.
                    </p>
                    <textarea
                        value={editedPrompt}
                        onChange={(e) => setEditedPrompt(e.target.value)}
                        rows={15}
                        className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-900 dark:border-neutral-600 font-mono text-sm"
                        aria-label="AI prompt editor"
                    />
                    <div className="flex justify-end space-x-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-neutral-600 rounded-md">Cancel</button>
                        <button onClick={handleSavePrompt} className="px-4 py-2 bg-brand-red text-white rounded-md">Save and Close</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
