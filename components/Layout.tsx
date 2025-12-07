import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  CalendarCheck, 
  Users, 
  LogOut, 
  Menu, 
  X,
  Building2
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentUser, 
  onLogout,
  currentPage,
  onNavigate
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NavItem = ({ page, icon: Icon, label }: { page: string; icon: any; label: string }) => {
    const isActive = currentPage === page;
    return (
      <button
        onClick={() => {
          onNavigate(page);
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center w-full px-4 py-3 mb-2 rounded-lg transition-colors ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
        }`}
      >
        <Icon size={20} className="mr-3" />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-20 relative">
        <h1 className="text-xl font-bold text-blue-700">MixConcreto</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-100 hidden md:block">
           <h1 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
             <Building2 className="text-blue-600"/> MixConcreto
           </h1>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <img 
              src={currentUser.avatar || "https://picsum.photos/100/100"} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            />
            <div className="overflow-hidden">
              <p className="font-semibold text-sm text-slate-900 truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 uppercase tracking-wide">{currentUser.role === UserRole.ADMIN ? 'Administrador' : 'Consultor'}</p>
            </div>
          </div>

          <nav>
            <NavItem page="pre-agendamento" icon={CalendarPlus} label="Pré-Agendamento" />
            
            {(currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.CONSULTANT) && (
               <NavItem page="programacao" icon={CalendarCheck} label="Programação" />
            )}

            {currentUser.role === UserRole.ADMIN && (
              <>
                <NavItem page="dashboard" icon={LayoutDashboard} label="Dashboard" />
                <NavItem page="gestao" icon={Users} label="Gestão Admin" />
              </>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-full p-6 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};