
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useToast } from '../components/Toast';
import { useData } from '../context/FirebaseDataContext';

const Pagination: React.FC<{ currentPage: number, totalPages: number, onPageChange: (page: number) => void }> = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="space-x-2">
            <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 text-sm font-medium text-white bg-brand-red rounded-lg hover:bg-brand-red-dark disabled:bg-gray-400">Previous</button>
            <span className="text-sm text-gray-700 dark:text-gray-400">Page {currentPage} of {totalPages}</span>
            <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 text-sm font-medium text-white bg-brand-red rounded-lg hover:bg-brand-red-dark disabled:bg-gray-400">Next</button>
        </div>
    );
};

const StatusBadge: React.FC<{ status: string; detail?: string }> = ({ status, detail }) => {
    const statusClasses: { [key: string]: string } = {
        'Open Order': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        'DNC': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        'Timeout': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        'Cancelled': 'bg-gray-200 text-gray-800 dark:bg-neutral-700 dark:text-neutral-200',
        'Active': 'bg-gray-100 text-gray-700 dark:bg-neutral-600 dark:text-neutral-300',
    };
    const className = statusClasses[status] || statusClasses['Active'];
    
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${className}`}>
            {status} {detail}
        </span>
    );
};

const STATUS_OPTIONS = ['Active', 'Open Order', 'Paid', 'Cancelled', 'Timeout', 'DNC'];

const CustomersPage: React.FC = () => {
    const { addToast } = useToast();
    const { 
        customers, agents, dispositions, associations, getDispositionById, getAssociationById, 
        deleteCustomer, deleteAllCustomers, customerFilters, setCustomerFilters,
        dncDispositionId, setDncDispositionId, dncDispositions 
    } = useData();
    const navigate = useNavigate();
    
    const [isDeleteAllModalOpen, setDeleteAllModalOpen] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomerFilters(prev => ({ ...prev, [name]: value }));
        setCurrentPage(1);
    };

    const handleMultiSelectChange = (
        type: 'agentNumbers' | 'dispositionIds' | 'statuses' | 'associationIds',
        id: number | string
    ) => {
        setCustomerFilters(prev => {
            const newFilters = { ...prev };
            
            // Type guard to handle agentNumbers (Set<number>) separately
            if (type === 'agentNumbers') {
                if (typeof id !== 'number') return prev; // Safety check
                const set = new Set(newFilters.agentNumbers);
                if (set.has(id)) {
                    set.delete(id);
                } else {
                    set.add(id);
                }
                return { ...newFilters, agentNumbers: set };
            } 
            
            // Handle other filter types which are all Set<string>
            if (typeof id !== 'string') return prev; // Safety check
            const set = new Set(newFilters[type]); // TS knows 'type' is one of the string set keys here
            if (set.has(id)) {
                set.delete(id);
            } else {
                set.add(id);
            }
            return { ...newFilters, [type]: set };
        });
        setCurrentPage(1);
    };

    const handleSetToday = () => {
        const today = new Date().toISOString().split('T')[0];
        setCustomerFilters(prev => ({
            ...prev,
            dateFrom: today,
            dateTo: today,
            timeFrom: '00:00',
            timeTo: '23:59',
        }));
    };

    const formatCustomerType = (br?: string, cp?: string) => {
        const brText = br?.toUpperCase().startsWith('B') ? 'Business' : 'Residential';
        const cpText = cp?.toUpperCase().startsWith('P') ? 'PC' : 'Cold';
        return `${brText} / ${cpText}`;
    };

    const filteredCustomers = useMemo(() => {
        const fromDateTime = customerFilters.dateFrom ? new Date(`${customerFilters.dateFrom}T${customerFilters.timeFrom || '00:00:00'}`) : null;
        const toDateTime = customerFilters.dateTo ? new Date(`${customerFilters.dateTo}T${customerFilters.timeTo || '23:59:59'}`) : null;
        
        return customers.filter(customer => {
            const term = customerFilters.searchTerm.toLowerCase();
            if (term && !(
                `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(term) ||
                customer.phone.toLowerCase().includes(term) ||
                customer.email?.toLowerCase().includes(term) ||
                customer.address?.toLowerCase().includes(term) ||
                customer.city?.toLowerCase().includes(term) ||
                customer.website?.toLowerCase().includes(term)
            )) {
                return false;
            }

            const dispositionTime = new Date(customer.dispositionTime);
            if (fromDateTime && dispositionTime < fromDateTime) {
                return false;
            }
            if (toDateTime && dispositionTime > toDateTime) {
                return false;
            }

            if (customerFilters.agentNumbers.size > 0 && !customerFilters.agentNumbers.has(customer.agentNumber)) {
                return false;
            }
            
            if (customerFilters.dispositionIds.size > 0 && !customerFilters.dispositionIds.has(customer.dispositionId)) {
                return false;
            }

            if (customerFilters.statuses.size > 0 && !customerFilters.statuses.has(customer.status)) {
                return false;
            }

            if (customerFilters.associationIds.size > 0 && !customerFilters.associationIds.has(customer.associationId)) {
                return false;
            }
            
            return true;
        });
    }, [customers, customerFilters]);

    const paginatedCustomers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this customer?')) {
            deleteCustomer(id);
            addToast('Customer deleted successfully', 'success');
        }
    };
    
    const handleConfirmDeleteAll = () => {
        const success = deleteAllCustomers(deleteConfirmText);
        if (success) {
            addToast('All customers have been deleted.', 'success');
            setDeleteAllModalOpen(false);
            setDeleteConfirmText('');
            setCurrentPage(1);
        } else {
            addToast('Verification failed. Customers not deleted.', 'error');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen">
            <Header title="Customers">
                 <div className="flex items-center justify-end flex-nowrap gap-x-4">
                    <div className="text-right">
                        <label htmlFor="dnc-disposition-select" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            DNC Setting
                        </label>
                        <select 
                            id="dnc-disposition-select" 
                            value={dncDispositionId} 
                            onChange={e => setDncDispositionId(e.target.value)}
                            className="w-40 p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600 text-sm focus:ring-brand-red focus:border-brand-red"
                            aria-label="DNC Setting used by the 'Do Not Call' button"
                        >
                            {dncDispositions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="h-8 w-px bg-gray-300 dark:bg-neutral-600 self-center"></div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDeleteAllModalOpen(true)}
                            className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
                        >
                            Delete All Customers
                        </button>
                        <button
                            onClick={() => navigate('/customers/add')}
                            className="bg-brand-red hover:bg-brand-red-dark text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm whitespace-nowrap"
                        >
                            Add Customer
                        </button>
                    </div>
                </div>
            </Header>
            <main className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div className="bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Filter Customers</h3>
                        <button type="button" onClick={handleSetToday} className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">Set to Today</button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="search-term-input" className="sr-only">Search</label>
                            <input
                                id="search-term-input"
                                type="text"
                                name="searchTerm"
                                placeholder="Search name, phone, email, address..."
                                value={customerFilters.searchTerm}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" name="dateFrom" aria-label="From Date" value={customerFilters.dateFrom} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                                    <input type="time" name="timeFrom" aria-label="From Time" value={customerFilters.timeFrom} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                                <div className="flex items-center gap-2">
                                    <input type="date" name="dateTo" aria-label="To Date" value={customerFilters.dateTo} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                                    <input type="time" name="timeTo" aria-label="To Time" value={customerFilters.timeTo} onChange={handleFilterChange} className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"/>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t dark:border-neutral-700 mt-4 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto bg-white dark:bg-neutral-700 dark:border-neutral-600">
                                <h4 className="font-semibold text-sm">Agents</h4>
                                {agents.map(agent => (
                                    <label key={agent.id} className="flex items-center text-sm">
                                        <input type="checkbox" checked={customerFilters.agentNumbers.has(agent.agentNumber)} onChange={() => handleMultiSelectChange('agentNumbers', agent.agentNumber)} className="mr-2 rounded border-gray-300 text-brand-red focus:ring-brand-red dark:border-neutral-500 dark:bg-neutral-600 dark:focus:ring-offset-neutral-800"/>
                                        {agent.firstName} {agent.lastName}
                                    </label>
                                ))}
                            </div>
                            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto bg-white dark:bg-neutral-700 dark:border-neutral-600">
                                <h4 className="font-semibold text-sm">Dispositions</h4>
                                {dispositions.map(disp => (
                                    <label key={disp.id} className="flex items-center text-sm">
                                        <input type="checkbox" checked={customerFilters.dispositionIds.has(disp.id)} onChange={() => handleMultiSelectChange('dispositionIds', disp.id)} className="mr-2 rounded border-gray-300 text-brand-red focus:ring-brand-red dark:border-neutral-500 dark:bg-neutral-600 dark:focus:ring-offset-neutral-800"/>
                                        {disp.name}
                                    </label>
                                ))}
                            </div>
                            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto bg-white dark:bg-neutral-700 dark:border-neutral-600">
                                <h4 className="font-semibold text-sm">Statuses</h4>
                                {STATUS_OPTIONS.map(status => (
                                    <label key={status} className="flex items-center text-sm">
                                        <input type="checkbox" checked={customerFilters.statuses.has(status)} onChange={() => handleMultiSelectChange('statuses', status)} className="mr-2 rounded border-gray-300 text-brand-red focus:ring-brand-red dark:border-neutral-500 dark:bg-neutral-600 dark:focus:ring-offset-neutral-800"/>
                                        {status}
                                    </label>
                                ))}
                            </div>
                            <div className="border border-gray-300 rounded-md p-2 max-h-40 overflow-y-auto bg-white dark:bg-neutral-700 dark:border-neutral-600">
                                <h4 className="font-semibold text-sm">Associations</h4>
                                {associations.map(assoc => (
                                    <label key={assoc.id} className="flex items-center text-sm">
                                        <input type="checkbox" checked={customerFilters.associationIds.has(assoc.associationId)} onChange={() => handleMultiSelectChange('associationIds', assoc.associationId)} className="mr-2 rounded border-gray-300 text-brand-red focus:ring-brand-red dark:border-neutral-500 dark:bg-neutral-600 dark:focus:ring-offset-neutral-800"/>
                                        {assoc.associatedCity || assoc.associationId}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto bg-white dark:bg-neutral-800 shadow-md rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-neutral-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Actions</th>
                                <th scope="col" className="px-6 py-3">Phone</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">City</th>
                                <th scope="col" className="px-6 py-3">Association</th>
                                <th scope="col" className="px-6 py-3">Disposition</th>
                                <th scope="col" className="px-6 py-3">Dispo Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedCustomers.map(customer => (
                                <tr 
                                    key={customer.id} 
                                    className="bg-white dark:bg-neutral-800 border-b dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-600"
                                >
                                    <td className="px-6 py-4 space-x-2 whitespace-nowrap">
                                        <button onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`);}} className="font-medium text-green-600 dark:text-green-500 hover:underline">View</button>
                                        <Link to={`/customers/${customer.id}/edit`} onClick={(e) => e.stopPropagation()} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Edit</Link>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(customer.id); }} className="font-medium text-red-600 dark:text-red-500 hover:underline">Delete</button>
                                    </td>
                                    <td className="px-6 py-4" onClick={() => navigate(`/customers/${customer.id}`)}>{customer.phone}</td>
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => navigate(`/customers/${customer.id}`)}>
                                        <span className="text-blue-600 dark:text-blue-400 hover:underline">
                                          {customer.firstName} {customer.lastName}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4" onClick={() => navigate(`/customers/${customer.id}`)}>
                                        <StatusBadge status={customer.status} detail={customer.statusDetail} />
                                    </td>
                                    <td className="px-6 py-4" onClick={() => navigate(`/customers/${customer.id}`)}>{formatCustomerType(customer.businessResidential, customer.coldPc)}</td>
                                    <td className="px-6 py-4" onClick={() => navigate(`/customers/${customer.id}`)}>{customer.city || 'N/A'}</td>
                                    <td className="px-6 py-4" onClick={() => navigate(`/customers/${customer.id}`)}>{getAssociationById(customer.associationId)?.associationName || customer.associationId}</td>
                                    <td className="px-6 py-4" onClick={() => navigate(`/customers/${customer.id}`)}>{getDispositionById(customer.dispositionId)?.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap" onClick={() => navigate(`/customers/${customer.id}`)}>{new Date(customer.dispositionTime).toLocaleString()}</td>
                                </tr>
                            ))}
                             {paginatedCustomers.length === 0 && (
                                <tr className="bg-white dark:bg-neutral-800 border-b dark:border-neutral-700">
                                    <td colSpan={9} className="text-center py-10 text-gray-500 dark:text-gray-400">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm text-gray-700 dark:text-gray-400">
                        Showing {paginatedCustomers.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} results
                    </span>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            </main>
            <Modal isOpen={isDeleteAllModalOpen} onClose={() => {setDeleteAllModalOpen(false); setDeleteConfirmText('');}} title="Confirm Delete All Customers">
                <div className="space-y-4">
                    <p className="text-red-500 font-bold">This is a permanent action and cannot be undone. All customer records will be deleted.</p>
                    <p>Please type <strong className="text-red-500 dark:text-red-400">DELETE ALL</strong> below to confirm.</p>
                    <input
                        type="text"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        className="w-full p-2 border border-gray-300 bg-white rounded-md dark:bg-neutral-700 dark:border-neutral-600"
                        aria-label="Confirm delete by typing DELETE ALL"
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                        <button onClick={() => {setDeleteAllModalOpen(false); setDeleteConfirmText('');}} className="px-4 py-2 bg-gray-200 dark:bg-neutral-600 rounded-md">Cancel</button>
                        <button
                            onClick={handleConfirmDeleteAll}
                            disabled={deleteConfirmText !== 'DELETE ALL'}
                            className="px-4 py-2 bg-red-600 text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Delete All Customers
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CustomersPage;
