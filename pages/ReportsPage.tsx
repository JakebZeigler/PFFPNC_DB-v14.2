



import React, { useState, useMemo, FC } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { flushSync } from 'react-dom';
import Header from '../components/Header';
import { useData } from '../context/DataContext';
import { CustomerWithHistory, Agent, Disposition, Show, Association, DispositionModifier, DispositionHistory } from '../types';
import { downloadCSV, objectToCsv, downloadHTML } from '../utils/csv';
import DownloadIcon from '../components/icons/DownloadIcon';
import { useToast } from '../components/Toast';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import { useTheme } from '../context/ThemeContext';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';

type AugmentedHistoryRecord = DispositionHistory & { customer: CustomerWithHistory };

// --- SHARED COMPONENTS WITHIN REPORTS ---

const Pagination: FC<{ currentPage: number, totalPages: number, onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    return (
        <div className="flex items-center space-x-1">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 text-sm font-medium text-white bg-brand-red rounded-md hover:bg-brand-red-dark disabled:bg-gray-400 disabled:cursor-not-allowed">Prev</button>
            <span className="text-sm px-2 text-gray-600 dark:text-gray-400">{`Page ${currentPage} of ${totalPages}`}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 text-sm font-medium text-white bg-brand-red rounded-md hover:bg-brand-red-dark disabled:bg-gray-400 disabled:cursor-not-allowed">Next</button>
        </div>
    );
};

const ReportStatCard: FC<{ label: string; value: string | number; subValue?: string; className?: string }> = ({ label, value, subValue, className = '' }) => (
    <div className={`bg-gray-50 dark:bg-neutral-700/50 p-4 rounded-lg text-center ${className}`}>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
        {subValue && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subValue}</p>}
    </div>
);

const BarChart: FC<{ data: { label: string; value: number; color?: string }[]; height?: number }> = ({ data, height = 200 }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (maxValue === 0) return <div style={{ height }} className="flex items-center justify-center text-gray-500">No data to display.</div>;
    return (
        <div className="flex items-end space-x-2" style={{ height }}>
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end">
                    <div className="text-xs font-bold text-gray-700 dark:text-gray-200">{item.value}</div>
                    <div
                        className="w-full rounded-t-md"
                        style={{ height: `${(item.value / maxValue) * 80}%`, backgroundColor: item.color || '#B91C1C' }}
                        title={`${item.label}: ${item.value}`}
                    ></div>
                    <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">{item.label}</div>
                </div>
            ))}
        </div>
    );
};

// --- REPORT TYPE COMPONENTS ---

const CustomerBreakdownReport: FC<{ data: AugmentedHistoryRecord[] }> = ({ data }) => {
    const { getDispositionById, getAgentByNumber, getAssociationById, getShowByNumber } = useData();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const stats = useMemo(() => {
        let saleCount = 0, paymentCount = 0, totalSales = 0, totalPayments = 0;
        let bizSales = 0, resSales = 0, coldSales = 0, pcSales = 0;

        data.forEach(h => {
            const disp = getDispositionById(h.dispositionId);
            if (!disp) return;

            const isSale = disp.modifiers.includes(DispositionModifier.Sale);
            const isPayment = disp.modifiers.includes(DispositionModifier.Payment);
            const amount = h.amount || 0;

            if (isSale) {
                saleCount++;
                totalSales += amount;
                
                const isBusiness = h.customer.businessResidential?.toUpperCase().startsWith('B');
                const isResidential = h.customer.businessResidential?.toUpperCase().startsWith('R');
                if (isBusiness) {
                    bizSales += amount;
                } else if (isResidential) {
                    resSales += amount;
                }
                
                const isCold = h.customer.coldPc?.toUpperCase().startsWith('C');
                const isPC = h.customer.coldPc?.toUpperCase().startsWith('P');
                if (isCold) {
                    coldSales += amount;
                } else if (isPC) {
                    pcSales += amount;
                }
            }
            if (isPayment) {
                paymentCount++;
                totalPayments += amount;
            }
        });
        
        return {
            saleCount, paymentCount, totalSales, totalPayments,
            avgSale: saleCount > 0 ? totalSales / saleCount : 0,
            avgPayment: paymentCount > 0 ? totalPayments / paymentCount : 0,
            bizSales, resSales, coldSales, pcSales,
        };
    }, [data, getDispositionById]);
    
    const customerDataForTable = useMemo(() => {
        const customerMap = new Map<string, { customer: CustomerWithHistory, lastHistory: AugmentedHistoryRecord }>();
        data.forEach(h => {
            const existing = customerMap.get(h.customer.id);
            if (!existing || new Date(h.dispositionTime) > new Date(existing.lastHistory.dispositionTime)) {
                customerMap.set(h.customer.id, { customer: h.customer, lastHistory: h });
            }
        });
        return Array.from(customerMap.values()).map(({ customer, lastHistory }) => ({
            ...customer,
            dispositionId: lastHistory.dispositionId,
            dispositionTime: lastHistory.dispositionTime,
            agentNumber: lastHistory.agentNumber,
            amount: lastHistory.amount,
        }));
    }, [data]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return customerDataForTable.slice(startIndex, startIndex + itemsPerPage);
    }, [customerDataForTable, currentPage]);

    const totalPages = Math.ceil(customerDataForTable.length / itemsPerPage);

    const handleExport = () => {
        const dataToExport = customerDataForTable.map(c => ({
            Name: `${c.firstName} ${c.lastName}`,
            Phone: c.phone,
            BusinessResidential: c.businessResidential,
            'Cold/PC': c.coldPc,
            'Last Disposition': getDispositionById(c.dispositionId)?.name,
            'Last Disposition Time': new Date(c.dispositionTime).toLocaleString(),
            Agent: getAgentByNumber(c.agentNumber)?.firstName,
            Amount: c.amount,
            Association: getAssociationById(c.associationId)?.associationName,
            Show: getShowByNumber(c.showNumber)?.showName,
        }));
        downloadCSV(objectToCsv(dataToExport), 'customer_breakdown.csv');
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                 <ReportStatCard label="Total Sales" value={`$${stats.totalSales.toFixed(2)}`} subValue={`${stats.saleCount} sales`} />
                 <ReportStatCard label="Total Payments" value={`$${stats.totalPayments.toFixed(2)}`} subValue={`${stats.paymentCount} payments`} />
                 <ReportStatCard label="Avg Sale" value={`$${stats.avgSale.toFixed(2)}`} />
                 <ReportStatCard label="Avg Payment" value={`$${stats.avgPayment.toFixed(2)}`} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BarChart data={[
                    { label: 'Business', value: stats.bizSales, color: '#DC2626' },
                    { label: 'Residential', value: stats.resSales, color: '#F87171' }
                ]} />
                <BarChart data={[
                    { label: 'Cold', value: stats.coldSales, color: '#0EA5E9' },
                    { label: 'PC', value: stats.pcSales, color: '#67E8F9' }
                ]} />
            </div>
            <div className="overflow-x-auto bg-white dark:bg-neutral-800 shadow-md rounded-lg">
                <div className="p-4 flex justify-between items-center">
                    <h3 className="font-semibold">Customer Details</h3>
                    <button onClick={handleExport} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <DownloadIcon className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                        <tr>
                            {['Name', 'Phone', 'Type', 'Last Disposition', 'Disp. Time', 'Agent', 'Amount', 'Association', 'Show'].map(h => <th key={h} className="px-4 py-2">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                         {paginatedData.map(c => (
                            <tr key={c.id} className="border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600">
                                <td className="px-4 py-2">{c.firstName} {c.lastName}</td>
                                <td className="px-4 py-2">{c.phone}</td>
                                <td className="px-4 py-2">{c.businessResidential}/{c.coldPc}</td>
                                <td className="px-4 py-2">{getDispositionById(c.dispositionId)?.name}</td>
                                <td className="px-4 py-2">{new Date(c.dispositionTime).toLocaleString()}</td>
                                <td className="px-4 py-2">{getAgentByNumber(c.agentNumber)?.firstName}</td>
                                <td className="px-4 py-2">{c.amount ? `$${c.amount.toFixed(2)}` : ''}</td>
                                <td className="px-4 py-2">{getAssociationById(c.associationId)?.associationName}</td>
                                <td className="px-4 py-2">{getShowByNumber(c.showNumber)?.showName}</td>
                            </tr>
                         ))}
                         {paginatedData.length === 0 && <tr><td colSpan={9} className="text-center py-8">No matching customer data.</td></tr>}
                    </tbody>
                </table>
                {totalPages > 1 && <div className="p-4 flex justify-end"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
            </div>
        </div>
    );
};

type DispositionSaleStat = {
    dispositionId: string;
    dispositionName: string;
    saleAmount: number;
    saleCount: number;
    resColdSales: number;
    resPcSales: number;
    bizColdSales: number;
    bizPcSales: number;
};

type DispositionPaymentStat = {
    dispositionId: string;
    dispositionName: string;
    paymentAmount: number;
    paymentCount: number;
    resColdPayments: number;
    resPcPayments: number;
    bizColdPayments: number;
    bizPcPayments: number;
};

type AgentStat = {
    agentNumber: number;
    agent: Agent;
    saleAmount: number;
    paymentAmount: number;
    saleCount: number;
    paymentCount: number;
    resColdSales: number;
    resPcSales: number;
    bizColdSales: number;
    bizPcSales: number;
    resColdPayments: number;
    resPcPayments: number;
    bizColdPayments: number;
    bizPcPayments: number;
    dispositionSales: Record<string, DispositionSaleStat>;
    dispositionPayments: Record<string, DispositionPaymentStat>;
};

const PrintableAgentReportContent: FC<{
    agentStats: AgentStat[],
    overallStats: any,
    filters: any,
}> = ({ agentStats, overallStats, filters }) => {
    const filterDateRange = filters.dateFrom && filters.dateTo
        ? `${new Date(filters.dateFrom.replace(/-/g, '/')).toLocaleDateString()} to ${new Date(filters.dateTo.replace(/-/g, '/')).toLocaleDateString()}`
        : 'All Time';

    const renderBreakdownRows = (dispositionStats: (DispositionSaleStat | DispositionPaymentStat)[], type: 'sale' | 'payment') => {
        const isSale = type === 'sale';
        const sortedStats = [...dispositionStats].sort((a,b) => (isSale ? (b as DispositionSaleStat).saleAmount : (b as DispositionPaymentStat).paymentAmount) - (isSale ? (a as DispositionSaleStat).saleAmount : (a as DispositionPaymentStat).paymentAmount));
        
        return sortedStats.map(stat => {
            const dispStat = stat as any; // To access common and specific properties
            return (
                <tr key={`${type}-${dispStat.dispositionId}`} className="bg-gray-50 dark:bg-neutral-800/50">
                    <td className="px-2 py-2 pl-8 text-sm italic text-gray-600 dark:text-gray-400 border dark:border-neutral-600">{dispStat.dispositionName}</td>
                    <td className={`px-2 py-2 text-right ${isSale ? 'text-green-700 dark:text-green-500' : 'text-blue-700 dark:text-blue-500'} border dark:border-neutral-600`}>${(isSale ? dispStat.saleAmount : dispStat.paymentAmount).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right border dark:border-neutral-600">${(isSale ? dispStat.resColdSales : dispStat.resColdPayments).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right border dark:border-neutral-600">${(isSale ? dispStat.resPcSales : dispStat.resPcPayments).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right border dark:border-neutral-600">${(isSale ? dispStat.bizColdSales : dispStat.bizColdPayments).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right border dark:border-neutral-600">${(isSale ? dispStat.bizPcSales : dispStat.bizPcPayments).toFixed(2)}</td>
                    <td className="px-2 py-2 text-right border dark:border-neutral-600">{isSale ? dispStat.saleCount : dispStat.paymentCount}</td>
                </tr>
            )
        });
    };

    return (
        <div className="p-6 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 font-sans">
            <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Agent Performance Report</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">PFFPNC Database</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">Date Range: {filterDateRange}</p>
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Overall Performance</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
                 <ReportStatCard label="Total Sales" value={`$${overallStats.totalSales.toFixed(2)}`} subValue={`${overallStats.totalSaleCount} sales`} />
                 <ReportStatCard label="Total Payments" value={`$${overallStats.totalPayments.toFixed(2)}`} subValue={`${overallStats.totalPaymentCount} payments`} />
                 <ReportStatCard label="Active Agents" value={agentStats.length} subValue="in filtered period"/>
            </div>

            <h2 className="text-xl font-semibold mb-2">Agent Performance Details</h2>
            
            {agentStats.length === 0 && (
                <p className="text-center py-8">No agent performance data for the selected filters.</p>
            )}

            {agentStats.map((s, index) => (
                <table key={s.agentNumber} className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-collapse mt-6" style={{ breakInside: 'avoid' }}>
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                        <tr>
                            <th className="px-2 py-2 border dark:border-neutral-600">Rank</th>
                            <th className="px-2 py-2 border dark:border-neutral-600">Agent</th>
                            <th className="px-2 py-2 border dark:border-neutral-600">Type / Breakdown</th>
                            <th className="px-2 py-2 text-right border dark:border-neutral-600">Total Amount</th>
                            <th className="px-2 py-2 text-right border dark:border-neutral-600">Res Cold</th>
                            <th className="px-2 py-2 text-right border dark:border-neutral-600">Res PC</th>
                            <th className="px-2 py-2 text-right border dark:border-neutral-600">Biz Cold</th>
                            <th className="px-2 py-2 text-right border dark:border-neutral-600">Biz PC</th>
                            <th className="px-2 py-2 text-right border dark:border-neutral-600"># Trans.</th>
                        </tr>
                    </thead>
                    <tbody className="border-t-2 border-black dark:border-white">
                        <tr className="bg-white dark:bg-neutral-800">
                            <td className="px-2 py-2 font-bold align-top border dark:border-neutral-600" rowSpan={2 + Object.keys(s.dispositionSales).length + Object.keys(s.dispositionPayments).length + 2}>
                                #{index + 1}
                            </td>
                            <td className="px-2 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap align-top border dark:border-neutral-600" rowSpan={2 + Object.keys(s.dispositionSales).length + Object.keys(s.dispositionPayments).length + 2}>{s.agent.firstName} {s.agent.lastName}</td>
                            <td className="px-2 py-2 border dark:border-neutral-600">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200">Sold</span>
                            </td>
                            <td className="px-2 py-2 text-right font-semibold text-green-600 dark:text-green-400 border dark:border-neutral-600">${s.saleAmount.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.resColdSales.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.resPcSales.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.bizColdSales.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.bizPcSales.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">{s.saleCount}</td>
                        </tr>
                        <tr className="bg-white dark:bg-neutral-800">
                             <td className="px-2 py-2 border dark:border-neutral-600">
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200">Paid</span>
                            </td>
                            <td className="px-2 py-2 text-right font-semibold text-blue-600 dark:text-blue-400 border dark:border-neutral-600">${s.paymentAmount.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.resColdPayments.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.resPcPayments.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.bizColdPayments.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">${s.bizPcPayments.toFixed(2)}</td>
                            <td className="px-2 py-2 text-right border dark:border-neutral-600">{s.paymentCount}</td>
                        </tr>
                        <tr className="bg-gray-100/50 dark:bg-neutral-900/30"><td colSpan={7} className="px-2 py-1 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider border dark:border-neutral-600">Sales Breakdown</td></tr>
                        {renderBreakdownRows(Object.values(s.dispositionSales), 'sale')}
                        <tr className="bg-gray-100/50 dark:bg-neutral-900/30"><td colSpan={7} className="px-2 py-1 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider border dark:border-neutral-600">Payments Breakdown</td></tr>
                        {renderBreakdownRows(Object.values(s.dispositionPayments), 'payment')}
                    </tbody>
                </table>
            ))}
        </div>
    );
};

const AgentPerformanceReport: FC<{ data: AugmentedHistoryRecord[], filters: any }> = ({ data, filters }) => {
    const { getAgentByNumber, getDispositionById } = useData();
    const { addToast } = useToast();
    const { theme } = useTheme();
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedAgents, setExpandedAgents] = useState<Set<number>>(new Set());
    const itemsPerPage = 10;

    const toggleExpand = (agentNumber: number) => {
        setExpandedAgents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(agentNumber)) {
                newSet.delete(agentNumber);
            } else {
                newSet.add(agentNumber);
            }
            return newSet;
        });
    };

    const agentStats = useMemo((): AgentStat[] => {
        const statsByAgent: Record<number, AgentStat> = {};

        data.forEach(h => {
            const agentNum = h.agentNumber;
            const agent = getAgentByNumber(agentNum);
            if (!agent) return;

            if (!statsByAgent[agentNum]) {
                statsByAgent[agentNum] = {
                    agentNumber: agentNum, agent: agent,
                    saleAmount: 0, paymentAmount: 0, saleCount: 0, paymentCount: 0,
                    resColdSales: 0, resPcSales: 0, bizColdSales: 0, bizPcSales: 0,
                    resColdPayments: 0, resPcPayments: 0, bizColdPayments: 0, bizPcPayments: 0,
                    dispositionSales: {}, dispositionPayments: {}
                };
            }

            const stat = statsByAgent[agentNum];
            const disp = getDispositionById(h.dispositionId);
            if (!disp) return;
            const amount = h.amount || 0;
            const isResidential = h.customer.businessResidential?.toUpperCase().startsWith('R');
            const isBusiness = h.customer.businessResidential?.toUpperCase().startsWith('B');
            const isCold = h.customer.coldPc?.toUpperCase().startsWith('C');
            const isPC = h.customer.coldPc?.toUpperCase().startsWith('P');

            if (disp.modifiers.includes(DispositionModifier.Sale)) {
                stat.saleAmount += amount;
                stat.saleCount++;
                if (isResidential) {
                    if (isCold) stat.resColdSales += amount; else if (isPC) stat.resPcSales += amount;
                } else if (isBusiness) {
                    if (isCold) stat.bizColdSales += amount; else if (isPC) stat.bizPcSales += amount;
                }
                
                if (!stat.dispositionSales[h.dispositionId]) {
                    stat.dispositionSales[h.dispositionId] = {
                        dispositionId: h.dispositionId, dispositionName: disp.name,
                        saleAmount: 0, saleCount: 0, resColdSales: 0, resPcSales: 0, bizColdSales: 0, bizPcSales: 0
                    };
                }
                const dispSaleStat = stat.dispositionSales[h.dispositionId];
                dispSaleStat.saleAmount += amount;
                dispSaleStat.saleCount++;
                if (isResidential) {
                    if (isCold) dispSaleStat.resColdSales += amount; else if (isPC) dispSaleStat.resPcSales += amount;
                } else if (isBusiness) {
                    if (isCold) dispSaleStat.bizColdSales += amount; else if (isPC) dispSaleStat.bizPcSales += amount;
                }
            }
            if (disp.modifiers.includes(DispositionModifier.Payment)) {
                stat.paymentAmount += amount;
                stat.paymentCount++;
                if (isResidential) {
                    if (isCold) stat.resColdPayments += amount; else if (isPC) stat.resPcPayments += amount;
                } else if (isBusiness) {
                    if (isCold) stat.bizColdPayments += amount; else if (isPC) stat.bizPcPayments += amount;
                }

                if (!stat.dispositionPayments[h.dispositionId]) {
                    stat.dispositionPayments[h.dispositionId] = {
                        dispositionId: h.dispositionId, dispositionName: disp.name,
                        paymentAmount: 0, paymentCount: 0, resColdPayments: 0, resPcPayments: 0, bizColdPayments: 0, bizPcPayments: 0
                    };
                }
                 const dispPaymentStat = stat.dispositionPayments[h.dispositionId];
                dispPaymentStat.paymentAmount += amount;
                dispPaymentStat.paymentCount++;
                 if (isResidential) {
                    if (isCold) dispPaymentStat.resColdPayments += amount; else if (isPC) dispPaymentStat.resPcPayments += amount;
                } else if (isBusiness) {
                    if (isCold) dispPaymentStat.bizColdPayments += amount; else if (isPC) dispPaymentStat.bizPcPayments += amount;
                }
            }
        });

        return Object.values(statsByAgent).sort((a, b) => (b.paymentAmount - a.paymentAmount) || (b.saleAmount - a.saleAmount));

    }, [data, getAgentByNumber, getDispositionById]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return agentStats.slice(startIndex, startIndex + itemsPerPage);
    }, [agentStats, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(agentStats.length / itemsPerPage);

    const overallStats = useMemo(() => {
        return agentStats.reduce((acc, curr) => ({
            totalSales: acc.totalSales + curr.saleAmount,
            totalPayments: acc.totalPayments + curr.paymentAmount,
            totalSaleCount: acc.totalSaleCount + curr.saleCount,
            totalPaymentCount: acc.totalPaymentCount + curr.paymentCount,
        }), { totalSales: 0, totalPayments: 0, totalSaleCount: 0, totalPaymentCount: 0 });
    }, [agentStats]);

    const handleDownloadHtml = () => {
        if (agentStats.length === 0) {
            addToast('No data to download.', 'info');
            return;
        }
    
        const container = document.createElement('div');
        flushSync(() => {
            const root = ReactDOM.createRoot(container);
            root.render(
                <React.StrictMode>
                    <PrintableAgentReportContent
                        agentStats={agentStats}
                        overallStats={overallStats}
                        filters={filters}
                    />
                </React.StrictMode>
            );
        });
    
        const reportHtml = container.innerHTML;
    
        const fullHtml = `
            <!DOCTYPE html>
            <html lang="en" class="${theme}">
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Agent Performance Report</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <script>
                        tailwind.config = {
                            darkMode: 'class',
                            theme: {
                                extend: {
                                    colors: {
                                        'brand-red': '#B91C1C',
                                        'brand-red-dark': '#991B1B',
                                        'brand-red-light': '#F87171',
                                        'neutral-800': '#262626',
                                        'neutral-900': '#171717',
                                    }
                                }
                            }
                        }
                    </script>
                    <style>
                        @media print {
                            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                            @page { margin: 0.5in; }
                        }
                        body {
                            font-family: sans-serif;
                        }
                    </style>
                </head>
                <body class="bg-white dark:bg-neutral-900">
                    ${reportHtml}
                </body>
            </html>
        `;
    
        downloadHTML(fullHtml, `agent_performance_report.html`);
        addToast('Report HTML file downloaded.', 'success');
    };
    
    const getRank = (index: number) => {
        return (currentPage - 1) * itemsPerPage + index + 1;
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <ReportStatCard label="Total Sales" value={`$${overallStats.totalSales.toFixed(2)}`} subValue={`${overallStats.totalSaleCount} sales`} />
                 <ReportStatCard label="Total Payments" value={`$${overallStats.totalPayments.toFixed(2)}`} subValue={`${overallStats.totalPaymentCount} payments`} />
                 <ReportStatCard label="Active Agents" value={agentStats.length} subValue="in filtered period"/>
            </div>
            
            <div className="overflow-x-auto bg-white dark:bg-neutral-800 shadow-md rounded-lg">
                <div className="p-4 flex justify-between items-center">
                    <h3 className="font-semibold">Agent Performance Details</h3>
                    <button onClick={handleDownloadHtml} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <DownloadIcon className="h-4 w-4" />
                        <span>Download Report</span>
                    </button>
                </div>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                        <tr>
                            <th className="px-2 py-2">Rank</th>
                            <th className="px-2 py-2">Agent</th>
                            <th className="px-2 py-2">Type / Breakdown</th>
                            <th className="px-2 py-2 text-right">Total Amount</th>
                            <th className="px-2 py-2 text-right">Res Cold</th>
                            <th className="px-2 py-2 text-right">Res PC</th>
                            <th className="px-2 py-2 text-right">Biz Cold</th>
                            <th className="px-2 py-2 text-right">Biz PC</th>
                            <th className="px-2 py-2 text-right"># Trans.</th>
                        </tr>
                    </thead>
                    
                    {paginatedData.map((s, index) => (
                        <tbody key={s.agentNumber} className="border-t-4 border-gray-200 dark:border-neutral-700 first:border-t-0">
                             {/* Sales Row */}
                            <tr className="bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                <td className="px-2 py-2 font-bold align-top" rowSpan={2}>
                                    <div className="flex items-center">
                                        <button onClick={() => toggleExpand(s.agentNumber)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-neutral-700">
                                            <ChevronDownIcon isOpen={expandedAgents.has(s.agentNumber)} />
                                        </button>
                                        <span className="ml-1">#{getRank(index)}</span>
                                    </div>
                                </td>
                                <td className="px-2 py-2 font-medium text-gray-900 dark:text-white whitespace-nowrap align-top" rowSpan={2}>{s.agent.firstName} {s.agent.lastName}</td>
                                <td className="px-2 py-2">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-200">Sold</span>
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-green-600 dark:text-green-400">${s.saleAmount.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.resColdSales.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.resPcSales.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.bizColdSales.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.bizPcSales.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">{s.saleCount}</td>
                            </tr>
                            {/* Payments Row */}
                            <tr className="bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                                <td className="px-2 py-2">
                                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-200">Paid</span>
                                </td>
                                <td className="px-2 py-2 text-right font-semibold text-blue-600 dark:text-blue-400">${s.paymentAmount.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.resColdPayments.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.resPcPayments.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.bizColdPayments.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">${s.bizPcPayments.toFixed(2)}</td>
                                <td className="px-2 py-2 text-right">{s.paymentCount}</td>
                            </tr>
                            {/* Disposition Breakdowns */}
                            {expandedAgents.has(s.agentNumber) && (
                                <>
                                    {Object.keys(s.dispositionSales).length > 0 && (
                                        <tr className="bg-gray-100/50 dark:bg-neutral-900/30"><td colSpan={9} className="px-2 py-1 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Sales Breakdown</td></tr>
                                    )}
                                    {Object.values(s.dispositionSales).sort((a,b) => b.saleAmount - a.saleAmount).map(dispStat => (
                                        <tr key={`sale-${dispStat.dispositionId}`} className="bg-gray-50 dark:bg-neutral-800/50">
                                            <td colSpan={2}></td>
                                            <td className="px-2 py-2 pl-8 text-sm italic text-gray-600 dark:text-gray-400">{dispStat.dispositionName}</td>
                                            <td className="px-2 py-2 text-right text-green-700 dark:text-green-500">${dispStat.saleAmount.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.resColdSales.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.resPcSales.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.bizColdSales.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.bizPcSales.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">{dispStat.saleCount}</td>
                                        </tr>
                                    ))}
                                    {Object.keys(s.dispositionPayments).length > 0 && (
                                        <tr className="bg-gray-100/50 dark:bg-neutral-900/30"><td colSpan={9} className="px-2 py-1 text-center text-xs font-bold uppercase text-gray-500 dark:text-gray-400 tracking-wider">Payments Breakdown</td></tr>
                                    )}
                                    {Object.values(s.dispositionPayments).sort((a,b) => b.paymentAmount - a.paymentAmount).map(dispStat => (
                                        <tr key={`payment-${dispStat.dispositionId}`} className="bg-gray-50 dark:bg-neutral-800/50">
                                            <td colSpan={2}></td>
                                            <td className="px-2 py-2 pl-8 text-sm italic text-gray-600 dark:text-gray-400">{dispStat.dispositionName}</td>
                                            <td className="px-2 py-2 text-right text-blue-700 dark:text-blue-500">${dispStat.paymentAmount.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.resColdPayments.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.resPcPayments.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.bizColdPayments.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">${dispStat.bizPcPayments.toFixed(2)}</td>
                                            <td className="px-2 py-2 text-right">{dispStat.paymentCount}</td>
                                        </tr>
                                    ))}
                                </>
                            )}
                        </tbody>
                     ))}
                     {agentStats.length === 0 && (
                        <tbody>
                            <tr><td colSpan={9} className="text-center py-8">No agent performance data for the selected filters.</td></tr>
                        </tbody>
                     )}
                </table>
                {totalPages > 1 && <div className="p-4 flex justify-end"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
            </div>
        </div>
    );
};

const DispositionAnalysisReport: FC<{ data: AugmentedHistoryRecord[] }> = ({ data }) => {
    const { getDispositionById, getDispositionByName } = useData();
    const { addToast } = useToast();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const dispositionStats = useMemo(() => {
        const stats: Record<string, {
            disposition: Disposition;
            count: number;
            totalAmount: number;
            firstUsed: number | null;
            lastUsed: number | null;
        }> = {};

        data.forEach(h => {
            const disp = getDispositionById(h.dispositionId);
            if (!disp) return;

            if (!stats[disp.id]) {
                stats[disp.id] = {
                    disposition: disp,
                    count: 0,
                    totalAmount: 0,
                    firstUsed: null,
                    lastUsed: null,
                };
            }
            const stat = stats[disp.id];
            stat.count++;
            stat.totalAmount += h.amount || 0;
            const dispTime = new Date(h.dispositionTime).getTime();
            if (!stat.firstUsed || dispTime < stat.firstUsed) {
                stat.firstUsed = dispTime;
            }
            if (!stat.lastUsed || dispTime > stat.lastUsed) {
                stat.lastUsed = dispTime;
            }
        });

        return Object.values(stats).sort((a, b) => b.count - a.count);

    }, [data, getDispositionById]);

    const modifierBreakdown = useMemo(() => {
        let saleCount = 0;
        let paymentCount = 0;
        let totalCount = data.length;

        dispositionStats.forEach(stat => {
            if (stat.disposition.modifiers.includes(DispositionModifier.Sale)) {
                saleCount += stat.count;
            }
            if (stat.disposition.modifiers.includes(DispositionModifier.Payment)) {
                paymentCount += stat.count;
            }
        });
        
        return {
            saleCount,
            paymentCount,
            salePercentage: totalCount > 0 ? (saleCount / totalCount) * 100 : 0,
            paymentPercentage: totalCount > 0 ? (paymentCount / totalCount) * 100 : 0,
        };
    }, [dispositionStats, data]);

    const keyDispositionCounts = useMemo(() => {
        const keys = ["Turndown", "Remove", "Processed", "Credit", "Sale"];
        const counts: { label: string, value: number, color?: string }[] = [];
        const colors = ['#EF4444', '#F97316', '#84CC16', '#22C55E', '#3B82F6'];
        
        keys.forEach((key, index) => {
            const disp = getDispositionByName(key);
            let count = 0;
            if (disp) {
                const stat = dispositionStats.find(s => s.disposition.id === disp.id);
                if (stat) {
                    count = stat.count;
                }
            }
            counts.push({ label: key, value: count, color: colors[index] });
        });
        return counts;

    }, [dispositionStats, getDispositionByName]);
    
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return dispositionStats.slice(startIndex, startIndex + itemsPerPage);
    }, [dispositionStats, currentPage]);

    const totalPages = Math.ceil(dispositionStats.length / itemsPerPage);

    const handleExport = () => {
        if (dispositionStats.length === 0) {
            addToast('No data to export.', 'info');
            return;
        }
        const dataToExport = dispositionStats.map(s => ({
            'Disposition Name': s.disposition.name,
            'Modifiers': s.disposition.modifiers.join(', '),
            'Count': s.count,
            'Total Amount ($)': s.totalAmount.toFixed(2),
            'First Used': s.firstUsed ? new Date(s.firstUsed).toLocaleString() : 'N/A',
            'Last Used': s.lastUsed ? new Date(s.lastUsed).toLocaleString() : 'N/A',
        }));
        downloadCSV(objectToCsv(dataToExport), 'disposition_analysis.csv');
    };
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Key Disposition Counts</h3>
                    <BarChart data={keyDispositionCounts} height={250} />
                </div>
                <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4 flex flex-col justify-center">
                    <h3 className="font-semibold mb-4">Sale vs. Payment Modifiers</h3>
                    <div className="space-y-4">
                        <ReportStatCard 
                            label="Dispositions with 'Sale' Modifier" 
                            value={modifierBreakdown.saleCount} 
                            subValue={`${modifierBreakdown.salePercentage.toFixed(1)}% of total filtered`}
                        />
                        <ReportStatCard 
                            label="Dispositions with 'Payment' Modifier" 
                            value={modifierBreakdown.paymentCount} 
                            subValue={`${modifierBreakdown.paymentPercentage.toFixed(1)}% of total filtered`}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white dark:bg-neutral-800 shadow-md rounded-lg">
                <div className="p-4 flex justify-between items-center">
                    <h3 className="font-semibold">Disposition Usage Details</h3>
                    <button onClick={handleExport} className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        <DownloadIcon className="h-4 w-4" />
                        <span>Export CSV</span>
                    </button>
                </div>
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                        <tr>
                            <th className="px-4 py-2">Disposition Name</th>
                            <th className="px-4 py-2">Modifiers</th>
                            <th className="px-4 py-2 text-right">Count</th>
                            <th className="px-4 py-2 text-right">Total Amount</th>
                            <th className="px-4 py-2">First Used</th>
                            <th className="px-4 py-2">Last Used</th>
                        </tr>
                    </thead>
                    <tbody>
                         {paginatedData.map(s => (
                            <tr key={s.disposition.id} className="border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600">
                                <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">{s.disposition.name}</td>
                                <td className="px-4 py-2 flex flex-wrap gap-1">
                                    {s.disposition.modifiers.length > 0
                                        ? s.disposition.modifiers.map(mod => <span key={mod} className="text-xs bg-gray-200 dark:bg-neutral-600 rounded-full px-2 py-0.5">{mod}</span>)
                                        : <span className="text-xs text-gray-500">None</span>
                                    }
                                </td>
                                <td className="px-4 py-2 text-right font-semibold">{s.count}</td>
                                <td className="px-4 py-2 text-right">${s.totalAmount.toFixed(2)}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{s.firstUsed ? new Date(s.firstUsed).toLocaleDateString() : 'N/A'}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{s.lastUsed ? new Date(s.lastUsed).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                         ))}
                         {paginatedData.length === 0 && <tr><td colSpan={6} className="text-center py-8">No matching disposition data.</td></tr>}
                    </tbody>
                </table>
                {totalPages > 1 && <div className="p-4 flex justify-end"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>}
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

const ReportSidebar: FC<{ activeReport: string }> = ({ activeReport }) => {
    const navigate = useNavigate();
    const reports = [
        { key: 'customers', label: 'Customer Breakdown' },
        { key: 'agents', label: 'Agent Performance' },
        { key: 'dispositions', label: 'Disposition Analysis' },
        { key: 'revenue', label: 'Revenue Reports' },
    ];
    
    const baseClasses = "block w-full text-left px-4 py-2 text-sm rounded-md transition-colors";
    const activeClasses = "bg-brand-red text-white font-semibold shadow-md";
    const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700";

    return (
        <aside className="w-64 flex-shrink-0 p-4 bg-white dark:bg-neutral-800 border-r dark:border-neutral-700">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">Report Types</h2>
            <nav className="space-y-2">
                {reports.map(report => (
                     <button
                        key={report.key}
                        onClick={() => navigate(`/reports/${report.key}`)}
                        className={`${baseClasses} ${activeReport === report.key ? activeClasses : inactiveClasses}`}
                    >
                        {report.label}
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const ReportFilters: FC<{
    filters: any;
    setFilters: React.Dispatch<React.SetStateAction<any>>;
    availableAgents: Agent[];
    availableDispositions: Disposition[];
    availableShows: Show[];
    availableAssociations: Association[];
    onPreviousWeek: () => void;
    onNextWeek: () => void;
    isNextWeekDisabled: boolean;
}> = ({ filters, setFilters, availableAgents, availableDispositions, availableShows, availableAssociations, onPreviousWeek, onNextWeek, isNextWeekDisabled }) => {
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev: any) => ({ ...prev, [name]: value }));
    };

    return (
         <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm mb-6">
             <h3 className="font-semibold text-lg mb-4">Filters</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="sm:col-span-2 lg:col-span-2 flex items-end space-x-2">
                    <button onClick={onPreviousWeek} className="p-2 border border-gray-300 bg-white dark:bg-neutral-700 dark:border-neutral-600 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-600 flex-shrink-0" aria-label="Previous week">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </button>
                    <button onClick={onNextWeek} disabled={isNextWeekDisabled} className="p-2 border border-gray-300 bg-white dark:bg-neutral-700 dark:border-neutral-600 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0" aria-label="Next week">
                        <ArrowRightIcon className="h-5 w-5" />
                    </button>
                    <div className="flex-grow">
                        <label className="text-xs text-gray-500">From</label>
                        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600" />
                    </div>
                    <div className="flex-grow">
                        <label className="text-xs text-gray-500">To</label>
                        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600" />
                    </div>
                </div>
                <select name="agentNumber" value={filters.agentNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 self-end">
                    <option value="">All Agents</option>
                    {availableAgents.map(a => <option key={a.id} value={a.agentNumber}>{a.firstName} {a.lastName}</option>)}
                </select>
                <select name="dispositionId" value={filters.dispositionId} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 self-end">
                    <option value="">All Dispositions</option>
                    {availableDispositions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select name="showNumber" value={filters.showNumber} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 self-end">
                    <option value="">All Shows</option>
                    {availableShows.map(s => <option key={s.id} value={s.showNumber}>{s.showName}</option>)}
                </select>
                 <select name="associationId" value={filters.associationId} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 self-end">
                    <option value="">All Associations</option>
                    {availableAssociations.map(a => <option key={a.id} value={a.associationId}>{a.associationName}</option>)}
                </select>
                 <select name="businessResidential" value={filters.businessResidential} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 self-end">
                    <option value="">All Types</option>
                    <option value="Business">Business</option>
                    <option value="Residential">Residential</option>
                </select>
                 <select name="coldPc" value={filters.coldPc} onChange={handleChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 self-end">
                    <option value="">All Sources</option>
                    <option value="Cold">Cold</option>
                    <option value="PC">PC</option>
                </select>
             </div>
         </div>
    )
};

const MemoCustomerBreakdownReport = React.memo(CustomerBreakdownReport);
const MemoAgentPerformanceReport = React.memo(AgentPerformanceReport);
const MemoDispositionAnalysisReport = React.memo(DispositionAnalysisReport);

const getWtdDateRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Thursday = 4
    const wtdStart = new Date(today);
    const daysToSubtract = (dayOfWeek - 4 + 7) % 7; // days to subtract to get to last Thursday
    wtdStart.setDate(today.getDate() - daysToSubtract);
    
    const wtdEnd = new Date(wtdStart);
    wtdEnd.setDate(wtdStart.getDate() + 6); // Wednesday is 6 days after Thursday

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
        start: formatDate(wtdStart),
        end: formatDate(wtdEnd),
    };
};


const ReportsPage: React.FC = () => {
    const { reportType = 'customers' } = useParams<{ reportType: string }>();
    const { customers, agents, dispositions, shows, associations } = useData();
    
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const [filters, setFilters] = useState(() => {
        const { start, end } = getWtdDateRange();
        return {
            dateFrom: start,
            dateTo: end,
            agentNumber: '',
            dispositionId: '',
            showNumber: '',
            associationId: '',
            businessResidential: '',
            coldPc: '',
        };
    });

    const handlePreviousWeek = () => {
        const currentFrom = new Date(filters.dateFrom.replace(/-/g, '/'));
        const newStart = new Date(currentFrom);
        newStart.setDate(currentFrom.getDate() - 7);
    
        const newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 6);
    
        setFilters(prev => ({
            ...prev,
            dateFrom: formatDate(newStart),
            dateTo: formatDate(newEnd),
        }));
    };
    
    const handleNextWeek = () => {
        const currentFrom = new Date(filters.dateFrom.replace(/-/g, '/'));
        const newStart = new Date(currentFrom);
        newStart.setDate(currentFrom.getDate() + 7);
    
        const newEnd = new Date(newStart);
        newEnd.setDate(newStart.getDate() + 6);
        
        setFilters(prev => ({
            ...prev,
            dateFrom: formatDate(newStart),
            dateTo: formatDate(newEnd),
        }));
    };

    const isNextWeekDisabled = useMemo(() => {
        const { start: currentPeriodStart } = getWtdDateRange();
        // Compare dates by stripping time component
        const filterStartDate = new Date(filters.dateFrom.replace(/-/g, '/'));
        filterStartDate.setHours(0,0,0,0);
        const currentWeekStartDate = new Date(currentPeriodStart.replace(/-/g, '/'));
        currentWeekStartDate.setHours(0,0,0,0);

        return filterStartDate.getTime() >= currentWeekStartDate.getTime();
    }, [filters.dateFrom]);


    const filteredHistoryRecords = useMemo((): AugmentedHistoryRecord[] => {
        const allHistoryRecords = customers.flatMap(c => 
            c.dispositionHistory.map(h => ({ ...h, customer: c }))
        );

        // Correctly create date boundaries in the user's local timezone.
        // new Date('YYYY-MM-DD') creates a date at UTC midnight, which causes issues.
        // new Date('YYYY/MM/DD') creates a date at local midnight.
        const startDate = filters.dateFrom ? new Date(filters.dateFrom.replace(/-/g, '/')) : null;
        if (startDate) {
            startDate.setHours(0, 0, 0, 0);
        }

        const endDate = filters.dateTo ? new Date(filters.dateTo.replace(/-/g, '/')) : null;
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }

        return allHistoryRecords.filter(h => {
            const dispTime = new Date(h.dispositionTime).getTime();

            if (startDate && dispTime < startDate.getTime()) return false;
            if (endDate && dispTime > endDate.getTime()) return false;

            if (filters.agentNumber && h.agentNumber !== Number(filters.agentNumber)) return false;
            if (filters.dispositionId && h.dispositionId !== filters.dispositionId) return false;

            if (filters.showNumber && h.customer.showNumber !== Number(filters.showNumber)) return false;
            if (filters.associationId && h.customer.associationId !== filters.associationId) return false;
            if (filters.businessResidential && h.customer.businessResidential !== filters.businessResidential) return false;
            if (filters.coldPc && h.customer.coldPc !== filters.coldPc) return false;
            
            return true;
        });
    }, [customers, filters]);

    const renderReport = () => {
        switch(reportType) {
            case 'customers':
                return <MemoCustomerBreakdownReport data={filteredHistoryRecords} />;
            case 'agents':
                 return <MemoAgentPerformanceReport data={filteredHistoryRecords} filters={filters} />;
            case 'dispositions':
                 return <MemoDispositionAnalysisReport data={filteredHistoryRecords} />;
            case 'revenue':
                 return (
                    <div className="text-center py-20 bg-white dark:bg-neutral-800 rounded-lg shadow-sm">
                        <h3 className="text-xl font-bold">Report Not Implemented</h3>
                        <p className="text-gray-500 mt-2">This report type is under construction.</p>
                    </div>
                );
            default:
                return <div>Unknown report type. Please select one from the sidebar.</div>;
        }
    };

    return (
        <div className="flex-1 flex flex-row h-screen">
            <ReportSidebar activeReport={reportType} />
            <div className="flex-1 flex flex-col">
                <Header title="Reports" />
                <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50 dark:bg-neutral-900/50">
                     <ReportFilters 
                        filters={filters}
                        setFilters={setFilters}
                        availableAgents={agents}
                        availableDispositions={dispositions}
                        availableShows={shows}
                        availableAssociations={associations}
                        onPreviousWeek={handlePreviousWeek}
                        onNextWeek={handleNextWeek}
                        isNextWeekDisabled={isNextWeekDisabled}
                     />
                    {renderReport()}
                </main>
            </div>
        </div>
    );
};

export default ReportsPage;