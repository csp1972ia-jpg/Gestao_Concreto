import React, { useState } from 'react';
import { Order, Branch, User, OrderStatus } from '../types';
import { formatDate } from '../services/apiService';
import { Search, Download, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ScheduleProps {
  currentUser: User;
  orders: Order[];
  branches: Branch[];
}

export const Schedule: React.FC<ScheduleProps> = ({ currentUser, orders, branches }) => {
  const [filterDate, setFilterDate] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Only show approved orders
  const approvedOrders = orders.filter(o => o.status === OrderStatus.APPROVED);

  const filtered = approvedOrders.filter(order => {
    const matchesDate = filterDate ? order.concreteDate === filterDate : true;
    const matchesBranch = filterBranch ? order.branchId === filterBranch : true;
    const matchesSearch = searchTerm ? (
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    ) : true;
    
    // Consultant can only see own approved (as per prompt "Visibilidade")
    // Note: Prompt says "Consultor: Vê apenas seus pedidos com status APROVADO".
    // Admin sees all.
    const hasPermission = currentUser.role === 'ADMIN' ? true : order.consultantId === currentUser.id;

    return matchesDate && matchesBranch && matchesSearch && hasPermission;
  });

  const exportXLS = () => {
    const data = filtered.map(o => ({
      ID: o.id,
      Data: formatDate(o.concreteDate),
      Cliente: o.clientName,
      Volume: o.volume,
      Filial: branches.find(b => b.id === o.branchId)?.name,
      Status: o.status
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Programação");
    XLSX.writeFile(wb, "programacao.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Relatório de Programação", 14, 16);
    
    const tableData = filtered.map(o => [
      o.id,
      formatDate(o.concreteDate),
      o.clientName,
      `${o.volume} m³`,
      branches.find(b => b.id === o.branchId)?.name || '-',
      o.status
    ]);

    autoTable(doc, {
      head: [['ID', 'Data', 'Cliente', 'Vol', 'Filial', 'Status']],
      body: tableData,
      startY: 20,
    });

    doc.save("programacao.pdf");
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Programação</h2>
          <p className="text-slate-500">Visualização de serviços aprovados e agendados</p>
        </div>
        <div className="flex gap-2">
           <button onClick={exportXLS} className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
             <Download size={16} className="mr-2" /> XLS
           </button>
           <button onClick={exportPDF} className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
             <Download size={16} className="mr-2" /> PDF
           </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex items-center bg-slate-50 rounded-lg px-3 border border-slate-200">
           <Search size={18} className="text-slate-400 mr-2"/>
           <input 
             type="text" 
             placeholder="Buscar cliente..." 
             className="bg-transparent border-none outline-none py-2 w-full text-sm"
             value={searchTerm}
             onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
        <div className="flex items-center bg-slate-50 rounded-lg px-3 border border-slate-200">
           <Calendar size={18} className="text-slate-400 mr-2"/>
           <input 
             type="date" 
             className="bg-transparent border-none outline-none py-2 w-full text-sm text-slate-600"
             value={filterDate}
             onChange={e => setFilterDate(e.target.value)}
           />
        </div>
        <div>
           <select 
             className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-sm outline-none"
             value={filterBranch}
             onChange={e => setFilterBranch(e.target.value)}
           >
             <option value="">Todas as Filiais</option>
             {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
           </select>
        </div>
      </div>

      {/* Table (Desktop) & Cards (Mobile) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Data</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Filial</th>
                <th className="p-4">Volume</th>
                <th className="p-4">Bomba</th>
                <th className="p-4">Consultor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs font-bold text-slate-500">{order.id}</td>
                  <td className="p-4">{formatDate(order.concreteDate)}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {order.clientName}
                    <div className="text-xs text-slate-400 font-normal">{order.contract}</div>
                  </td>
                  <td className="p-4">{branches.find(b => b.id === order.branchId)?.name}</td>
                  <td className="p-4">{order.volume} m³</td>
                  <td className="p-4">{order.pump || '-'}</td>
                  <td className="p-4">{order.consultantName}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Nenhum agendamento encontrado para os filtros selecionados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.map(order => (
             <div key={order.id} className="p-4">
               <div className="flex justify-between items-start mb-2">
                 <div>
                   <span className="font-mono text-xs font-bold text-slate-500 block mb-1">{order.id}</span>
                   <h4 className="font-bold text-slate-800">{order.clientName}</h4>
                 </div>
                 <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-bold">
                   {formatDate(order.concreteDate)}
                 </span>
               </div>
               <div className="text-sm text-slate-600 grid grid-cols-2 gap-2 mt-2">
                  <p>Filial: {branches.find(b => b.id === order.branchId)?.name}</p>
                  <p>Volume: {order.volume}m³</p>
                  <p>Bomba: {order.pump || '-'}</p>
                  <p>Consultor: {order.consultantName.split(' ')[0]}</p>
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};