
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Users, PhoneIncoming, Zap, AlertTriangle, Timer, 
  Search, Filter, Headphones, Power, RefreshCw, ChevronRight,
  ShieldAlert, Radio, Clock, ShieldCheck, Play, Pause, X,
  MonitorCheck, MoreHorizontal, ArrowUpRight, BarChart3
} from 'lucide-react';
import { useToast } from '../ToastContext';
import { GTRAgentMetric, GTRQueueMetric } from '../types';

const MOCK_QUEUES: GTRQueueMetric[] = [
  { queueName: 'Ventas Florida', callsWaiting: 4, longestWait: 45, agentsLogged: 12, agentsReady: 2, slaPercent: 92 },
  { queueName: 'Soporte Técnico', callsWaiting: 0, longestWait: 0, agentsLogged: 8, agentsReady: 5, slaPercent: 98 },
  { queueName: 'Cobranzas Late', callsWaiting: 12, longestWait: 180, agentsLogged: 5, agentsReady: 0, slaPercent: 64 },
];

const INITIAL_AGENTS: GTRAgentMetric[] = [
  { agentId: '1', agentName: 'Maria Gonzalez', status: 'INCALL', statusDuration: 120, campaignName: 'Real Estate Florida', callsToday: 42, salesToday: 5, occupancyRate: 88, currentCallDuration: 120, warningLevel: 'NONE' },
  { agentId: '2', agentName: 'Juan Perez', status: 'WRAPUP', statusDuration: 45, campaignName: 'Real Estate Florida', callsToday: 38, salesToday: 3, occupancyRate: 72, warningLevel: 'CRITICAL' },
  { agentId: '3', agentName: 'Carla Mendez', status: 'PAUSED', statusDuration: 900, campaignName: 'Soporte Técnico', callsToday: 25, salesToday: 0, occupancyRate: 91, warningLevel: 'CRITICAL' },
  { agentId: '4', agentName: 'Pedro Sanchez', status: 'READY', statusDuration: 15, campaignName: 'Real Estate Florida', callsToday: 55, salesToday: 8, occupancyRate: 94, warningLevel: 'NONE' },
  { agentId: '5', agentName: 'Sofia Ruiz', status: 'INCALL', statusDuration: 350, campaignName: 'Cobranzas Late', callsToday: 30, salesToday: 2, occupancyRate: 85, currentCallDuration: 350, warningLevel: 'LOW' },
];

