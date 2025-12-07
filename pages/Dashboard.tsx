import React from 'react';
import { Order, Branch, OrderStatus } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, Truck, CheckCircle, Clock } from 'lucide-react';

interface DashboardProps {
  orders: Order[];
  branches: Branch[];
}

export const Dashboard: React.FC<DashboardProps> = ({ orders, branches }) => {
  
  // Calculate Metrics
  const totalVolume = orders.reduce((acc, curr) => acc + (curr.status === OrderStatus.APPROVED ? curr.volume : 0), 0);
  const approvedCount = orders.filter(o => o.status === OrderStatus.APPROVED).length;
  const pendingCount = orders.filter(o => o.status === OrderStatus.PENDING).length;

  const volumeByBranch = branches.map(branch => {
    const vol = orders
      .filter(o => o.branchId === branch.id && o.status === OrderStatus.APPROVED)
      .reduce((acc, curr) => acc + curr.volume, 0);
    return { name: branch.name, value: vol };
  });

  const statusData = [
    { name: 'Aprovado', value: approvedCount, color: '#16a34a' }, // green-600
    { name: 'Pendente', value: pendingCount, color: '#ca8a04' }, // yellow-600
    { name: 'Reprovado', value: orders.filter(o => o.status === OrderStatus.REJECTED).length, color: '#dc2626' } // red-600
  ].filter(d => d.value > 0);

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
      <div className={`p-4 rounded-full mr-4 ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Dashboard Administrativo</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Volume Total (Aprovado)" 
          value={`${totalVolume} m³`} 
          icon={TrendingUp} 
          color="bg-blue-600" 
        />
        <StatCard 
          title="Pedidos Aprovados" 
          value={approvedCount} 
          icon={CheckCircle} 
          color="bg-green-600" 
        />
        <StatCard 
          title="Pedidos Pendentes" 
          value={pendingCount} 
          icon={Clock} 
          color="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Volume by Branch */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Volume por Filial</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByBranch}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Volume (m³)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Status dos Pedidos</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center text-sm text-slate-600">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                {item.name} ({item.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};