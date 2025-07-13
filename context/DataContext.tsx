
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { Customer, CustomerWithHistory, Agent, Disposition, Show, Association, DataContextType, DispositionHistory, User, DispositionModifier, ImportHistoryLog, PaidsImportResult, ChecksImportResult, CustomerFilters } from '../types';
import { initialAgents, initialCustomers, initialDispositions, initialShows, initialAssociations, initialUsers } from '../data/mockData';
import { DEFAULT_AGENT, DEFAULT_DISPOSITION, DEFAULT_SHOW, DEFAULT_ASSOCIATION } from '../constants';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

// --- Local Storage Persistence Hook ---
// NOTE: Disabled localStorage persistence to prevent "quota exceeded" errors.
// The application state will reset on page refresh. This is a temporary solution
// for the demo environment. For a production app, a more robust storage solution
// like IndexedDB would be required for large datasets.
const useLocalStorage = <T,>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        // We are only using the initial value and not touching localStorage to avoid quota errors.
        // This means data will reset on page refresh.
        return initialValue;
    });

    // The useEffect that wrote to localStorage has been removed to prevent storage errors.

    return [storedValue, setStoredValue];
};

const calculateCustomerStatus = (customer: CustomerWithHistory, dispositions: Disposition[]): { status: string, statusDetail?: string } => {
    const history = [...customer.dispositionHistory].sort((a, b) => new Date(a.dispositionTime).getTime() - new Date(b.dispositionTime).getTime());
    if (history.length === 0) {
        return { status: 'Active' };
    }

    // Check for DNC first
    const dncDispIds = new Set(dispositions.filter(d => d.modifiers.includes(DispositionModifier.DNC)).map(d => d.id));
    if (history.some(h => dncDispIds.has(h.dispositionId))) {
        return { status: 'DNC' };
    }

    const excludeDncDisps = dispositions.filter(d => d.modifiers.includes(DispositionModifier.ExcludeCount) && d.excludeAction === 'DNC' && d.excludeAfterAttempts);
    for (const d of excludeDncDisps) {
        if (history.filter(h => h.dispositionId === d.id).length >= d.excludeAfterAttempts!) {
            return { status: 'DNC' };
        }
    }

    // Check for Timeout from the latest disposition
    const latestHistory = history[history.length - 1];
    const latestDisp = dispositions.find(d => d.id === latestHistory.dispositionId);

    if (latestDisp) {
        if (latestDisp.modifiers.includes(DispositionModifier.TimeOut) && latestDisp.timeOutDays) {
            const timeoutEnds = new Date(latestHistory.dispositionTime).getTime() + (latestDisp.timeOutDays * 24 * 60 * 60 * 1000);
            if (Date.now() < timeoutEnds) {
                return { status: 'Timeout', statusDetail: `until ${new Date(timeoutEnds).toLocaleDateString()}` };
            }
        }
        if (latestDisp.modifiers.includes(DispositionModifier.ExcludeCount) && latestDisp.excludeAfterAttempts && latestDisp.excludeAction === 'TimeOut' && latestDisp.excludeActionTimeOutDays) {
            if (history.filter(h => h.dispositionId === latestDisp.id).length >= latestDisp.excludeAfterAttempts) {
                const timeoutEnds = new Date(latestHistory.dispositionTime).getTime() + (latestDisp.excludeActionTimeOutDays * 24 * 60 * 60 * 1000);
                if (Date.now() < timeoutEnds) {
                    return { status: 'Timeout', statusDetail: `until ${new Date(timeoutEnds).toLocaleDateString()}` };
                }
            }
        }
    }

    // Check for Sale/Payment/Cancel cycle
    let lastSaleIndex = -1;
    for (let i = history.length - 1; i >= 0; i--) {
        const disp = dispositions.find(d => d.id === history[i].dispositionId);
        if (disp?.modifiers.includes(DispositionModifier.Sale)) {
            if (disp.modifiers.includes(DispositionModifier.Payment)) {
                return { status: 'Paid' }; // Combined Sale+Payment disposition
            }
            lastSaleIndex = i;
            break;
        }
    }

    if (lastSaleIndex !== -1) {
        for (let i = lastSaleIndex + 1; i < history.length; i++) {
            const subsequentDisp = dispositions.find(d => d.id === history[i].dispositionId);
            if (subsequentDisp?.modifiers.includes(DispositionModifier.Payment)) {
                return { status: 'Paid' };
            }
            if (subsequentDisp?.modifiers.includes(DispositionModifier.Cancel)) {
                return { status: 'Cancelled' };
            }
        }
        return { status: 'Open Order' };
    }

    return { status: 'Active' };
};

