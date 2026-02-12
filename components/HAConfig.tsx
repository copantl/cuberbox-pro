import React, { useState } from 'react';
import { 
  Shield, Globe, Network, Activity, Plus, Trash2, Edit2, 
  Save, RefreshCw, X, CheckCircle2, AlertTriangle, Cpu, 
  Zap, Info, Smartphone, Monitor, LayoutGrid, ArrowRightLeft,
  Lock, Terminal, ToggleRight, Share2, Server,
  // Fix: Added missing Settings icon import
  Settings
} from 'lucide-react';
import { HANode, HAConfig } from '../types';
import { MOCK_HA_NODES, MOCK_HA_CONFIG } from '../constants';
import { useToast } from '../ToastContext';

const HAConfigPage: React.FC = () => {
  const { toast } = useToast();
  const [nodes, setNodes] = useState<HANode[]>(MOCK_HA_NODES);
  const [config, setConfig] = useState<HAConfig>(MOCK_HA_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSaveHA = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
    toast('Políticas de Alta Disponibilidad aplicadas al clúster.', 'success', 'Keepalived Sync');
  };

  const handleTestFailover = async () => {
    setIsTesting(true);
    toast('Simulando falla en nodo primario...', 'warning', 'Failover Tester');
    await new Promise(r => setTimeout(r, 3000));
    
    setNodes(prev => prev.map(n => ({
      ...n,
      status: n.isPrimary ? 'DOWN' : 'ACTIVE'
    })));

    toast('Failover exitoso. Nodo 02 ha asumido la IP Virtual.', 'success');
    setIsTesting(false);

    // Revertir después de un tiempo para la demo
    setTimeout(() => {
       setNodes(MOCK_HA_NODES);
       toast('Recuperación automática detectada (Failback).', 'info');
    }, 5000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Shield className="mr-4 text-blue-400" size={36} />
            High Availability & Load Balancing
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configuración del stack de redundancia L7 para el plano web y API.</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={handleTestFailover}
             disabled={isTesting}
             className="flex items-center space-x-3 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 text-rose-500 px-8 py-4 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 disabled:opacity-50"
           >
             {isTesting ? <RefreshCw className="animate-spin" size={18} /> : <AlertTriangle size={18} />}
             <span>Test Failover</span>
           </button>
           <button 
            onClick={handleSaveHA}
            disabled={isSaving}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group"
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
                 <Server className="mr-3 text-blue-500" /> App Nodes Pool
              </h3>
              <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline flex items-center">
                 <Plus size={14} className="mr-1.5" /> Añadir Nodo al Pool
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {nodes.map(node => (
                <div key={node.id} className={`glass p-10 rounded-[64px] border-2 flex flex-col h-full hover:shadow-2xl transition-all relative overflow-hidden group ${node.status === 'ACTIVE' ? 'border-emerald-500/30 bg-emerald-500/5 shadow-emerald-500/5' : node.status === 'DOWN' ? 'border-rose-500/30 bg-rose-500/5' : 'border-slate-800'}`}>
                   <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition-transform">
                      <LayoutGrid size={180} />
                   </div>

                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className={`p-4 rounded-2xl ${node.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-800'} text-white shadow-lg`}>
                         <Smartphone size={28} />
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                         <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                           node.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_#10b98130]' : 
                           node.status === 'DOWN' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                           'bg-blue-500/10 text-blue-400 border-blue-500/20'
                         }`}>
                            {node.status}
                         </div>
                         {node.isPrimary && <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">MASTER_PRIORITY</span>}
                      </div>
                   </div>

                   <div className="space-y-1 relative z-10 mb-10">
                      <h4 className="text-2xl font-black text-white uppercase tracking-tight truncate">{node.name}</h4>
                      <p className="text-xs font-mono text-slate-500 font-bold tracking-widest uppercase">{node.ip}</p>
                   </div>

                   <div className="mt-auto pt-8 border-t border-slate-800/50 flex justify-between items-center relative z-10">
                      <div className="flex flex-col">
                         <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Load Weight</span>
                         <span className="text-lg font-black text-white font-mono">{node.weight}%</span>
                      </div>
                      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                         <button className="p-3 bg-slate-950 border border-slate-800 hover:bg-blue-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg"><Edit2 size={16} /></button>
                         <button className="p-3 bg-slate-950 border border-slate-800 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl transition-all shadow-lg"><Trash2 size={16} /></button>
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
                 <Terminal size={32} />
              </div>
              <div className="flex-1 relative z-10">
                 <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Monitor de Sincronización Web</h4>
                 <p className="text-xs text-slate-400 font-medium uppercase leading-relaxed tracking-wider max-w-2xl">
                    CUBERBOX Pro utiliza <span className="text-blue-400 font-black">VRRP</span> para gestionar la Virtual IP compartida. Al detectar una falla en el nodo 01, el motor redirige automáticamente el tráfico al nodo de respaldo en menos de <span className="text-emerald-400 font-black">2.5 segundos</span>.
                 </p>
                 <div className="flex space-x-12 mt-10">
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Protocolo de Red</p>
                       <p className="text-sm font-black text-white uppercase tracking-tight">Keepalived / HAProxy</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Virtual IP (VIP)</p>
                       <p className="text-sm font-black text-emerald-400 font-mono tracking-widest">{config.virtualIP}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Parámetros Globales HA */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col space-y-10">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                 <Settings className="mr-3 text-blue-400" /> HA Stack Engine
              </h3>
              
              <div className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Load Balancing Algorithm</label>
                    <select 
                      value={config.loadBalancerMode}
                      onChange={e => setConfig({...config, loadBalancerMode: e.target.value as any})}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-blue-400 font-black outline-none appearance-none shadow-inner"
                    >
                       <option value="ROUND_ROBIN">Round Robin</option>
                       <option value="LEAST_CONN">Least Connections</option>
                       <option value="IP_HASH">Sticky Sessions (IP Hash)</option>
                    </select>
                 </div>

                 <div className="space-y-4 p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Health Check Interval</label>
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
                       <span className="text-[10px] font-black text-slate-300 uppercase">Let's Encrypt Auto-Renew</span>
                       <button className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                       <span className="text-[10px] font-black text-slate-300 uppercase">HSTS Hardening</span>
                       <button className="w-10 h-5 bg-emerald-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-slate-800">
                    <button className="w-full py-5 rounded-[28px] bg-slate-950 border-2 border-slate-800 text-blue-400 hover:bg-blue-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em] active:scale-95 flex items-center justify-center space-x-3 shadow-xl group">
                       <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
                       <span>Export Haproxy Config</span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HAConfigPage;