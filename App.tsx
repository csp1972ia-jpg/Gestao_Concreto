import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { PreScheduling } from './pages/PreScheduling';
import { Schedule } from './pages/Schedule';
import { Dashboard } from './pages/Dashboard';
import { AdminManagement } from './pages/AdminManagement';
import { User, Order, Branch, UserRole } from './types';
import { 
  subscribeToOrders, 
  subscribeToBranches, 
  subscribeToUsers,
  firestoreAddOrder,
  firestoreUpdateOrder,
  firestoreDeleteOrder,
  firestoreAddBranch,
  firestoreDeleteBranch,
  firestoreAddUser,
  firestoreDeleteUser
} from './services/apiService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User logged in
      } else {
        setUser(null);
        setCurrentPage('login');
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Listeners (Real-time)
  useEffect(() => {
    if (!auth.currentUser) return;

    // Safety Valve: Force loading to complete after 3.5 seconds if DB hangs
    // This prevents the "infinite spinner" if Firestore rules block access
    const safetyTimer = setTimeout(() => {
      if (isLoadingData) {
        console.warn("Database response timed out. Forcing app entry.");
        setIsLoadingData(false);
      }
    }, 3500);

    const unsubOrders = subscribeToOrders(setOrders);
    const unsubBranches = subscribeToBranches(setBranches);
    const unsubUsers = subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
      setIsLoadingData(false); // Success path
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubOrders();
      unsubBranches();
      unsubUsers();
    };
  }, [authInitialized, user]); // Re-run when user state changes

  // 3. Sync Auth with User Data
  useEffect(() => {
    if (auth.currentUser) {
      // If we have users loaded, try to find current user
      if (users.length > 0) {
        const foundUser = users.find(u => u.email === auth.currentUser?.email);
        if (foundUser) {
          setUser(foundUser);
          if (currentPage === 'login') setCurrentPage('pre-agendamento');
        } else {
          // Fallback if user exists in Auth but not in 'users' collection yet
          const newUser: User = {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'Novo Usuário',
            email: auth.currentUser.email || '',
            role: UserRole.CONSULTANT,
            avatar: auth.currentUser.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser.email}`
          };
          setUser(newUser);
          if (currentPage === 'login') setCurrentPage('pre-agendamento');
        }
      } else if (!isLoadingData) {
         // Users loaded but empty (or blocked), so we create a session user from Auth data
          const newUser: User = {
            id: auth.currentUser.uid,
            name: auth.currentUser.displayName || 'Usuário',
            email: auth.currentUser.email || '',
            role: auth.currentUser.email === 'cristianospaula1972@gmail.com' ? UserRole.ADMIN : UserRole.CONSULTANT,
            avatar: auth.currentUser.photoURL || `https://ui-avatars.com/api/?name=${auth.currentUser.email}`
          };
          setUser(newUser);
          if (currentPage === 'login') setCurrentPage('pre-agendamento');
      }
    }
  }, [auth.currentUser, users, isLoadingData]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentPage('login');
  };

  // --- RENDER: LOADING ---
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500">Iniciando sistema...</p>
      </div>
    );
  }

  // --- RENDER: LOGIN ---
  if (!user) {
    return <Login />;
  }

  // --- RENDER: APP ---
  return (
    <Layout 
      currentUser={user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
    >
      {currentPage === 'pre-agendamento' && (
        <PreScheduling 
          currentUser={user}
          orders={orders}
          branches={branches}
          onAddOrder={firestoreAddOrder}
          onUpdateOrder={firestoreUpdateOrder}
          onDeleteOrder={firestoreDeleteOrder}
        />
      )}
      {currentPage === 'programacao' && (
        <Schedule 
          currentUser={user}
          orders={orders}
          branches={branches}
        />
      )}
      {currentPage === 'dashboard' && user.role === UserRole.ADMIN && (
        <Dashboard 
          orders={orders}
          branches={branches}
        />
      )}
      {currentPage === 'gestao' && user.role === UserRole.ADMIN && (
        <AdminManagement 
          branches={branches}
          setBranches={() => {}} 
          users={users}
          setUsers={() => {}} 
          onAddBranch={firestoreAddBranch}
          onDeleteBranch={firestoreDeleteBranch}
          onAddUser={firestoreAddUser}
          onDeleteUser={firestoreDeleteUser}
        />
      )}
    </Layout>
  );
}

export default App;