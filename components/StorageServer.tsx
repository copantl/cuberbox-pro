
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Database, HardDrive, Search, Filter, Play, Pause, Download, 
  Trash2, RefreshCw, ShieldCheck, PieChart, Info, Save, X,
  ChevronRight, ArrowUpRight, Share2, Terminal, Clock, 
  Smartphone, Headphones, Mic, Sparkles, Wand2, Cloud,
  ExternalLink, FileText, Zap, Layers, AlertCircle,
  FolderOpen, Settings, Volume2, Shield, Activity,
  // Added missing CheckCircle2 import
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { StorageNode, RecordingAsset, BackupJob } from '../types';
import { MOCK_STORAGE_NODES, MOCK_RECORDINGS, MOCK_BACKUP_JOBS } from '../constants';
import { useToast } from '../ToastContext';

const StorageServer: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'EXPLORER' | 'BACKUPS' | 'CONFIG'>('DASHBOARD');
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRec, setSelectedRec] = useState<RecordingAsset | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  // Storage Stats Data
  const storageData = [
    { name: 'Alpha Node', val: 65, color: '#3b82f6' },
    { name: 'Beta Node', val: 22, color: '#10b981' },
    { name: 'NAS Backup', val: 40, color: '#f59e0b' },
  ];

  const handleBackup = async () => {
    setIsBackingUp(true);
    toast('Iniciando volcado de seguridad SHA-256 en unidad externa...', 'info', 'Backup Engine');
    await new Promise(r => setTimeout(r, 2500));
    setIsBackingUp(false);
    toast('Backup masivo completado exitosamente.', 'success');
  };

  const handlePurge = async () => {
    if (confirm('¿Ejecutar purga de audios con más de 90 días? Se liberarán aproximadamente 450 GB.')) {
      setIsPurging(true);
      await new Promise(r => setTimeout(r, 1500));
      setIsPurging(false);
      toast('Purga optimizada completada.', 'warning');
    }
  };

  const filteredRecordings = useMemo(() => 
    MOCK_RECORDINGS.filter(r => 
      r.customerPhone.includes(searchTerm) || 
      r.agentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  , [searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <HardDrive className="mr-4 text-blue-500" size={36} />
            Media Storage Plane
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Gestión distribuida de grabaciones y auditoría forense de audio.</p>
        </div>
        <div className="flex items-center space-x-3">
           <button 
            onClick={handleBackup}
            disabled={isBackingUp}
            className="flex items-center space-x-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50"
           >
             {isBackingUp ? <RefreshCw className="animate-spin" size={20} /> : <Cloud size={20} />}
             <span className="text-[10px] font-black uppercase tracking-widest">Generar Backup</span>
           </button>
           {/* Fixed: replaced undefined handleOpenConfig with setActiveTab('CONFIG') */}
           <button 
            onClick={() => setActiveTab('CONFIG')}
            className="p-4 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-500 hover:text-white rounded-2xl transition-all shadow-lg"
           >
             <Settings size={22} />
           </button>
        </div>
      </div>

      {/* Tabs de Navegación del Plano */}
      <div className="flex space-x-2 bg-slate-900 border-2 border-slate-800 p-1.5 rounded-2xl w-fit shadow-inner">
        {[
          { id: 'DASHBOARD', label: 'Estatado Nodos', icon: Activity },
          { id: 'EXPLORER', label: 'Búsqueda Forense', icon: Search },
          { id: 'BACKUPS', label: 'Logs de Backup', icon: Layers },
          { id: 'CONFIG', label: 'Políticas Purga', icon: Shield },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="col-span-12 lg:col-span-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {MOCK_STORAGE_NODES.map(node => (
                     <div key={node.id} className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                           <div className="p-4 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
                              <Database size={28} />
                           </div>
                           <div className="flex items-center space-x-2">
                              <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></div>
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.status}</span>
                           </div>
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">{node.name}</h3>
                        <p className="text-[10px] font-mono text-slate-600 font-bold uppercase mt-1 tracking-widest">{node.ip} • {node.path}</p>
                        
                        <div className="mt-10 space-y-6">
                           <div className="space-y-3">
                              <div className="flex justify-between text-[11px] font-black uppercase">
                                 <span className="text-slate-500">Espacio Utilizado</span>
                                 <span className="text-white">{node.usedSpace} GB / {node.totalSpace} GB</span>
                              </div>
                              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner">
                                 <div className="h-full bg-blue-600 shadow-[0_0_15px_#3b82f6]" style={{ width: `${(node.usedSpace/node.totalSpace)*100}%` }}></div>
                              </div>
                           </div>
                           <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                              <div className="flex items-center space-x-2 text-emerald-400">
                                 <Zap size={14} />
                                 <span className="text-[10px] font-black uppercase">IOPS: {node.iops}</span>
                              </div>
                              <button className="text-[9px] font-black text-blue-500 hover:underline uppercase tracking-widest">Config Mount</button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl relative overflow-hidden bg-slate-900/40">
                   <div className="flex items-center justify-between mb-12">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
                         <Activity className="mr-4 text-blue-500" />
                         Real-Time Throughput
                      </h3>
                      <div className="px-4 py-2 rounded-full bg-slate-950 border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest">Write Ops/sec</div>
                   </div>
                   <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={Array.from({length: 20}, (_, i) => ({v: 20 + Math.random()*60}))}>
                            <defs>
                               <linearGradient id="gradSt" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={4} fill="url(#gradSt)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>

             <div className="col-span-12 lg:col-span-4 space-y-8">
                <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col items-center">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight mb-10 w-full">Distribución por Nodo</h3>
                   <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={storageData} layout="vertical">
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} width={80} />
                            <Bar dataKey="val" radius={[0, 10, 10, 0]} barSize={24}>
                               {storageData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                            </Bar>
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                   <div className="space-y-4 w-full mt-8">
                      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase">Retention Compliance</span>
                            <CheckCircle2 size={16} className="text-emerald-500" />
                         </div>
                         <p className="text-xs text-slate-300 font-bold uppercase tracking-widest leading-relaxed">Todos los nodos operan bajo cifrado AES-256 en reposo.</p>
                      </div>
                   </div>
                </div>

                <div className="p-10 glass rounded-[56px] border border-rose-500/20 bg-rose-500/5 shadow-inner">
                   <div className="flex items-center space-x-6 mb-6">
                      <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                         <AlertCircle size={28} />
                      </div>
                      <h4 className="text-xl font-black text-white uppercase tracking-tight">Maintenance Engine</h4>
                   </div>
                   <p className="text-xs text-slate-400 font-medium uppercase tracking-widest leading-relaxed mb-10">Optimiza el almacenamiento eliminando archivos huérfanos o temporales no sincronizados.</p>
                   <button 
                    onClick={handlePurge}
                    disabled={isPurging}
                    className="w-full py-5 rounded-[24px] bg-slate-950 hover:bg-rose-900 text-rose-500 hover:text-white border-2 border-rose-500/20 transition-all font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center space-x-3"
                   >
                      {isPurging ? <RefreshCw className="animate-spin" size={18} /> : <Trash2 size={18} />}
                      <span>Lanzar Purga Manual</span>
                   </button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'EXPLORER' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
             <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="relative flex-1">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                   <input 
                    type="text" 
                    placeholder="Buscar por teléfono, agente o Call ID..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
                   />
                </div>
                <div className="flex space-x-3">
                   <button className="flex items-center space-x-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-8 py-5 rounded-[24px] transition-all"><Filter size={18} /> <span className="text-[10px] font-black uppercase">Filtros</span></button>
                   <button className="flex items-center space-x-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-8 py-5 rounded-[24px] transition-all"><FileText size={18} /> <span className="text-[10px] font-black uppercase">Reporte CSV</span></button>
                </div>
             </div>

             <div className="glass rounded-[56px] border border-slate-700/50 shadow-2xl overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                      <tr>
                         <th className="px-10 py-6">Timestamp / ID</th>
                         <th className="px-10 py-6">Operador / Campaña</th>
                         <th className="px-10 py-6 text-center">Destino</th>
                         <th className="px-10 py-6 text-center">IA Sentiment</th>
                         <th className="px-10 py-6 text-right">Acción</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-800/50">
                      {filteredRecordings.map(rec => (
                        <tr key={rec.id} className="hover:bg-blue-600/5 transition-all group cursor-pointer" onClick={() => setSelectedRec(rec)}>
                           <td className="px-10 py-8">
                              <div className="flex items-center space-x-5">
                                 <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 group-hover:text-blue-400 transition-colors`}>
                                    <Volume2 size={20} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-white uppercase tracking-tight">{rec.timestamp}</p>
                                    <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-widest">{rec.callId} • {rec.fileSize}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8">
                              <p className="text-xs font-black text-slate-300 uppercase tracking-tighter">{rec.agentName}</p>
                              <p className="text-[9px] text-blue-500 font-bold uppercase mt-1 tracking-widest">{rec.campaignName}</p>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <span className="font-mono text-sm font-black text-white underline decoration-slate-800 group-hover:decoration-blue-500/30 transition-all">{rec.customerPhone}</span>
                           </td>
                           <td className="px-10 py-8 text-center">
                              <div className="flex justify-center">
                                 <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase border flex items-center space-x-2 ${
                                   rec.sentiment === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                   rec.sentiment === 'NEGATIVE' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                                   'bg-slate-900 text-slate-500 border-slate-800'
                                 }`}>
                                    <Sparkles size={10} />
                                    <span>{rec.sentiment}</span>
                                 </div>
                              </div>
                           </td>
                           <td className="px-10 py-8 text-right">
                              <div className="flex items-center justify-end space-x-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                 <button className="p-3 bg-slate-900 hover:bg-blue-600 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"><Play size={16} fill="currentColor" /></button>
                                 <button className="p-3 bg-slate-900 hover:bg-emerald-600 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl"><Download size={16} /></button>
                              </div>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
                <div className="p-10 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-600">
                   <p>Mostrando {filteredRecordings.length} activos forenses.</p>
                   <div className="flex space-x-2">
                      <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"><ChevronRight size={18} className="rotate-180" /></button>
                      <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"><ChevronRight size={18} /></button>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'BACKUPS' && (
          <div className="space-y-8 animate-in slide-in-from-left-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Destino Local', val: 'NAS_CLUSTER_01', icon: HardDrive, col: 'blue' },
                  { label: 'Destino Cloud', val: 'AWS_S3_GLACIER', icon: Cloud, col: 'indigo' },
                  { label: 'Frecuencia', val: 'Diario 02:00 AM', icon: Clock, col: 'emerald' },
                  { label: 'Última Carga', val: 'Hace 4h', icon: Save, col: 'amber' },
                ].map((k, i) => (
                  <div key={i} className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-xl flex flex-col justify-between group">
                     <div className={`p-3 rounded-2xl bg-${k.col}-600/10 text-${k.col}-400 w-fit mb-6 border border-white/5`}>
                        <k.icon size={20} />
                     </div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">{k.val}</h3>
                     <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{k.label}</p>
                  </div>
                ))}
             </div>

             <div className="glass rounded-[56px] border border-slate-700/50 overflow-hidden shadow-2xl">
                <div className="p-10 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center">
                      <Layers size={24} className="mr-3 text-blue-500" /> Historial de Jobs de Backup
                   </h3>
                   <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Scheduler Active</span>
                   </div>
                </div>
                <div className="overflow-x-auto scrollbar-hide">
                   <table className="w-full text-left">
                      <thead className="bg-slate-950/60 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                         <tr>
                            <th className="px-10 py-6">ID / Timestamp</th>
                            <th className="px-10 py-6">Destino</th>
                            <th className="px-10 py-6 text-center">Tipo / Peso</th>
                            <th className="px-10 py-6 text-center">Estado</th>
                            <th className="px-10 py-6 text-right">Forense</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                         {MOCK_BACKUP_JOBS.map(job => (
                           <tr key={job.id} className="hover:bg-blue-600/5 transition-all group">
                              <td className="px-10 py-8">
                                 <p className="text-sm font-black text-white uppercase tracking-tight">{job.timestamp}</p>
                                 <p className="text-[9px] font-mono text-slate-600 mt-1 uppercase tracking-widest">{job.id}</p>
                              </td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center space-x-3">
                                    <Cloud size={14} className="text-blue-500" />
                                    <span className="text-xs font-black text-slate-300 uppercase">{job.destination}</span>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-center">
                                 <p className="text-xs font-black text-white">{job.size}</p>
                                 <span className="text-[9px] text-slate-600 font-bold uppercase">{job.type}</span>
                              </td>
                              <td className="px-10 py-8 text-center">
                                 <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${
                                   job.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                   job.status === 'FAILED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                                   'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                 }`}>
                                    {job.status}
                                 </span>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <button className="p-3 bg-slate-900 border border-slate-800 text-slate-500 hover:text-white rounded-xl transition-all shadow-xl opacity-0 group-hover:opacity-100">
                                    <Terminal size={18} />
                                 </button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'CONFIG' && (
          <div className="max-w-5xl space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl space-y-12">
                <div className="flex items-center space-x-8">
                   <div className="w-20 h-20 rounded-[32px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Shield size={36} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Políticas de Retención Core</h3>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Lógica Automatizada de Ciclo de Vida de Medios</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-6 shadow-inner">
                         <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Días en Hot Storage</label>
                            <span className="text-xl font-black text-blue-400 font-mono">90 Días</span>
                         </div>
                         <input type="range" min="30" max="365" step="30" defaultValue="90" className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                         <p className="text-[9px] text-slate-600 font-bold leading-relaxed uppercase">Tras este periodo, los audios se comprimirán a GSM y se moverán al clúster de Archivo.</p>
                      </div>
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-6 shadow-inner">
                         <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-white uppercase tracking-widest">Cifrado de Capas</h4>
                            <ShieldCheck size={20} className="text-emerald-500" />
                         </div>
                         <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                            <span className="text-[10px] font-black text-slate-500 uppercase">AES-256 Enabled</span>
                            <button className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b border-slate-800 pb-3 flex items-center">
                         <Cloud size={16} className="mr-2" /> Remote Storage Mounts
                      </h4>
                      <div className="space-y-3">
                         {['S3_MIAMI_REPLICA', 'LOCAL_NAS_BACKUP'].map(mount => (
                           <div key={mount} className="p-5 bg-slate-950 border border-slate-800 rounded-3xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                              <div className="flex items-center space-x-4">
                                 <ExternalLink size={16} className="text-slate-600" />
                                 <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{mount}</span>
                              </div>
                              <div className="flex space-x-1">
                                 <button className="p-2 text-slate-700 hover:text-white"><Settings size={14} /></button>
                                 <button className="p-2 text-slate-700 hover:text-rose-500"><X size={14} /></button>
                              </div>
                           </div>
                         ))}
                         <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-3xl text-[10px] font-black text-slate-700 hover:text-blue-500 uppercase tracking-widest transition-all">Montar Nueva Unidad</button>
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex justify-end">
                   <button className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95">Guardar Lógica de Purga</button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Floating Audio Player Context (Cuando se selecciona una grabación) */}
      {selectedRec && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl z-[150] px-6 animate-in slide-in-from-bottom-10 duration-500">
           <div className="glass p-8 rounded-[48px] border-2 border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)] bg-[#020617]/95 flex items-center space-x-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
              
              <div className="flex items-center space-x-6 relative z-10">
                 <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-2xl">
                    <Volume2 size={32} />
                 </div>
                 <div className="min-w-0">
                    <h4 className="text-white font-black uppercase text-lg truncate tracking-tighter">{selectedRec.customerPhone}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedRec.agentName} • {selectedRec.timestamp}</p>
                 </div>
              </div>

              <div className="flex-1 flex flex-col space-y-4 relative z-10">
                 <div className="flex items-center space-x-6">
                    <button className="p-4 rounded-2xl bg-blue-600 text-white shadow-lg active:scale-90 transition-all"><Play size={24} fill="currentColor" /></button>
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                       <div className="absolute h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{ width: '45%' }}></div>
                    </div>
                    <span className="text-[10px] font-mono font-black text-slate-500">01:45 / 03:20</span>
                 </div>
                 <div className="flex space-x-4 items-center px-2">
                    <div className="flex items-center space-x-2 text-purple-400">
                       <Sparkles size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Sentiment: {selectedRec.sentiment}</span>
                    </div>
                    <div className="h-3 w-px bg-slate-800"></div>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Call ID: {selectedRec.callId}</span>
                 </div>
              </div>

              <div className="flex items-center space-x-4 relative z-10 pl-10 border-l border-slate-800">
                 <button className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white border border-slate-800 transition-all shadow-lg active:scale-95"><Download size={20} /></button>
                 <button onClick={() => setSelectedRec(null)} className="p-4 rounded-2xl bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 border border-slate-800 transition-all shadow-lg active:scale-95"><X size={20} /></button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StorageServer;
