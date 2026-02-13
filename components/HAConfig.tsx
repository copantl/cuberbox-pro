import React, { useState, useEffect } from 'react';
import { 
  Shield, Globe, Network, Activity, Plus, Trash2, Edit2, 
  Save, RefreshCw, X, CheckCircle2, AlertTriangle, Cpu, 
  Zap, Info, Smartphone, Monitor, LayoutGrid, ArrowRightLeft,
  Lock, Terminal, ToggleRight, Share2, Server, Settings,
  ArrowRight, ShieldCheck, Download, Code, Signal, Wifi,
  BarChart3, Layers
} from 'lucide-react';
import { HANode, HAConfig } from '../types';
import { MOCK_HA_NODES, MOCK_HA_CONFIG } from '../constants';
import { useToast } from '../ToastContext';

const HAConfigPage: React.FC = () => {
  const { toast } = useToast();
  
  // --- ESTADOS DE DATOS ---
  const [nodes, setNodes] = useState<(HANode & { latency: number })[]>(
    MOCK_HA_NODES.map(n => ({ ...n, latency: 12 + Math.floor(Math.random() * 20) }))
  );
  const [config, setConfig] = useState<HAConfig>(MOCK_HA_CONFIG);
  
  // --- ESTADOS DE UI ---
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState<Partial<HANode> | null>(null);

  // --- HEARTBEAT SIMULATOR ---
  useEffect(() => {
    const timer = setInterval(() => {
      setNodes(prev => prev.map(n => ({
        ...n,
        latency: n.status === 'ACTIVE' ? Math.max(8, n.latency + (Math.random() > 0.5 ? 2 : -2)) : 0
      })));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // --- LOGICA DE NODOS ---
  const handleOpenModal = (node?: HANode) => {
    if (node) {
      setEditingNode({ ...node });
    } else {
      setEditingNode({
        id: `ha_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        ip: '',
        weight: 100,
        isPrimary: false,
        status: 'ACTIVE'
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveNode = () => {
    if (!editingNode?.name || !editingNode?.ip) {
      toast('Alias e IP son obligatorios.', 'error');
      return;
    }

    const finalNode = { ...editingNode, latency: 15 } as any;
    
    // Lógica de primacía única
    let updatedNodes = [...nodes];
    if (finalNode.isPrimary) {
      updatedNodes = updatedNodes.map(n => ({ ...n, isPrimary: false }));
    }

    const exists = updatedNodes.find(n => n.id === finalNode.id);
    if (exists) {
      setNodes(updatedNodes.map(n => n.id === finalNode.id ? finalNode : n));
    } else {
      setNodes([...updatedNodes, finalNode]);
    }

    setIsModalOpen(false);
    toast(`Nodo ${finalNode.name} configurado en el pool HA.`, 'success');
  };

  const handleDeleteNode = (id: string) => {
    if (nodes.length <= 1) {
      toast('Debe existir al menos un nodo para garantizar HA.', 'error');
      return;
    }
    setNodes(nodes.filter(n => n.id !== id));
    toast('Nodo removido del clúster.', 'warning');
  };

  // --- SIMULADOR DE FAILOVER INTELIGENTE ---
  const handleTestFailover = async () => {
    setIsTesting(true);
    toast('Protocolo de estrés iniciado: Forzando caída de MASTER...', 'warning', 'Failover Engine');
    
    await new Promise(r => setTimeout(r, 2000));
    
    // 1. Matar primario
    setNodes(prev => prev.map(n => n.isPrimary ? { ...n, status: 'DOWN', latency: 0 } : n));
    toast('NODO MAESTRO OFFLINE. Transfiriendo Virtual IP...', 'critical');

    await new Promise(r => setTimeout(r, 2500));

    // 2. Elegir nuevo líder basado en latencia y peso (Weight)
    setNodes(prev => {
      const candidates = prev.filter(n => n.status !== 'DOWN');
      if (candidates.length === 0) return prev;
      
      const nextLeader = candidates.sort((a,b) => b.weight - a.weight)[0];
      return prev.map(n => ({
        ...n,
        isPrimary: n.id === nextLeader.id,
        status: n.id === nextLeader.id ? 'ACTIVE' : n.status
      }));
    });

    toast('Failover exitoso. Tráfico re-enrutado vía VRRP.', 'success');
    setIsTesting(false);

    // Auto-recuperación simulada tras 10s
    setTimeout(() => {
      setNodes(MOCK_HA_NODES.map(n => ({ ...n, latency: 15 })));
      toast('Sincronización recuperada. Nodo 01 re-integrado.', 'info');
    }, 10000);
  };

  const handleApplyGlobal = async () => {
    setIsSaving(true);
    toast('Regenerando clúster Keepalived & HAProxy...', 'info');
    await new Promise(r => setTimeout(r, 2500));
    setIsSaving(false);
    toast('Topología de Alta Disponibilidad sellada.', 'success', 'Sync Core');
  };

  const handleExportConfig = () => {
    const haproxyConfig = `
# CUBERBOX PRO - GENERATED HAPROXY CONFIG v5.1.5
# Hash: ${Math.random().toString(36).substr(2, 32)}
global
    log /dev/log local0
    maxconn 4096

defaults
    log global
    mode http
    option httplog
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms

frontend http-in
    bind *:80
    default_backend cuberbox_nodes

backend cuberbox_nodes
    balance ${config.loadBalancerMode.toLowerCase().replace('_', '')}
    option httpchk GET /health
${nodes.map(n => `    server ${n.name.replace(/\s+/g, '_')} ${n.ip}:80 check weight ${n.weight} ${n.isPrimary ? 'primary' : ''}`).join('\n')}

# VIP Config (Keepalived / VRRP)
vrrp_instance VI_1 {
    state MASTER
    interface ${config.interface}
    virtual_router_id 51
    priority ${config.keepalivedPriority}
    advert_int 1
    virtual_ipaddress {
        ${config.virtualIP}
    }
}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([haproxyConfig], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "cuberbox_ha_stack.cfg";
    document.body.appendChild(element);
    element.click();
    toast('Configuración .cfg exportada.', 'success');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
           <div className="w-16 h-16 rounded-[28px] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/30 animate-glow">
              <Shield size={32} />
           </div>
           <div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                Redundancia L7
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-2">Gestión de Virtual IP y Load Balancing Bridge</p>
           </div>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={handleTestFailover}
             disabled={isTesting}
             className={`flex items-center space-x-3 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 text-rose-500 px-8 py-4 rounded-[28px] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50 ${isTesting ? 'animate-pulse' : ''}`}
           >
             {isTesting ? <RefreshCw className="animate-spin" size={18} /> : <AlertTriangle size={18} />}
             <span>Test Failover</span>
           </button>
           <button 
            onClick={handleApplyGlobal}
            disabled={isSaving}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-50 text-white px-10 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group"
           >
             {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} className="group-hover:scale-110 transition-transform" />}
             <span>Aplicar HA Stack</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Nodos de Aplicación */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                 <Server className="mr-3 text-blue-500" /> Nodos en Pool de Balanceo
              </h3>
              <button 
                onClick={() => handleOpenModal()}
                className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline flex items-center group"
              >
                 <Plus size={14} className="mr-1.5 group-hover:rotate-90 transition-transform" /> Añadir Nodo
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {nodes.map(node => (
                <div key={node.id} className={`glass p-10 rounded-[64px] border-2 flex flex-col h-full hover:shadow-2xl transition-all relative overflow-hidden group ${node.status === 'ACTIVE' ? 'border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5' : node.status === 'DOWN' ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-800'}`}>
                   <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform">
                      <LayoutGrid size={180} />
                   </div>

                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className={`p-4 rounded-2xl ${node.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_15px_#10b98130]' : 'bg-slate-800'} text-white shadow-lg`}>
                         <Smartphone size={28} />
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           node.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                           node.status === 'DOWN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                           'bg-blue-500/10 text-blue-400 border-blue-500/20'
                         }`}>
                            {node.status}
                         </div>
                         {node.isPrimary && (
                           <div className="flex items-center space-x-1 bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 animate-pulse">
                              <ShieldCheck size={10} />
                              <span className="text-[8px] font-black uppercase tracking-widest">MASTER_VIP</span>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-1 relative z-10 mb-10">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight truncate">{node.name}</h4>
                      <div className="flex items-center space-x-3">
                         <p className="text-xs font-mono text-slate-500 font-bold tracking-widest uppercase">{node.ip}</p>
                         <div className="h-1 w-1 rounded-full bg-slate-800"></div>
                         <p className="text-xs font-mono text-blue-400 font-black tracking-widest">{node.latency}ms</p>
                      </div>
                   </div>

                   <div className="mt-auto pt-8 border-t border-slate-800/50 flex justify-between items-center relative z-10">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Load Weight</span>
                         <span className="text-lg font-black text-white font-mono">{node.weight}%</span>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <button onClick={() => handleOpenModal(node)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg"><Edit2 size={16} /></button>
                         <button onClick={() => handleDeleteNode(node.id)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg"><Trash2 size={16} /></button>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="p-10 glass rounded-[64px] border border-blue-500/20 bg-blue-600/5 flex items-start space-x-8 shadow-inner group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                 <Network size={200} />
              </div>
              <div className="p-4 rounded-3xl bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-inner group-hover:rotate-12 transition-transform">
                 <Signal size={32} />
              </div>
              <div className="flex-1 relative z-10">
                 <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Protocolo VRRP Core</h4>
                 <p className="text-xs text-slate-400 font-medium uppercase leading-relaxed tracking-wider max-w-2xl">
                    CUBERBOX Pro utiliza <span className="text-blue-400 font-black">VRRP</span> para gestionar la Virtual IP compartida. El clúster está configurado para failover atómico en <span className="text-emerald-400 font-black">Nivel 2 y 3</span>.
                 </p>
                 <div className="flex space-x-12 mt-10">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">VIP Activa</p>
                       <p className="text-sm font-black text-emerald-400 font-mono tracking-widest">{config.virtualIP}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Interface Red</p>
                       <p className="text-sm font-black text-white font-mono uppercase tracking-widest">{config.interface}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Parámetros Globales HA */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col space-y-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                 <Settings className="mr-3 text-blue-400" size={24} /> HA Stack Engine
              </h3>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Algoritmo de Balanceo</label>
                    <select 
                      value={config.loadBalancerMode}
                      onChange={e => setConfig({...config, loadBalancerMode: e.target.value as any})}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-blue-400 font-black outline-none appearance-none shadow-inner cursor-pointer"
                    >
                       <option value="ROUND_ROBIN">Round Robin</option>
                       <option value="LEAST_CONN">Least Connections</option>
                       <option value="IP_HASH">Sticky Sessions (IP Hash)</option>
                    </select>
                 </div>

                 <div className="space-y-4 p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intervalo Heartbeat</label>
                       <span className="text-lg font-black text-emerald-400 font-mono">{config.healthCheckInterval}ms</span>
                    </div>
                    <input 
                      type="range" min="1000" max="10000" step="1000"
                      value={config.healthCheckInterval}
                      onChange={(e) => setConfig({...config, healthCheckInterval: parseInt(e.target.value)})}
                      className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                    />
                 </div>

                 <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-inner space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center">
                       <Lock size={12} className="mr-2 text-rose-500" /> SSL Termination
                    </h4>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                       <span className="text-[10px] font-black text-slate-300 uppercase">Auto-Renew SSL</span>
                       <button className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                       <span className="text-[10px] font-black text-slate-300 uppercase">HSTS Shield</span>
                       <button className="w-10 h-5 bg-emerald-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-800">
                    <button 
                      onClick={handleExportConfig}
                      className="w-full py-5 rounded-[28px] bg-slate-950 border-2 border-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center space-x-3 shadow-xl group"
                    >
                       <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                       <span>Exportar Configuración</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODAL: ADD/EDIT NODE */}
      {isModalOpen && editingNode && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="relative w-full max-w-xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shadow-lg shrink-0">
                 <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-[20px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                       <Smartphone size={24} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Nodo de Aplicación</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configuración de Pool</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl"><X size={20} /></button>
              </div>

              <div className="p-12 space-y-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Alias del Nodo</label>
                    <input 
                      type="text" 
                      value={editingNode.name} 
                      onChange={e => setEditingNode({...editingNode, name: e.target.value})} 
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-8 py-4 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" 
                      placeholder="Ej: Web-App-Server-03" 
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dirección IP</label>
                    <input 
                      type="text" 
                      value={editingNode.ip} 
                      onChange={e => setEditingNode({...editingNode, ip: e.target.value})} 
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-8 py-4 text-sm text-blue-400 font-mono outline-none focus:border-blue-500 shadow-inner" 
                      placeholder="10.0.0.X" 
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Peso (Weight)</label>
                       <input 
                         type="number" 
                         value={editingNode.weight} 
                         onChange={e => setEditingNode({...editingNode, weight: parseInt(e.target.value)})} 
                         className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-8 py-4 text-sm text-white font-mono text-center outline-none focus:border-blue-500 shadow-inner" 
                       />
                    </div>
                    <div className="space-y-4 flex flex-col justify-end">
                       <button 
                         onClick={() => setEditingNode({...editingNode, isPrimary: !editingNode.isPrimary})}
                         className={`w-full py-4 rounded-[24px] border-2 transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 ${editingNode.isPrimary ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                       >
                          <Shield size={14} />
                          <span>Nodo Maestro</span>
                       </button>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-4">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase italic opacity-60">
                   <ShieldCheck size={18} className="text-emerald-500" />
                   <span>Certificado TLS Sync</span>
                </div>
                <button onClick={handleSaveNode} className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 group">
                   <Save size={18} className="group-hover:scale-110 transition-transform" />
                   <span>Sellar Nodo</span>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HAConfigPage;