
import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, Legend, PieChart, Pie
} from 'recharts';
import { 
  Users, Target, Zap, Clock, TrendingUp, Filter, FileDown, 
  Search, Award, PhoneCall, Smartphone, Layers,
  ChevronRight, ArrowUpRight, BarChart3, MoreVertical,
  Activity, CheckCircle2, ShieldAlert, Timer, Trophy,
  Flame, Briefcase, FileSpreadsheet, Quote
} from 'lucide-react';
import { MOCK_AGENT_STATS, MOCK_CAMPAIGNS, MOCK_USER_GROUPS } from '../constants';

const AgentPerformanceReport: React.FC = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("1");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredStats = useMemo(() => {
    return MOCK_AGENT_STATS.filter(stat => {
      const matchCampaign = stat.campaignId === selectedCampaignId;
      const matchSearch = stat.agentName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCampaign && matchSearch;
    });
  }, [selectedCampaignId, searchTerm]);

  const funnelData = useMemo(() => {
    if (filteredStats.length === 0) return [];
    const totalCalls = filteredStats.reduce((acc, s) => acc + s.calls, 0);
    const totalEffective = filteredStats.reduce((acc, s) => acc + (s.dispositions['SALE'] || 0) + (s.dispositions['CBK'] || 0), 0);
    const totalSales = filteredStats.reduce((acc, s) => acc + s.sales, 0);
    
    return [
      { name: 'Emisión Total', value: totalCalls, color: '#3b82f6' },
      { name: 'Interés / CBK', value: totalEffective, color: '#f59e0b' },
      { name: 'Cierres / Ventas', value: totalSales, color: '#10b981' }
    ];
  }, [filteredStats]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Trophy className="mr-4 text-amber-500" size={36} />
            Forensic Productivity Report
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Análisis profundo de la eficiencia humana y retorno de contactabilidad.</p>
        </div>
        <button 
          className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 group"
        >
          <FileSpreadsheet size={18} className="group-hover:rotate-6" />
          <span>Generar PDF Auditoría</span>
        </button>
      </div>

      {/* Selector de Contexto */}
      <div className="glass p-8 rounded-[40px] border border-slate-700/50 flex flex-wrap items-center gap-8 shadow-2xl">
         <div className="flex-1 min-w-[300px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Filtrar por Campaña SIP</label>
            <div className="relative group">
               <Layers className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={20} />
               <select 
                 value={selectedCampaignId}
                 onChange={e => setSelectedCampaignId(e.target.value)}
                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] pl-16 pr-6 py-4 text-sm text-white font-bold outline-none focus:border-blue-500 appearance-none transition-all shadow-inner"
               >
                 {MOCK_CAMPAIGNS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
               </select>
            </div>
         </div>
         <div className="flex-1 min-w-[300px]">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Búsqueda de Operador</label>
            <div className="relative">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
               <input 
                type="text" 
                placeholder="Nombre completo o ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] pl-16 pr-8 py-4 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
               />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Funnel de Conversión de la Campaña */}
        <div className="lg:col-span-5 glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col items-center">
           <h3 className="text-xl font-black text-white uppercase tracking-tight mb-10 w-full flex items-center">
              <Flame size={24} className="mr-3 text-rose-500" />
              Conversion Funnel (Global)
           </h3>
           <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie data={funnelData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">
                       {funnelData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px' }} />
                 </PieChart>
              </ResponsiveContainer>
           </div>
           <div className="grid grid-cols-3 gap-4 w-full mt-8">
              {funnelData.map((d, i) => (
                <div key={i} className="p-4 rounded-[24px] bg-slate-900/40 border border-slate-800 text-center">
                   <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1 truncate">{d.name}</div>
                   <div className="text-xl font-black text-white">{d.value.toLocaleString()}</div>
                </div>
              ))}
           </div>
        </div>

        {/* KPIs Detallados de Talk vs Dead Time */}
        <div className="lg:col-span-7 glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl">
           <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Time Leak Detection</h3>
              <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400 border border-blue-500/20">
                 <Clock size={24} />
              </div>
           </div>
           
           <div className="space-y-8">
              {filteredStats.slice(0, 4).map((stat, i) => {
                const total = stat.talkTime + stat.pauseTime + stat.wrapUpTime + stat.waitTime;
                const talkPercent = (stat.talkTime / total) * 100;
                const idlePercent = (stat.waitTime / total) * 100;
                
                return (
                  <div key={i} className="space-y-3">
                     <div className="flex justify-between items-end">
                        <div>
                           <p className="text-sm font-black text-white uppercase tracking-tight">{stat.agentName}</p>
                           <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Ocupación: {stat.occupancy}%</p>
                        </div>
                        <span className="text-xs font-mono font-black text-blue-400">{formatTime(stat.talkTime)} Talk / {formatTime(stat.pauseTime)} Pause</span>
                     </div>
                     <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                        <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]" style={{ width: `${talkPercent}%` }} title="Talk Time"></div>
                        <div className="h-full bg-rose-600/40" style={{ width: `${(stat.pauseTime/total)*100}%` }} title="Pause Time"></div>
                        <div className="h-full bg-amber-600/40" style={{ width: `${(stat.wrapUpTime/total)*100}%` }} title="Wrap Up"></div>
                        <div className="h-full bg-slate-800" style={{ width: `${idlePercent}%` }} title="Idle Time"></div>
                     </div>
                  </div>
                );
              })}
           </div>

           <div className="mt-12 flex items-center justify-center space-x-8 text-[9px] font-black text-slate-600 uppercase tracking-widest">
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded bg-blue-600 mr-2"></div> TALK TIME</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded bg-rose-600 mr-2"></div> BREAK / PAUSE</div>
              <div className="flex items-center"><div className="w-2.5 h-2.5 rounded bg-amber-600 mr-2"></div> WRAP UP</div>
           </div>
        </div>
      </div>

      {/* Matriz de Productividad Vicidial Pro */}
      <div className="glass rounded-[56px] border border-slate-700/50 overflow-hidden shadow-2xl">
         <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center space-x-6">
               <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                  <Activity size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Full Performance Scorecard</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Matriz analítica de eficiencia operativa</p>
               </div>
            </div>
            <button className="px-6 py-2.5 bg-slate-950 border border-slate-800 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-blue-500 transition-all">
               Custom Columns
            </button>
         </div>

         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
               <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  <tr>
                     <th className="px-10 py-6">Agente</th>
                     <th className="px-10 py-6 text-center">Calls</th>
                     <th className="px-10 py-6 text-center">CPH (Calls/hr)</th>
                     <th className="px-10 py-6 text-center">AHT (AVG)</th>
                     <th className="px-10 py-6 text-center">Sales</th>
                     <th className="px-10 py-6 text-center">Conv %</th>
                     <th className="px-10 py-6 text-right">Performance Score</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                  {filteredStats.map((stat, idx) => {
                    const convRatio = ((stat.sales / stat.calls) * 100).toFixed(1);
                    const score = Math.min(100, Math.round((stat.occupancy * 0.4) + (parseFloat(convRatio) * 5) + (stat.callsPerHour * 0.5)));
                    
                    return (
                      <tr key={idx} className="hover:bg-blue-600/5 transition-all group">
                         <td className="px-10 py-8">
                            <div className="flex items-center space-x-5">
                               <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-400 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform">
                                  {stat.agentName.charAt(0)}
                               </div>
                               <span className="font-black text-sm text-slate-200 uppercase tracking-tight">{stat.agentName}</span>
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center font-mono text-sm font-black text-white">{stat.calls}</td>
                         <td className="px-10 py-8 text-center font-mono text-sm text-slate-400">{stat.callsPerHour}</td>
                         <td className="px-10 py-8 text-center">
                            <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 inline-block font-mono text-xs text-white font-black">
                               {stat.aht}s
                            </div>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <span className="text-base font-black text-emerald-400">{stat.sales}</span>
                         </td>
                         <td className="px-10 py-8 text-center">
                            <span className="text-xs font-black text-blue-400">{convRatio}%</span>
                         </td>
                         <td className="px-10 py-8 text-right">
                            <div className="flex items-center justify-end space-x-4">
                               <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                                  <div className={`h-full ${score > 80 ? 'bg-emerald-500' : score > 60 ? 'bg-blue-500' : 'bg-rose-500'}`} style={{ width: `${score}%` }}></div>
                               </div>
                               <span className="text-xs font-black text-white w-8">{score}%</span>
                            </div>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default AgentPerformanceReport;