const GTRDashboard: React.FC = () => {
  const { toast } = useToast();
  const [agents, setAgents] = useState<GTRAgentMetric[]>(INITIAL_AGENTS);
  const [queues, setQueues] = useState<GTRQueueMetric[]>(MOCK_QUEUES);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  useEffect(() => {
    const timer = setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        statusDuration: a.statusDuration + 1,
        currentCallDuration: a.status === 'INCALL' ? (a.currentCallDuration || 0) + 1 : undefined,
        warningLevel: (a.status === 'WRAPUP' && a.statusDuration > 30) || (a.status === 'PAUSED' && a.statusDuration > 600) ? 'CRITICAL' : a.statusDuration > 300 ? 'LOW' : 'NONE'
      })));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  const filteredAgents = useMemo(() => 
    agents.filter(a => 
      (filterStatus === 'ALL' || a.status === filterStatus) &&
      (a.agentName.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  , [agents, searchTerm, filterStatus]);

  const handleForceReady = (id: string) => {
    toast('Señal remota enviada: Forzando estado READY.', 'info', 'GTR Action');
    setAgents(agents.map(a => a.agentId === id ? { ...a, status: 'READY', statusDuration: 0, warningLevel: 'NONE' } : a));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <MonitorCheck className="mr-4 text-blue-500" size={36} />
            Consola de Gestión GTR
          </h2>
          <p className="text-slate-400 text-sm font-medium">Control táctico en tiempo real del desempeño de la planta.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="bg-slate-900 border border-slate-800 px-6 py-2.5 rounded-full flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Postgres SQL Bridge: OK</span>
           </div>
        </div>
      </div>

      {/* Queue Performance Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {queues.map((q, i) => (
          <div key={i} className={`glass p-8 rounded-[48px] border-2 shadow-2xl relative overflow-hidden transition-all ${q.callsWaiting > 5 ? 'border-rose-500/30' : 'border-slate-800'}`}>
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-black text-white uppercase tracking-tight text-lg">{q.queueName}</h3>
                <div className={`p-2 rounded-xl ${q.callsWaiting > 0 ? 'bg-rose-500 text-white animate-bounce' : 'bg-slate-800 text-slate-500'}`}>
                   <PhoneIncoming size={20} />
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">En Espera</p>
                   <p className={`text-4xl font-black ${q.callsWaiting > 5 ? 'text-rose-500' : 'text-white'}`}>{q.callsWaiting}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">SLA (Real)</p>
                   <p className={`text-4xl font-black ${q.slaPercent < 80 ? 'text-amber-400' : 'text-emerald-400'}`}>{q.slaPercent}%</p>
                </div>
             </div>
             <div className="mt-6 pt-6 border-t border-slate-800/50 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-500 uppercase">Longest Wait: <span className="text-white font-mono">{q.longestWait}s</span></span>
                <span className="text-[9px] font-black text-slate-500 uppercase">Ready: <span className="text-emerald-500 font-mono">{q.agentsReady}/{q.agentsLogged}</span></span>
             </div>
          </div>
        ))}
      </div>

      {/* Main Agent Matrix */}
      <div className="glass rounded-[56px] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
         <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-5">
               <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 shadow-inner">
                  <Users size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Agent Matrix Control</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Supervisión disciplinaria de estados</p>
               </div>
            </div>
            
            <div className="flex items-center gap-4 w-full lg:w-auto">
               <div className="relative flex-1 lg:w-80">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="text" 
                    placeholder="Buscar agente..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] pl-14 pr-6 py-4 text-xs text-white font-bold outline-none focus:border-blue-500 shadow-inner"
                  />
               </div>
               <select 
                 value={filterStatus}
                 onChange={e => setFilterStatus(e.target.value)}
                 className="bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-[10px] font-black text-slate-300 uppercase outline-none focus:border-blue-500"
               >
                  <option value="ALL">TODOS LOS ESTADOS</option>
                  <option value="READY">READY</option>
                  <option value="INCALL">IN CALL</option>
                  <option value="PAUSED">PAUSED</option>
                  <option value="WRAPUP">WRAP-UP</option>
               </select>
            </div>
         </div>

         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
               <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  <tr>
                     <th className="px-10 py-6">Agente / Campaña</th>
                     <th className="px-10 py-6 text-center">Estado</th>
                     <th className="px-10 py-6 text-center">Duración</th>
                     <th className="px-10 py-6 text-center">KPI Hoy</th>
                     <th className="px-10 py-6 text-right">Controles GTR</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                  {filteredAgents.map(agent => (
                    <tr key={agent.agentId} className={`hover:bg-blue-600/5 transition-all group ${agent.warningLevel === 'CRITICAL' ? 'bg-rose-600/5' : ''}`}>
                       <td className="px-10 py-8">
                          <div className="flex items-center space-x-6">
                             <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-black text-blue-400 border border-slate-700 shadow-lg">
                                {agent.agentName.split(' ').map(n=>n[0]).join('')}
                             </div>
                             <div>
                                <span className="font-black text-sm text-slate-200 uppercase tracking-tight">{agent.agentName}</span>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">{agent.campaignName}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                            agent.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            agent.status === 'INCALL' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' :
                            agent.status === 'PAUSED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {agent.status}
                          </span>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <div className={`text-lg font-mono font-black tabular-nums ${agent.warningLevel === 'CRITICAL' ? 'text-rose-500 animate-pulse' : 'text-slate-300'}`}>
                             {formatTime(agent.statusDuration)}
                          </div>
                       </td>
                       <td className="px-10 py-8 text-center">
                          <div className="flex items-center justify-center space-x-6">
                             <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase">Ventas</p>
                                <p className="text-sm font-black text-white">{agent.salesToday}</p>
                             </div>
                             <div>
                                <p className="text-[8px] font-black text-slate-600 uppercase">Ocupación</p>
                                <p className="text-sm font-black text-blue-400">{agent.occupancyRate}%</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end space-x-2">
                             <button 
                               onClick={() => handleForceReady(agent.agentId)}
                               className="p-3 bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90"
                               title="Forzar Ready"
                             >
                                <Play size={16} fill="currentColor" />
                             </button>
                             <button 
                               className="p-3 bg-slate-900 border border-slate-800 hover:bg-amber-600 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90"
                               title="Intervenir Llamada"
                             >
                                <Headphones size={16} />
                             </button>
                             <button 
                               className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90"
                               title="Desconectar"
                             >
                                <Power size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         <div className="p-8 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
               <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div> Producción Nominal</div>
               <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-rose-500 mr-2"></div> Alerta Disciplinaria</div>
            </div>
            <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center">
               Logs de Gestión Histórica <ChevronRight size={14} className="ml-1" />
            </button>
         </div>
      </div>
    </div>
  );
};

export default GTRDashboard;
