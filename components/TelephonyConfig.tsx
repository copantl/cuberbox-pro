
/**
 * @file TelephonyConfig.tsx
 * @description Gestión estructural de SIP Trunks, DIDs y extensiones.
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, Server, Globe, Key, Shield, Hash, Activity, Plus, Trash2, 
  Settings, Save, RefreshCw, CheckCircle, XCircle, Layers, Radio,
  Smartphone, Monitor, Zap, ListFilter, Cpu, Database, Search, 
  ArrowRightLeft, X, ShieldCheck, Terminal as TerminalIcon, Power, 
  ToggleLeft, ToggleRight, ChevronRight, Info, Lock, Unlock, PhoneIncoming,
  Edit2, Clock
} from 'lucide-react';
import { SIPTrunk, DID } from '../types';
import { MOCK_DIDS, MOCK_TRUNKS, MOCK_CAMPAIGNS } from '../constants';
import FreeswitchCLI from './FreeswitchCLI';
import { useToast } from '../ToastContext';

const TelephonyConfig: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'FS' | 'TRUNKS' | 'DIDS' | 'EXTENSIONS' | 'CLI'>('TRUNKS');
  const [trunks, setTrunks] = useState<SIPTrunk[]>(MOCK_TRUNKS);
  const [dids, setDids] = useState<DID[]>(MOCK_DIDS);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Estados para el Modal de Troncal
  const [isTrunkModalOpen, setIsTrunkModalOpen] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<Partial<SIPTrunk> | null>(null);
  const [isSavingTrunk, setIsSavingTrunk] = useState(false);

  // Simulación de estados cambiantes de registro SIP
  useEffect(() => {
    const interval = setInterval(() => {
      setTrunks(prev => prev.map(t => ({
        ...t,
        latency: Math.floor(Math.random() * 50) + 15
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    toast('Handshake global completado. Todos los módulos SIP están en línea.', 'success', 'System Integrity OK');
  };

  const handleOpenTrunkModal = (trunk?: SIPTrunk) => {
    if (trunk) {
      setEditingTrunk({ ...trunk });
    } else {
      setEditingTrunk({
        id: `trunk_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        host: '',
        username: '',
        secret: '',
        protocol: 'UDP',
        port: 5060,
        context: 'from-trunk',
        isActive: true,
        status: 'requesting',
        codecs: ['G711', 'G729'],
        latency: 0
      });
    }
    setIsTrunkModalOpen(true);
  };

  const handleSaveTrunk = async () => {
    if (!editingTrunk?.name || !editingTrunk?.host) {
      toast('Nombre y Host son campos obligatorios.', 'error');
      return;
    }
    setIsSavingTrunk(true);
    
    // Simular registro con Carrier
    await new Promise(r => setTimeout(r, 1500));
    
    const finalTrunk = { 
      ...editingTrunk, 
      status: 'registered',
      latency: 20 + Math.floor(Math.random() * 20)
    } as SIPTrunk;

    setTrunks(prev => {
      const exists = prev.find(t => t.id === finalTrunk.id);
      if (exists) return prev.map(t => t.id === finalTrunk.id ? finalTrunk : t);
      return [...prev, finalTrunk];
    });

    setIsSavingTrunk(false);
    setIsTrunkModalOpen(false);
    setEditingTrunk(null);
    toast(`Troncal SIP "${finalTrunk.name}" vinculada y registrada correctamente.`, 'success', 'SIP Carrier Link');
  };

  const handleDeleteTrunk = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Deseas eliminar permanentemente esta troncal? Se perderá la conectividad de salida vinculada.')) {
      setTrunks(prev => prev.filter(t => t.id !== id));
      toast('Recurso SIP liberado.', 'warning');
    }
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Phone className="mr-4 text-blue-400" size={32} />
            Infraestructura SIP
          </h2>
          <p className="text-slate-400 text-sm font-medium">Configuración del stack de telefonía y gateways carrier.</p>
        </div>
        <div className="flex space-x-4">
           <div className="hidden md:flex items-center px-6 py-2 bg-slate-900 border border-slate-800 rounded-full space-x-6">
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Switch: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TLS: Active</span>
              </div>
           </div>
           <button onClick={handleGlobalSync} disabled={isSyncing} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-3xl transition-all shadow-xl flex items-center active:scale-95 disabled:opacity-50 group">
              {isSyncing ? <RefreshCw className="animate-spin mr-2" size={18} /> : <ShieldCheck size={18} className="mr-2" />}
              <span className="font-black text-[10px] uppercase tracking-widest">Sincronizar Cluster</span>
           </button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
        {[
          { id: 'FS', icon: Server, label: 'FreeSwitch Node' },
          { id: 'TRUNKS', icon: Globe, label: 'Carrier Trunks' },
          { id: 'DIDS', icon: Hash, label: 'DIDs (Inbound)' },
          { id: 'EXTENSIONS', icon: Smartphone, label: 'SIP Extensions' },
          { id: 'CLI', icon: TerminalIcon, label: 'System CLI' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-800/40 text-slate-500 border border-slate-700/50 hover:bg-slate-800'}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'CLI' ? <FreeswitchCLI /> : (
          <div className="glass rounded-[48px] border border-slate-700/50 p-10 shadow-2xl h-full">
            
            {activeTab === 'TRUNKS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                {trunks.map(trunk => (
                  <div key={trunk.id} onClick={() => handleOpenTrunkModal(trunk)} className="p-8 rounded-[40px] bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 transition-all group relative overflow-hidden cursor-pointer">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-5">
                           <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                              <Globe size={24} />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-white uppercase">{trunk.name}</h4>
                              <p className="text-[10px] font-mono text-slate-500 font-bold uppercase">{trunk.host}</p>
                           </div>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${trunk.status === 'registered' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                           {trunk.status}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col justify-center items-center text-center">
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Latencia Carrier</p>
                           <p className="text-xl font-black text-blue-400 font-mono">{trunk.latency}ms</p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 flex flex-col justify-center items-center text-center">
                           <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Protocolo</p>
                           <p className="text-xl font-black text-white">{trunk.protocol}</p>
                        </div>
                     </div>
                     <div className="mt-8 pt-8 border-t border-slate-800/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all">
                        <button className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline flex items-center">
                           <RefreshCw size={12} className="mr-2" /> Recargar Gateway
                        </button>
                        <div className="flex space-x-2">
                           <button onClick={(e) => { e.stopPropagation(); handleOpenTrunkModal(trunk); }} className="p-2.5 bg-slate-800 rounded-xl text-slate-500 hover:text-white"><Edit2 size={16} /></button>
                           <button onClick={(e) => handleDeleteTrunk(trunk.id, e)} className="p-2.5 bg-slate-800 rounded-xl text-slate-500 hover:text-rose-500"><Trash2 size={16} /></button>
                        </div>
                     </div>
                  </div>
                ))}
                <div 
                  onClick={() => handleOpenTrunkModal()}
                  className="p-8 border-4 border-dashed border-slate-800 rounded-[40px] flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 hover:border-blue-500/40 transition-all cursor-pointer group bg-slate-900/20"
                >
                   <Plus size={48} className="text-slate-700 group-hover:text-blue-500 mb-4 transition-transform group-hover:scale-110" />
                   <h4 className="font-black text-white uppercase tracking-widest">Vincular Nueva Troncal</h4>
                   <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Provisionar Carrier SIP</p>
                </div>
              </div>
            )}

            {activeTab === 'DIDS' && (
               <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">Direct Inward Dialing (DIDs)</h3>
                     <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-xl transition-all active:scale-95 flex items-center">
                        <Plus size={16} className="mr-2" /> Portar Número
                     </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {dids.map(did => (
                        <div key={did.id} className="p-8 rounded-[40px] bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all group shadow-xl">
                           <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center space-x-4">
                                 <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400 border border-blue-500/20 shadow-inner">
                                    <PhoneIncoming size={20} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-mono font-black text-white tracking-tighter">{did.number}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{did.description}</p>
                                 </div>
                              </div>
                           </div>
                           <div className="pt-4 border-t border-slate-800/50">
                              <div className="flex justify-between items-center">
                                 <div className="flex flex-col">
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Ruta Activa</span>
                                    <span className="text-[10px] font-black text-emerald-400 uppercase">
                                       {did.routingType === 'CAMPAIGN' ? `CAMP: ${MOCK_CAMPAIGNS.find(c => c.id === did.routingDestination)?.name || '?'}` : did.routingType}
                                    </span>
                                 </div>
                                 <div className={`w-2 h-2 rounded-full ${did.isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`}></div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}
            
            {activeTab === 'FS' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center space-x-8">
                    <div className="w-24 h-24 rounded-[32px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                       <Server size={48} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Nodo Maestro FreeSwitch</h2>
                       <p className="text-sm text-slate-500 font-medium">FreeSwitch 1.10.x LTS - Build: 2024-Nov-21</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-inner group hover:border-blue-500/30 transition-all">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Uptime Global</h4>
                       <div className="flex items-center space-x-4">
                          <Clock size={32} className="text-blue-500" />
                          <p className="text-3xl font-black text-white tabular-nums">14d 08h</p>
                       </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-inner group hover:border-emerald-500/30 transition-all">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Canales SIP</h4>
                       <div className="flex items-center space-x-4">
                          <Activity size={32} className="text-emerald-500" />
                          <p className="text-3xl font-black text-white tabular-nums">1,240 / 5,000</p>
                       </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-inner group hover:border-amber-500/30 transition-all">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">ESL Status</h4>
                       <div className="flex items-center space-x-4">
                          <Zap size={32} className="text-amber-500 animate-pulse" />
                          <p className="text-3xl font-black text-white tabular-nums">SECURE_LINK</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* MODAL PARA CONFIGURACIÓN DE TRONCAL SIP */}
      {isTrunkModalOpen && editingTrunk && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              {isSavingTrunk && (
                <div className="absolute inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-8 text-center p-10">
                   <div className="relative">
                      <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                      <RefreshCw size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400 animate-pulse" />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-3">Authenticating SIP</h3>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse italic">Validando credenciales con el Carrier Gateway...</p>
                   </div>
                </div>
              )}

              <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
                 <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                       <Globe size={32} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Gateway Provisioning</h3>
                       <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Configuración de Troncal de Salida / Entrada</p>
                    </div>
                 </div>
                 <button onClick={() => setIsTrunkModalOpen(false)} className="p-4 bg-slate-800 rounded-[28px] text-slate-500 hover:text-white transition-all shadow-xl"><X size={28} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 scrollbar-hide space-y-12">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Parámetros de Red</h4>
                       
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Descriptivo</label>
                             <input 
                               type="text" 
                               value={editingTrunk.name}
                               onChange={e => setEditingTrunk({...editingTrunk, name: e.target.value})}
                               className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" 
                               placeholder="Ej: Twilio New York Primary"
                             />
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4">
                             <div className="col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Carrier Host (IP/Domain)</label>
                                <input 
                                  type="text" 
                                  value={editingTrunk.host}
                                  onChange={e => setEditingTrunk({...editingTrunk, host: e.target.value})}
                                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-xs text-blue-400 font-mono outline-none focus:border-blue-500 shadow-inner" 
                                  placeholder="sip.carrier.com"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Port</label>
                                <input 
                                  type="number" 
                                  value={editingTrunk.port}
                                  onChange={e => setEditingTrunk({...editingTrunk, port: parseInt(e.target.value)})}
                                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-[24px] px-6 py-4 text-xs text-white font-mono outline-none focus:border-blue-500 shadow-inner text-center" 
                                />
                             </div>
                          </div>

                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Protocolo SIP</label>
                             <div className="grid grid-cols-3 gap-3">
                                {['UDP', 'TCP', 'TLS'].map(p => (
                                   <button 
                                     key={p}
                                     onClick={() => setEditingTrunk({...editingTrunk, protocol: p})}
                                     className={`py-4 rounded-2xl text-[10px] font-black transition-all border ${editingTrunk.protocol === p ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-600 hover:text-slate-400'}`}
                                   >
                                      {p}
                                   </button>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Seguridad & Auth</h4>
                       
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SIP Username</label>
                             <div className="relative group">
                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input 
                                  type="text" 
                                  value={editingTrunk.username}
                                  onChange={e => setEditingTrunk({...editingTrunk, username: e.target.value})}
                                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-medium outline-none focus:border-emerald-500 transition-all shadow-inner" 
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SIP Secret</label>
                             <div className="relative group">
                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                                <input 
                                  type="password" 
                                  value={editingTrunk.secret}
                                  onChange={e => setEditingTrunk({...editingTrunk, secret: e.target.value})}
                                  className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-medium outline-none focus:border-emerald-500 transition-all shadow-inner" 
                                  placeholder="••••••••••••"
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dialplan Context</label>
                             <input 
                               type="text" 
                               value={editingTrunk.context}
                               onChange={e => setEditingTrunk({...editingTrunk, context: e.target.value})}
                               className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-xs text-slate-400 font-mono outline-none focus:border-blue-500 shadow-inner" 
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-10 glass rounded-[48px] border border-blue-500/20 bg-blue-600/5 flex items-start space-x-8 shadow-inner group">
                    <div className="p-4 rounded-3xl bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
                       <Info size={32} />
                    </div>
                    <div className="flex-1">
                       <h5 className="text-sm font-black text-white uppercase tracking-widest mb-1">Nota de Cumplimiento</h5>
                       <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase tracking-wider">
                          Al guardar esta troncal, el orquestador de Go generará una nueva configuración XML para FreeSwitch y ejecutará un <code className="text-blue-400">sofia profile rescan</code> automáticamente. Asegúrate de que el carrier tenga autorizada la IP del clúster.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-8 shadow-2xl shrink-0">
                 <div className="flex items-center space-x-3 text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                    <ShieldCheck size={20} className="text-emerald-500" />
                    <span>Configuración Segura SHA-256</span>
                 </div>
                 <button 
                  onClick={handleSaveTrunk}
                  disabled={isSavingTrunk || !editingTrunk.name}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-16 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-4 group"
                 >
                   {isSavingTrunk ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSavingTrunk ? 'Validando...' : 'Sellar y Registrar'}</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TelephonyConfig;
