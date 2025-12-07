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
  try {
    const q = query(collection(db, 'orders'), orderBy('requestDate', 'desc'));
    return onSnapshot(q, 
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        callback(orders);
      },
      (error) => {
        console.error("Error subscribing to orders:", error);
        callback([]); // Return empty list on error to prevent hanging
      }
    );
  } catch (e) {
    console.error("Setup error orders:", e);
    callback([]);
    return () => {};
  }
};

export const subscribeToBranches = (callback: (branches: Branch[]) => void) => {
  try {
    return onSnapshot(collection(db, 'branches'), 
      (snapshot) => {
        const branches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
        // Seed if empty (and we have write permission, otherwise just return empty)
        if (branches.length === 0) {
          // Attempt seed, but catch error silently if permission denied
          SEED_BRANCHES.forEach(b => setDoc(doc(db, 'branches', b.id), b).catch(err => console.log("Seed blocked", err)));
          // We return the seed data locally so UI looks good immediately
          callback(SEED_BRANCHES);
        } else {
          callback(branches);
        }
      },
      (error) => {
        console.error("Error subscribing to branches:", error);
        // Fallback to mock data if DB fails
        callback(SEED_BRANCHES);
      }
    );
  } catch (e) {
    callback(SEED_BRANCHES);
    return () => {};
  }
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  try {
    return onSnapshot(collection(db, 'users'), 
      (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        callback(users);
      },
      (error) => {
        console.error("Error subscribing to users:", error);
        callback([]); // Return empty list on error
      }
    );
  } catch (e) {
    callback([]);
    return () => {};
  }
};

// 2. CRUD Operations
// Wrapped in try/catch to prevent UI crashes if permission denied
export const firestoreAddOrder = async (order: Order) => {
  try {
    await setDoc(doc(db, 'orders', order.id), order);
  } catch (error) {
    console.error("Error adding order:", error);
    alert("Erro ao salvar: Verifique sua conexão ou permissões.");
  }
};

export const firestoreUpdateOrder = async (order: Order) => {
  try {
    const orderRef = doc(db, 'orders', order.id);
    await updateDoc(orderRef, { ...order });
  } catch (error) {
    console.error("Error updating order:", error);
    alert("Erro ao atualizar.");
  }
};

export const firestoreDeleteOrder = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'orders', id));
  } catch (error) {
    console.error("Error deleting order:", error);
  }
};

export const firestoreAddBranch = async (branch: Branch) => {
  try {
    await setDoc(doc(db, 'branches', branch.id), branch);
  } catch (error) {
    console.error("Error adding branch:", error);
  }
};

export const firestoreDeleteBranch = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'branches', id));
  } catch (error) {
    console.error("Error deleting branch:", error);
  }
};

export const firestoreAddUser = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.id), user);
  } catch (error) {
    console.error("Error adding user profile:", error);
    // Don't alert here, it might happen on login/register if rules are strict
  }
};

export const firestoreDeleteUser = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'users', id));
  } catch (error) {
    console.error("Error deleting user:", error);
  }
};

export const ensureUserProfile = async (authUser: any) => {
  // Legacy stub
};