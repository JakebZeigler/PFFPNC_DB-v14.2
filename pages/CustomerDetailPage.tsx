import React, { useMemo, useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { DispositionHistory, DispositionModifier, Customer } from '../types';
import { useToast } from '../components/Toast';
import { DEFAULT_INVOICE_TEMPLATE, DEFAULT_AGENT } from '../constants';
import { downloadTXT } from '../utils/csv';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import SunIcon from '../components/icons/SunIcon';
import MoonIcon from '../components/icons/MoonIcon';
import LogoutIcon from '../components/icons/LogoutIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import TrashIcon from '../components/icons/TrashIcon';
import PencilIcon from '../components/icons/PencilIcon';
import Spinner from '../components/Spinner';
import CurrencyDollarIcon from '../components/icons/CurrencyDollarIcon';
import BanIcon from '../components/icons/BanIcon';
import PlusIcon from '../components/icons/PlusIcon';
import Modal from '../components/Modal';


const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div className="py-1">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 dark:text-gray-100">{value || 'N/A'}</dd>
    </div>
);

const HistoryTable: React.FC<{ title: string; history: DispositionHistory[]; showAmount?: boolean, onAddDispo?: () => void }> = ({ title, history, showAmount = false, onAddDispo }) => {
    const { getDispositionById, getAgentByNumber } = useData();
    const columns = showAmount 
        ? ['Date', 'Disposition', 'Agent', 'Amount', 'Tickets', 'Notes']
        : ['Date', 'Disposition', 'Agent', 'Notes'];

    return (
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
             <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                {onAddDispo && (
                    <button onClick={onAddDispo} className="flex items-center space-x-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Dispo</span>
                    </button>
                )}
            </div>
            <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                     <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400 sticky top-0">
                        <tr>
                            {columns.map(col => <th key={col} scope="col" className="px-4 py-2">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-800">
                        {history.length > 0 ? [...history].sort((a,b) => new Date(b.dispositionTime).getTime() - new Date(a.dispositionTime).getTime()).map((h, index) => {
                            const disposition = getDispositionById(h.dispositionId);
                            const agent = getAgentByNumber(h.agentNumber);
                            return (
                                <tr key={index} className="border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600">
                                    <td className="px-4 py-2 whitespace-nowrap">{new Date(h.dispositionTime).toLocaleString()}</td>
                                    <td className="px-4 py-2">{disposition?.name || 'Unknown'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{agent ? `${agent.firstName} ${agent.lastName}` : 'Unknown'}</td>
                                    {showAmount && <td className="px-4 py-2">{h.amount ? `$${h.amount.toFixed(2)}` : 'N/A'}</td>}
                                    {showAmount && <td className="px-4 py-2">{h.ticketsAd || 'N/A'}</td>}
                                    <td className="px-4 py-2 truncate" title={h.currentNotes}>{h.currentNotes}</td>
                                </tr>
                            )
                        }) : (
                             <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">No history found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const centerText = (text: string, width = 60): string => {
    if (!text) return ' '.repeat(width);
    const padCount = Math.floor((width - text.length) / 2);
    return ' '.repeat(Math.max(0, padCount)) + text;
};

const CustomerDetailPage: React.FC = () => {
    const { customerId } = useParams<{ customerId: string }>();
    const { 
        customers, deleteCustomer, getShowByNumber, getAssociationById, getDispositionById, 
        getAgentByNumber, addOrUpdateCustomer, paidDispositionId, dncDispositionId, agents, dispositions
    } = useData();
    const { addToast } = useToast();
    const navigate = useNavigate();
    
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const [isAddDispoModalOpen, setIsAddDispoModalOpen] = useState(false);
    const [newDispoData, setNewDispoData] = useState<{
        dispositionId: string;
        dispositionTime: string;
        agentNumber: number;
        amount?: number;
        ticketsAd?: number;
        currentNotes: string;
    }>({
        dispositionId: '',
        dispositionTime: '',
        agentNumber: 0,
        amount: undefined,
        ticketsAd: undefined,
        currentNotes: '',
    });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setDropdownOpen(false);
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const customer = useMemo(() => customers.find(c => c.id === customerId), [customerId, customers]);

    const salesAndPaymentsHistory = useMemo(() => {
        if (!customer) return [];
        return customer.dispositionHistory.filter(h => {
            const disp = getDispositionById(h.dispositionId);
            return disp?.modifiers.includes(DispositionModifier.Payment) || disp?.modifiers.includes(DispositionModifier.Sale);
        });
    }, [customer, getDispositionById]);

    const handleOpenAddDispoModal = () => {
        if (!customer) return;
        setNewDispoData({
            dispositionId: '',
            dispositionTime: new Date().toISOString().substring(0, 16),
            agentNumber: DEFAULT_AGENT.agentNumber,
            amount: undefined,
            ticketsAd: undefined,
            currentNotes: '',
        });
        setIsAddDispoModalOpen(true);
    };

    const handleAddDispoSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        if (!newDispoData.dispositionId || !newDispoData.dispositionTime) {
            addToast('Disposition and Date/Time are required.', 'error');
            return;
        }

        const updatedCustomer: Customer = {
            ...customer,
            dispositionId: newDispoData.dispositionId,
            dispositionTime: new Date(newDispoData.dispositionTime).toISOString(),
            agentNumber: newDispoData.agentNumber,
            amount: newDispoData.amount,
            ticketsAd: newDispoData.ticketsAd,
            currentNotes: newDispoData.currentNotes,
        };

        addOrUpdateCustomer(updatedCustomer);
        addToast('Disposition added successfully.', 'success');
        setIsAddDispoModalOpen(false);
    };

    const handleDNC = () => {
        if (!customer) return;
        const dncDisp = getDispositionById(dncDispositionId);
        if (!dncDisp) {
            addToast("DNC disposition is not configured. Please select one on the Customers page.", 'error');
            return;
        }

        const agentNumberForAction = DEFAULT_AGENT.agentNumber;
        
        const updatedCustomer: Customer = {
          ...customer,
          dispositionId: dncDisp.id,
          dispositionTime: new Date().toISOString(),
          agentNumber: agentNumberForAction,
          currentNotes: `Customer added to DNC list by ${user?.firstName || 'system'}.`,
        };

        addOrUpdateCustomer(updatedCustomer);
        addToast('Customer has been added to the Do Not Call list.', 'success');
    };

    const handleMarkAsPaid = () => {
        if (!customer) return;

        const paidDisposition = getDispositionById(paidDispositionId);
        if (!paidDisposition) {
            addToast('The "Paid" disposition is not configured. This action cannot be completed. Please set it on the Paids Import page.', 'error');
            return;
        }

        const lastSale = [...customer.dispositionHistory]
            .reverse()
            .find(h => getDispositionById(h.dispositionId)?.modifiers.includes(DispositionModifier.Sale));

        if (!lastSale) {
            addToast('Could not find a previous sale disposition to mark as paid.', 'error');
            return;
        }

        const updatedCustomerData: Customer = {
          ...customer,
          dispositionId: paidDisposition.id,
          dispositionTime: new Date().toISOString(),
          agentNumber: lastSale.agentNumber,
          amount: lastSale.amount,
          ticketsAd: lastSale.ticketsAd,
          currentNotes: `Marked as paid manually using "${paidDisposition.name}".`,
        };

        addOrUpdateCustomer(updatedCustomerData);
        addToast(`${customer.firstName} ${customer.lastName} has been marked as paid.`, 'success');
    };

    const handlePrintInvoice = () => {
        if (!customer) {
            addToast('Customer not found.', 'error');
            return;
        }
        
        const latestHistory = [...customer.dispositionHistory].sort((a,b) => new Date(b.dispositionTime).getTime() - new Date(a.dispositionTime).getTime())[0];
    
        if (!latestHistory) {
            addToast('No disposition history found for this customer.', 'error');
            return;
        }
    
        const record = { ...customer, ...latestHistory };
        
        const agent = getAgentByNumber(record.agentNumber);
        const association = getAssociationById(record.associationId);
        const mailByDate = new Date();
        mailByDate.setDate(mailByDate.getDate() + 15);
    
        const replacements: { [key: string]: string } = {
            associationPhone: (association?.phone || '(704)331-9075').toUpperCase(),
            currentDate: new Date(record.dispositionTime).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric'}),
            phone: (record.phone || '').toUpperCase(),
            showNumber: (record.showNumber?.toString() || '').toUpperCase(),
            coldPc: (record.coldPc || '').toUpperCase(),
            agentName: (agent ? `${agent.firstName} ${agent.lastName}` : '').toUpperCase(),
            amount: (record.amount?.toFixed(2) || '0.00').toUpperCase(),
            tickets: (record.ticketsAd ? `TICKETS: ${record.ticketsAd}` : '').toUpperCase(),
            title: (record.title || '').toUpperCase(),
            firstName: (record.firstName || '').toUpperCase(),
            lastName: (record.lastName || '').toUpperCase(),
            address: (record.address || '').toUpperCase(),
            city: (record.city || '').toUpperCase(),
            state: (record.state || '').toUpperCase(),
            zip: (record.zip || '').toUpperCase(),
            centeredAssociationName: centerText((association?.associationName || '').toUpperCase()),
            mailByDate: `MAIL BY: ${mailByDate.toLocaleDateString()}`.toUpperCase()
        };
        
        let text = DEFAULT_INVOICE_TEMPLATE;
        for (const key in replacements) {
            text = text.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
        }
    
        const fileName = `Invoice_${record.firstName}_${record.lastName}.txt`;
        downloadTXT(text, fileName);
        addToast('Invoice downloaded successfully.', 'success');
    };

    if (!customer) {
        return (
             <div className="flex-1 flex flex-col h-screen">
                <div className="p-6 text-center">
                    <Spinner />
                    <p className="mt-2">Loading customer...</p>
                    <button onClick={() => navigate('/customers')} className="mt-4 bg-brand-red text-white font-bold py-2 px-4 rounded">Back to Customers</button>
                </div>
            </div>
        )
    }
    
    const statusClasses: { [key: string]: string } = {
        'Open Order': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'DNC': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'Timeout': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'Cancelled': 'bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200',
        'Active': 'bg-gray-100 text-gray-700 dark:bg-neutral-600 dark:text-neutral-300',
    };
    const badgeClassName = statusClasses[customer.status] || statusClasses['Active'];

    const handleDelete = () => {
        if(window.confirm('Are you sure you want to delete this customer?')) {
            deleteCustomer(customer.id);
            addToast('Customer deleted successfully.', 'success');
            navigate('/customers');
        }
    }

    const show = getShowByNumber(customer.showNumber);
    const association = getAssociationById(customer.associationId);
    
    const formattedCustomerType = useMemo(() => {
        if (!customer) return 'N/A';
        const brText = customer.businessResidential?.toUpperCase().startsWith('B') ? 'Business' : 'Residential';
        const cpText = customer.coldPc?.toUpperCase().startsWith('P') ? 'PC' : 'Cold';
        return `${brText} / ${cpText}`;
    }, [customer]);

    return (
        <div className="flex-1 flex flex-col h-screen">
            <header className="bg-white dark:bg-neutral-800 shadow-sm sticky top-0 z-20">
                <div className="max-w-full mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    {/* Left Side: Name and Status */}
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">{customer.firstName} {customer.lastName}</h1>
                        <span className={`mt-1 px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClassName}`}>
                            {customer.status} {customer.statusDetail && ` ${customer.statusDetail}`}
                        </span>
                    </div>

                    {/* Right Side: Buttons and User Menu */}
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="hidden sm:flex items-center space-x-2">
                             <button onClick={() => navigate('/customers')} className="flex items-center space-x-1.5 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-600 font-medium py-2 px-3 rounded-md transition-colors text-sm">
                                <ArrowLeftIcon className="h-4 w-4" />
                                <span>Back</span>
                            </button>
                            <button onClick={handlePrintInvoice} className="flex items-center space-x-1.5 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-neutral-600 font-medium py-2 px-3 rounded-md transition-colors text-sm">
                                <PrinterIcon className="h-4 w-4" />
                                <span>Print</span>
                            </button>
                             {customer.status === 'Open Order' && (
                                <button onClick={handleMarkAsPaid} className="flex items-center space-x-1.5 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-800/30 font-medium py-2 px-3 rounded-md transition-colors text-sm">
                                    <CurrencyDollarIcon className="h-4 w-4" />
                                    <span>Mark as Paid</span>
                                </button>
                            )}
                            <button onClick={handleDelete} className="flex items-center space-x-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800/30 font-medium py-2 px-3 rounded-md transition-colors text-sm">
                                <TrashIcon className="h-4 w-4" />
                                <span>Delete</span>
                            </button>
                            <Link to={`/customers/${customer.id}/edit`} className="flex items-center space-x-1.5 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-3 rounded-md transition-colors text-sm">
                                <PencilIcon className="h-4 w-4" />
                                <span>Edit</span>
                            </Link>
                        </div>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? <SunIcon className="w-6 h-6 text-yellow-400" /> : <MoonIcon className="w-6 h-6 text-gray-700" />}
                        </button>

                        {user && (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-700 transition"
                                aria-label="User menu" aria-haspopup="true" aria-expanded={dropdownOpen}
                            >
                                <div className="w-8 h-8 bg-brand-red rounded-full flex items-center justify-center text-white font-bold">
                                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                </div>
                            </button>
                            {dropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-neutral-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-neutral-700">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Signed in as</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                </div>
                                <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700">
                                <LogoutIcon className="w-5 h-5 mr-2" />
                                Logout
                                </a>
                            </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>
            </header>
            <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50 dark:bg-neutral-900/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                         <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6">
                            <div className="flex justify-between items-center border-b dark:border-neutral-700 pb-2">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contact Details</h3>
                                <button
                                    onClick={handleDNC}
                                    className="flex items-center space-x-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/10 hover:bg-red-200 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-md"
                                >
                                    <BanIcon className="h-4 w-4" />
                                    <span>Do Not Call</span>
                                </button>
                            </div>
                            <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                                <DetailItem label="Full Name" value={`${customer.title || ''} ${customer.firstName} ${customer.middleName || ''} ${customer.lastName}`} />
                                <DetailItem label="Phone" value={customer.phone} />
                                <DetailItem label="Email" value={customer.email} />
                                <DetailItem label="Website" value={customer.website} />
                                <DetailItem label="Address" value={`${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}`} />
                            </dl>
                        </div>
                        <HistoryTable title="Sales & Payments History" history={salesAndPaymentsHistory} showAmount={true}/>
                    </div>
                    {/* Right Column */}
                     <div className="space-y-6">
                        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b dark:border-neutral-700 pb-2">Business Details</h3>
                            <dl className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                               <DetailItem label="Type" value={formattedCustomerType} />
                               <DetailItem label="Show" value={show ? `${show.showNumber} - ${show.showName}`: customer.showNumber} />
                               <DetailItem label="Association" value={association?.associationName || customer.associationId} />
                               <DetailItem label="Latest Program" value={customer.program} />
                               <DetailItem label="Latest Lead List" value={customer.leadList} />
                            </dl>
                        </div>
                        <HistoryTable title="Full Disposition History" history={customer.dispositionHistory} onAddDispo={handleOpenAddDispoModal} />
                    </div>
                </div>

            </main>
            <Modal isOpen={isAddDispoModalOpen} onClose={() => setIsAddDispoModalOpen(false)} title="Add New Disposition">
                <form onSubmit={handleAddDispoSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disposition *</label>
                        <select 
                            name="dispositionId" 
                            value={newDispoData.dispositionId} 
                            onChange={e => setNewDispoData(p => ({...p, dispositionId: e.target.value}))}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"
                        >
                            <option value="" disabled>Select a disposition</option>
                            {dispositions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Disposition Time *</label>
                        <input type="datetime-local" name="dispositionTime" value={newDispoData.dispositionTime} 
                            onChange={e => setNewDispoData(p => ({...p, dispositionTime: e.target.value}))} required
                            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Agent</label>
                        <select name="agentNumber" value={newDispoData.agentNumber} 
                            onChange={e => setNewDispoData(p => ({...p, agentNumber: Number(e.target.value)}))}
                            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"
                        >
                            {agents.map(a => <option key={a.id} value={a.agentNumber}>{a.firstName} {a.lastName}</option>)}
                        </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                            <input type="number" step="0.01" name="amount" value={newDispoData.amount || ''} 
                                onChange={e => setNewDispoData(p => ({...p, amount: e.target.value ? parseFloat(e.target.value) : undefined}))}
                                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tickets/Ad</label>
                            <input type="number" name="ticketsAd" value={newDispoData.ticketsAd || ''} 
                                onChange={e => setNewDispoData(p => ({...p, ticketsAd: e.target.value ? parseInt(e.target.value, 10) : undefined}))}
                                className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                        <textarea name="currentNotes" value={newDispoData.currentNotes}
                            onChange={e => setNewDispoData(p => ({...p, currentNotes: e.target.value}))} rows={3}
                            className="mt-1 block w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setIsAddDispoModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-neutral-600 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-brand-red text-white rounded-md">Add Disposition</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CustomerDetailPage;