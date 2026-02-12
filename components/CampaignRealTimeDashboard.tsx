/**
 * @file CampaignRealTimeDashboard.tsx
 * @description Pizarra táctica de alta visibilidad para monitoreo de campañas en tiempo real.
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Activity, Users, Target, Zap, Clock, ShieldAlert,
  TrendingUp, TrendingDown, PhoneIncoming, Radio, Cpu,
  BarChart3, LayoutGrid, Timer, AlertTriangle, RefreshCw
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, Tooltip } from 'recharts';
import { Campaign, CampaignRealTime } from '../types';

interface Props {
  campaign: Campaign;
  onClose: () => void;
}

const CampaignRealTimeDashboard: React.FC<Props> = ({ campaign, onClose }) => {
  const [stats, setStats] = useState<CampaignRealTime>(campaign.liveStats || {
    callsActive: 0, callsRinging: 0, agentsOnline: 0, agentsOnCall: 0,
    agentsPaused: 0, agentsReady: 0, salesToday: 0, dropRate: 0,
    pacingLevel: 0, hopperAvailable: 0
  });

  const [time, setTime] = useState(new Date());

  // Simulación de telemetría dinámica
  useEffect(() => {
    const timerInterval = setInterval(() => setTime(new Date()), 1000);
    const telemetryInterval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        callsActive: Math.max(0, prev.callsActive + (Math.random() > 0.5 ? 1 : -1)),
        callsRinging: Math.max(0, prev.callsRinging + (Math.random() > 0.7 ? 1 : -1)),
        salesToday: prev.salesToday + (Math.random() > 0.95 ? 1 : 0),
        dropRate: parseFloat((prev.dropRate + (Math.random() - 0.5) * 0.2).toFixed(2))
      }));
    }, 3000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(telemetryInterval);
    };
  }, []);

  const metrics = [
    { label: 'LLAMADAS ACTIVAS', val: stats.callsActive, col: 'blue', icon: Activity },
    { label: 'RINGING / QUEUED', val: stats.callsRinging, col: 'amber', icon: PhoneIncoming },
    { label: 'AGENTES EN LINEA', val: stats.agentsOnline, col: 'emerald', icon: Users },
    { label: 'CONVERSIÓN (Vtas)', val: stats.salesToday, col: 'indigo', icon: Target },
    { label: 'DROP RATE %', val: `${stats.dropRate}%`, col: stats.dropRate > 3 ? 'rose' : 'emerald', icon: ShieldAlert },
    { label: 'DIAL RATIO', val: `${stats.pacingLevel}x`, col: 'sky', icon: Zap },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-[#020617] flex flex-col p-10 animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[length:60px_60px] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-12 border-b border-slate-800 pb-8 relative z-10">
         <div className="flex items-center space-x-10">
            <div className="w-20 h-20 rounded-[32px] bg-rose-600 flex items-center justify-center text-white shadow-[0_0_50px_rgba(225,29,72,0.4)]">
               <Radio size={48} className="animate-pulse" />
            </div>
            <div>
               <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">{campaign.name}</h1>
               <div className="flex items-center space-x-8 mt-4">
                  <span className="text-xl font-black text-rose-500 uppercase tracking-[0.4em]">OPERATIONS COMMAND CENTER</span>
                  <div className="flex items-center space-x-3 bg-slate-900 px-5 py-2 rounded-full border border-slate-800">
                     <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                     <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">REAL-TIME TELEMETRY</span>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center space-x-12">
            <div className="text-right">
               <p className="text-7xl font-mono font-black text-white tracking-tighter tabular-nums leading-none">
                  {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
               </p>
               <p className="text-sm font-black text-slate-500 uppercase tracking-[0.3em] mt-2 italic">
                  {time.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </p>
            </div>
            <button onClick={onClose} className="p-6 bg-slate-900 hover:bg-rose-600 text-slate-500 hover:text-white rounded-[32px] transition-all border border-slate-800 shadow-2xl active:scale-95">
               <X size={40} />
            </button>
         </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 flex-1 relative z-10">
         {metrics.map((m, i) => (
           <div key={i} className={`glass p-12 rounded-[64px] border-2 border-slate-800 flex flex-col justify-between relative overflow-hidden group hover:border-${m.col}-500/50 transition-all shadow-2xl`}>
              <div className="absolute top-0 right-0 p-12 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <m.icon size={220} />
              </div>
              <div className="flex items-center space-x-6 relative z-10">
                 <div className={`p-5 rounded-[28px] bg-${m.col}-600 text-white shadow-2xl shadow-${m.col}-600/40`}>
                    <m.icon size={36} />
                 </div>
                 <h4 className="text-2xl font-black text-slate-500 uppercase tracking-[0.2em]">{m.label}</h4>
              </div>
              <div className="relative z-10 mt-10">
                 <h2 className={`text-[9rem] font-black tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] leading-none tabular-nums`}>
                    {m.val}
                 </h2>
                 <div className="flex items-center space-x-4 mt-6">
                    <TrendingUp className="text-emerald-400" size={32} />
                    <span className="text-2xl font-black text-emerald-400 uppercase tracking-widest">+8.2% VS PEAK</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      {/* Bottom Data Layer */}
      <div className="mt-12 grid grid-cols-12 gap-10 relative z-10">
         <div className="col-span-8 p-10 glass rounded-[56px] border border-blue-500/20 bg-blue-600/5 flex items-center justify-between shadow-inner group">
            <div className="flex items-center space-x-12">
               <div className="flex flex-col">
                  <span className="text-sm font-black text-blue-400 uppercase tracking-[0.4em] mb-4">SIP LOAD ANALYTICS</span>
                  <div className="h-20 w-80">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={Array.from({length: 30}, (_, i) => ({v: 40 + Math.random()*40}))}>
                           <Area type="monotone" dataKey="v" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={5} dot={false} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
               <div className="h-24 w-px bg-slate-800"></div>
               <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                     <Cpu size={24} className="text-emerald-500" />
                     <span className="text-xl font-black text-white uppercase tracking-tight">ENGINE: <span className="text-emerald-400">OPTIMAL</span></span>
                  </div>
                  <div className="flex items-center space-x-4">
                     <Timer size={24} className="text-blue-500" />
                     <span className="text-xl font-black text-white uppercase tracking-tight">LATENCY: <span className="text-blue-400">18ms</span></span>
                  </div>
               </div>
            </div>
            <div className="text-right">
               <p className="text-5xl font-black text-white tracking-tighter tabular-nums">{stats.hopperAvailable.toLocaleString()}</p>
               <p className="text-xs font-black text-slate-500 uppercase tracking-[0.4em] mt-1">LEADS EN HOPPER</p>
            </div>
         </div>

         <div className="col-span-4 p-10 glass rounded-[56px] border border-slate-700/50 flex flex-col justify-center bg-slate-900/40">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center space-x-4">
                  <Users size={24} className="text-blue-400" />
                  <span className="text-sm font-black text-white uppercase tracking-widest">AGENT MATRIX</span>
               </div>
               <RefreshCw size={20} className="text-slate-600 animate-spin" />
            </div>
            <div className="grid grid-cols-4 gap-4">
               {[
                 { label: 'CALL', val: stats.agentsOnCall, col: 'blue' },
                 { label: 'WAIT', val: stats.agentsReady, col: 'emerald' },
                 { label: 'PAUSE', val: stats.agentsPaused, col: 'rose' },
                 { label: 'WRAP', val: 2, col: 'amber' },
               ].map((a, i) => (
                 <div key={i} className="bg-slate-950 p-4 rounded-3xl border border-slate-800 text-center">
                    <p className={`text-xl font-black text-${a.col}-400 font-mono`}>{a.val}</p>
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">{a.label}</p>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default CampaignRealTimeDashboard;