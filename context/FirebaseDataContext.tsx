import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Papa from 'papaparse';
import { DataContextType, CustomerWithHistory, Agent, Disposition, Show, Association, User, DispositionHistory } from '../types';
import { 
  CustomerService, 
  AgentService, 
  DispositionService, 
  ShowService, 
  AssociationService, 
  UserService,
  initializeDefaultData 
} from '../src/services/firebaseService';

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State management
  const [customers, setCustomers] = useState<CustomerWithHistory[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [dispositions, setDispositions] = useState<Disposition[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Firebase data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize default data if needed
        await initializeDefaultData();

        // Load all data
        const [customersData, agentsData, dispositionsData, showsData, associationsData, usersData] = await Promise.all([
          CustomerService.getAll(),
          AgentService.getAll(),
          DispositionService.getAll(),
          ShowService.getAll(),
          AssociationService.getAll(),
          UserService.getAll()
        ]);

        setCustomers(customersData);
        setAgents(agentsData);
        setDispositions(dispositionsData);
        setShows(showsData);
        setAssociations(associationsData);
        setUsers(usersData);

      } catch (err) {
        console.error('Error loading Firebase data:', err);
        setError('Failed to load data from Firebase');
        
        // Fallback to mock data if Firebase fails
        const { mockCustomers, mockAgents, mockDispositions, mockShows, mockAssociations, mockUsers } = await import('../data/mockData');
        setCustomers(mockCustomers);
        setAgents(mockAgents);
        setDispositions(mockDispositions);
        setShows(mockShows);
        setAssociations(mockAssociations);
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // Customer operations
  const addCustomer = async (customer: Omit<CustomerWithHistory, 'id'>) => {
    try {
      const id = await CustomerService.create(customer);
      const newCustomer = { ...customer, id };
      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, updates: Partial<CustomerWithHistory>) => {
    try {
      await CustomerService.update(id, updates);
      setCustomers(prev => prev.map(customer => 
        customer.id === id ? { ...customer, ...updates } : customer
      ));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      await CustomerService.delete(id);
      setCustomers(prev => prev.filter(customer => customer.id !== id));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  // Agent operations
  const addAgent = async (agent: Omit<Agent, 'id'>) => {
    try {
      const id = await AgentService.create(agent);
      const newAgent = { ...agent, id };
      setAgents(prev => [newAgent, ...prev]);
      return newAgent;
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  };

  const updateAgent = async (id: string, updates: Partial<Agent>) => {
    try {
      await AgentService.update(id, updates);
      setAgents(prev => prev.map(agent => 
        agent.id === id ? { ...agent, ...updates } : agent
      ));
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  };

  const deleteAgent = async (id: string) => {
    try {
      await AgentService.delete(id);
      setAgents(prev => prev.filter(agent => agent.id !== id));
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  };

  // Show operations
  const addShow = async (show: Omit<Show, 'id'>) => {
    try {
      const id = await ShowService.create(show);
      const newShow = { ...show, id };
      setShows(prev => [newShow, ...prev]);
      return newShow;
    } catch (error) {
      console.error('Error adding show:', error);
      throw error;
    }
  };

  const updateShow = async (id: string, updates: Partial<Show>) => {
    try {
      await ShowService.update(id, updates);
      setShows(prev => prev.map(show => 
        show.id === id ? { ...show, ...updates } : show
      ));
    } catch (error) {
      console.error('Error updating show:', error);
      throw error;
    }
  };

  const deleteShow = async (id: string) => {
    try {
      await ShowService.delete(id);
      setShows(prev => prev.filter(show => show.id !== id));
    } catch (error) {
      console.error('Error deleting show:', error);
      throw error;
    }
  };

  // Association operations
  const addAssociation = async (association: Omit<Association, 'id'>) => {
    try {
      const id = await AssociationService.create(association);
      const newAssociation = { ...association, id };
      setAssociations(prev => [newAssociation, ...prev]);
      return newAssociation;
    } catch (error) {
      console.error('Error adding association:', error);
      throw error;
    }
  };

  const updateAssociation = async (id: string, updates: Partial<Association>) => {
    try {
      await AssociationService.update(id, updates);
      setAssociations(prev => prev.map(association => 
        association.id === id ? { ...association, ...updates } : association
      ));
    } catch (error) {
      console.error('Error updating association:', error);
      throw error;
    }
  };

  const deleteAssociation = async (id: string) => {
    try {
      await AssociationService.delete(id);
      setAssociations(prev => prev.filter(association => association.id !== id));
    } catch (error) {
      console.error('Error deleting association:', error);
      throw error;
    }
  };

  // Disposition operations
  const addDisposition = async (disposition: Omit<Disposition, 'id'>) => {
    try {
      const id = await DispositionService.create(disposition);
      const newDisposition = { ...disposition, id };
      setDispositions(prev => [newDisposition, ...prev]);
      return newDisposition;
    } catch (error) {
      console.error('Error adding disposition:', error);
      throw error;
    }
  };

  const updateDisposition = async (id: string, updates: Partial<Disposition>) => {
    try {
      await DispositionService.update(id, updates);
      setDispositions(prev => prev.map(disposition => 
        disposition.id === id ? { ...disposition, ...updates } : disposition
      ));
    } catch (error) {
      console.error('Error updating disposition:', error);
      throw error;
    }
  };

  const deleteDisposition = async (id: string) => {
    try {
      await DispositionService.delete(id);
      setDispositions(prev => prev.filter(disposition => disposition.id !== id));
    } catch (error) {
      console.error('Error deleting disposition:', error);
      throw error;
    }
  };

  // User operations
  const addUser = async (user: Omit<User, 'id'>) => {
    try {
      const id = await UserService.create(user);
      const newUser = { ...user, id };
      setUsers(prev => [newUser, ...prev]);
      return newUser;
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    try {
      await UserService.update(id, updates);
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...updates } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await UserService.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  // Disposition history operations
  const addDispositionHistory = async (customerId: string, history: Omit<DispositionHistory, 'id'>) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) throw new Error('Customer not found');

      const updatedHistory = [...(customer.dispositionHistory || []), { ...history, id: Date.now().toString() }];
      await updateCustomer(customerId, { dispositionHistory: updatedHistory });
    } catch (error) {
      console.error('Error adding disposition history:', error);
      throw error;
    }
  };

  const updateDispositionHistory = async (customerId: string, historyId: string, updates: Partial<DispositionHistory>) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) throw new Error('Customer not found');

      const updatedHistory = customer.dispositionHistory?.map(h => 
        h.id === historyId ? { ...h, ...updates } : h
      ) || [];
      
      await updateCustomer(customerId, { dispositionHistory: updatedHistory });
    } catch (error) {
      console.error('Error updating disposition history:', error);
      throw error;
    }
  };

  // Import operations (simplified for Firebase)
  const importCustomers = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const csvContent = results.data as any[];
            for (const row of csvContent) {
              if (row.firstName && row.lastName) {
                await addCustomer({
                  firstName: row.firstName,
                  lastName: row.lastName,
                  email: row.email || '',
                  phone: row.phone || '',
                  address: row.address || '',
                  city: row.city || '',
                  state: row.state || '',
                  zipCode: row.zipCode || '',
                  notes: row.notes || '',
                  dispositionHistory: []
                });
              }
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        error: reject
      });
    });
  };

  const value: DataContextType = {
    // Data
    customers,
    agents,
    dispositions,
    shows,
    associations,
    users,
    loading,
    error,

    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,

    // Agent operations
    addAgent,
    updateAgent,
    deleteAgent,

    // Show operations
    addShow,
    updateShow,
    deleteShow,

    // Association operations
    addAssociation,
    updateAssociation,
    deleteAssociation,

    // Disposition operations
    addDisposition,
    updateDisposition,
    deleteDisposition,

    // User operations
    addUser,
    updateUser,
    deleteUser,

    // Disposition history operations
    addDispositionHistory,
    updateDispositionHistory,

    // Import operations
    importCustomers,
    importPaids: async () => {},
    importChecks: async () => {},

    // Export operations
    exportCustomers: () => '',
    exportPaids: () => '',
    exportChecks: () => '',

    // Clear operations
    clearAllData: async () => {
      setCustomers([]);
      setAgents([]);
      setDispositions([]);
      setShows([]);
      setAssociations([]);
      setUsers([]);
    }
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
