
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, Lock, FileText, Search, Filter, AlertTriangle, CheckCircle, 
  Fingerprint, Activity, Clock, User, HardDrive, Download, Trash2, 
  ExternalLink, Info, ShieldCheck, RefreshCw, Terminal, Eye, Database, 
  Cpu, ChevronRight, X, AlertCircle, ShieldAlert, Globe, Layers, Copy
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { AuditLog } from '../types';

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'L001',
    timestamp: '2024-11-21 14:05:22',
    // Fix: Satisfaction of AuditLog interface with userId
    userId: 'usr_1',
    userName: 'Admin Cuberbox',
    action: 'Cambio de Configuración SIP Trunk',
    module: 'TELEPHONY_CORE',
    ip: '192.168.1.45',
    level: 'INFO',
    status: 'SUCCESS',
    integrityHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    details: 'Se actualizó el host del carrier Voxbone de vox-eu.sip.com a vox-global.sip.com'
  },
  {
    id: 'L002',
    timestamp: '2024-11-21 14:10:05',
    // Fix: Satisfaction of AuditLog interface with userId
    userId: 'usr_1',
    userName: 'Admin Cuberbox',
    action: 'Intento Fallido de Login (MFA)',
    module: 'AUTH_GATEWAY',
    ip: '102.34.12.8',
    level: 'SECURITY',
    status: 'FAILURE',
    integrityHash: '5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9',
    details: 'Código de token incorrecto ingresado 3 veces consecutivas.'
  },
  {
    id: 'L003',
    timestamp: '2024-11-21 14:15:30',
    // Fix: Satisfaction of AuditLog interface with userId
    userId: 'usr_4',
    userName: 'Carla Mendez',
    action: 'Exportación de Listas de Leads',
    module: 'DATA_MANAGEMENT',
    ip: '192.168.1.112',
    level: 'WARN',
    status: 'SUCCESS',
    integrityHash: '6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b',
    details: 'Descarga masiva de 12,000 registros de la lista "Real Estate Florida".'
  },
  {
    id: 'L004',
    timestamp: '2024-11-21 14:22:12',
    // Fix: Satisfaction of AuditLog interface with userId
    userId: 'SYSTEM',
    userName: 'FreeSwitch Engine',
    action: 'Reinicio de Proceso sofia.c',
    module: 'SYSTEM_CORE',
    ip: '127.0.0.1',
    level: 'CRITICAL',
    status: 'SUCCESS',
    integrityHash: 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35',
    details: 'Memory leak detectado en socket layer. Auto-reinicio completado en 1.2s.'
  }
];

const activityData = [
  { time: '10:00', logs: 45, security: 2 },
  { time: '11:00', logs: 52, security: 1 },
  { time: '12:00', logs: 89, security: 5 },
  { time: '13:00', logs: 34, security: 0 },
  { time: '14:00', logs: 76, security: 3 },
  { time: '15:00', logs: 65, security: 1 },
];

