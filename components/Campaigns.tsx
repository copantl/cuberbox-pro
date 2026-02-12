
/**
 * @file Campaigns.tsx
 * @description Centro de mando para la orquestación táctica de campañas.
 */

import React, { useState } from 'react';
import { 
  Plus, Target, RefreshCw, Cpu, CheckCircle2, Coffee, Settings, Maximize2, 
  Radio, Users, Network, Database, Sliders, ListChecks, Bot, X, Save, 
  ShieldCheck, Check, Info, Shield, Hash, Headphones, Sparkles, Zap,
  Globe, Smartphone, ListFilter, SlidersHorizontal, GitMerge, ChevronRight,
  Mic, MicOff, Volume2, Trash2
} from 'lucide-react';
import { Campaign, CampaignType, UserGroup, PauseCode, CallCode, DID, IVRFlow, AIBot } from '../types';
import { 
  MOCK_CAMPAIGNS, MOCK_USER_GROUPS, PAUSE_CODES, MOCK_CALL_CODES, 
  MOCK_TRUNKS, MOCK_LISTS, MOCK_DIDS, MOCK_IVR_FLOWS, MOCK_BOTS 
} from '../constants';
import { useToast } from '../ToastContext';
import CampaignRealTimeDashboard from './CampaignRealTimeDashboard';

type CampaignTab = 'GENERAL' | 'ROUTING' | 'LISTS' | 'STAFFING' | 'DISPOSITIONS' | 'INTELLIGENCE';

