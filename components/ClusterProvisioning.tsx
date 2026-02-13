import React, { useState, useEffect } from 'react';
import { 
  Server, Plus, Trash2, Edit2, ShieldCheck, RefreshCw, Globe, Key, 
  Activity, Zap, Info, CheckCircle2, Terminal, Network, X, Save,
  Cpu, Database, Shield, Layers, HardDrive, Smartphone, Radio, 
  Search, GitBranch, Cloud, Power, Signal, ChevronRight, ArrowRight,
  Wifi, ShieldAlert, ZapOff, CheckCircle,
  // Added missing Clock import
  Clock
} from 'lucide-react';
import { ClusterNode, NodeRole, SyncStatus } from '../types';
import { useToast } from '../ToastContext';
import Logo from './Logo';

const ClusterProvisioning: React.FC = () => {
  const { toast } = useToast();
  
  // Estado de los nodos con metadatos de sincronización
  const [nodes, setNodes] = useState<(ClusterNode & { syncProgress: number, isSyncing: boolean })[]>([
    { id: 'n1', name: 'Master Titan-01', ip: '10.0.0.10', role: 'MASTER', status: 'ONLINE', cpu: 12, mem: 4.5, channels: 1500, threads: 450, dbLatency: 1, lastSync: 'Hoy 10:20 AM', syncProgress: 100, isSyncing: false },
    { id: 'n2', name: 'Media SIP-West', ip: '10.0.0.42', role: 'MEDIA', status: 'ONLINE', cpu: 22, mem: 8.1, channels: 840, threads: 890, dbLatency: 4, lastSync: 'Hoy 09:15 AM', syncProgress: 100, isSyncing: false },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNode, setNewNode] = useState<Partial<ClusterNode>>({
    name: '',
    ip: '',
    role: 'MEDIA',
    sshPort: 22,
  });

  const [isGlobalSyncing, setIsGlobalSyncing] = useState(false);

  // Efecto de telemetría (Ping simulado)
  useEffect(() => {
    const interval = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...prev.find(x => x.id === n.id)!,
        dbLatency: Math.max(1, n.dbLatency + (Math.random() > 0.5 ? 1 : -1)),
        cpu: Math.max(2, Math.min(95, n.cpu + (Math.random() > 0.5 ? 2 : -2)))
      } as any)));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleAddServer = async () => {
    if (!newNode.name || !newNode.ip) {
      toast('Alias e IP son obligatorios.', 'error');
      return;
    }

    const node: any = {
      id: `n_${Math.random().toString(36).substr(2, 5)}`,
      name: newNode.name,
      ip: newNode.ip,
      role: newNode.role as NodeRole,
      status: 'PROVISIONING',
      cpu: 0,
      mem: 0,
      channels: 0,
      threads: 0,
      dbLatency: 0,
      sshPort: newNode.sshPort,
      syncProgress: 0,
      isSyncing: true
    };

    setNodes([...nodes, node]);
    setIsModalOpen(false);
    setNewNode({ name: '', ip: '', role: 'MEDIA', sshPort: 22 });
    
    toast(`Inyectando Titan Engine en ${node.name}...`, 'info', 'Titan Forge');
    
    // Simular pasos de aprovisionamiento
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(r => setTimeout(r, 800));
      setNodes(prev => prev.map(n => n.id === node.id ? { ...n, syncProgress: i } : n));
    }
    
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'ONLINE', cpu: 5, mem: 1.2, threads: 120, isSyncing: false, lastSync: 'Recién provisionado' } : n));
    toast(`Servidor ${node.name} activo y sincronizado.`, 'success');
  };

  const handleSyncNode = async (nodeId: string) => {
    toast('Iniciando sincronización atómica de DialPlan...', 'info');
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, isSyncing: true, syncProgress: 0 } : n));
    
    for (let i = 0; i <= 100; i += 25) {
      await new Promise(r => setTimeout(r, 500));
      setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, syncProgress: i } : n));
    }

    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, isSyncing: false, lastSync: 'Ahora mismo' } : n));
    toast('Nodo sincronizado con el Master.', 'success');
  };

  const handleGlobalSync = async () => {
    setIsGlobalSyncing(true);
    toast('Propagando configuraciones globales a todos los nodos...', 'warning', 'Titan Cloud Sync');
    
    const syncPromises = nodes.map(n => handleSyncNode(n.id));
    await Promise.all(syncPromises);
    
    setIsGlobalSyncing(false);
    toast('Clúster sincronizado globalmente.', 'success');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 rounded-[28px] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30">
              <Layers size={32} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                Orquestador Titan
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-2 uppercase tracking-widest opacity-60">Control de Topología v5.1.5</p>
           </div>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={handleGlobalSync}
             disabled={isGlobalSyncing}
             className="flex items-center space-x-3 px-8 py-4 rounded-[28px] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 border-2 bg-slate-900 border-slate-800 text-blue-400 hover:border-blue-500/50 disabled:opacity-50"
           >
             {isGlobalSyncing ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
             <span>{isGlobalSyncing ? 'Sincronizando Todo...' : 'Sincronización Global'}</span>
           </button>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center group"
           >
             <Plus size={22} className="mr-2 group-hover:rotate-90 transition-transform" />
             Añadir Servidor
           </button>
        </div>
      </div>

      {/* NODES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {nodes.map(node => (
          <div key={node.id} className={`glass p-10 rounded-[64px] border-2 transition-all relative overflow-hidden group ${node.isSyncing ? 'border-blue-500/50 bg-blue-500/5 shadow-blue-500/10' : 'border-slate-800 hover:border-blue-500/30 shadow-2xl'}`}>
             
             {/* Progress Bar Overlay for Sync */}
             {node.isSyncing && (
                <div className="absolute bottom-0 left-0 h-1.5 bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all duration-500" style={{ width: `${node.syncProgress}%` }}></div>
             )}

             <div className="flex justify-between items-start mb-10">
                <div className="flex items-center space-x-6">
                   <div className={`p-4 rounded-[24px] shadow-lg border border-white/5 transition-transform group-hover:scale-110 ${node.role === 'MASTER' ? 'bg-blue-600 text-white' : node.role === 'MEDIA' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'}`}>
                      {node.role === 'MASTER' ? <Globe size={28} /> : node.role === 'MEDIA' ? <Radio size={28} /> : <Database size={28} />}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{node.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                         <div className={`w-2 h-2 rounded-full ${node.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : node.status === 'PROVISIONING' ? 'bg-amber-500 animate-spin' : 'bg-slate-700'}`}></div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{node.role} • {node.status}</span>
                      </div>
                   </div>
                </div>
                <div className="flex space-x-1">
                   <button 
                    onClick={() => handleSyncNode(node.id)}
                    className={`p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-blue-400 transition-all ${node.isSyncing ? 'animate-spin text-blue-400' : ''}`}
                   >
                     <RefreshCw size={16} />
                   </button>
                   <button onClick={() => setNodes(nodes.filter(n => n.id !== node.id))} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 transition-all">
                     <Trash2 size={16} />
                   </button>
                </div>
             </div>

             <div className="p-6 bg-slate-950/60 rounded-[40px] border border-slate-900 space-y-8 shadow-inner mb-8">
                <div className="flex justify-between items-center px-2">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Host IP</span>
                      <span className="text-sm font-mono font-black text-blue-400">{node.ip}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Latencia DB</span>
                      <span className={`text-sm font-mono font-black ${node.dbLatency > 5 ? 'text-amber-400' : 'text-emerald-400'}`}>{node.dbLatency}ms</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase">
                         <span>CPU LOAD</span>
                         <span className="text-white">{node.cpu}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                         <div className={`h-full transition-all duration-700 ${node.cpu > 80 ? 'bg-rose-500' : 'bg-blue-500'}`} style={{ width: `${node.cpu}%` }}></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase">
                         <span>THREADS</span>
                         <span className="text-white">{node.threads}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                         <div className="h-full bg-indigo-500" style={{ width: `${(node.threads / 1000) * 100}%` }}></div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div className="flex items-center space-x-2">
                   {/* Added missing Clock import */}
                   <Clock size={12} className="text-slate-600" />
                   <span className="text-[9px] font-black text-slate-600 uppercase">Sync: {node.lastSync}</span>
                </div>
                <button className="text-[10px] font-black text-blue-500 hover:text-white uppercase tracking-widest flex items-center group/btn">
                   Terminal <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        ))}

        {/* ADD NODE PLACEHOLDER */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="glass rounded-[64px] border-4 border-dashed border-slate-800 p-12 flex flex-col items-center justify-center text-center opacity-30 hover:opacity-100 hover:border-blue-500/30 transition-all cursor-pointer group bg-slate-900/10"
        >
           <div className="w-24 h-24 rounded-[32px] bg-slate-800 flex items-center justify-center text-slate-600 group-hover:scale-110 group-hover:text-blue-500 transition-all shadow-inner mb-6">
              <Plus size={48} />
           </div>
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Expandir Clúster</h3>
           <p className="text-sm font-bold text-slate-500 mt-2 max-w-[250px] leading-relaxed">Inyecta un nuevo servidor a la infraestructura en caliente.</p>
        </div>
      </div>

      {/* FOOTER SYSTEM HEALTH */}
      <div className="p-10 glass rounded-[56px] border border-emerald-500/20 bg-emerald-500/5 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 text-emerald-400 group-hover:scale-110 transition-transform duration-1000">
            <Shield size={300} />
         </div>
         <div className="flex items-center space-x-8 relative z-10">
            <div className="p-6 rounded-[32px] bg-emerald-600 flex items-center justify-center text-white shadow-2xl animate-pulse">
               <ShieldCheck size={40} />
            </div>
            <div>
               <h4 className="text-2xl font-black text-white uppercase tracking-tight">Capa de Sincronización Titan v5.1</h4>
               <p className="text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed font-medium uppercase tracking-wider">
                  El protocolo de clúster garantiza que cada cambio en el Master se propague a los nodos esclavos en menos de <span className="text-emerald-400 font-black">500ms</span>. Todos los servicios de red están <span className="text-emerald-400 font-black">NOMINALES</span>.
               </p>
            </div>
         </div>
      </div>

      {/* MODAL: ADD SERVER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
              <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0 shadow-lg">
                 <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                       <Server size={32} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Expand Topology</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Inyección de Nodo Remoto</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl"><X size={24} /></button>
              </div>

              <div className="p-12 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Alias del Servidor</label>
                    <input 
                      type="text" 
                      value={newNode.name} 
                      onChange={e => setNewNode({...newNode, name: e.target.value})} 
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner" 
                      placeholder="Ej: Media-Node-Brazil-01" 
                    />
                 </div>

                 <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Dirección IP (Pública/VPC)</label>
                       <div className="relative group">
                          <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                          <input 
                            type="text" 
                            value={newNode.ip} 
                            onChange={e => setNewNode({...newNode, ip: e.target.value})} 
                            className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm font-mono text-blue-400 font-black outline-none focus:border-blue-500 transition-all shadow-inner" 
                            placeholder="0.0.0.0" 
                          />
                       </div>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">SSH Port</label>
                       <input 
                        type="number" 
                        value={newNode.sshPort} 
                        onChange={e => setNewNode({...newNode, sshPort: parseInt(e.target.value)})} 
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm font-mono text-white text-center outline-none focus:border-blue-500 transition-all shadow-inner" 
                       />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] ml-2">Rol Operativo del Nodo</label>
                    <div className="grid grid-cols-3 gap-4">
                       {[
                         { id: 'MEDIA', icon: Radio, label: 'Media Plane (SIP)' },
                         { id: 'DATABASE', icon: Database, label: 'Data Plane (SQL)' },
                         { id: 'AI_BRIDGE', icon: Zap, label: 'Neural AI Node' },
                       ].map(role => (
                         <button 
                           key={role.id}
                           onClick={() => setNewNode({...newNode, role: role.id as NodeRole})}
                           className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center justify-center space-y-4 ${newNode.role === role.id ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                         >
                            <role.icon size={24} />
                            <span className="text-[8px] font-black uppercase tracking-widest text-center">{role.label}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-8 shadow-2xl shrink-0">
                 <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span>Inyección Vía SSH-Key (Titan Protocol)</span>
                 </div>
                 <button 
                   onClick={handleAddServer} 
                   className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center space-x-4 group"
                 >
                    <span>Lanzar Nodo</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ClusterProvisioning;