import React, { useState } from 'react';
import { 
  Database, Server, Cpu, Plus, Trash2, Edit2, ShieldCheck, 
  RefreshCw, Globe, Key, Activity, ArrowRight, Zap, Info,
  CheckCircle2, AlertCircle, Layers, Network, Terminal, X, Save,
  // Fix: Added missing Phone icon import
  Phone
} from 'lucide-react';
import { DBNode, ClusterNode } from '../types';
import { MOCK_DB_NODES } from '../constants';
import { useToast } from '../ToastContext';

const ClusterConfig: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'DATABASE' | 'SIP'>('DATABASE');
  const [dbNodes, setDbNodes] = useState<DBNode[]>(MOCK_DB_NODES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Partial<DBNode> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (node?: DBNode) => {
    if (node) {
      setEditingNode({ ...node });
    } else {
      setEditingNode({
        id: `node_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        ip: '',
        port: 5432,
        role: 'SLAVE',
        status: 'REPLICATING'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveNode = async () => {
    if (!editingNode?.name || !editingNode?.ip) {
      toast('Nombre e IP son obligatorios.', 'error');
      return;
    }
    setIsSaving(true);
    // Simulación de provisionamiento Ansible/Terraform
    await new Promise(r => setTimeout(r, 2000));
    
    const finalNode = editingNode as DBNode;
    setDbNodes(prev => {
      const exists = prev.find(n => n.id === finalNode.id);
      if (exists) return prev.map(n => n.id === finalNode.id ? finalNode : n);
      return [...prev, finalNode];
    });

    setIsSaving(false);
    setIsModalOpen(false);
    toast(`Nodo ${finalNode.name} inyectado en el clúster.`, 'success', 'Infrastructure Sync');
  };

  const handleDeleteNode = (id: string) => {
    const node = dbNodes.find(n => n.id === id);
    if (node?.role === 'MASTER') {
      toast('No se puede eliminar el nodo Maestro directamente. Realiza un Failover primero.', 'error', 'Cluster Safety');
      return;
    }
    if (confirm('¿Eliminar permanentemente este nodo del plano de control?')) {
      setDbNodes(prev => prev.filter(n => n.id !== id));
      toast('Nodo removido del inventario.', 'warning');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Layers className="mr-4 text-emerald-400" size={32} />
            Orquestador de Infraestructura
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Aprovisionamiento y topología de nodos de alta disponibilidad.</p>
        </div>
        <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-2xl shadow-inner">
           <button 
             onClick={() => setActiveTab('DATABASE')} 
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'DATABASE' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
           >
              Data Plane (DB)
           </button>
           <button 
             onClick={() => setActiveTab('SIP')} 
             className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'SIP' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
           >
              Media Plane (SIP)
           </button>
        </div>
      </div>

      {activeTab === 'DATABASE' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                 <Database className="mr-3 text-emerald-500" /> PostgreSQL 16 Cluster
              </h3>
              <button 
                onClick={() => handleOpenModal()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center group"
              >
                <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" /> Inyectar Nodo DB
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {dbNodes.map(node => (
                <div key={node.id} className="glass p-10 rounded-[56px] border border-slate-700/50 flex flex-col h-full hover:border-emerald-500/30 transition-all shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform">
                      <Database size={150} />
                   </div>
                   
                   <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className={`p-4 rounded-2xl ${node.role === 'MASTER' ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'} border border-white/10 shadow-lg`}>
                         <Database size={24} />
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${node.status === 'SYNCHRONIZED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {node.status}
                         </div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">{node.role}</span>
                      </div>
                   </div>

                   <div className="space-y-1 mb-8 relative z-10">
                      <h4 className="text-xl font-black text-white uppercase tracking-tight truncate">{node.name}</h4>
                      <p className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-widest">{node.ip}:{node.port}</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                      <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-1">
                         <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Rep. Lag</p>
                         <p className={`text-sm font-black font-mono ${node.replicationLag === '0ms' ? 'text-emerald-400' : 'text-amber-400'}`}>{node.replicationLag}</p>
                      </div>
                      <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-1">
                         <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Uptime</p>
                         <p className="text-sm font-black text-white font-mono">{node.uptime}</p>
                      </div>
                   </div>

                   <div className="mt-auto pt-8 border-t border-slate-800/50 flex justify-between items-center relative z-10">
                      <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                         <button onClick={() => handleOpenModal(node)} className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-lg"><Edit2 size={16} /></button>
                         <button onClick={() => handleDeleteNode(node.id)} className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-rose-600 hover:text-white rounded-xl transition-all shadow-lg"><Trash2 size={16} /></button>
                      </div>
                      <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest flex items-center">
                         Promote Master <ArrowRight size={14} className="ml-1" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'SIP' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
           <div className="p-12 glass rounded-[64px] border border-blue-500/20 bg-blue-600/5 flex flex-col items-center text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-400">
                 <Zap size={200} />
              </div>
              <div className="w-20 h-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl animate-pulse">
                 <Phone size={40} />
              </div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tighter max-w-xl">Gestión del Media Plane SIP</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto font-medium">Añade nodos FreeSwitch para balancear el tráfico RTP de tus campañas activas.</p>
              <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 flex items-center space-x-3">
                 <Plus size={20} />
                 <span>Añadir Nodo FreeSwitch</span>
              </button>
           </div>
        </div>
      )}

      {/* Modal CRUD Nodo */}
      {isModalOpen && editingNode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
             
             {isSaving && (
               <div className="absolute inset-0 z-[210] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-8 text-center p-10">
                  <div className="relative">
                     <div className="w-24 h-24 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                     <Terminal size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-2">Provisioning Node</h3>
                     <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Inyectando configuración vía SSH/Ansible...</p>
                  </div>
               </div>
             )}

             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg shrink-0">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[24px] bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                      <Server size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Nodo de Red</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Ajustes de Infraestructura Crítica</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl"><X size={24} /></button>
             </div>

             <div className="p-12 space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alias del Servidor</label>
                   <input type="text" value={editingNode.name} onChange={e => setEditingNode({...editingNode, name: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-emerald-500 shadow-inner" placeholder="Ej: DB-Replica-Q4" />
                </div>
                <div className="grid grid-cols-3 gap-6">
                   <div className="col-span-2 space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dirección IP Local/VPN</label>
                      <input type="text" value={editingNode.ip} onChange={e => setEditingNode({...editingNode, ip: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-blue-400 font-mono outline-none focus:border-blue-500 shadow-inner" placeholder="10.0.0.101" />
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Puerto</label>
                      <input type="number" value={editingNode.port} onChange={e => setEditingNode({...editingNode, port: parseInt(e.target.value)})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-mono outline-none focus:border-blue-500 shadow-inner text-center" />
                   </div>
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol en el Clúster</label>
                   <div className="grid grid-cols-2 gap-4 p-2 bg-slate-950 border border-slate-800 rounded-[32px] shadow-inner">
                      {['MASTER', 'SLAVE'].map(r => (
                        <button 
                          key={r}
                          onClick={() => setEditingNode({...editingNode, role: r as any})}
                          className={`py-4 rounded-[22px] text-[10px] font-black uppercase transition-all ${editingNode.role === r ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}
                        >
                           {r === 'MASTER' ? 'Escritura (Master)' : 'Solo Lectura (Slave)'}
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-6">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   <span>Certificado TLS Requerido</span>
                </div>
                <button onClick={handleSaveNode} disabled={isSaving} className="flex items-center space-x-4 bg-emerald-600 hover:bg-emerald-500 text-white px-14 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/30 transition-all active:scale-95 group">
                   {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                   <span>Guardar & Inyectar</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClusterConfig;