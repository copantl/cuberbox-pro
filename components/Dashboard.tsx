import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { 
  Users, Clock, Activity, Zap, TrendingUp, RefreshCw, Target, Timer, AlertCircle, BarChart3, TrendingDown
} from 'lucide-react';
import { useToast } from '../ToastContext';
import Logo from './Logo';

const timeEfficiencyData = [
  { name: 'Talk Time', val: 72, color: '#3b82f6' },
  { name: 'Wait Time', val: 15, color: '#10b981' },
  { name: 'Wrapup', val: 8, color: '#f59e0b' },
  { name: 'Dead Time', val: 5, color: '#f43f5e' },
];

const colorMap: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
};

const StatCard = ({ title, value, icon: Icon, trend, color, subtitle }: any) => {
  const styles = colorMap[color] || colorMap.blue;
  return (
    <div className="glass-card p-10 rounded-[56px] flex flex-col justify-between shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700">
        <Icon size={120} />
      </div>
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`p-4 rounded-2xl ${styles.bg} ${styles.text} group-hover:scale-110 transition-transform border ${styles.border}`}>
          <Icon size={28} />
        </div>
        <div className={`flex items-center text-[10px] font-black tracking-widest ${trend.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          <TrendingUp size={12} className="mr-1" /> {trend}
        </div>
      </div>
      <div className="relative z-10">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{title}</h3>
        <div className="flex items-baseline space-x-3 mt-1">
          <p className="text-5xl font-black text-white tracking-tighter">{value}</p>
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      toast('Engine Core sincronizado con clúster Quantica.', 'success', 'Sincronización de Datos');
    }, 1500);
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-1000">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="relative group">
            <Logo className="w-12 h-12 group-hover:rotate-12 transition-transform duration-700" />
            <div className="absolute -bottom-1 -right-1 bg-blue-600 w-4 h-4 rounded-full border-2 border-[#020617] animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center">
              Command Terminal
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest opacity-60">System v5.4.0 • Quantica Node Linked</p>
          </div>
        </div>
        <button 
          onClick={handleRefresh}
          className="p-5 bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-blue-400 rounded-3xl transition-all shadow-xl active:scale-95 group"
        >
          <RefreshCw size={24} className={isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-1000'} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Productividad" value="94.2%" icon={Zap} trend="+2.4%" color="blue" subtitle="Target 90%" />
        <StatCard title="Dead Time" value="4m 12s" icon={Timer} trend="-1.2%" color="rose" subtitle="Time Leak" />
        <StatCard title="Ocupación" value="88.1%" icon={Users} trend="+1.5%" color="purple" subtitle="High Load" />
        <StatCard title="Talk Time Global" value="72.5%" icon={Target} trend="+5.1%" color="emerald" subtitle="Efficient" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl relative overflow-hidden flex flex-col">
           <div className="flex items-center justify-between mb-12">
              <div>
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Time Allocation Matrix</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1">Desglose de uso de tiempo del clúster de agentes</p>
              </div>
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-blue-400 shadow-inner">
                 <BarChart3 size={24} />
              </div>
           </div>

           <div className="flex-1 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={timeEfficiencyData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} width={100} tick={{fontWeight: 800, textTransform: 'uppercase'}} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px'}} />
                    <Bar dataKey="val" radius={[0, 12, 12, 0]} barSize={40}>
                       {timeEfficiencyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-8">
           <div className="glass p-10 rounded-[64px] border border-rose-500/20 bg-rose-500/5 shadow-2xl flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                    <AlertCircle className="mr-4 text-rose-500" size={28} />
                    Top Leaks Detected
                 </h3>
                 <div className="px-4 py-1.5 bg-rose-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl shadow-rose-600/20">Critical</div>
              </div>
              <div className="space-y-6">
                 {[
                   { agent: 'Maria Gonzalez', reason: 'Exceso de Wrap-up Q4', leak: '14m 22s', trend: 'down' },
                   { agent: 'Juan Perez', reason: 'Pausa técnica no validada', leak: '08m 10s', trend: 'down' },
                   { agent: 'Sergio Téllez (GTR)', reason: 'Monitor Session Silence', leak: '04m 55s', trend: 'up' },
                 ].map((leak, i) => (
                   <div key={i} className="p-6 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-rose-500/30 transition-all">
                      <div className="flex items-center space-x-6">
                         <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-rose-500 transition-colors">
                            {leak.agent.split(' ').map(n=>n[0]).join('')}
                         </div>
                         <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{leak.agent}</p>
                            <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">{leak.reason}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-lg font-black text-rose-500 font-mono">+{leak.leak}</p>
                         {leak.trend === 'up' ? <TrendingUp size={12} className="text-rose-600 ml-auto" /> : <TrendingDown size={12} className="text-rose-400 ml-auto" />}
                      </div>
                   </div>
                 ))}
              </div>
              <button className="mt-auto w-full py-4 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:border-blue-500/50 shadow-xl">Auditoría Temporal Completa</button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;