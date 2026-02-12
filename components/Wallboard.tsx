
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Activity, Clock, Users, PhoneIncoming, Zap, 
  TrendingUp, AlertTriangle, ShieldCheck, RefreshCw, X, Maximize2
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, Tooltip } from 'recharts';

const Wallboard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = [
    { label: 'LLAMADAS ACTIVAS', val: '42', col: 'blue', icon: Activity },
    { label: 'AGENTES READY', val: '18', col: 'emerald', icon: Users },
    { label: 'WAITING CALLS', val: '4', col: 'amber', icon: PhoneIncoming },
    { label: 'SLA (80/20)', val: '92%', col: 'indigo', icon: ShieldCheck },
    { label: 'DROP RATE', val: '0.4%', col: 'rose', icon: AlertTriangle },
    { label: 'ANS. SPEED', val: '12s', col: 'sky', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col p-10 animate-in fade-in zoom-in-95 duration-500">
      {/* Header Estilo Centro de Mando */}
      <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-8">
         <div className="flex items-center space-x-8">
            <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(59,130,246,0.5)]">
               <BarChart3 size={36} />
            </div>
            <div>
               <h1 className="text-5xl font-black text-white tracking-tighter uppercase">CUBERBOX NEURAL WALLBOARD</h1>
               <div className="flex items-center space-x-6 mt-2">
                  <span className="text-sm font-black text-blue-500 uppercase tracking-[0.4em]">PRO INFRASTRUCTURE MONITOR</span>
                  <div className="flex items-center space-x-2 bg-slate-900 px-4 py-1 rounded-full border border-slate-800">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">LIVE DATA SYNC</span>
                  </div>
               </div>
            </div>
         </div>
         <div className="flex items-center space-x-10">
            <div className="text-right">
               <p className="text-6xl font-mono font-black text-white tracking-tighter">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
               <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mt-1">{time.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={onClose} className="p-4 bg-slate-900 hover:bg-rose-600 text-slate-500 hover:text-white rounded-[24px] transition-all border border-slate-800 shadow-xl">
               <X size={32} />
            </button>
         </div>
      </div>

      {/* Grid de KPIs Gigantes */}
      <div className="grid grid-cols-3 gap-8 flex-1">
         {stats.map((s, i) => (
           <div key={i} className={`glass p-12 rounded-[64px] border-2 border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-${s.col}-500/50 transition-all`}>
              <div className="absolute top-0 right-0 p-10 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform">
                 <s.icon size={180} />
              </div>
              <div className="flex items-center space-x-6 relative z-10">
                 <div className={`p-4 rounded-3xl bg-${s.col}-600 text-white shadow-2xl shadow-${s.col}-600/40`}>
                    <s.icon size={32} />
                 </div>
                 <h4 className="text-2xl font-black text-slate-500 uppercase tracking-[0.2em]">{s.label}</h4>
              </div>
              <div className="relative z-10 mt-8">
                 <h2 className={`text-9xl font-black tracking-tighter text-white drop-shadow-2xl`}>{s.val}</h2>
                 <div className="flex items-center space-x-3 mt-4">
                    <TrendingUp className="text-emerald-400" size={24} />
                    <span className="text-xl font-black text-emerald-400 uppercase tracking-widest">+4.2% VS PREV HR</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Footer Animado */}
      <div className="mt-12 flex items-center justify-between p-8 glass rounded-[40px] border border-blue-500/20 bg-blue-600/5">
         <div className="flex items-center space-x-8">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-2">TELEPHONY THROUGHPUT</span>
               <div className="h-12 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={Array.from({length: 20}, (_, i) => ({v: Math.random()*100}))}>
                        <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={3} dot={false} />
                     </AreaChart>
                  </ResponsiveContainer>
               </div>
            </div>
            <div className="h-12 w-px bg-slate-800"></div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-xl italic">
               "EL RENDIMIENTO DE HOY ES LA BASE DEL ÉXITO DE MAÑANA. TODOS LOS SISTEMAS NEURONALES ESTÁN OPERANDO DENTRO DE LOS PARÁMETROS NOMINALES."
            </p>
         </div>
         <div className="flex items-center space-x-4">
            <RefreshCw size={24} className="text-blue-500 animate-spin" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">NEXUS CORE ACTIVE</span>
         </div>
      </div>
    </div>
  );
};

export default Wallboard;
