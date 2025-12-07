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

// Email mestre normalizado (tudo minúsculo)
const SUPER_ADMIN_EMAIL = 'cristianospaula1972@gmail.com';

function App() {
  // Global State
  const [user, setUser] = useState<User | null>(null);
  
  // CORREÇÃO CRÍTICA: O estado inicial DEVE ser uma página válida interna.
  // A tela de Login é controlada pelo 'if (!user)', não por esta variável.
  const [currentPage, setCurrentPage] = useState<string>('pre-agendamento');
  
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // 1. Auth Listener - Caminho Crítico
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Normaliza o email para garantir que a comparação funcione
        const normalizedEmail = firebaseUser.email ? firebaseUser.email.toLowerCase().trim() : '';
        const isSuperAdmin = normalizedEmail === SUPER_ADMIN_EMAIL;
        
        const currentUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: normalizedEmail,
          // FORÇA O CARGO DE ADMIN se o email bater
          role: isSuperAdmin ? UserRole.ADMIN : UserRole.CONSULTANT,
          avatar: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}`
        };

        setUser(currentUser);
      } else {
        setUser(null);
        // Resetamos para a página inicial padrão ao deslogar
        setCurrentPage('pre-agendamento');
      }
      setAuthInitialized(true);
    });
    return () => unsubscribe();
  }, []); // Executa apenas uma vez no mount

  // 2. Listeners de Dados (Tempo Real) - Apenas quando logado
  useEffect(() => {
    if (!user) return;

    // Subscreve aos dados sem bloquear a UI
    const unsubOrders = subscribeToOrders(setOrders);
    const unsubBranches = subscribeToBranches(setBranches);
    const unsubUsers = subscribeToUsers(setUsers);

    return () => {
      unsubOrders();
      unsubBranches();
      unsubUsers();
    };
  }, [user?.id]); 

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // --- RENDER: CARREGANDO (Apenas checagem inicial do Firebase) ---
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-slate-500 font-medium">Iniciando sistema...</p>
      </div>
    );
  }

  // --- RENDER: LOGIN (Se não houver usuário) ---
  if (!user) {
    return <Login />;
  }

  // --- RENDER: APP PRINCIPAL (Se houver usuário) ---
  // A variável currentPage define qual componente filho renderizar
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