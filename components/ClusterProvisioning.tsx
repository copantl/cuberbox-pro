import React, { useState, useEffect } from 'react';
import { 
  Server, Plus, Trash2, Edit2, ShieldCheck, RefreshCw, Globe, Key, 
  Activity, Zap, Info, CheckCircle2, Terminal, Network, X, Save,
  Cpu, Database, Shield, Layers, HardDrive, Smartphone, Radio, 
  Search, GitBranch, Cloud, Power, Signal,
  // Added missing imports to fix errors on lines 190 and 321
  ChevronRight, ArrowRight
} from 'lucide-react';
import { ClusterNode, NodeRole, SyncStatus } from '../types';
import { useToast } from '../ToastContext';
import Logo from './Logo';

const ClusterProvisioning: React.FC = () => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<ClusterNode[]>([
    { id: 'n1', name: 'Master Titan-01', ip: '10.0.0.10', role: 'MASTER', status: 'ONLINE', cpu: 12, mem: 4.5, channels: 1500, threads: 450, dbLatency: 1, lastSync: 'Ahora' },
    { id: 'n2', name: 'Media SIP-West', ip: '10.0.0.42', role: 'MEDIA', status: 'ONLINE', cpu: 22, mem: 8.1, channels: 840, threads: 890, dbLatency: 4, lastSync: 'Hace 5m' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNode, setNewNode] = useState<Partial<ClusterNode>>({
    name: '',
    ip: '',
    role: 'MEDIA',
    sshPort: 22,
  });

  const [isSyncingGlobal, setIsSyncingGlobal] = useState<SyncStatus>('IDLE');
  const [provisioningNodeId, setProvisioningNodeId] = useState<string | null>(null);

  const handleAddServer = async () => {
    if (!newNode.name || !newNode.ip) {
      toast('Alias e IP son obligatorios.', 'error');
      return;
    }

    const node: ClusterNode = {
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
      sshPort: newNode.sshPort
    };

    setNodes([...nodes, node]);
    setIsModalOpen(false);
    setNewNode({ name: '', ip: '', role: 'MEDIA', sshPort: 22 });
    
    // Iniciar secuencia de aprovisionamiento
    setProvisioningNodeId(node.id);
    toast(`Iniciando despliegue de TITAN v5.1 en ${node.name}...`, 'info', 'Auto-Provisioning');
    
    await new Promise(r => setTimeout(r, 4000));
    
    setNodes(prev => prev.map(n => n.id === node.id ? { ...n, status: 'ONLINE', cpu: 4, mem: 1.2, threads: 120 } : n));
    setProvisioningNodeId(null);
    toast(`Servidor ${node.name} provisionado y enlazado al clúster.`, 'success');
  };

  const handleGlobalSync = async () => {
    setIsSyncingGlobal('SYNCING');
    toast('Propagando configuraciones DialPlan y DB a todos los nodos...', 'info', 'Titan Sync');
    
    await new Promise(r => setTimeout(r, 3000));
    
    setIsSyncingGlobal('SUCCESS');
    setNodes(prev => prev.map(n => ({ ...n, lastSync: 'Ahora' })));
    toast('Clúster sincronizado globalmente.', 'success');
    
    setTimeout(() => setIsSyncingGlobal('IDLE'), 2000);
  };

  const handleDeleteNode = (id: string) => {
    if (confirm('¿Deseas desvincular este servidor del clúster? El tráfico será redirigido.')) {
      setNodes(nodes.filter(n => n.id !== id));
      toast('Servidor removido de la topología.', 'warning');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* HEADER TÁCTICO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center">
            <Layers className="mr-4 text-blue-500" size={36} />
            Orquestador Elástico
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-widest opacity-60">Gestión de Topología y Aprovisionamiento Global</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={handleGlobalSync}
             disabled={isSyncingGlobal === 'SYNCING'}
             className={`flex items-center space-x-3 px-8 py-4 rounded-[28px] font-black text-[11px] uppercase tracking-widest transition-all shadow-xl active:scale-95 border-2 ${isSyncingGlobal === 'SUCCESS' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-blue-400 hover:border-blue-500/50'}`}
           >
             {isSyncingGlobal === 'SYNCING' ? <RefreshCw className="animate-spin" size={18} /> : isSyncingGlobal === 'SUCCESS' ? <CheckCircle2 size={18} /> : <Zap size={18} />}
             <span>{isSyncingGlobal === 'SYNCING' ? 'Sincronizando Nodos...' : isSyncingGlobal === 'SUCCESS' ? 'Sync Completado' : 'Propagar Configuración'}</span>
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
          <div key={node.id} className={`glass p-10 rounded-[64px] border-2 transition-all relative overflow-hidden group ${node.status === 'PROVISIONING' ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 hover:border-blue-500/30 shadow-2xl'}`}>
             
             {node.status === 'PROVISIONING' && (
                <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center p-8">
                   <div className="relative">
                      <div className="w-20 h-20 border-4 border-amber-500/10 border-t-amber-500 rounded-full animate-spin"></div>
                      <Terminal size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber-400 animate-pulse" />
                   </div>
                   <h4 className="text-xl font-black text-white uppercase tracking-widest">Provisioning...</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Inyectando Titan Core v5.1</p>
                </div>
             )}

             <div className="flex justify-between items-start mb-10">
                <div className="flex items-center space-x-6">
                   <div className={`p-4 rounded-[24px] shadow-lg border border-white/5 transition-transform group-hover:scale-110 ${node.role === 'MASTER' ? 'bg-blue-600 text-white' : node.role === 'MEDIA' ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'}`}>
                      {node.role === 'MASTER' ? <Globe size={28} /> : node.role === 'MEDIA' ? <Radio size={28} /> : <Database size={28} />}
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{node.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                         <div className={`w-2 h-2 rounded-full ${node.status === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`}></div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{node.role} • {node.status}</span>
                      </div>
                   </div>
                </div>
                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                   <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-all"><Edit2 size={16} /></button>
                   <button onClick={() => handleDeleteNode(node.id)} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                </div>
             </div>

             <div className="p-6 bg-slate-950/60 rounded-[40px] border border-slate-900 space-y-8 shadow-inner mb-8">
                <div className="flex justify-between items-center px-2">
                   <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Host / Interface</span>
                      <span className="text-sm font-mono font-black text-blue-400">{node.ip}</span>
                   </div>
                   <div className="flex flex-col text-right">
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Uptime</span>
                      <span className="text-sm font-mono font-black text-white">14d 08h</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase">
                         <span>CPU LOAD</span>
                         <span className="text-white">{node.cpu}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                         <div className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" style={{ width: `${node.cpu}%` }}></div>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase">
                         <span>SIP CHANNELS</span>
                         <span className="text-white">{node.channels}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                         <div className="h-full bg-emerald-500" style={{ width: `${(node.channels / 2000) * 100}%` }}></div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                <div className="flex items-center space-x-3 text-[9px] font-black text-slate-600 uppercase">
                   <RefreshCw size={12} className="text-emerald-500" />
                   <span>Last Sync: {node.lastSync}</span>
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

      {/* FOOTER INFO */}
      <div className="p-10 glass rounded-[56px] border border-blue-500/20 bg-blue-600/5 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-400 group-hover:scale-110 transition-transform duration-1000">
            <Network size={300} />
         </div>
         <div className="flex items-center space-x-8 relative z-10">
            <div className="p-6 rounded-[32px] bg-blue-600 flex items-center justify-center text-white shadow-2xl animate-pulse">
               <ShieldCheck size={40} />
            </div>
            <div>
               <h4 className="text-2xl font-black text-white uppercase tracking-tight">Capa de Sincronización Global v5.1</h4>
               <p className="text-sm text-slate-400 max-w-2xl mt-2 leading-relaxed font-medium uppercase tracking-wider">
                  El motor Titan gestiona la consistencia eventual entre nodos. Al sincronizar el clúster, los cambios de DialPlan y configuraciones de red se propagan de forma atómica a todos los servidores <span className="text-blue-400 font-black">MEDIA</span> y <span className="text-emerald-400 font-black">DATABASE</span>.
               </p>
            </div>
         </div>
         <div className="flex items-center space-x-4 relative z-10">
            <div className="text-right">
               <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Health Consensus</p>
               <p className="text-2xl font-black text-emerald-400 uppercase tracking-tight">100% NOMINAL</p>
            </div>
            <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 flex items-center justify-center p-1">
               <div className="w-full h-full rounded-full bg-emerald-500 shadow-[0_0_20px_#10b981] animate-pulse"></div>
            </div>
         </div>
      </div>

      {/* MODAL: ADD SERVER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-[0_0_150px_rgba(59,130,246,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
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

              <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-8 shadow-2xl">
                 <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span>Inyección Vía SSH-Key (Titan Protocol)</span>
                 </div>
                 <button 
                   onClick={handleAddServer} 
                   className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center space-x-4 group"
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