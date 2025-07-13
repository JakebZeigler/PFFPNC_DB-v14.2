import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { CustomerWithHistory, Agent, Disposition, Show, Association, User } from '../../types';

// Collection names
const COLLECTIONS = {
  customers: 'customers',
  agents: 'agents',
  dispositions: 'dispositions',
  shows: 'shows',
  associations: 'associations',
  users: 'users'
};

// Generic CRUD operations
export class FirebaseService<T> {
  constructor(private collectionName: string) {}

  async getAll(): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
    } catch (error) {
      console.error(`Error fetching ${this.collectionName}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching ${this.collectionName} by ID:`, error);
      throw error;
    }
  }

  async create(data: Omit<T, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error(`Error updating ${this.collectionName}:`, error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listener
  onSnapshot(callback: (data: T[]) => void): () => void {
    const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as T));
      callback(data);
    }, (error) => {
      console.error(`Error in ${this.collectionName} snapshot:`, error);
    });
  }
}

// Specific service instances
export const CustomerService = new FirebaseService<CustomerWithHistory>(COLLECTIONS.customers);
export const AgentService = new FirebaseService<Agent>(COLLECTIONS.agents);
export const DispositionService = new FirebaseService<Disposition>(COLLECTIONS.dispositions);
export const ShowService = new FirebaseService<Show>(COLLECTIONS.shows);
export const AssociationService = new FirebaseService<Association>(COLLECTIONS.associations);
export const UserService = new FirebaseService<User>(COLLECTIONS.users);

// Initialize default data if collections are empty
export const initializeDefaultData = async () => {
  try {
    // Check if data already exists
    const customers = await CustomerService.getAll();
    if (customers.length > 0) {
      console.log('Data already exists, skipping initialization');
      return;
    }

    console.log('Initializing default data...');

    // Add default agents
    const defaultAgents: Omit<Agent, 'id'>[] = [
      { name: 'John Smith', email: 'john@example.com', phone: '555-0101', isActive: true },
      { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-0102', isActive: true }
    ];

    for (const agent of defaultAgents) {
      await AgentService.create(agent);
    }

    // Add default shows
    const defaultShows: Omit<Show, 'id'>[] = [
      { name: 'Morning Show', timeSlot: '9:00 AM', isActive: true },
      { name: 'Evening News', timeSlot: '6:00 PM', isActive: true }
    ];

    for (const show of defaultShows) {
      await ShowService.create(show);
    }

    // Add default dispositions
    const defaultDispositions: Omit<Disposition, 'id'>[] = [
      { name: 'Interested', category: 'Positive', isActive: true },
      { name: 'Not Interested', category: 'Negative', isActive: true },
      { name: 'Call Back Later', category: 'Follow-up', isActive: true }
    ];

    for (const disposition of defaultDispositions) {
      await DispositionService.create(disposition);
    }

    console.log('Default data initialized successfully');
  } catch (error) {
    console.error('Error initializing default data:', error);
  }
};