const recalculateAllCustomerStatuses = (allCustomers: CustomerWithHistory[], allDispositions: Disposition[]): CustomerWithHistory[] => {
    return allCustomers.map(c => {
        const { status, statusDetail } = calculateCustomerStatus(c, allDispositions);
        return { ...c, status, statusDetail };
    });
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const initialCustomersWithStatus = useMemo(() => {
        return recalculateAllCustomerStatuses(initialCustomers, initialDispositions);
    }, []);
    
    const [customers, setCustomers] = useLocalStorage<CustomerWithHistory[]>('pffpnc-customers', initialCustomersWithStatus);
    const [agents, setAgents] = useLocalStorage<Agent[]>('pffpnc-agents', initialAgents);
    const [dispositions, setDispositions] = useLocalStorage<Disposition[]>('pffpnc-dispositions', initialDispositions);
    const [shows, setShows] = useLocalStorage<Show[]>('pffpnc-shows', initialShows);
    const [associations, setAssociations] = useLocalStorage<Association[]>('pffpnc-associations', initialAssociations);
    const [users, setUsers] = useLocalStorage<User[]>('pffpnc-users', initialUsers);
    const [importHistory, setImportHistory] = useState<ImportHistoryLog[]>([]);
    const [paidsImportHistory, setPaidsImportHistory] = useState<PaidsImportResult[]>([]);
    const [checksImportHistory, setChecksImportHistory] = useState<ChecksImportResult[]>([]);

    const [customerFilters, setCustomerFilters] = useState<CustomerFilters>({
        searchTerm: '',
        dateFrom: '',
        timeFrom: '',
        dateTo: '',
        timeTo: '',
        agentNumbers: new Set(),
        dispositionIds: new Set(),
        statuses: new Set(),
        associationIds: new Set(),
    });

    
    // Configurable disposition states
    const [paidDispositionId, setPaidDispositionId] = useState<string>('');
    const [checkDispositionId, setCheckDispositionId] = useState<string>('');
    const [dncDispositionId, setDncDispositionId] = useState<string>('');

    // Memoized lists of dispositions by modifier
    const paymentDispositions = useMemo(() => 
        dispositions.filter(d => d.modifiers.includes(DispositionModifier.Payment))
    , [dispositions]);
    const dncDispositions = useMemo(() =>
        dispositions.filter(d => d.modifiers.includes(DispositionModifier.DNC))
    , [dispositions]);
    
    // Set default dispositions
    useEffect(() => {
        if (!paidDispositionId) {
            const ranDisp = dispositions.find(d => d.name === 'Ran');
            if (ranDisp) setPaidDispositionId(ranDisp.id);
            else if (paymentDispositions.length > 0) setPaidDispositionId(paymentDispositions[0].id)
        }
        if (!checkDispositionId) {
            const verifiedCreditDisp = dispositions.find(d => d.name === 'Verified Credit');
            if (verifiedCreditDisp) setCheckDispositionId(verifiedCreditDisp.id);
            else if (paymentDispositions.length > 0) setCheckDispositionId(paymentDispositions[0].id)
        }
        if (!dncDispositionId) {
            const removeDisp = dispositions.find(d => d.name === 'Remove');
            if (removeDisp) setDncDispositionId(removeDisp.id);
            else if (dncDispositions.length > 0) setDncDispositionId(dncDispositions[0].id);
        }
    }, [dispositions, paymentDispositions, dncDispositions, paidDispositionId, checkDispositionId, dncDispositionId]);


    const addImportHistoryLog = useCallback((log: ImportHistoryLog) => {
        setImportHistory(prev => [log, ...prev]);
    }, []);
    
    // --- User Actions ---
    const addUser = useCallback((user: Omit<User, 'id' | 'status'>) => {
        const newUser: User = {
            ...user,
            id: `user-${Date.now()}`,
            status: 'pending',
        };
        setUsers(prev => [...prev, newUser]);
    }, [setUsers]);

    const updateUser = useCallback((updatedUser: User) => {
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }, [setUsers]);

    const deleteUser = useCallback((userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    }, [setUsers]);

    const getUserByEmail = useCallback((email: string) => users.find(u => u.email.toLowerCase() === email.toLowerCase()), [users]);

    // --- Customer Actions ---
    const addOrUpdateCustomer = useCallback((customer: Customer) => {
        setCustomers(prev => {
            const newHistoryEntry: DispositionHistory = {
                dispositionId: customer.dispositionId,
                dispositionTime: new Date(customer.dispositionTime).toISOString(),
                agentNumber: customer.agentNumber,
                amount: customer.amount,
                ticketsAd: customer.ticketsAd,
                currentNotes: customer.currentNotes,
                program: customer.program,
                leadList: customer.leadList,
            };

            const updateCustomerWithStatus = (cust: CustomerWithHistory, allDisps: Disposition[]): CustomerWithHistory => {
                const { status, statusDetail } = calculateCustomerStatus(cust, allDisps);
                return { ...cust, status, statusDetail };
            };

            const existing = prev.find(c => c.id === customer.id);
            if (existing) {
                 // Check for meaningful change to avoid duplicate history on simple re-saves
                const lastHistory = existing.dispositionHistory[existing.dispositionHistory.length - 1];
                const hasMeaningfulChange = !lastHistory ||
                    lastHistory.dispositionId !== newHistoryEntry.dispositionId ||
                    new Date(lastHistory.dispositionTime).getTime() !== new Date(newHistoryEntry.dispositionTime).getTime() ||
                    lastHistory.amount !== newHistoryEntry.amount ||
                    existing.currentNotes !== customer.currentNotes;

                const updatedHistory = hasMeaningfulChange
                    ? [...existing.dispositionHistory, newHistoryEntry]
                    : existing.dispositionHistory;

                let customerWithHistory = { ...customer, dispositionHistory: updatedHistory };
                customerWithHistory = updateCustomerWithStatus(customerWithHistory, dispositions);
                return prev.map(c => c.id === customer.id ? customerWithHistory : c);
            } else {
                // Add new customer
                let newCustomer: CustomerWithHistory = {
                    ...customer,
                    id: `cust-${Date.now()}`,
                    dispositionHistory: [newHistoryEntry]
                };
                newCustomer = updateCustomerWithStatus(newCustomer, dispositions);
                return [newCustomer, ...prev];
            }
        });
    }, [setCustomers, dispositions]);
    
    const deleteCustomer = useCallback((customerId: string) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
    }, [setCustomers]);

    const deleteAllCustomers = useCallback((verification: string): boolean => {
        if (verification !== 'DELETE ALL') {
            console.error("Delete all verification failed.");
            return false;
        }
        setCustomers([]);
        return true;
    }, [setCustomers]);

    const bulkAddCustomers = useCallback((newCustomers: Customer[]) => {
        setCustomers(prev => {
            const customerMap = new Map<string, CustomerWithHistory>(prev.map(c => [c.phone, c]));
    
            for (const importedCustomer of newCustomers) {
                if (!importedCustomer.phone) continue; // Skip records without a phone number

                const newHistoryEntry: DispositionHistory = {
                    dispositionId: importedCustomer.dispositionId,
                    dispositionTime: new Date(importedCustomer.dispositionTime).toISOString(),
                    agentNumber: importedCustomer.agentNumber,
                    amount: importedCustomer.amount,
                    ticketsAd: importedCustomer.ticketsAd,
                    currentNotes: importedCustomer.currentNotes,
                    program: importedCustomer.program,
                    leadList: importedCustomer.leadList,
                };
    
                const existingCustomer = customerMap.get(importedCustomer.phone);
    
                if (existingCustomer) {
                    // UPDATE existing customer
                    const newHistoryTime = new Date(newHistoryEntry.dispositionTime).getTime();
                    const historyExists = existingCustomer.dispositionHistory.some(
                        h => new Date(h.dispositionTime).getTime() === newHistoryTime
                    );
    
                    // Update base info (name, address, etc.) and add history if it's new
                    const updatedCustomer: CustomerWithHistory = {
                        ...existingCustomer,
                        ...importedCustomer,
                        id: existingCustomer.id, // Keep original ID
                        dispositionHistory: historyExists 
                            ? existingCustomer.dispositionHistory 
                            : [...existingCustomer.dispositionHistory, newHistoryEntry],
                    };
                    customerMap.set(importedCustomer.phone, updatedCustomer);
                } else {
                    // CREATE new customer
                    const newCustomerWithHistory: CustomerWithHistory = {
                        ...importedCustomer,
                        id: `cust-${Date.now()}-${Math.random()}`,
                        dispositionHistory: [newHistoryEntry],
                    };
                    customerMap.set(newCustomerWithHistory.phone, newCustomerWithHistory);
                }
            }
            
            // After all updates, ensure the top-level disposition for each customer is correct.
            let finalCustomers = Array.from(customerMap.values()).map(customer => {
                 if (customer.dispositionHistory.length > 0) {
                     const latestHistory = [...customer.dispositionHistory].sort((a,b) => new Date(b.dispositionTime).getTime() - new Date(a.dispositionTime).getTime())[0];
                     return {
                         ...customer,
                         dispositionId: latestHistory.dispositionId,
                         dispositionTime: latestHistory.dispositionTime,
                         agentNumber: latestHistory.agentNumber,
                         amount: latestHistory.amount,
                         ticketsAd: latestHistory.ticketsAd,
                         currentNotes: latestHistory.currentNotes,
                         program: latestHistory.program,
                         leadList: latestHistory.leadList,
                     };
                 }
                 return customer;
            });

            return recalculateAllCustomerStatuses(finalCustomers, dispositions);
        });
    }, [setCustomers, dispositions]);

    const addDispositionsForPaidsFile = useCallback((filesToProcess: { content: string; name: string }[]) => {
        const paidDisposition = dispositions.find(d => d.id === paidDispositionId);
        if (!paidDisposition) {
            console.error('The selected "Paid" disposition is not configured or found. Please select one on the Paids Import page.');
            return;
        }
    
        const defaultAgent = agents.find(a => a.isDefault) || agents[0];
        const newHistoryLogs: PaidsImportResult[] = [];
        const customerMap = new Map<string, CustomerWithHistory>(customers.map(c => [c.phone.replace(/\D/g, ''), c]));
        
        let totalUpdated = 0;
        let totalNotFound = 0;
    
        for (const file of filesToProcess) {
            let updatedInFile = 0;
            let notFoundInFile = 0;
    
            const dateMatch = file.name.match(/(\d{8})/);
            if (!dateMatch) {
                console.error(`Skipping file ${file.name}: Filename must contain a date in MMDDYYYY format.`);
                continue;
            }
            const dateString = dateMatch[1];
            const dispositionDate = new Date(`${dateString.slice(0, 2)}/${dateString.slice(2, 4)}/${dateString.slice(4, 8)}`);
            if (isNaN(dispositionDate.getTime())) {
                console.error(`Skipping file ${file.name}: Invalid date found in filename.`);
                continue;
            }
    
            const phoneNumbers = file.content.split(/\r?\n/).map(p => p.trim()).filter(Boolean);
    
            for (const phone of phoneNumbers) {
                const normalizedPhone = phone.replace(/\D/g, '');
                const customer = customerMap.get(normalizedPhone);
    
                if (customer) {
                    let agentToAssign = defaultAgent.agentNumber;
                    let amountFromSale: number | undefined = undefined;
                    let ticketsFromSale: number | undefined = undefined;
    
                    if (customer.status === 'Open Order') {
                        const sortedHistory = [...customer.dispositionHistory].sort((a, b) => new Date(b.dispositionTime).getTime() - new Date(a.dispositionTime).getTime());
                        for (const historyItem of sortedHistory) {
                            const disp = dispositions.find(d => d.id === historyItem.dispositionId);
                            if (disp?.modifiers.includes(DispositionModifier.Sale)) {
                                agentToAssign = historyItem.agentNumber;
                                amountFromSale = historyItem.amount;
                                ticketsFromSale = historyItem.ticketsAd;
                                break;
                            }
                        }
                    }
    
                    const newHistoryEntry: DispositionHistory = {
                        dispositionId: paidDisposition.id,
                        dispositionTime: dispositionDate.toISOString(),
                        agentNumber: agentToAssign,
                        amount: amountFromSale,
                        ticketsAd: ticketsFromSale,
                    };
    
                    const updatedCustomer: CustomerWithHistory = {
                      ...customer,
                      dispositionHistory: [...customer.dispositionHistory, newHistoryEntry],
                      dispositionId: newHistoryEntry.dispositionId,
                      dispositionTime: newHistoryEntry.dispositionTime,
                      agentNumber: newHistoryEntry.agentNumber,
                      amount: newHistoryEntry.amount,
                      ticketsAd: newHistoryEntry.ticketsAd,
                    };

                    const { status, statusDetail } = calculateCustomerStatus(updatedCustomer, dispositions);
                    updatedCustomer.status = status;
                    updatedCustomer.statusDetail = statusDetail;

                    customerMap.set(normalizedPhone, updatedCustomer);
                    updatedInFile++;
                } else {
                    notFoundInFile++;
                }
            }
            
            totalUpdated += updatedInFile;
            totalNotFound += notFoundInFile;

            newHistoryLogs.push({
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                fileName: file.name,
                dispositionDate: dispositionDate.toLocaleDateString(),
                updatedCount: updatedInFile,
                notFoundCount: notFoundInFile,
            });
        }
    
        setCustomers(Array.from(customerMap.values()));
        setPaidsImportHistory(prev => [...newHistoryLogs, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

    }, [customers, dispositions, agents, setCustomers, setPaidsImportHistory, paidDispositionId]);

    const getDispositionById = useCallback((id: string) => dispositions.find(d => d.id === id), [dispositions]);

    const addDispositionsForChecksFile = useCallback(async (filesToProcess: { content: string; name: string }[]) => {
        const checkDisposition = dispositions.find(d => d.id === checkDispositionId);
        if (!checkDisposition) {
            console.error('The selected "Check" disposition is not configured or found.');
            return;
        }
    
        const customerByPhone = new Map<string, CustomerWithHistory>(customers.map(c => [c.phone.replace(/\D/g, ''), c]));
        const customerByEmail = new Map<string, CustomerWithHistory>(customers.filter(c => c.email).map(c => [c.email!.toLowerCase(), c]));
        const customerAddressMap = new Map<string, CustomerWithHistory>(customers.filter(c => c.address && c.zip).map(c => [(c.address + c.zip).toLowerCase().replace(/\s/g, ''), c]));

        const allLogs: ChecksImportResult[] = [];
        const masterUpdateMap = new Map<string, CustomerWithHistory>();
    
        for (const file of filesToProcess) {
            await new Promise<void>((resolve) => {
                let updatedInFile = 0;
                let notFoundInFile = 0;
                const notFoundRowsInFile: Record<string, any>[] = [];
    
                Papa.parse(file.content, {
                    header: true,
                    skipEmptyLines: true,
                    step: (results) => {
                        const row = results.data as any;
                        let customer: CustomerWithHistory | undefined;
    
                        if (row.customer_phone) customer = customerByPhone.get(row.customer_phone.replace(/\D/g, ''));
                        if (!customer && row.customer_email) customer = customerByEmail.get(row.customer_email.toLowerCase());
                        if (!customer && row.billing_address_1 && row.billing_address_zip) customer = customerAddressMap.get((row.billing_address_1 + row.billing_address_zip).toLowerCase().replace(/\s/g, ''));
                        if (!customer && row.customer_address_1 && row.customer_address_zip) customer = customerAddressMap.get((row.customer_address_1 + row.customer_address_zip).toLowerCase().replace(/\s/g, ''));
    
                        if (customer) {
                            const customerToUpdate = masterUpdateMap.get(customer.id) || customer;
                            const lastSale = [...customerToUpdate.dispositionHistory].reverse().find(h => getDispositionById(h.dispositionId)?.modifiers.includes(DispositionModifier.Sale));
    
                            const newHistoryEntry: DispositionHistory = {
                                dispositionId: checkDisposition.id,
                                dispositionTime: new Date(row.updated_at || Date.now()).toISOString(),
                                agentNumber: lastSale?.agentNumber || DEFAULT_AGENT.agentNumber,
                                amount: parseFloat(row.total) || 0,
                                ticketsAd: lastSale?.ticketsAd,
                                currentNotes: `Credit processed via CSV import. Ref: ${row.id || 'N/A'}`
                            };
    
                            const updatedHistory = [...customerToUpdate.dispositionHistory, newHistoryEntry];
                            
                            const customerWithNewHistory: CustomerWithHistory = {
                                ...customerToUpdate,
                                dispositionHistory: updatedHistory,
                                dispositionId: newHistoryEntry.dispositionId,
                                dispositionTime: newHistoryEntry.dispositionTime,
                                agentNumber: newHistoryEntry.agentNumber,
                                amount: newHistoryEntry.amount,
                                ticketsAd: newHistoryEntry.ticketsAd,
                                currentNotes: newHistoryEntry.currentNotes,
                                program: newHistoryEntry.program,
                                leadList: newHistoryEntry.leadList,
                            };
                            
                            masterUpdateMap.set(customer.id, customerWithNewHistory);
                            updatedInFile++;
                        } else {
                            notFoundInFile++;
                            notFoundRowsInFile.push(row);
                        }
                    },
                    complete: () => {
                        allLogs.push({
                            id: Date.now() + Math.random(),
                            timestamp: new Date().toISOString(),
                            fileName: file.name,
                            updatedCount: updatedInFile,
                            notFoundCount: notFoundInFile,
                            notFoundRows: notFoundRowsInFile,
                        });
                        resolve();
                    }
                });
            });
        }
    
        if (masterUpdateMap.size > 0) {
            setCustomers(prevCustomers => {
                const finalCustomerMap = new Map(prevCustomers.map(c => [c.id, c]));
                for (const [id, updatedCustomer] of masterUpdateMap.entries()) {
                    const { status, statusDetail } = calculateCustomerStatus(updatedCustomer, dispositions);
                    finalCustomerMap.set(id, { ...updatedCustomer, status, statusDetail });
                }
                return Array.from(finalCustomerMap.values());
            });
        }
    
        setChecksImportHistory(prev => [...allLogs, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }, [customers, dispositions, checkDispositionId, getDispositionById, setCustomers, setChecksImportHistory]);


    // --- Agent Actions ---
    const addOrUpdateAgent = useCallback((agent: Agent) => {
        setAgents(prev => {
            const exists = prev.some(a => a.id === agent.id);
            if (exists) {
                return prev.map(a => a.id === agent.id ? agent : a);
            }
            return [...prev, { ...agent, id: `agent-${Date.now()}` }];
        });
    }, [setAgents]);

    const deleteAgent = useCallback((id: string, agentNumber: number) => {
        setAgents(prev => prev.filter(a => a.id !== id));
        setCustomers(prev => prev.map(c =>
            c.agentNumber === agentNumber
                ? { ...c, agentNumber: DEFAULT_AGENT.agentNumber }
                : c
        ));
    }, [setAgents, setCustomers]);

    // --- Disposition Actions ---
    const addOrUpdateDisposition = useCallback((disposition: Disposition) => {
         setDispositions(prevDisps => {
            const exists = prevDisps.some(d => d.id === disposition.id);
            const newDispositions = exists ?
                prevDisps.map(d => d.id === disposition.id ? disposition : d)
                : [{ ...disposition, id: `disp-custom-${Date.now()}` }, ...prevDisps];
            
            setCustomers(prevCustomers => recalculateAllCustomerStatuses(prevCustomers, newDispositions));
            
            return newDispositions;
        });
    }, [setDispositions, setCustomers]);
    
    const deleteDisposition = useCallback((dispositionId: string) => {
        setDispositions(prevDisps => {
            const newDispositions = prevDisps.filter(d => d.id !== dispositionId);
            
            setCustomers(prevCustomers => {
                const updatedCustomersForDefault = prevCustomers.map(c =>
                    c.dispositionId === dispositionId
                        ? { ...c, dispositionId: DEFAULT_DISPOSITION.id }
                        : c
                );
                return recalculateAllCustomerStatuses(updatedCustomersForDefault, newDispositions);
            });
    
            return newDispositions;
        });
    }, [setDispositions, setCustomers]);

    // --- Show Actions ---
    const addOrUpdateShow = useCallback((show: Show) => {
        setShows(prev => {
            const exists = prev.some(s => s.id === show.id);
            if(exists) {
                return prev.map(s => s.id === show.id ? show : s);
            }
            return [...prev, {...show, id: `show-${Date.now()}`}];
        });
    }, [setShows]);

    const deleteShow = useCallback((id: string, showNumber: number) => {
        setShows(prev => prev.filter(s => s.id !== id));
        setCustomers(prev => prev.map(c =>
            c.showNumber === showNumber
                ? { ...c, showNumber: DEFAULT_SHOW.showNumber }
                : c
        ));
    }, [setShows, setCustomers]);
    
    // --- Association Actions ---
    const addOrUpdateAssociation = useCallback((association: Association) => {
        setAssociations(prev => {
            const exists = prev.some(a => a.id === association.id);
            if(exists) {
                return prev.map(a => a.id === association.id ? association : a);
            }
            return [...prev, {...association, id: `assoc-${Date.now()}`}];
        });
    }, [setAssociations]);

    const deleteAssociation = useCallback((id: string, associationIdString: string) => {
        setAssociations(prev => prev.filter(a => a.id !== id));
        setCustomers(prev => prev.map(c =>
            c.associationId === associationIdString
                ? { ...c, associationId: DEFAULT_ASSOCIATION.associationId }
                : c
        ));
    }, [setAssociations, setCustomers]);

    // --- Getter Functions ---
    const getDispositionByName = useCallback((name: string) => dispositions.find(d => d.name.toLowerCase() === name.toLowerCase()), [dispositions]);
    const getAgentByNumber = useCallback((num: number) => agents.find(a => a.agentNumber === num), [agents]);
    const getShowByNumber = useCallback((num: number) => shows.find(s => s.showNumber === num), [shows]);
    const getShowById = useCallback((id: string) => shows.find(s => s.id === id), [shows]);
    const getAssociationByDbId = useCallback((id: string) => associations.find(a => a.id === id), [associations]);
    const getAssociationById = useCallback((associationId: string) => associations.find(a => a.associationId === associationId), [associations]);


    const value: DataContextType = {
        customers,
        agents,
        dispositions,
        shows,
        associations,
        users,
        addOrUpdateCustomer,
        deleteCustomer,
        deleteAllCustomers,
        bulkAddCustomers,
        addDispositionsForPaidsFile,
        addDispositionsForChecksFile,
        addOrUpdateAgent,
        deleteAgent,
        addOrUpdateDisposition,
        deleteDisposition,
        addOrUpdateShow,
        deleteShow,
        addOrUpdateAssociation,
        deleteAssociation,
        addUser,
        updateUser,
        deleteUser,
        getUserByEmail,
        getDispositionById,
        getDispositionByName,
        getAgentByNumber,
        getShowByNumber,
        getShowById,
        getAssociationByDbId,
        getAssociationById,
        importHistory,
        addImportHistoryLog,
        paidsImportHistory,
        checksImportHistory,
        paidDispositionId,
        setPaidDispositionId,
        checkDispositionId,
        setCheckDispositionId,
        dncDispositionId,
        setDncDispositionId,
        paymentDispositions,
        dncDispositions,
        customerFilters,
        setCustomerFilters,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};