import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, ComposedChart, Area, AreaChart, PieChart, Pie, Cell,
  RadialBarChart, RadialBar
} from 'recharts';
import { 
  FileDown, Calendar, Filter, Zap, Activity, Users, Award,
  ArrowUpRight, Target, Clock, Heart, PieChart as PieChartIcon,
  BarChart3, TrendingUp, CreditCard, DollarSign, PhoneCall, Search,
  Database, Layers, CheckCircle2, AlertTriangle, ArrowRight, Coffee,
  Mic, UserCheck, Mail, PhoneOff, Smartphone, List, ChevronRight, Info,
  TrendingDown, Star, ShieldCheck, Sparkles, BrainCircuit,
  // Added missing Smile and FileText imports to fix errors on lines 169 and 293
  Smile, FileText
} from 'lucide-react';
import { MOCK_CAMPAIGNS, MOCK_CDR_DATA, MOCK_PAUSE_RECORDS, PAUSE_CODES } from '../constants';

const agentKPIs = [
  { name: 'Maria G.', fcr: 82, aht: 310, csat: 4.9, qa: 98, occupancy: 88, pauseTime: 4500, trend: 'up' },
  { name: 'Juan P.', fcr: 71, aht: 350, csat: 4.2, qa: 88, occupancy: 92, pauseTime: 3200, trend: 'down' },
  { name: 'Carla M.', fcr: 89, aht: 290, csat: 5.0, qa: 96, occupancy: 85, pauseTime: 3800, trend: 'stable' },
  { name: 'Pedro S.', fcr: 65, aht: 410, csat: 3.8, qa: 82, occupancy: 78, pauseTime: 5100, trend: 'up' },
  { name: 'Sofia R.', fcr: 78, aht: 320, csat: 4.7, qa: 94, occupancy: 86, pauseTime: 4200, trend: 'up' },
];

