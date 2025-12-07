import React, { useState } from 'react';
import { Order, Branch, User, OrderStatus, UserRole } from '../types';
import { generateId, formatDate } from '../services/apiService';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Search, Filter, CheckCircle, XCircle, Clock, Edit2 } from 'lucide-react';

interface PreSchedulingProps {
  currentUser: User;
  orders: Order[];
  branches: Branch[];
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
}

export const PreScheduling: React.FC<PreSchedulingProps> = ({
  currentUser,
  orders,
  branches,
  onAddOrder,
  onUpdateOrder
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New Order Form State
  const [newOrder, setNewOrder] = useState<Partial<Order>>({
    volume: 0,
    dischargeType: 'BOMBEADO',
    fck: '',
    contract: '',
    clientName: '',
    contactName: '',
    phone: '',
    observation: ''
  });

  // Filter orders based on role and search
  const filteredOrders = orders.filter(order => {
    // Role Check
    if (currentUser.role === UserRole.CONSULTANT && order.consultantId !== currentUser.id) {
      return false;
    }
    
    // Search Check
    const searchLower = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(searchLower) ||
      order.clientName.toLowerCase().includes(searchLower) ||
      order.consultantName.toLowerCase().includes(searchLower)
    );
  }).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const now = new Date();
    const orderToAdd: Order = {
      id: generateId(),
      requestDate: now.toISOString().split('T')[0],
      requestTime: now.toTimeString().slice(0, 5),
      branchId: newOrder.branchId || branches[0]?.id,
      consultantId: currentUser.id,
      consultantName: currentUser.name,
      status: OrderStatus.PENDING,
      history: [{
        date: now.toISOString(),
        action: 'Criado',
        user: currentUser.name
      }],
      clientName: newOrder.clientName || '',
      contactName: newOrder.contactName || '',
      phone: newOrder.phone || '',
      volume: Number(newOrder.volume),
      dischargeType: newOrder.dischargeType as any,
      pump: newOrder.pump || '',
      partnerPump: newOrder.partnerPump || '',
      concreteDate: newOrder.concreteDate || '',
      observation: newOrder.observation || '',
      fck: newOrder.fck || '',
      contract: newOrder.contract || ''
    };

    onAddOrder(orderToAdd);
    setIsFormOpen(false);
    setNewOrder({ volume: 0, dischargeType: 'BOMBEADO', fck: '', contract: '', clientName: '', contactName: '', phone: '', observation: '' });
  };

  const handleStatusChange = (order: Order, newStatus: OrderStatus, note?: string) => {
    const updatedOrder = {
      ...order,
      status: newStatus,
      adminNote: note,
      history: [
        ...order.history,
        {
          date: new Date().toISOString(),
          action: `Status alterado para ${newStatus}`,
          user: currentUser.name
        }
      ]
    };
    onUpdateOrder(updatedOrder);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pré-Agendamento</h2>
          <p className="text-slate-500">Gerencie as solicitações de serviço</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Novo Pedido
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Pendentes</p>
          <p className="text-2xl font-bold text-blue-600">{filteredOrders.filter(o => o.status === OrderStatus.PENDING).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Aprovados</p>
          <p className="text-2xl font-bold text-green-600">{filteredOrders.filter(o => o.status === OrderStatus.APPROVED).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Reprovados</p>
          <p className="text-2xl font-bold text-red-600">{filteredOrders.filter(o => o.status === OrderStatus.REJECTED).length}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por ID, Cliente ou Consultor..." 
          className="flex-1 outline-none text-slate-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Filter className="text-slate-400 cursor-pointer hover:text-blue-500" size={20} />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
           <div className="text-center py-10 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
             Nenhum pedido encontrado.
           </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-sm font-bold text-slate-500">{order.id}</span>
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-slate-400 flex items-center">
                      <Clock size={12} className="mr-1" /> {formatDate(order.requestDate)} às {order.requestTime}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">{order.clientName}</h3>
                  <p className="text-sm text-slate-600">Filial: {branches.find(b => b.id === order.branchId)?.name || 'N/A'} • Vol: {order.volume}m³</p>
                </div>
                
                {currentUser.role === UserRole.ADMIN && order.status === OrderStatus.PENDING && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStatusChange(order, OrderStatus.REJECTED)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50 flex items-center"
                    >
                      <XCircle size={16} className="mr-1" /> Reprovar
                    </button>
                    <button 
                      onClick={() => handleStatusChange(order, OrderStatus.APPROVED)}
                      className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center shadow-sm"
                    >
                      <CheckCircle size={16} className="mr-1" /> Aprovar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Contato</p>
                  <p className="font-medium">{order.contactName}</p>
                  <p>{order.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Serviço</p>
                  <p>{order.dischargeType}</p>
                  <p>FCK: {order.fck}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Programação</p>
                  <p>Data: {formatDate(order.concreteDate)}</p>
                  <p>Bomba: {order.pump || '-'}</p>
                </div>
                 <div>
                  <p className="text-xs text-slate-400 uppercase">Consultor</p>
                  <p>{order.consultantName}</p>
                  <p className="text-xs truncate" title={order.contract}>{order.contract}</p>
                </div>
              </div>
              
              {order.observation && (
                <div className="mt-3 text-sm text-slate-600 italic">
                  <span className="font-semibold text-slate-700 not-italic">Obs:</span> {order.observation}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal / Slide-over Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-slate-800">Nova Solicitação</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Client Info */}
              <section>
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Cliente</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Cliente</label>
                    <input required type="text" className="w-full p-2 border rounded-lg" 
                      value={newOrder.clientName} onChange={e => setNewOrder({...newOrder, clientName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contato</label>
                    <input required type="text" className="w-full p-2 border rounded-lg" 
                      value={newOrder.contactName} onChange={e => setNewOrder({...newOrder, contactName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                    <input required type="tel" className="w-full p-2 border rounded-lg" 
                      value={newOrder.phone} onChange={e => setNewOrder({...newOrder, phone: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Service Info */}
              <section>
                <h4 className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-3">Serviço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Filial</label>
                    <select className="w-full p-2 border rounded-lg"
                      value={newOrder.branchId} onChange={e => setNewOrder({...newOrder, branchId: e.target.value})}>
                      <option value="">Selecione...</option>
                      {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Data Concretagem</label>
                    <input required type="date" className="w-full p-2 border rounded-lg" 
                      value={newOrder.concreteDate} onChange={e => setNewOrder({...newOrder, concreteDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Volume (m³)</label>
                    <input required type="number" step="0.5" className="w-full p-2 border rounded-lg" 
                      value={newOrder.volume} onChange={e => setNewOrder({...newOrder, volume: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Descarga</label>
                    <select className="w-full p-2 border rounded-lg"
                      value={newOrder.dischargeType} onChange={e => setNewOrder({...newOrder, dischargeType: e.target.value as any})}>
                      <option value="BOMBEADO">BOMBEADO</option>
                      <option value="CONVENCIONAL">CONVENCIONAL</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">FCK</label>
                    <input type="text" className="w-full p-2 border rounded-lg" placeholder="Ex: 30 MPA"
                      value={newOrder.fck} onChange={e => setNewOrder({...newOrder, fck: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Contrato</label>
                    <input type="text" className="w-full p-2 border rounded-lg"
                      value={newOrder.contract} onChange={e => setNewOrder({...newOrder, contract: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bomba</label>
                    <input type="text" className="w-full p-2 border rounded-lg" placeholder="Opcional"
                      value={newOrder.pump} onChange={e => setNewOrder({...newOrder, pump: e.target.value})} />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bomba Parceira</label>
                    <input type="text" className="w-full p-2 border rounded-lg" placeholder="Opcional"
                      value={newOrder.partnerPump} onChange={e => setNewOrder({...newOrder, partnerPump: e.target.value})} />
                  </div>
                </div>
              </section>

              {/* Obs */}
              <section>
                 <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
                 <textarea className="w-full p-2 border rounded-lg" rows={3}
                   value={newOrder.observation} onChange={e => setNewOrder({...newOrder, observation: e.target.value})}></textarea>
              </section>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">Enviar Solicitação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};