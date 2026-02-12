
/**
 * @file RealTimeMonitor.tsx
 * @description Centro de comando táctico para supervisión de conferencias, estados de agentes, colas y telemetría SIP.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Users, PhoneCall, Clock, AlertTriangle, TrendingUp, ChevronRight,
  Zap, PhoneForwarded, LayoutGrid, Monitor, Headphones, Radio, Mic, ShieldAlert,
  Server as ServerIcon, Globe, RefreshCw, ShieldCheck, User, Search, Play,
  Pause, MoreVertical, MessageSquare, Volume2, Ear, Mic2, Users2, X, AlertCircle,
  PhoneIncoming, PhoneOutgoing, Layers, Settings, Info, Wifi, Database, 
  Cpu, HardDrive, BarChart3, Terminal, Timer, Hourglass,
  Smile, Signal, Maximize2, Trophy, Target, Award, Shapes, Filter,
  VolumeX, Lock, PhoneOff, Plus, UserCheck, CheckCircle2, History,
  Power
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, BarChart, Bar, Cell
} from 'recharts';
import Wallboard from './Wallboard';
import { MOCK_CAMPAIGNS, MOCK_USER_GROUPS, MOCK_USERS_LIST } from '../constants';
import { ConferenceRoom, GTRAgentMetric, GTRQueueMetric } from '../types';
import { useToast } from '../ToastContext';
import Logo from './Logo';

const INITIAL_CONFERENCES: ConferenceRoom[] = [
  {
    id: 'conf_1001',
    agentId: '1',
    agentName: 'Maria Gonzalez',
    extension: '1001',
    status: 'TALKING',
    memberCount: 2,
    members: [
      { id: 'm1', uuid: 'u1', callerName: 'Maria G.', callerNumber: '1001', isMuted: false, isSpeaking: true, energyScore: 85, joinTime: '08:00' },
      { id: 'm2', uuid: 'u2', callerName: 'Lead: John Wick', callerNumber: '+13055551234', isMuted: false, isSpeaking: false, energyScore: 10, joinTime: '08:02' }
    ]
  },
  {
    id: 'conf_1002',
    agentId: '2',
    agentName: 'Juan Perez',
    extension: '1002',
    status: 'IDLE_IN_CONF',
    memberCount: 1,
    members: [
      { id: 'm3', uuid: 'u3', callerName: 'Juan P.', callerNumber: '1002', isMuted: false, isSpeaking: false, energyScore: 0, joinTime: '08:05' }
    ]
  }
];

const MOCK_GTR_AGENTS: GTRAgentMetric[] = [
  { agentId: 'usr_2', agentName: 'Maria Gonzalez', status: 'INCALL', statusDuration: 145, campaignName: 'Real Estate Leads', callsToday: 45, salesToday: 4, occupancyRate: 88, warningLevel: 'NONE' },
  { agentId: 'usr_3', agentName: 'Juan Perez', status: 'READY', statusDuration: 32, campaignName: 'Real Estate Leads', callsToday: 38, salesToday: 2, occupancyRate: 72, warningLevel: 'NONE' },
  { agentId: 'usr_gtr', agentName: 'Sergio Tellez', status: 'PAUSED', statusDuration: 900, campaignName: 'N/A', callsToday: 5, salesToday: 0, occupancyRate: 95, warningLevel: 'CRITICAL' },
  { agentId: 'usr_4', agentName: 'Carla Mendez', status: 'WRAPUP', statusDuration: 12, campaignName: 'Inbound Support', callsToday: 22, salesToday: 0, occupancyRate: 82, warningLevel: 'NONE' },
];

const MOCK_GTR_QUEUES: GTRQueueMetric[] = [
  { queueName: 'Ventas_Florida_Primary', callsWaiting: 3, longestWait: 45, agentsLogged: 12, agentsReady: 2, slaPercent: 92 },
  { queueName: 'Soporte_VIP_Gold', callsWaiting: 0, longestWait: 0, agentsLogged: 8, agentsReady: 5, slaPercent: 98 },
  { queueName: 'Cobranzas_Retención', callsWaiting: 14, longestWait: 220, agentsLogged: 5, agentsReady: 0, slaPercent: 54 },
];

const RealTimeMonitor: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'CONFERENCES' | 'AGENTS' | 'QUEUES' | 'FS_TELEMETRY'>('CONFERENCES');
  const [conferences, setConferences] = useState<ConferenceRoom[]>(INITIAL_CONFERENCES);
  const [agents, setAgents] = useState<GTRAgentMetric[]>(MOCK_GTR_AGENTS);
  const [queues, setQueues] = useState<GTRQueueMetric[]>(MOCK_GTR_QUEUES);
  const [searchTerm, setSearchTerm] = useState("");
  const [isWallboardOpen, setIsWallboardOpen] = useState(false);

  // Simulación de actividad de audio y telemetría en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Audio Conferencia
      setConferences(prev => prev.map(conf => ({
        ...conf,
        members: conf.members.map(m => ({
          ...m,
          energyScore: Math.floor(Math.random() * 100),
          isSpeaking: Math.random() > 0.5
        }))
      })));

      // Duraciones de Agentes
      setAgents(prev => prev.map(a => ({
        ...a,
        statusDuration: a.statusDuration + 1,
        currentCallDuration: a.status === 'INCALL' ? (a.currentCallDuration || 0) + 1 : undefined,
        warningLevel: (a.status === 'WRAPUP' && a.statusDuration > 30) || (a.status === 'PAUSED' && a.statusDuration > 600) ? 'CRITICAL' : a.statusDuration > 300 ? 'LOW' : 'NONE'
      })));

      // Colas
      setQueues(prev => prev.map(q => ({
        ...q,
        callsWaiting: Math.max(0, q.callsWaiting + (Math.random() > 0.7 ? 1 : -1)),
        longestWait: q.callsWaiting > 0 ? q.longestWait + 1 : 0
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredConfs = useMemo(() => 
    conferences.filter(c => c.agentName.toLowerCase().includes(searchTerm.toLowerCase()) || c.extension.includes(searchTerm))
  , [conferences, searchTerm]);

  const filteredAgents = useMemo(() => 
    agents.filter(a => a.agentName.toLowerCase().includes(searchTerm.toLowerCase()))
  , [agents, searchTerm]);

  const formatSeconds = (s: number) => {
    const m = Math.floor(s / 60);
    const rs = s % 60;
    return `${m}:${rs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-700 pb-10">
      {isWallboardOpen && <Wallboard onClose={() => setIsWallboardOpen(false)} />}

      <div className="flex items-center justify-between shrink-0">
         <div className="flex items-center space-x-5">
            <div className="relative group">
               <Logo className="w-10 h-10 group-hover:scale-110 transition-transform" />
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#020617]"></div>
            </div>
            <div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center">
                  Matriz de Control Zero-Idle
               </h2>
               <p className="text-slate-400 text-sm font-medium italic opacity-60">Supervisión táctica de canales, colas e infraestructura SIP.</p>
            </div>
         </div>
         <div className="flex space-x-4">
            <div className="hidden md:flex bg-rose-500/10 border border-rose-500/20 px-6 py-2 rounded-full items-center space-x-3">
               <Signal size={14} className="text-rose-500 animate-pulse" />
               <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Enforcement: Active</span>
            </div>
            <button 
              onClick={() => setIsWallboardOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center space-x-3 active:scale-95 group"
            >
               <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
               <span>Launch Wallboard</span>
            </button>
         </div>
      </div>

      {/* Tabs de Operación */}
      <div className="flex space-x-2 bg-slate-900 border-2 border-slate-800 p-1.5 rounded-3xl shrink-0 overflow-x-auto scrollbar-hide">
         {[
           { id: 'CONFERENCES', label: 'Bridges Activos', icon: Headphones },
           { id: 'AGENTS', label: 'Monitor Estados', icon: Users },
           { id: 'QUEUES', label: 'Colas SIP', icon: Layers },
           { id: 'FS_TELEMETRY', label: 'Telemetría FS', icon: ServerIcon },
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <tab.icon size={16} />
             <span>{tab.label}</span>
           </button>
         ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
        {/* BARRA DE BUSQUEDA GLOBAL DENTRO DEL CONTENIDO */}
        {activeTab !== 'FS_TELEMETRY' && (
          <div className="mb-8 relative max-w-2xl px-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
            <input 
              type="text" 
              placeholder={`Filtrar ${activeTab === 'QUEUES' ? 'colas' : 'agentes o terminales'}...`} 
              className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )}

        {/* TAB 1: CONFERENCES */}
        {activeTab === 'CONFERENCES' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {filteredConfs.map(conf => (
              <div key={conf.id} className="glass rounded-[48px] border border-slate-700/50 shadow-2xl p-10 relative overflow-hidden group hover:border-blue-500/30 transition-all">
                  <div className="flex items-start justify-between mb-8">
                    <div className="flex items-center space-x-5">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-500 shadow-inner border border-slate-700 group-hover:scale-110 transition-transform duration-500">
                          <Mic size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-white uppercase text-lg tracking-tight">{conf.agentName}</h4>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Permanent EXT {conf.extension}</p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${conf.status === 'TALKING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-800'}`}>
                        {conf.status}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Miembros en Bridge ({conf.memberCount})</p>
                    {conf.members.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-3xl">
                          <div className="flex items-center space-x-4">
                            <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                            <div className="min-w-0">
                                <p className="text-xs font-black text-white uppercase truncate">{m.callerName}</p>
                                <p className="text-[9px] text-slate-600 font-mono">{m.callerNumber}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {m.isSpeaking && (
                                <div className="flex items-end space-x-0.5 h-4">
                                  {[...Array(5)].map((_, i) => (
                                      <div key={i} className="w-1 bg-emerald-500 rounded-full animate-wave" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i*0.1}s` }}></div>
                                  ))}
                                </div>
                            )}
                            {m.isMuted ? <VolumeX size={14} className="text-rose-500" /> : <Volume2 size={14} className="text-slate-500" />}
                          </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800/50">
                    <button className="flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl shadow-xl shadow-blue-600/20 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                        <Ear size={18} />
                        <span>Escuchar</span>
                    </button>
                    <button className="flex items-center justify-center space-x-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                        <PhoneOff size={18} />
                        <span>Barge SIP</span>
                    </button>
                  </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: AGENTS (Monitor de Estados) */}
        {activeTab === 'AGENTS' && (
          <div className="glass rounded-[48px] border border-slate-700/50 overflow-hidden shadow-2xl animate-in slide-in-from-right-4 duration-500">
             <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Agent Matrix Telemetry</h3>
                <div className="flex space-x-4">
                   <div className="flex items-center space-x-2 px-4 py-2 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">Live: {filteredAgents.length}</span>
                   </div>
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                      <tr>
                         <th className="px-10 py-6">Agente / Campaña</th>
                         <th className="px-10 py-6 text-center">Estado SIP</th>
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
                                 <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-blue-400 font-black border border-slate-700 shadow-lg group-hover:scale-105 transition-transform">
                                    {agent.agentName.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{agent.agentName}</p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-1">{agent.campaignName}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                agent.status === 'READY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                agent.status === 'INCALL' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 animate-pulse' : 
                                agent.status === 'PAUSED' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                                'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                 {agent.status}
                              </span>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className={`text-lg font-mono font-black tabular-nums ${agent.warningLevel === 'CRITICAL' ? 'text-rose-500' : agent.warningLevel === 'LOW' ? 'text-amber-500' : 'text-slate-300'}`}>
                                 {formatSeconds(agent.statusDuration)}
                              </div>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className="flex justify-center space-x-6">
                                 <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase">Calls</p>
                                    <p className="text-sm font-black text-white">{agent.callsToday}</p>
                                 </div>
                                 <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-600 uppercase">Sales</p>
                                    <p className="text-sm font-black text-emerald-400">{agent.salesToday}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                                 <button className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-xl shadow-lg transition-all"><Ear size={16} /></button>
                                 <button className="p-3 bg-slate-900 border border-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl shadow-lg transition-all"><Mic2 size={16} /></button>
                                 <button className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white rounded-xl shadow-lg transition-all"><Power size={16} /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* TAB 3: QUEUES (Colas SIP) */}
        {activeTab === 'QUEUES' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in zoom-in-95 duration-500">
             {queues.map((q, idx) => (
               <div key={idx} className={`glass p-10 rounded-[56px] border-2 shadow-2xl flex flex-col justify-between relative overflow-hidden group transition-all ${q.callsWaiting > 5 ? 'border-rose-500/40 bg-rose-500/5 shadow-rose-500/10' : 'border-slate-800'}`}>
                  <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Layers size={180} />
                  </div>
                  <div className="flex justify-between items-start mb-8 relative z-10">
                     <div className="space-y-1">
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">{q.queueName}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">SLA Real-time</p>
                     </div>
                     <div className={`p-4 rounded-2xl shadow-xl transition-all ${q.slaPercent > 80 ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white animate-pulse'}`}>
                        <span className="font-black text-sm">{q.slaPercent}%</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 relative z-10">
                     <div className="p-6 bg-slate-950/80 rounded-[32px] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Waiting</span>
                           <PhoneIncoming size={12} className={q.callsWaiting > 0 ? 'text-rose-500' : 'text-slate-800'} />
                        </div>
                        <p className={`text-5xl font-black tabular-nums ${q.callsWaiting > 5 ? 'text-rose-500' : 'text-white'}`}>{q.callsWaiting}</p>
                     </div>
                     <div className="p-6 bg-slate-950/80 rounded-[32px] border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Longest</span>
                           <Clock size={12} className="text-slate-800" />
                        </div>
                        <p className={`text-4xl font-black text-blue-400 tabular-nums`}>{q.longestWait}s</p>
                     </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-slate-800/50 flex justify-between items-center relative z-10">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Agents (Ready/Logged)</span>
                        <div className="flex items-baseline space-x-2 mt-1">
                           <span className="text-xl font-black text-emerald-400">{q.agentsReady}</span>
                           <span className="text-xs font-black text-slate-700">/ {q.agentsLogged}</span>
                        </div>
                     </div>
                     <button className="p-4 bg-slate-900 hover:bg-blue-600 text-slate-500 hover:text-white rounded-2xl transition-all shadow-xl"><Settings size={18} /></button>
                  </div>
               </div>
             ))}
             <div className="glass rounded-[56px] border-4 border-dashed border-slate-800 p-12 flex flex-col items-center justify-center text-center opacity-30 hover:opacity-100 hover:border-blue-500/30 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-600 group-hover:text-blue-500 group-hover:scale-110 transition-all shadow-inner mb-6">
                   <Plus size={32} />
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Vincular Nueva Cola</h4>
                <p className="text-xs text-slate-500 font-bold uppercase mt-2">Provisionar DialPlan Context</p>
             </div>
          </div>
        )}

        {/* TAB 4: FS_TELEMETRY (Telemetría FS) */}
        {activeTab === 'FS_TELEMETRY' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'SIP SESSIONS', val: '1,240', icon: PhoneIncoming, col: 'blue' },
                  { label: 'RTP CHANNELS', val: '2,480', icon: Radio, col: 'emerald' },
                  { label: 'NODE UPTIME', val: '14d 08h', icon: Timer, col: 'indigo' },
                  { label: 'CPU WAIT (I/O)', val: '1.2ms', icon: Cpu, col: 'amber' },
                ].map((k, i) => (
                  <div key={i} className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-xl flex flex-col justify-between group">
                     <div className={`p-3 rounded-2xl bg-${k.col}-600/10 text-${k.col}-400 w-fit mb-6 border border-white/5`}>
                        <k.icon size={20} />
                     </div>
                     <h3 className="text-2xl font-black text-white uppercase tracking-tight">{k.val}</h3>
                     <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{k.label}</p>
                  </div>
                ))}
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl relative overflow-hidden bg-slate-900/40">
                   <div className="flex items-center justify-between mb-12 relative z-10">
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                          <Activity className="mr-4 text-emerald-400" />
                          Packet Processing Velocity
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Throughput del núcleo de telefonía (Go Bridge)</p>
                      </div>
                      <div className="px-6 py-2 bg-slate-950 border border-slate-800 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] shadow-inner">Nominal Flow</div>
                   </div>
                   <div className="h-[350px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={Array.from({length: 40}, (_, i) => ({v: 40 + Math.random()*40, e: 10 + Math.random()*15}))}>
                            <defs>
                               <linearGradient id="colorV" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px'}} labelStyle={{display: 'none'}} />
                            <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={5} fill="url(#colorV)" animationDuration={1000} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                   <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col bg-slate-900/40">
                      <h3 className="text-xl font-black mb-10 flex items-center tracking-tight text-white uppercase">
                        <ShieldCheck className="mr-4 text-blue-400" size={24} />
                        Service Health
                      </h3>
                      <div className="space-y-6">
                         {[
                           { name: 'Sofia Profile: External', status: 'ACTIVE', color: 'emerald' },
                           { name: 'Sofia Profile: Internal', status: 'ACTIVE', color: 'emerald' },
                           { name: 'Mod_Lua / Routing', status: 'SYNCED', color: 'blue' },
                           { name: 'Postgres Driver', status: 'ONLINE', color: 'emerald' },
                           { name: 'ESL Orquestrator', status: 'CONNECTED', color: 'emerald' },
                         ].map((s, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl group hover:border-blue-500/30 transition-all">
                              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{s.name}</span>
                              <div className="flex items-center space-x-2">
                                 <div className={`w-2 h-2 rounded-full bg-${s.color}-500 shadow-[0_0_8px_currentColor]`}></div>
                                 <span className={`text-[9px] font-black uppercase text-${s.color}-400`}>{s.status}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="p-10 glass rounded-[56px] border border-blue-500/20 bg-blue-600/5 space-y-6 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-400 group-hover:scale-110 transition-transform">
                         <Terminal size={100} />
                      </div>
                      <h4 className="font-black text-lg text-white uppercase tracking-tighter flex items-center">
                         <Info size={18} className="mr-3 text-blue-400" /> Kernel Optimization
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
                         El orquestador de Go está administrando el <span className="text-white">Load Balancing</span> entre los 2 nodos activos para mantener la latencia por debajo de los 10ms.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Panel Inferior: Alertas de Tiempo Muerto */}
      <div className="glass p-8 md:p-10 rounded-[56px] border border-slate-700/50 shadow-2xl bg-gradient-to-r from-rose-600/5 to-transparent flex flex-col md:flex-row items-center justify-between gap-8 shrink-0">
         <div className="flex items-center space-x-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
               <Timer size={40} />
            </div>
            <div>
               <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">Alertas de Productividad (Real-Time)</h3>
               <p className="text-xs md:text-sm text-slate-500 font-medium max-w-xl">El motor detectó a <span className="text-rose-500 font-black">3 agentes</span> excediendo el tiempo de Wrap-up configurado. Se ha disparado una notificación auditiva en sus terminales.</p>
            </div>
         </div>
         <div className="flex space-x-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Ver Logs</button>
            <button className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all">Reset Global</button>
         </div>
      </div>
    </div>
  );
};

export default RealTimeMonitor;