const MOCK_LISTS_PERFORMANCE = [
  { 
    id: '1001', 
    name: 'Real Estate Florida - Nov', 
    total: 4500, 
    called: 3200, 
    human: 1850, 
    voicemail: 840, 
    noAnswer: 510, 
    dnc: 45, 
    sales: 125,
    penetration: 71.1,
    avgDuration: '4m 20s'
  },
  { 
    id: '1002', 
    name: 'Health Leads Cold', 
    total: 12000, 
    called: 5100, 
    human: 1200, 
    voicemail: 2200, 
    noAnswer: 1700, 
    dnc: 120, 
    sales: 88, 
    penetration: 42.5,
    avgDuration: '3m 15s'
  },
];

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'KPI' | 'PAUSE' | 'CDR' | 'LIST'>('KPI');
  const [selectedListId, setSelectedListId] = useState('1001');
  const [cdrFilter, setCdrFilter] = useState("");
  const [qaTimeRange, setQaTimeRange] = useState('Today');

  const selectedList = MOCK_LISTS_PERFORMANCE.find(l => l.id === selectedListId) || MOCK_LISTS_PERFORMANCE[0];

  const listPieData = [
    { name: 'Contactos Humanos', value: selectedList.human, color: '#10b981' },
    { name: 'Buzones (AMD)', value: selectedList.voicemail, color: '#3b82f6' },
    { name: 'No Contactados', value: selectedList.noAnswer, color: '#f59e0b' },
    { name: 'DNC / Inválidos', value: selectedList.dnc, color: '#ef4444' },
  ];

  const handleExport = () => {
    alert(`Generando reporte estructurado de "${selectedList.name}"... El archivo CSV estará listo en segundos.`);
  };

  const filteredCDR = MOCK_CDR_DATA.filter(cdr => 
    cdr.destination.toLowerCase().includes(cdrFilter.toLowerCase()) || 
    cdr.source.toLowerCase().includes(cdrFilter.toLowerCase())
  );

  const totalCost = filteredCDR.reduce((acc, curr) => acc + curr.cost, 0);
  const totalMinutes = filteredCDR.reduce((acc, curr) => acc + curr.duration, 0) / 60;

  const pauseDistributionData = PAUSE_CODES.map(code => {
    const totalDuration = MOCK_PAUSE_RECORDS
      .filter(r => r.codeId === code.id)
      .reduce((acc, curr) => acc + curr.duration, 0);
    return {
      name: code.name,
      value: totalDuration / 60,
      color: code.color
    };
  }).filter(d => d.value > 0);

  const formatSeconds = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Intelligence Engine</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Análisis multivariable del tráfico SIP y rendimiento de bases de datos.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[24px] shadow-inner">
            {[
              { id: 'KPI', label: 'Operación & QA', icon: Activity },
              { id: 'LIST', label: 'Listas', icon: List },
              { id: 'PAUSE', label: 'Pausas', icon: Coffee },
              { id: 'CDR', label: 'Llamadas', icon: PhoneCall },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setReportType(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${reportType === tab.id ? `bg-blue-600 text-white shadow-xl shadow-blue-600/30` : 'text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-3 bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-[24px] transition-all border border-slate-700 shadow-2xl active:scale-95 group"
          >
            <FileDown size={20} className="group-hover:translate-y-0.5 transition-transform" />
            <span className="font-black text-xs uppercase tracking-widest">Descargar</span>
          </button>
        </div>
      </div>

      {reportType === 'KPI' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
          {/* Top QA Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="glass p-8 rounded-[40px] border border-blue-500/20 bg-blue-600/5 shadow-2xl flex flex-col justify-between group">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400">
                      <ShieldCheck size={24} />
                   </div>
                   <div className="flex items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      <TrendingUp size={12} className="mr-1" /> +2.4%
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global QA Score</p>
                   <h3 className="text-4xl font-black text-white tracking-tighter mt-1">94.1%</h3>
                   <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Target 90%</p>
                </div>
             </div>
             <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-purple-600/10 text-purple-400">
                      <BrainCircuit size={24} />
                   </div>
                   <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Gemini V4</span>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">AI Audit Coverage</p>
                   <h3 className="text-4xl font-black text-white tracking-tighter mt-1">88.5%</h3>
                   <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Automated Audits</p>
                </div>
             </div>
             <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-400">
                      <Smile size={24} />
                   </div>
                   <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">High CSAT</span>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Avg NPS Score</p>
                   <h3 className="text-4xl font-black text-white tracking-tighter mt-1">4.82</h3>
                   <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Scale 1-5</p>
                </div>
             </div>
             <div className="glass p-8 rounded-[40px] border border-rose-500/20 bg-rose-500/5 shadow-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                   <div className="p-3 rounded-2xl bg-rose-600/10 text-rose-500">
                      <AlertTriangle size={24} />
                   </div>
                   <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Critical</span>
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Compliance Alerts</p>
                   <h3 className="text-4xl font-black text-white tracking-tighter mt-1">12</h3>
                   <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">Failed Scripting</p>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* QA Ranking Matrix */}
             <div className="lg:col-span-8 glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden">
                <div className="flex items-center justify-between mb-12">
                   <div className="flex items-center space-x-5">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                         <Star size={28} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-white uppercase tracking-tight">Real-Time QA Matrix</h3>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Puntaje por Agente & Tendencia de Desempeño</p>
                      </div>
                   </div>
                   <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                      {['Today', 'Week', 'Month'].map(r => (
                        <button 
                          key={r} 
                          onClick={() => setQaTimeRange(r)}
                          className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${qaTimeRange === r ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                           {r}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                         <tr>
                            <th className="px-8 py-5">Operador</th>
                            <th className="px-8 py-5 text-center">Score QA</th>
                            <th className="px-8 py-5 text-center">Tendencia</th>
                            <th className="px-8 py-5 text-right">Auditoría IA</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                         {agentKPIs.sort((a,b) => b.qa - a.qa).map((agent, i) => (
                           <tr key={i} className="hover:bg-blue-600/5 transition-all group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center space-x-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-black text-blue-400 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                                       {agent.name.split(' ').map(n=>n[0]).join('')}
                                    </div>
                                    <span className="font-black text-sm text-slate-200 uppercase tracking-tight">{agent.name}</span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex flex-col items-center">
                                    <span className={`text-xl font-black ${agent.qa >= 90 ? 'text-emerald-400' : agent.qa >= 80 ? 'text-blue-400' : 'text-rose-400'}`}>
                                       {agent.qa}%
                                    </span>
                                    <div className="w-24 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden shadow-inner">
                                       <div className={`h-full ${agent.qa >= 90 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]'}`} style={{ width: `${agent.qa}%` }}></div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex justify-center">
                                    {agent.trend === 'up' && (
                                       <div className="flex items-center text-emerald-400 font-black text-[10px] space-x-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                          <TrendingUp size={14} />
                                          <span className="uppercase">Improving</span>
                                       </div>
                                    )}
                                    {agent.trend === 'down' && (
                                       <div className="flex items-center text-rose-400 font-black text-[10px] space-x-1.5 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                                          <TrendingDown size={14} />
                                          <span className="uppercase">Declining</span>
                                       </div>
                                    )}
                                    {agent.trend === 'stable' && (
                                       <div className="flex items-center text-slate-400 font-black text-[10px] space-x-1.5 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                                          <Activity size={14} />
                                          <span className="uppercase">Stable</span>
                                       </div>
                                    )}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end space-x-2">
                                    <button className="p-3 bg-slate-950 border border-slate-800 hover:bg-blue-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95" title="Escuchar Grabación"><Mic size={16} /></button>
                                    <button className="p-3 bg-slate-950 border border-slate-800 hover:bg-emerald-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg active:scale-95" title="Ver Reporte IA"><ChevronRight size={16} /></button>
                                 </div>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

             {/* QA Category Distribution */}
             <div className="lg:col-span-4 flex flex-col space-y-8">
                <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">QA Attribute Breakdown</h3>
                   
                   <div className="space-y-8 flex-1">
                      {[
                        { label: 'Script Adherence', val: 92, col: 'blue', icon: FileText },
                        { label: 'Customer Empathy', val: 84, col: 'emerald', icon: Heart },
                        { label: 'Product Knowledge', val: 76, col: 'amber', icon: Database },
                        { label: 'Closing Ability', val: 95, col: 'rose', icon: Target },
                      ].map((attr, i) => (
                        <div key={i} className="space-y-3">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-500 flex items-center">
                                 <attr.icon size={12} className={`mr-2 text-${attr.col}-400`} /> {attr.label}
                              </span>
                              <span className={`text-${attr.col}-400`}>{attr.val}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner">
                              <div className={`h-full bg-${attr.col}-500 shadow-[0_0_10px_currentColor] transition-all duration-1000`} style={{ width: `${attr.val}%` }}></div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="p-6 mt-8 rounded-[36px] bg-slate-950 border border-slate-800 relative group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-400 group-hover:scale-110 transition-transform">
                         <Sparkles size={60} />
                      </div>
                      <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2 flex items-center">
                         <Activity size={14} className="mr-2" /> Neural Engine insight
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                         El grupo muestra un <span className="text-white">aumento del 15%</span> en el manejo de objeciones tras la última actualización del bot de coaching.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="glass p-10 rounded-[48px] border border-slate-700/50 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black flex items-center text-white uppercase tracking-tight">
                    <Zap size={24} className="mr-4 text-amber-400 shadow-inner" />
                    Resolución vs Satisfacción
                  </h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Impacto del FCR en el NPS Global</p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-black text-emerald-400 tracking-tighter">92.4%</span>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mt-1">Correlation Index</p>
                </div>
              </div>
              <div className="h-[350px] flex items-end justify-between space-x-6 pt-10">
                {agentKPIs.map((agent, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group cursor-help">
                    <div className="w-full bg-blue-600/10 rounded-2xl relative flex items-end justify-center overflow-hidden border border-blue-500/10" style={{ height: '100%' }}>
                      <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl group-hover:from-blue-500 group-hover:to-blue-300 transition-all duration-700 shadow-2xl" style={{ height: `${agent.fcr}%` }}></div>
                      <span className="absolute top-2 text-[10px] font-black text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">{agent.fcr}%</span>
                    </div>
                    <span className="mt-4 text-[10px] text-slate-500 font-black uppercase tracking-widest truncate w-full text-center group-hover:text-blue-400 transition-colors">{agent.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-10 rounded-[48px] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-center">
               <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 mb-8 shadow-inner animate-pulse">
                  <Activity size={40} />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">Telemetría Avanzada Operativa</h3>
               <p className="text-sm font-bold text-slate-500 mt-3 max-w-xs leading-relaxed uppercase tracking-widest">
                  Analizando patrones de <span className="text-blue-400">AHT</span> contra <span className="text-emerald-400">Conversión</span> en tiempo real. 
               </p>
               <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Peak Concurrency</p>
                     <p className="text-xl font-black text-white">422 <span className="text-[10px] text-slate-700">Ch.</span></p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                     <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Carrier Jitter</p>
                     <p className="text-xl font-black text-emerald-400">12ms</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'LIST' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {MOCK_LISTS_PERFORMANCE.map(list => (
              <button
                key={list.id}
                onClick={() => setSelectedListId(list.id)}
                className={`p-6 rounded-[32px] border-2 text-left min-w-[280px] transition-all ${selectedListId === list.id ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'glass border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${selectedListId === list.id ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                    <Database size={18} />
                  </div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: {list.id}</span>
                </div>
                <h4 className="font-black text-white text-sm uppercase truncate mb-1">{list.name}</h4>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{list.total.toLocaleString()} Registros Totales</p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Penetración', val: `${selectedList.penetration}%`, icon: Target, col: 'blue', sub: 'Barrido de Lista' },
              { label: 'Contactos Humanos', val: selectedList.human, icon: UserCheck, col: 'emerald', sub: 'Conversaciones' },
              { label: 'Buzones (AMD)', val: selectedList.voicemail, icon: Mic, col: 'indigo', sub: 'Detección Máquina' },
              { label: 'DNC / No Útiles', val: selectedList.dnc, icon: PhoneOff, col: 'rose', sub: 'Limpieza' },
            ].map((kpi, i) => (
              <div key={i} className={`glass p-8 rounded-[40px] border border-slate-700/40 shadow-xl flex flex-col justify-between group hover:border-blue-500/30 transition-all`}>
                <div className={`w-12 h-12 rounded-2xl bg-${kpi.col}-500/10 text-${kpi.col}-400 border border-${kpi.col}-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <kpi.icon size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>                   <h3 className="text-3xl font-black text-white tracking-tighter mt-1">{kpi.val}</h3>
                   <p className="text-[9px] text-slate-600 font-bold uppercase mt-1">{kpi.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col items-center">
               <h3 className="text-xl font-black text-white uppercase tracking-tight mb-10 w-full text-left">Estructura de Resultados</h3>
               <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={listPieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                          {listPieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                       </Pie>
                       <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full mt-8">
                  {listPieData.map((d, i) => (
                    <div key={i} className="p-4 rounded-[24px] bg-slate-900/40 border border-slate-800">
                       <div className="flex items-center text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                          <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                          {d.name}
                       </div>
                       <div className="text-xl font-black text-white">{((d.value / selectedList.called) * 100).toFixed(1)}%</div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="lg:col-span-7 glass rounded-[56px] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col">
               <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Desglose Operativo de Estados</h3>
                  <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                     <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Real-time Stats</span>
                  </div>
               </div>
               <div className="flex-1 overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                        <tr>
                           <th className="px-10 py-6">Estado de Marcación</th>
                           <th className="px-10 py-6 text-center">Registros</th>
                           <th className="px-10 py-6 text-right">Impacto en Hopper</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-800/50">
                        {[
                          { status: 'SALE (VENTA)', count: selectedList.sales, type: 'POSITIVE' },
                          { status: 'NA (NO ANSWER)', count: selectedList.noAnswer, type: 'NEUTRAL' },
                          { status: 'VM (VOICEMAIL)', count: selectedList.voicemail, type: 'SYSTEM' },
                          { status: 'DNC (REMOVER)', count: selectedList.dnc, type: 'NEGATIVE' },
                          { status: 'PENDING', count: selectedList.total - selectedList.called, type: 'QUEUED' },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-blue-600/5 transition-all group">
                             <td className="px-10 py-6">
                                <div className="flex items-center space-x-4">
                                   <div className={`w-2 h-2 rounded-full ${row.type === 'POSITIVE' ? 'bg-emerald-500' : row.type === 'NEGATIVE' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                                   <span className="font-black text-sm text-slate-200 uppercase tracking-tight">{row.status}</span>
                                </div>
                             </td>
                             <td className="px-10 py-6 text-center font-mono text-xs font-black text-white">{row.count.toLocaleString()}</td>
                             <td className="px-10 py-6 text-right">
                                <div className="flex items-center justify-end space-x-3">
                                   <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                      <div className="h-full bg-blue-600 shadow-[0_0_8px_#3b82f6]" style={{ width: `${(row.count / selectedList.total) * 100}%` }}></div>
                                   </div>
                                   <span className="text-[10px] font-black text-slate-500">{((row.count / selectedList.total) * 100).toFixed(1)}%</span>
                                </div>
                             </td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="p-8 bg-slate-900/40 border-t border-slate-800 flex justify-between items-center">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center">
                    <Info size={14} className="mr-2 text-blue-500" />
                    Los registros "PENDING" entrarán al hopper automáticamente según el Dial Ratio.
                  </p>
                  <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center">
                    Ver registros <ChevronRight size={14} className="ml-1" />
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {reportType === 'PAUSE' && (
        <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="glass p-8 rounded-[40px] border-2 border-emerald-500/20 bg-emerald-500/5 shadow-2xl">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Inversión en Telefonía</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">${totalCost.toFixed(2)}</h3>
             </div>
             <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Minutos Procesados</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{totalMinutes.toFixed(1)}<span className="text-lg text-slate-600">m</span></h3>
             </div>
             <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Carrier Avg / Min</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">${(totalCost / (totalMinutes || 1)).toFixed(3)}</h3>
             </div>
             <div className="glass p-8 rounded-[40px] border-2 border-blue-500/20 bg-blue-600/5 shadow-2xl">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Eficiencia de Ruta</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">98<span className="text-lg text-slate-600">%</span></h3>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-4 glass p-10 rounded-[48px] border border-slate-700/50 shadow-2xl h-full flex flex-col">
                <h3 className="text-xl font-black text-white uppercase tracking-tight mb-10 flex items-center">
                   <PieChartIcon className="mr-4 text-amber-500" size={24} />
                   Motivos de Pausa
                </h3>
                <div className="flex-1 h-[300px]">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={pauseDistributionData} innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="value">
                            {pauseDistributionData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                         </Pie>
                         <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px' }} />
                      </PieChart>
                   </ResponsiveContainer>
                </div>
                <div className="space-y-4 mt-8">
                   {pauseDistributionData.map((d, i) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
                        <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <div className="w-3 h-3 rounded-full mr-3 shadow-lg" style={{ backgroundColor: d.color }}></div>
                           {d.name}
                        </div>
                        <span className="text-xs font-mono font-black text-white">{d.value.toFixed(0)}m</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="lg:col-span-8 glass rounded-[48px] border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Ranking de Inactividad</h3>
                   <Clock className="text-slate-600" size={24} />
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                         <tr>
                            <th className="px-10 py-6">Operador</th>
                            <th className="px-10 py-6 text-center">Frecuencia</th>
                            <th className="px-10 py-6 text-center">Inversión Temporal</th>
                            <th className="px-10 py-6 text-right">Efecto Ocupación</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                         {agentKPIs.sort((a,b) => b.pauseTime - a.pauseTime).map((agent, i) => (
                            <tr key={i} className="hover:bg-blue-600/5 transition-all group">
                               <td className="px-10 py-6">
                                  <div className="flex items-center space-x-5">
                                     <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-[11px] font-black text-blue-400 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                                        {agent.name.split(' ').map(n=>n[0]).join('')}
                                     </div>
                                     <span className="font-black text-sm text-slate-200 uppercase tracking-tight">{agent.name}</span>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center font-mono text-xs text-slate-500 font-bold">{Math.floor(Math.random() * 5) + 3} hits</td>
                               <td className="px-10 py-6 text-center font-black text-xs text-amber-500 tracking-widest">{formatSeconds(agent.pauseTime)}</td>
                               <td className="px-10 py-6 text-right">
                                  <div className="flex items-center justify-end space-x-4">
                                     <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-gradient-to-r from-rose-600 to-rose-400" style={{ width: `${(agent.pauseTime/28800)*100}%` }}></div>
                                     </div>
                                     <span className="text-[11px] font-black text-rose-500 tracking-tighter">-{((agent.pauseTime/28800)*100).toFixed(1)}%</span>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      )}

      {reportType === 'CDR' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="glass p-8 rounded-[40px] border-2 border-emerald-500/20 bg-emerald-500/5 shadow-2xl">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-3">Inversión en Telefonía</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">${totalCost.toFixed(2)}</h3>
             </div>
             <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Minutos Procesados</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">{totalMinutes.toFixed(1)}<span className="text-lg text-slate-600">m</span></h3>
             </div>
             <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Carrier Avg / Min</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">${(totalCost / (totalMinutes || 1)).toFixed(3)}</h3>
             </div>
             <div className="glass p-8 rounded-[40px] border-2 border-blue-500/20 bg-blue-600/5 shadow-2xl">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Eficiencia de Ruta</p>
                <h3 className="text-4xl font-black text-white tracking-tighter">98<span className="text-lg text-slate-600">%</span></h3>
             </div>
          </div>

          <div className="glass rounded-[48px] border border-slate-700/50 overflow-hidden shadow-2xl">
            <div className="p-10 bg-slate-900/60 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-8">
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter">Call Detail Records (Auditoría Central)</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-2">Logs estructurados del Event Socket Layer</p>
               </div>
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Filtrar por número de destino o extensión..." 
                    value={cdrFilter}
                    onChange={(e) => setCdrFilter(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] pl-14 pr-6 py-4 text-xs text-slate-200 font-bold outline-none focus:border-emerald-500 shadow-inner transition-all"
                  />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  <tr>
                    <th className="px-10 py-6">Timestamp</th>
                    <th className="px-10 py-6">Source</th>
                    <th className="px-10 py-6">Destination</th>
                    <th className="px-10 py-6">Duration</th>
                    <th className="px-10 py-6">Disposition</th>
                    <th className="px-10 py-6 text-right">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCDR.map((cdr) => (
                    <tr key={cdr.id} className="hover:bg-slate-900/40 transition-colors group">
                      <td className="px-10 py-6 text-xs font-bold text-slate-500 uppercase">{cdr.timestamp}</td>
                      <td className="px-10 py-6 text-xs font-black text-blue-400 font-mono underline decoration-blue-500/20">{cdr.source}</td>
                      <td className="px-10 py-6 text-sm font-mono font-black text-white group-hover:text-emerald-400 transition-colors">{cdr.destination}</td>
                      <td className="px-10 py-6 text-xs font-mono text-slate-400 font-bold">{Math.floor(cdr.duration / 60)}m {cdr.duration % 60}s</td>
                      <td className="px-10 py-6">
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${cdr.disposition === 'ANSWERED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                            {cdr.disposition}
                         </span>
                      </td>
                      <td className="px-10 py-6 text-right text-xs font-black text-white tracking-widest">
                         {cdr.cost > 0 ? `$${cdr.cost.toFixed(2)}` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;