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

const SUPER_ADMIN_EMAIL = 'cristianospaula1972@gmail.com';

function App() {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('login');
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // NOTE: We removed 'isLoadingData' blocking the entire UI to prevent the "infinite spin" issue.
  // The app will load the shell first, then data populates as it arrives.

  // 1. Auth Listener - The Critical Path
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // --- IMMEDIATE ACCESS LOGIC ---
        // We construct the user object immediately from Auth data.
        // We do NOT wait for Firestore to tell us who the user is.
        // This solves the "F5 required" and "Spinning" issues.
        
        const isSuperAdmin = firebaseUser.email === SUPER_ADMIN_EMAIL;
        
        const currentUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
          // FORCE ADMIN ROLE if email matches
          role: isSuperAdmin ? UserRole.ADMIN : UserRole.CONSULTANT,
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}`
        };

        setUser(currentUser);
        
        // Only redirect to home if we were on login page
        if (currentPage === 'login') {
          setCurrentPage('pre-agendamento');
        }
      } else {
        setUser(null);
        setCurrentPage('login');
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []); // Run once on mount

  // 2. Data Listeners (Real-time) - Run only when user is logged in
  useEffect(() => {
    if (!user) return;

    // We subscribe to data, but we don't block the UI.
    // The components will just show empty lists until data arrives.
    
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubBranches = subscribeToBranches(setBranches);
    
    // We fetch users to keep the "Admin Management" list up to date, 
    // but we don't use it to determine the CURRENT user's role anymore (to be safe).
    const unsubUsers = subscribeToUsers((fetchedUsers) => {
      setUsers(fetchedUsers);
      
      // Optional: If we want to sync the avatar or name from DB later, we could do it here,
      // but strictly adhering to Auth data for the session is faster and safer for now.
    });

    return () => {
      unsubOrders();
      unsubBranches();
      unsubUsers();
    };
  }, [user?.id]); // Re-subscribe only if user ID changes

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentPage('login');
  };

  // --- RENDER: LOADING (Only for initial Auth check) ---
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-medium">Iniciando sistema...</p>
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