const SystemAudit: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.userName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, levelFilter]);

  const runIntegrityCheck = async () => {
    setIsVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsVerifying(false);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-600 text-white shadow-rose-600/20';
      case 'SECURITY': return 'bg-amber-600 text-white shadow-amber-600/20';
      case 'WARN': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header Forense */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Shield className="mr-4 text-blue-400" size={36} />
            Auditoría & Blindaje
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Trazabilidad total de eventos del sistema con verificación SHA-256.</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
            onClick={runIntegrityCheck}
            disabled={isVerifying}
            className="flex items-center space-x-3 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 text-slate-300 px-6 py-3 rounded-2xl transition-all shadow-xl active:scale-95"
           >
             {isVerifying ? <RefreshCw className="animate-spin" size={18} /> : <Fingerprint size={18} className="text-emerald-400" />}
             <span className="text-[10px] font-black uppercase tracking-widest">{isVerifying ? 'Verificando Hash...' : 'Integrity Check'}</span>
           </button>
           <button className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/30 active:scale-95 group">
             <Download size={20} className="group-hover:translate-y-0.5 transition-transform" />
             <span className="font-black text-xs uppercase tracking-widest">Exportar Forense</span>
           </button>
        </div>
      </div>

      {/* KPI Dashboard Auditoría */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                  <Activity size={24} />
               </div>
               <span className="text-[10px] font-black text-emerald-400">+12%</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Eventos 24h</p>
               <h3 className="text-3xl font-black text-white mt-1">1,248</h3>
            </div>
         </div>
         <div className="glass p-8 rounded-[40px] border border-rose-500/20 bg-rose-500/5 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                  <ShieldAlert size={24} />
               </div>
               <span className="text-[10px] font-black text-rose-400">ALERT</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alertas Seguridad</p>
               <h3 className="text-3xl font-black text-white mt-1">4</h3>
            </div>
         </div>
         <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Lock size={24} />
               </div>
               <span className="text-[10px] font-black text-emerald-400">ENCRYPTED</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logs Cifrados</p>
               <h3 className="text-3xl font-black text-white mt-1">100%</h3>
            </div>
         </div>
         <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                  <HardDrive size={24} />
               </div>
               <span className="text-[10px] font-black text-slate-500">7.2 GB</span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Log Retention</p>
               <h3 className="text-3xl font-black text-white mt-1">90 Días</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Tabla de Logs Blindados */}
        <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
           <div className="glass p-8 rounded-[48px] border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                 <div className="relative flex-1">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="text" 
                      placeholder="Filtrar por acción, usuario o IP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-[20px] pl-14 pr-6 py-4 text-xs text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                 </div>
                 <div className="flex space-x-2">
                    {['ALL', 'INFO', 'WARN', 'SECURITY', 'CRITICAL'].map(lvl => (
                      <button 
                        key={lvl}
                        onClick={() => setLevelFilter(lvl)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${levelFilter === lvl ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-800 text-slate-500 hover:text-slate-300'}`}
                      >
                        {lvl}
                      </button>
                    ))}
                 </div>
              </div>

              <div className="overflow-x-auto scrollbar-hide">
                 <table className="w-full text-left">
                    <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                       <tr>
                          <th className="px-8 py-5">Integrity / Hash</th>
                          <th className="px-8 py-5">Evento</th>
                          <th className="px-8 py-5">Usuario / IP</th>
                          <th className="px-8 py-5 text-right">Acción</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                       {filteredLogs.map((log) => (
                         <tr 
                          key={log.id} 
                          onClick={() => setSelectedLog(log)}
                          className="hover:bg-blue-600/5 transition-all group cursor-pointer"
                         >
                            <td className="px-8 py-6">
                               <div className="flex items-center space-x-4">
                                  <div className={`p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
                                     <ShieldCheck size={16} />
                                  </div>
                                  <div>
                                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-tighter">{log.id}</p>
                                     <p className="text-[8px] font-mono text-slate-600 truncate w-32 tracking-widest">{log.integrityHash}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase w-fit mb-2 ${getLevelColor(log.level)}`}>
                                  {log.level}
                               </div>
                               <p className="text-sm font-black text-white uppercase tracking-tight">{log.action}</p>
                               <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{log.timestamp}</p>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-xs font-black text-slate-300 uppercase tracking-tight">{log.userName}</p>
                               <div className="flex items-center text-[9px] text-blue-500 font-bold uppercase mt-1">
                                  <Globe size={10} className="mr-1.5" /> {log.ip}
                               </div>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button className="p-3 bg-slate-800 hover:bg-blue-600 rounded-2xl text-slate-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl">
                                  <Eye size={18} />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-8 bg-slate-900/40 border-t border-slate-800 flex items-center justify-between">
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                   Mostrando {filteredLogs.length} registros de auditoría de un total de {logs.length}.
                 </p>
                 <div className="flex space-x-2">
                    <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 hover:text-white transition-all"><ChevronRight size={18} className="rotate-180" /></button>
                    <button className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-500 hover:text-white transition-all"><ChevronRight size={18} /></button>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar: Salud e Integridad */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass p-10 rounded-[64px] border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden">
              <h3 className="text-xl font-black mb-8 flex items-center tracking-tight text-white uppercase">
                 <RefreshCw className="mr-4 text-emerald-500" size={24} />
                 Estado de Integridad
              </h3>

              <div className="space-y-6">
                 <div className="p-6 rounded-[32px] bg-emerald-500/5 border border-emerald-500/20 flex items-center space-x-5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner">
                       <ShieldCheck size={28} />
                    </div>
                    <div>
                       <h4 className="text-xs font-black text-white uppercase tracking-widest">Log Block-Shield</h4>
                       <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest mt-1">Activo y Verificado</p>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-950 rounded-[40px] border border-slate-900 space-y-8 shadow-inner">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actividad de Logs</h4>
                       <Terminal size={14} className="text-blue-500" />
                    </div>
                    <div className="h-40">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={activityData}>
                             <defs>
                                <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <Area type="monotone" dataKey="logs" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorLogs)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 space-y-4 shadow-inner">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Consumo Storage Auditoría</h4>
                    <div className="flex justify-between items-center text-xs font-black text-white uppercase tracking-tighter mb-2">
                       <span>Database Usage</span>
                       <span className="text-blue-400">65%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-blue-600 shadow-[0_0_10px_#3b82f6]" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-4">Próxima rotación automática: <span className="text-slate-400">24 de Noviembre</span></p>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Modal de Detalle Forense */}
      {selectedLog && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedLog(null)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[28px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <FileText size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Análisis Forense de Evento</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Log ID: {selectedLog.id}</p>
                   </div>
                </div>
                <button onClick={() => setSelectedLog(null)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl">
                   <X size={24} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-12 space-y-12 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <div className="space-y-4">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-3 flex items-center">
                            <Clock size={16} className="mr-2" /> Cronología
                         </h4>
                         <p className="text-2xl font-black text-white uppercase tracking-tighter">{selectedLog.timestamp}</p>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-3 flex items-center">
                            <User size={16} className="mr-2" /> Atribución
                         </h4>
                         <p className="text-xl font-black text-white uppercase tracking-tight">{selectedLog.userName}</p>
                         <p className="text-sm font-mono text-slate-500 font-bold uppercase tracking-widest">{selectedLog.ip}</p>
                      </div>
                   </div>

                   <div className="space-y-10">
                      <div className="space-y-4">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-3 flex items-center">
                            <Layers size={16} className="mr-2" /> Módulo de Origen
                         </h4>
                         <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl w-fit">
                            <span className="text-xs font-black text-slate-300 uppercase tracking-widest">{selectedLog.module}</span>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-3 flex items-center">
                            {/* replaced LockIcon with standard Lock icon from lucide-react */}
                            <Lock size={16} className="mr-2" /> Estado de Ejecución
                         </h4>
                         <div className={`px-4 py-2 rounded-xl w-fit flex items-center space-x-2 border ${selectedLog.status === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                            {selectedLog.status === 'SUCCESS' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{selectedLog.status}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-3">Detalle del Registro</h4>
                   <div className="p-8 bg-slate-950 rounded-[40px] border border-slate-900 shadow-inner">
                      <p className="text-lg text-slate-300 font-medium leading-relaxed italic">"{selectedLog.details}"</p>
                   </div>
                </div>

                <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-4 shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 text-blue-500 pointer-events-none group-hover:scale-110 transition-transform">
                      <Fingerprint size={120} />
                   </div>
                   <div className="flex items-center space-x-3 mb-2">
                      <Fingerprint className="text-emerald-500" size={20} />
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Sello de Integridad Forense</h4>
                   </div>
                   <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider max-w-2xl">
                      Este registro ha sido sellado criptográficamente en el momento de su creación. Cualquier alteración manual en la base de datos romperá la cadena de confianza.
                   </p>
                   <div className="p-5 bg-black/40 rounded-2xl border border-slate-800 flex items-center justify-between group/hash">
                      <code className="text-[11px] font-mono text-emerald-400 break-all">{selectedLog.integrityHash}</code>
                      <button className="p-2 text-slate-600 hover:text-white transition-colors"><Copy size={16} /></button>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center">
                <button 
                  onClick={() => setSelectedLog(null)}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center space-x-3"
                >
                   <ShieldCheck size={20} />
                   <span>Validar & Cerrar</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemAudit;
