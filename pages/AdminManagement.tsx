import React, { useState } from 'react';
import { Branch, User, UserRole } from '../types';
import { Trash2, Plus, Building, User as UserIcon } from 'lucide-react';

interface AdminManagementProps {
  branches: Branch[];
  setBranches: any; // Legacy prop, unused in firebase mode but kept for TS compatibility if needed
  users: User[];
  setUsers: any; // Legacy prop
  onAddBranch: (b: Branch) => void;
  onDeleteBranch: (id: string) => void;
  onAddUser: (u: User) => void;
  onDeleteUser: (id: string) => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({ 
  branches, 
  users,
  onAddBranch,
  onDeleteBranch,
  onAddUser,
  onDeleteUser
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'branches'>('users');
  
  // Simple state for new entries
  const [newBranch, setNewBranch] = useState({ name: '', trucks: 0, goalPerTruck: 0 });
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.CONSULTANT });

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBranch({ id: Date.now().toString(), ...newBranch });
    setNewBranch({ name: '', trucks: 0, goalPerTruck: 0 });
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser({ id: `u${Date.now()}`, ...newUser, avatar: `https://ui-avatars.com/api/?name=${newUser.name}&background=random` });
    setNewUser({ name: '', email: '', role: UserRole.CONSULTANT });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Gestão Administrativa</h2>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-1 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === 'users' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
        >
          <UserIcon size={18} /> Consultores
        </button>
        <button 
          onClick={() => setActiveTab('branches')}
          className={`pb-3 px-1 flex items-center gap-2 font-medium transition-colors border-b-2 ${activeTab === 'branches' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'}`}
        >
          <Building size={18} /> Filiais
        </button>
      </div>

      {activeTab === 'users' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
             <h3 className="font-bold text-slate-700">Adicionar Usuário</h3>
             <form onSubmit={handleAddUser} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <input required placeholder="Nome" className="w-full p-2 border rounded" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input required placeholder="Email" type="email" className="w-full p-2 border rounded" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                <select className="w-full p-2 border rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value={UserRole.CONSULTANT}>Consultor</option>
                  <option value={UserRole.ADMIN}>Administrador</option>
                </select>
                <div className="bg-amber-50 text-amber-800 text-xs p-2 rounded">
                  Nota: Isso apenas cria o registro no sistema. O usuário precisará criar a conta no Firebase Auth com este email.
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Adicionar</button>
             </form>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700">Lista de Usuários</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {users.map(u => (
                 <div key={u.id} className="p-4 border-b last:border-0 border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                       <img src={u.avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                       <div>
                         <p className="font-medium text-slate-800">{u.name}</p>
                         <p className="text-xs text-slate-500">{u.email} • {u.role}</p>
                       </div>
                    </div>
                    {u.role !== UserRole.ADMIN && (
                      <button onClick={() => onDeleteUser(u.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                    )}
                 </div>
               ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-4">
             <h3 className="font-bold text-slate-700">Adicionar Filial</h3>
             <form onSubmit={handleAddBranch} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <input required placeholder="Nome da Filial" className="w-full p-2 border rounded" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
                <div className="flex gap-4">
                   <div className="flex-1">
                      <label className="text-xs text-slate-500">Caminhões</label>
                      <input required type="number" className="w-full p-2 border rounded" value={newBranch.trucks} onChange={e => setNewBranch({...newBranch, trucks: Number(e.target.value)})} />
                   </div>
                   <div className="flex-1">
                      <label className="text-xs text-slate-500">Meta / Caminhão</label>
                      <input required type="number" className="w-full p-2 border rounded" value={newBranch.goalPerTruck} onChange={e => setNewBranch({...newBranch, goalPerTruck: Number(e.target.value)})} />
                   </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Adicionar</button>
             </form>
          </div>
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700">Lista de Filiais</h3>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
               {branches.map(b => (
                 <div key={b.id} className="p-4 border-b last:border-0 border-slate-100 flex justify-between items-center">
                    <div>
                       <p className="font-medium text-slate-800">{b.name}</p>
                       <p className="text-xs text-slate-500">{b.trucks} Caminhões • Meta: {b.goalPerTruck}</p>
                    </div>
                    <button onClick={() => onDeleteBranch(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};