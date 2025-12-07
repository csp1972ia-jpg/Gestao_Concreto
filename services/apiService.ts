import { Order, Branch, User, UserRole, OrderStatus } from '../types';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot 
} from 'firebase/firestore';

// Mock Data for seeding database if empty
const SEED_BRANCHES: Branch[] = [
  { id: '1', name: 'Filial Centro', trucks: 10, goalPerTruck: 50 },
  { id: '2', name: 'Filial Norte', trucks: 8, goalPerTruck: 45 },
  { id: '3', name: 'Filial Sul', trucks: 12, goalPerTruck: 55 },
];

export const generateId = () => `PED-${Math.floor(Math.random() * 10000)}`;

export const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const correctedDate = new Date(date.getTime() + userTimezoneOffset);
  return new Intl.DateTimeFormat('pt-BR').format(correctedDate);
};

// --- Firestore Operations ---

// 1. Subscribe to Collections (Real-time updates)
export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const q = query(collection(db, 'orders'), orderBy('requestDate', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    callback(orders);
  });
};

export const subscribeToBranches = (callback: (branches: Branch[]) => void) => {
  return onSnapshot(collection(db, 'branches'), (snapshot) => {
    const branches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
    // Seed if empty
    if (branches.length === 0) {
      SEED_BRANCHES.forEach(b => setDoc(doc(db, 'branches', b.id), b));
    } else {
      callback(branches);
    }
  });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, 'users'), (snapshot) => {
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    callback(users);
  });
};

// 2. CRUD Operations
export const firestoreAddOrder = async (order: Order) => {
  // Use custom ID or auto-generated
  await setDoc(doc(db, 'orders', order.id), order);
};

export const firestoreUpdateOrder = async (order: Order) => {
  const orderRef = doc(db, 'orders', order.id);
  await updateDoc(orderRef, { ...order });
};

export const firestoreDeleteOrder = async (id: string) => {
  await deleteDoc(doc(db, 'orders', id));
};

export const firestoreAddBranch = async (branch: Branch) => {
  await setDoc(doc(db, 'branches', branch.id), branch);
};

export const firestoreDeleteBranch = async (id: string) => {
  await deleteDoc(doc(db, 'branches', id));
};

export const firestoreAddUser = async (user: User) => {
  await setDoc(doc(db, 'users', user.id), user);
};

export const firestoreDeleteUser = async (id: string) => {
  await deleteDoc(doc(db, 'users', id));
};

// Helper to check/create user profile in Firestore on login
export const ensureUserProfile = async (authUser: any) => {
  const userRef = doc(db, 'users', authUser.uid);
  const userSnap = await getDocs(query(collection(db, 'users'))); // Just checking if exists logic could be simpler
  
  // Logic simplified: In a real app, we check if doc exists. 
  // For this demo, we'll rely on the Admin panel to create users or auto-create basic ones
  // Here we just return a mapped User object from Auth
  
  // If user is not in our custom 'users' collection, we might treat them as Guest or Auto-create
  // For now, let's assume the Admin creates users in the 'users' collection with roles
  // and the auth.uid matches the user.id
};