const Campaigns: React.FC = () => {
  const { toast } = useToast();
  const [campaignsList, setCampaignsList] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(MOCK_CAMPAIGNS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<CampaignTab>('GENERAL');
  const [editingCampaign, setEditingCampaign] = useState<Partial<Campaign> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCOCVisible, setIsCOCVisible] = useState(false);

  const handleOpenModal = (campaign?: Campaign) => {
    setActiveModalTab('GENERAL');
    if (campaign) {
      setEditingCampaign({ ...campaign });
    } else {
      setEditingCampaign({
        id: `c_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        status: 'ACTIVE',
        campaignType: 'OUTBOUND',
        dialMethod: 'RATIO',
        autoDialLevel: 1.0,
        hopperLevel: 100,
        recordingMode: 'ALL_CALLS',
        callCodeIds: ['SALE', 'NI'],
        listIds: [],
        userIds: [],
        groupIds: [],
        pauseCodeIds: ['1', '3'],
        ivrId: '',
        aiBotId: '',
        syncStatus: 'PENDING'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingCampaign?.name) {
      toast('El nombre de la campaña es obligatorio', 'error');
      return;
    }
    setIsSaving(true);
    // Simular sincronización de FreeSwitch
    await new Promise(r => setTimeout(r, 1800));
    
    const updated = { 
      ...editingCampaign, 
      syncStatus: 'SYNCHRONIZED', 
      lastSync: new Date().toISOString() 
    } as Campaign;

    setCampaignsList(prev => {
      const exists = prev.find(c => c.id === updated.id);
      if (exists) {
        return prev.map(c => c.id === updated.id ? updated : c);
      }
      return [updated, ...prev];
    });
    
    setSelectedCampaign(updated);
    setIsSaving(false);
    setIsModalOpen(false);
    toast(`Campaña "${updated.name}" sincronizada en el cluster. Grabación: ${updated.recordingMode}`, 'success', 'Sincronización Core');
  };

  const toggleSelection = (key: keyof Campaign, id: string) => {
    if (!editingCampaign) return;
    const current = (editingCampaign[key] as string[]) || [];
    const updated = current.includes(id) 
      ? current.filter(i => i !== id) 
      : [...current, id];
    setEditingCampaign({ ...editingCampaign, [key]: updated });
  };

  const handleDeleteCampaign = (id: string) => {
    if (confirm('¿Deseas eliminar permanentemente esta campaña del cluster?')) {
      const newList = campaignsList.filter(c => c.id !== id);
      setCampaignsList(newList);
      if (selectedCampaign?.id === id) {
        setSelectedCampaign(newList[0] || null);
      }
      toast('Recurso liberado del servidor.', 'warning');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {isCOCVisible && selectedCampaign && (
        <CampaignRealTimeDashboard campaign={selectedCampaign} onClose={() => setIsCOCVisible(false)} />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center">
            <Target className="mr-4 text-blue-500" size={36} />
            Estrategia & Marcado
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Orquestación del motor predictivo y sus reglas de negocio de misión crítica.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[28px] font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 flex items-center group"
        >
          <Plus size={22} className="mr-2 group-hover:rotate-90 transition-transform" />
          Nueva Campaña
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar de Campañas */}
        <div className="col-span-12 lg:col-span-4 space-y-4 max-h-[800px] overflow-y-auto scrollbar-hide pr-2">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-4 mb-4">Pipeline Activo</h4>
           {campaignsList.map(campaign => (
             <div 
              key={campaign.id} 
              onClick={() => setSelectedCampaign(campaign)}
              className={`p-6 rounded-[48px] border-2 cursor-pointer transition-all relative overflow-hidden group ${selectedCampaign?.id === campaign.id ? 'bg-blue-600/10 border-blue-500 shadow-2xl scale-[1.02]' : 'glass border-slate-800 hover:border-slate-700'}`}
             >
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-3 rounded-2xl ${campaign.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      <Radio size={20} className={campaign.status === 'ACTIVE' ? 'animate-pulse' : ''} />
                   </div>
                   <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${campaign.syncStatus === 'SYNCHRONIZED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-amber-500'}`}></div>
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{campaign.syncStatus}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(campaign.id); }}
                        className="ml-2 p-1.5 hover:bg-rose-500/20 text-slate-600 hover:text-rose-500 rounded-lg transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                   </div>
                </div>
                <h3 className="font-black text-white text-xl uppercase truncate tracking-tight">{campaign.name}</h3>
                <div className="mt-5 flex flex-wrap gap-2">
                   <span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-xl uppercase border border-blue-500/20">{campaign.campaignType}</span>
                   <span className="text-[9px] font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-xl uppercase border border-amber-500/20">{campaign.dialMethod}</span>
                   {campaign.recordingMode === 'ALL_CALLS' && (
                     <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-xl uppercase border border-emerald-500/20 flex items-center">
                        <Mic size={10} className="mr-1" /> Recording
                     </span>
                   )}
                </div>
             </div>
           ))}
        </div>

        {/* Visualizador de Detalle */}
        <div className="col-span-12 lg:col-span-8 h-full">
          {selectedCampaign ? (
            <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl space-y-12 animate-in fade-in duration-500 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <Target size={300} />
              </div>

              <div className="flex items-center justify-between border-b border-slate-800 pb-10 relative z-10">
                <div className="flex items-center space-x-8">
                   <div className="w-20 h-20 rounded-[32px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Cpu size={40} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">{selectedCampaign.name}</h3>
                      <div className="flex items-center space-x-6 mt-2">
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center">
                          <CheckCircle2 size={14} className="mr-2 text-emerald-500" /> Disposiciones: {selectedCampaign.callCodeIds?.length}
                        </p>
                        <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest flex items-center">
                          <Database size={14} className="mr-2 text-blue-500" /> Pools: {selectedCampaign.listIds?.length || 0}
                        </p>
                      </div>
                   </div>
                </div>
                <div className="flex space-x-4">
                  <button onClick={() => setIsCOCVisible(true)} className="flex items-center space-x-3 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95">
                    <Maximize2 size={18} />
                    <span>Real-Time Command</span>
                  </button>
                  <button onClick={() => handleOpenModal(selectedCampaign)} className="p-5 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-white rounded-[22px] transition-all shadow-lg active:scale-95"><Settings size={24} /></button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 overflow-y-auto scrollbar-hide pr-2 flex-1 relative z-10">
                 {/* Card: Marcado */}
                 <div className="p-10 bg-slate-900/60 rounded-[56px] border border-slate-800 space-y-8 group hover:border-blue-500/30 transition-all shadow-inner">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Adaptive Dialing</h4>
                       <Sliders size={20} className="text-slate-700" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800 text-center">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Dial Ratio</p>
                          <p className="text-4xl font-black text-white mt-1 tabular-nums">{selectedCampaign.autoDialLevel}x</p>
                       </div>
                       <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800 text-center">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Hopper Pool</p>
                          <p className="text-4xl font-black text-white mt-1 tabular-nums">{selectedCampaign.hopperLevel}</p>
                       </div>
                    </div>
                 </div>

                 {/* Card: Network/IVR */}
                 <div className="p-10 bg-slate-900/60 rounded-[56px] border border-slate-800 space-y-8 group hover:border-emerald-500/30 transition-all shadow-inner">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em]">Network Routing</h4>
                       <Network size={20} className="text-slate-700" />
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active DID</span>
                          <span className="text-xs font-mono font-black text-emerald-400">{MOCK_DIDS.find(d => d.id === selectedCampaign.inboundDIDId)?.number || 'No Assigned'}</span>
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">IVR Flow</span>
                          <span className="text-[10px] font-black text-white uppercase">{MOCK_IVR_FLOWS.find(i => i.id === selectedCampaign.ivrId)?.name || 'Direct Route'}</span>
                       </div>
                    </div>
                 </div>

                 {/* Card: Intelligence */}
                 <div className="p-10 bg-slate-900/60 rounded-[56px] border border-slate-800 space-y-8 group hover:border-purple-500/30 transition-all shadow-inner">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.3em]">Neural AI Engine</h4>
                       <Bot size={20} className="text-slate-700" />
                    </div>
                    <div className="flex items-center space-x-6">
                       <div className="w-16 h-16 rounded-[24px] bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20 shadow-lg">
                          <Sparkles size={28} />
                       </div>
                       <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">Gemini 3 Pro Linked</p>
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Bot: {MOCK_BOTS.find(b => b.id === selectedCampaign.aiBotId)?.name || 'None'}</p>
                       </div>
                    </div>
                 </div>

                 {/* Card: Staffing */}
                 <div className="p-10 bg-slate-900/60 rounded-[56px] border border-slate-800 space-y-8 group hover:border-amber-500/30 transition-all shadow-inner">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-[0.3em]">Staffing Matrix</h4>
                       <Users size={20} className="text-slate-700" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {selectedCampaign.groupIds?.map(gid => (
                         <span key={gid} className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-white uppercase tracking-widest">{MOCK_USER_GROUPS.find(g => g.id === gid)?.name}</span>
                       ))}
                       <span className="px-4 py-2 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-black text-slate-600 uppercase tracking-widest">+{selectedCampaign.userIds?.length} Agentes</span>
                    </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center glass rounded-[64px] border border-slate-800 p-20 opacity-30">
              <Target size={80} className="text-slate-700 mb-8" />
              <h3 className="text-3xl font-black text-slate-500 uppercase tracking-[0.4em]">Propiedades de Campaña</h3>
            </div>
          )}
        </div>
      </div>

      {/* MODAL MAESTRO DE CONFIGURACIÓN */}
      {isModalOpen && editingCampaign && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-full max-w-6xl h-[85vh] glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden flex flex-col">
              
              {isSaving && (
                <div className="absolute inset-0 z-[200] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-8 text-center p-10">
                   <div className="relative">
                      <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                      <RefreshCw size={48} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-3">Syncing Neural Core</h3>
                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse italic">Re-configurando clúster de FreeSwitch y Gemini Nodes...</p>
                   </div>
                </div>
              )}

              <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 shrink-0">
                 <div className="flex items-center space-x-6">
                    <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                       <Target size={32} />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Blueprint de Campaña</h3>
                       <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Definición Estructural y Comportamiento SIP</p>
                    </div>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 rounded-[28px] text-slate-500 hover:text-white transition-all shadow-xl"><X size={28} /></button>
              </div>

              {/* Tabs de Navegación del Modal */}
              <div className="bg-slate-900/20 px-10 pt-4 flex space-x-10 border-b border-slate-800 shrink-0 overflow-x-auto scrollbar-hide">
                 {[
                   { id: 'GENERAL', label: 'Algoritmo Marcado', icon: Sliders },
                   { id: 'ROUTING', label: 'Red & Grabación', icon: Network },
                   { id: 'LISTS', label: 'Leads Pool', icon: Database },
                   { id: 'STAFFING', label: 'Staffing & Pausas', icon: Users },
                   { id: 'DISPOSITIONS', label: 'Tipificaciones', icon: ListChecks },
                   { id: 'INTELLIGENCE', label: 'IA Voice Engine', icon: Bot }
                 ].map(tab => (
                   <button 
                    key={tab.id}
                    onClick={() => setActiveModalTab(tab.id as CampaignTab)}
                    className={`flex items-center space-x-3 pb-6 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all whitespace-nowrap ${activeModalTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                   >
                     <tab.icon size={16} />
                     <span>{tab.label}</span>
                   </button>
                 ))}
              </div>

              <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
                 {/* TAB: GENERAL (Algoritmo) */}
                 {activeModalTab === 'GENERAL' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Alias de Campaña</label>
                            <input 
                              type="text" 
                              value={editingCampaign.name}
                              onChange={e => setEditingCampaign({...editingCampaign, name: e.target.value})}
                              className="w-full bg-slate-950 border-2 border-slate-800 rounded-[32px] px-8 py-5 text-sm text-white font-black uppercase outline-none focus:border-blue-500 shadow-inner" 
                            />
                         </div>
                         
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Campaña</label>
                               <select 
                                value={editingCampaign.campaignType}
                                onChange={e => setEditingCampaign({...editingCampaign, campaignType: e.target.value as CampaignType})}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-6 py-5 text-[10px] text-white font-black uppercase outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer"
                               >
                                  <option value="OUTBOUND">OUTBOUND (Salida)</option>
                                  <option value="INBOUND">INBOUND (Entrada)</option>
                                  <option value="BLENDED">BLENDED (Mixto)</option>
                                  <option value="SURVEY">SURVEY (Encuesta IA)</option>
                               </select>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Modo de Marcación</label>
                               <select 
                                value={editingCampaign.dialMethod}
                                onChange={e => setEditingCampaign({...editingCampaign, dialMethod: e.target.value as any})}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-6 py-5 text-[10px] text-white font-black uppercase outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer"
                               >
                                  <option value="MANUAL">MANUAL</option>
                                  <option value="RATIO">RATIO (Multi-Dial)</option>
                                  <option value="PREDICTIVE">PREDICTIVE (Neural)</option>
                                </select>
                            </div>
                         </div>

                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Dial Level (Ratio / Pacing)</label>
                            <input 
                              type="number" step="0.5" min="1" max="10"
                              disabled={editingCampaign.dialMethod === 'MANUAL'}
                              value={editingCampaign.autoDialLevel}
                              onChange={e => setEditingCampaign({...editingCampaign, autoDialLevel: parseFloat(e.target.value)})}
                              className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-blue-400 font-black outline-none focus:border-blue-500 shadow-inner disabled:opacity-30 transition-all" 
                            />
                         </div>
                      </div>
                      <div className="p-10 bg-slate-900 border border-slate-800 rounded-[56px] space-y-8 shadow-inner relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-5 text-amber-500"><SlidersHorizontal size={100} /></div>
                         <div className="flex items-center space-x-4 mb-2">
                            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500"><Info size={20} /></div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Protección de Marca</h4>
                         </div>
                         <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                               <span className="text-[10px] font-black text-slate-500 uppercase">Max Drop Rate %</span>
                               <span className="text-xs font-mono font-black text-rose-500">{editingCampaign.adaptiveMaxDropRate || 3.0}%</span>
                            </div>
                            <input 
                              type="range" min="0.5" max="5.0" step="0.1"
                              value={editingCampaign.adaptiveMaxDropRate || 3.0}
                              onChange={e => setEditingCampaign({...editingCampaign, adaptiveMaxDropRate: parseFloat(e.target.value)})}
                              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                            />
                         </div>
                         <p className="text-[10px] text-slate-600 font-bold uppercase tracking-wider leading-relaxed italic">
                           El motor reducirá automáticamente el ratio si el porcentaje de llamadas colgadas supera este límite federal.
                         </p>
                      </div>
                   </div>
                 )}

                 {/* TAB: ROUTING (Red & Grabación) */}
                 {activeModalTab === 'ROUTING' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-8">
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Inbound DID (Punto de Entrada)</label>
                            <div className="relative group">
                               <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-400 transition-colors" size={20} />
                               <select 
                                 value={editingCampaign.inboundDIDId}
                                 onChange={e => setEditingCampaign({...editingCampaign, inboundDIDId: e.target.value})}
                                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-[32px] pl-16 pr-6 py-5 text-sm text-white font-bold outline-none focus:border-emerald-500 appearance-none shadow-inner"
                               >
                                  <option value="">Ningún DID asignado</option>
                                  {MOCK_DIDS.filter(d => d.allowedUsage !== 'OUTBOUND').map(d => (
                                    <option key={d.id} value={d.id}>{d.number} - {d.description}</option>
                                  ))}
                               </select>
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">IVR Routing Workflow</label>
                            <div className="relative group">
                               <GitMerge className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={20} />
                               <select 
                                 value={editingCampaign.ivrId}
                                 onChange={e => setEditingCampaign({...editingCampaign, ivrId: e.target.value})}
                                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-[32px] pl-16 pr-6 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 appearance-none shadow-inner"
                               >
                                  <option value="">Acceso Directo (No IVR)</option>
                                  {MOCK_IVR_FLOWS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                               </select>
                            </div>
                         </div>
                         <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-4">
                            <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center">
                              <Mic size={14} className="mr-2" /> Política de Grabación
                            </h4>
                            <div className="space-y-2">
                               <select 
                                value={editingCampaign.recordingMode}
                                onChange={e => setEditingCampaign({...editingCampaign, recordingMode: e.target.value as any})}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-bold outline-none focus:border-emerald-500 appearance-none shadow-inner cursor-pointer"
                               >
                                  <option value="ALL_CALLS">GRABAR TODO (FULL)</option>
                                  <option value="MANUAL">GRABACIÓN MANUAL</option>
                                  <option value="NEVER">DESACTIVADO</option>
                               </select>
                               <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-2 px-2 leading-relaxed">
                                 {editingCampaign.recordingMode === 'ALL_CALLS' ? 'Misión Crítica: Se grabarán todas las interacciones automáticamente.' : 'Aviso: La grabación requiere activación manual por parte del agente.'}
                               </p>
                            </div>
                         </div>
                      </div>
                      <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Outbound Signaling</h4>
                        <div className="p-8 bg-slate-900 border border-slate-800 rounded-[56px] space-y-6">
                           <div className="space-y-3">
                              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">CallerID Forzado (Masking)</label>
                              <input 
                                type="text" 
                                value={editingCampaign.outboundDID}
                                onChange={e => setEditingCampaign({...editingCampaign, outboundDID: e.target.value})}
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 py-4 text-xs text-blue-300 font-mono outline-none focus:border-blue-500" 
                                placeholder="Default System CID"
                              />
                           </div>
                           <div className="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-slate-800">
                              <div className="flex items-center space-x-3">
                                 <Smartphone size={16} className="text-slate-600" />
                                 <span className="text-[10px] font-black text-slate-400 uppercase">Detectar Contestadores (AMD)</span>
                              </div>
                              <button 
                                onClick={() => setEditingCampaign({...editingCampaign, amdEnabled: !editingCampaign.amdEnabled})}
                                className={`w-12 h-6 rounded-full relative transition-all duration-500 ${editingCampaign.amdEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
                              >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${editingCampaign.amdEnabled ? 'right-1' : 'left-1'}`}></div>
                              </button>
                           </div>
                        </div>
                      </div>
                   </div>
                 )}

                 {/* TAB: LISTS (Leads Pool) */}
                 {activeModalTab === 'LISTS' && (
                   <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex-1">Bases de Datos Vinculadas</h4>
                         <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-10">Selecciona los pools que el hopper debe consumir</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {MOCK_LISTS.map(list => (
                           <div 
                             key={list.id}
                             onClick={() => toggleSelection('listIds', list.id)}
                             className={`p-8 rounded-[48px] border-2 cursor-pointer transition-all flex items-center justify-between group ${editingCampaign.listIds?.includes(list.id) ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'glass border-slate-800 hover:border-slate-700'}`}
                           >
                              <div className="flex items-center space-x-5">
                                 <div className={`p-4 rounded-2xl transition-all ${editingCampaign.listIds?.includes(list.id) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-950 text-slate-700'}`}>
                                    <Database size={24} />
                                 </div>
                                 <div>
                                    <h4 className="font-black text-sm text-white uppercase tracking-tight">{list.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-widest">{list.count.toLocaleString()} Leads</p>
                                 </div>
                              </div>
                              {editingCampaign.listIds?.includes(list.id) && <Check size={20} className="text-blue-400" />}
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 {/* TAB: STAFFING (Users & Pauses) */}
                 {activeModalTab === 'STAFFING' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-8">
                         <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Grupos de Agentes</h4>
                         <div className="space-y-3">
                            {MOCK_USER_GROUPS.map(grp => (
                               <div 
                                 key={grp.id}
                                 onClick={() => toggleSelection('groupIds', grp.id)}
                                 className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-center justify-between ${editingCampaign.groupIds?.includes(grp.id) ? 'bg-blue-600/10 border-blue-500' : 'bg-slate-950 border-slate-800'}`}
                               >
                                  <span className="text-[11px] font-black text-white uppercase tracking-widest">{grp.name}</span>
                                  {editingCampaign.groupIds?.includes(grp.id) && <CheckCircle2 size={18} className="text-blue-400" />}
                               </div>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-8">
                         <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Whitelist de Pausas</h4>
                         <div className="grid grid-cols-2 gap-3">
                            {PAUSE_CODES.map(pc => (
                               <button 
                                 key={pc.id}
                                 onClick={() => toggleSelection('pauseCodeIds', pc.id)}
                                 className={`p-5 rounded-2xl border-2 font-black text-[9px] uppercase tracking-widest transition-all flex items-center justify-between ${editingCampaign.pauseCodeIds?.includes(pc.id) ? 'bg-amber-600/10 border-amber-500 text-amber-400 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-700'}`}
                               >
                                 <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pc.color }}></div>
                                    <span>{pc.name}</span>
                                 </div>
                                 {editingCampaign.pauseCodeIds?.includes(pc.id) && <Check size={14} />}
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                 )}

                 {/* TAB: DISPOSITIONS */}
                 {activeModalTab === 'DISPOSITIONS' && (
                   <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex-1">Matriz de Tipificación</h4>
                        <button 
                          onClick={() => setEditingCampaign({...editingCampaign, callCodeIds: MOCK_CALL_CODES.map(c => c.id)})}
                          className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:underline ml-10"
                        >
                          Seleccionar Todos
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                         {MOCK_CALL_CODES.map(code => (
                           <div 
                             key={code.id}
                             onClick={() => toggleSelection('callCodeIds', code.id)}
                             className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex flex-col justify-between group ${editingCampaign.callCodeIds?.includes(code.id) ? 'bg-emerald-600/10 border-emerald-500 shadow-xl' : 'glass border-slate-800 hover:border-slate-700'}`}
                           >
                              <div className="flex justify-between items-start mb-6">
                                 <div className={`p-2 rounded-xl ${editingCampaign.callCodeIds?.includes(code.id) ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-700'}`}>
                                    <Shield size={18} />
                                 </div>
                                 {editingCampaign.callCodeIds?.includes(code.id) && <CheckCircle2 size={20} className="text-emerald-400" />}
                              </div>
                              <div>
                                 <h4 className="font-black text-xs text-white uppercase tracking-tight">{code.name}</h4>
                                 <span className="text-[8px] font-black text-slate-500 uppercase mt-1">ID: {code.id}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                 )}

                 {/* TAB: INTELLIGENCE (IA Voice Bot) */}
                 {activeModalTab === 'INTELLIGENCE' && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="space-y-10">
                         <div className="space-y-3">
                            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Vincular Agente Virtual (Neural Node)</label>
                            <div className="relative group">
                               <Bot className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-purple-400 transition-colors" size={24} />
                               <select 
                                 value={editingCampaign.aiBotId}
                                 onChange={e => setEditingCampaign({...editingCampaign, aiBotId: e.target.value})}
                                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-[32px] pl-16 pr-6 py-6 text-sm text-purple-400 font-black uppercase outline-none focus:border-purple-500 appearance-none shadow-inner cursor-pointer"
                               >
                                  <option value="">Sin IA vinculada</option>
                                  {MOCK_BOTS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                               </select>
                            </div>
                         </div>
                         <div className="p-8 glass rounded-[48px] border border-purple-500/20 bg-purple-600/5 space-y-6 shadow-inner group">
                            <div className="flex items-center space-x-4">
                               <Sparkles className="text-purple-400 animate-pulse" size={32} />
                               <h4 className="text-xl font-black text-white uppercase tracking-tighter">Gemini 3 Pro Bridge</h4>
                            </div>
                            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider leading-relaxed">
                               Activa la extracción automática de datos mediante LLM para esta campaña. El bot guardará información estructurada directamente en el pool de leads.
                            </p>
                            <button className="text-[10px] font-black text-purple-400 hover:text-purple-300 uppercase tracking-[0.2em] flex items-center group-hover:translate-x-2 transition-all">
                               Ir al AI Studio <ChevronRight size={14} className="ml-1" />
                            </button>
                         </div>
                      </div>
                      <div className="space-y-8">
                         <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Extracción Directa (Key/Value)</h4>
                         <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                            {['Presupuesto Estimado', 'Nivel Interés (1-10)', 'Confirma Cita', 'Urgencia'].map(field => (
                               <div key={field} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-between group hover:border-purple-500/40 transition-all">
                                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{field}</span>
                                  <div className="flex items-center space-x-2 text-[9px] font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                     <RefreshCw size={10} className="animate-spin" />
                                     <span>Auto-Extract</span>
                                  </div>
                               </div>
                            ))}
                            <button className="w-full py-4 border-2 border-dashed border-slate-800 rounded-3xl text-[10px] font-black text-slate-700 uppercase tracking-widest hover:border-slate-700 hover:text-slate-500 transition-all">Definir Nuevo Campo IA</button>
                         </div>
                      </div>
                   </div>
                 )}
              </div>

              {/* Botonera de Acción Modal */}
              <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-8 shadow-2xl shrink-0">
                 <div className="flex items-center space-x-3 text-[11px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                    <ShieldCheck size={20} className="text-emerald-500" />
                    <span>Configuración Firmada vía SHA-256</span>
                 </div>
                 <button 
                  onClick={handleSave}
                  disabled={isSaving || !editingCampaign.name}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-16 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-4 group"
                 >
                   {isSaving ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSaving ? 'Sincronizando...' : 'Sellar y Aplicar'}</span>
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
