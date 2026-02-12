/**
 * @file BroadcastAI.tsx
 * @description Motor de emisión masiva de llamadas con integración de IA.
 * Permite la gestión de campañas, configuración de extracción de datos via LLM,
 * validación de leads y ahora incluye un algoritmo de marcado adaptativo.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, Zap, Users, Play, Pause, Square, Plus, Settings, 
  Database, MessageSquare, Target, CheckCircle2, AlertCircle,
  BarChart3, RefreshCw, ChevronRight, Mic, Info, Trash2, 
  Save, Sparkles, Filter, Activity, PieChart, Search, 
  Smartphone, Share2, Terminal, Wand2, ArrowUpRight, X,
  Clock, Hash, BrainCircuit, Type as TypeIcon, ListChecks,
  CalendarDays, ToggleRight, Download, Trash, ShieldCheck,
  FileCheck, AlertTriangle, Cpu, TrendingUp, Gauge, Volume2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, Cell, PieChart as RePieChart, Pie 
} from 'recharts';
import { useToast } from '../ToastContext';

/** Interfaz para los campos que la IA debe extraer de la conversación */
interface ExtractionField {
  id: string;
  field: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';
  required: boolean;
}

/** Interfaz principal de la campaña de Broadcast */
interface BroadcastCampaign {
  id: string;
  name: string;
  status: 'RUNNING' | 'PAUSED' | 'COMPLETED';
  totalLeads: number;
  processed: number;
  converted: number;
  failed: number;
  concurrency: number;
  aiPrompt: string;
  voiceName: string;
  extractionFields: ExtractionField[];
  // Campos para Marcado Adaptativo
  isAdaptive: boolean;
  targetDropRate: number;
  currentDropRate: number;
}

/** Interfaz para los logs del dialer en tiempo real */
interface DialerLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR' | 'SYSTEM';
  message: string;
  callId?: string;
}

/** Interfaz para el resumen de validación de leads */
interface ValidationSummary {
  total: number;
  valid: number;
  invalid: number;
  duplicates: number;
  dncMatches: number;
  timestamp: string;
}

const FIELD_TEMPLATES: Omit<ExtractionField, 'id'>[] = [
  { field: 'Presupuesto Estimado', type: 'NUMBER', required: true },
  { field: 'Nivel de Interés', type: 'STRING', required: true },
  { field: 'Confirma Cita', type: 'BOOLEAN', required: true },
  { field: 'Fecha de Seguimiento', type: 'DATE', required: false },
  { field: 'Resumen de Objeción', type: 'STRING', required: false },
  { field: 'Score de Calificación', type: 'NUMBER', required: false },
];

const MOCK_BROADCAST_CAMPAIGNS: BroadcastCampaign[] = [
  { 
    id: 'bc_1', 
    name: 'Prospección Inmobiliaria Florida', 
    status: 'RUNNING', 
    totalLeads: 5000, 
    processed: 1240, 
    converted: 185, 
    failed: 45, 
    concurrency: 25,
    isAdaptive: true,
    targetDropRate: 3.0,
    currentDropRate: 2.1,
    voiceName: 'Helena - Emotional Professional',
    aiPrompt: 'Tu objetivo es contactar con el dueño de la propiedad. Saluda cordialmente y menciona que tenemos una oferta de compra directa. Califica su urgencia de venta.',
    extractionFields: [
      { id: '1', field: 'Precio Deseado', type: 'NUMBER', required: true },
      { id: '2', field: 'Urgencia (1-10)', type: 'NUMBER', required: true },
      { id: '3', field: 'Fecha de Visita', type: 'DATE', required: false },
      { id: '4', field: 'Comentarios Adicionales', type: 'STRING', required: false },
    ]
  },
  { 
    id: 'bc_2', 
    name: 'Encuesta Satisfacción Q4', 
    status: 'PAUSED', 
    totalLeads: 2500, 
    processed: 800, 
    converted: 62, 
    failed: 12, 
    concurrency: 0,
    isAdaptive: false,
    targetDropRate: 5.0,
    currentDropRate: 0.0,
    voiceName: 'Puck - Friendly Casual',
    aiPrompt: 'Realiza una encuesta breve sobre el servicio de soporte. Pregunta si resolvieron su problema y su nivel de satisfacción general.',
    extractionFields: [
      { id: '5', field: 'Problema Resuelto', type: 'BOOLEAN', required: true },
      { id: '6', field: 'Satisfacción (1-5)', type: 'NUMBER', required: true },
      { id: '7', field: 'Feedback Abierto', type: 'STRING', required: false }
    ]
  }
];

const BroadcastAI: React.FC = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>(MOCK_BROADCAST_CAMPAIGNS);
  const [selectedBc, setSelectedBc] = useState<BroadcastCampaign>(MOCK_BROADCAST_CAMPAIGNS[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [dialerLogs, setDialerLogs] = useState<DialerLog[]>([]);
  const [isLogsPaused, setIsLogsPaused] = useState(false);
  const [editingBc, setEditingBc] = useState<Partial<BroadcastCampaign> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- Estados de Validación de Datos ---
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationSummary | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * EFECTO: Generación de logs simulados para telemetría del dialer.
   */
  useEffect(() => {
    if (isLogsPaused) return;

    const interval = setInterval(() => {
      const activeCampaigns = campaigns.filter(c => c.status === 'RUNNING');
      if (activeCampaigns.length === 0) return;

      const randomC = activeCampaigns[Math.floor(Math.random() * activeCampaigns.length)];
      const levels: DialerLog['level'][] = ['INFO', 'SUCCESS', 'WARN', 'ERROR', 'SYSTEM'];
      
      const actions = [
        `Marcando lead +1 ${Math.floor(Math.random()*900)+100}-${Math.floor(Math.random()*9000)+1000}`,
        `Llamada conectada. Iniciando protocolo de voz ${randomC.voiceName}`,
        `Extrayendo structured data via Gemini LLM`,
        `Falla de conexión: carrier congestion (SIP 503)`,
        `Lead calificado positivamente. Enviando a CRM`,
        `AMD: Contestador detectado. Terminando sesión`,
      ];

      // Lógica extra para modo adaptativo
      if (randomC.isAdaptive && Math.random() > 0.7) {
        const drift = (Math.random() - 0.5) * 0.4;
        const newDrop = Math.max(0.1, Math.min(10, randomC.currentDropRate + drift));
        const scalingAction = newDrop > randomC.targetDropRate ? 'SCALING DOWN' : 'SCALING UP';
        
        const systemLog: DialerLog = {
          id: Math.random().toString(36).substr(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          level: 'SYSTEM',
          message: `Adaptive Engine: Current Drop Rate ${newDrop.toFixed(2)}% vs Target ${randomC.targetDropRate}%. ${scalingAction} concurrency.`,
          callId: 'ENGINE'
        };
        setDialerLogs(prev => [...prev, systemLog].slice(-50));
      }

      const newLog: DialerLog = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: levels[Math.floor(Math.random() * (actions.length > 3 ? 4 : 2))], 
        message: actions[Math.floor(Math.random() * actions.length)],
        callId: `cid_${Math.random().toString(36).substr(2, 6)}`
      };

      setDialerLogs(prev => [...prev, newLog].slice(-50));
    }, 2500);

    return () => clearInterval(interval);
  }, [campaigns, isLogsPaused]);

  useEffect(() => {
    if (scrollRef.current && !isLogsPaused) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [dialerLogs, isLogsPaused]);

  const statsData = [
    { name: 'Leads Recolectados', value: selectedBc.converted, color: '#10b981' },
    { name: 'Sin Interés', value: Math.max(0, selectedBc.processed - selectedBc.converted - selectedBc.failed), color: '#3b82f6' },
    { name: 'Fallidas / Buzón', value: selectedBc.failed, color: '#ef4444' },
  ];

  /** 
   * Lógica de Validación de Leads
   */
  const handleValidateLeads = async () => {
    if (!selectedBc) return;
    setIsValidating(true);
    setValidationResults(null);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const total = selectedBc.totalLeads;
    const results: ValidationSummary = {
      total,
      valid: Math.floor(total * 0.92),
      invalid: Math.floor(total * 0.03),
      duplicates: Math.floor(total * 0.04),
      dncMatches: Math.floor(total * 0.01),
      timestamp: new Date().toLocaleString()
    };

    setValidationResults(results);
    setIsValidating(false);
    toast('Escaneo de integridad de leads finalizado con éxito.', 'success', 'Validación de Datos');
  };

  const handleOpenModal = (bc?: BroadcastCampaign) => {
    if (bc) {
      setEditingBc({ ...bc });
    } else {
      setEditingBc({
        id: `bc_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        status: 'PAUSED',
        totalLeads: 0,
        processed: 0,
        converted: 0,
        failed: 0,
        concurrency: 10,
        isAdaptive: true,
        targetDropRate: 3.0,
        currentDropRate: 0.0,
        voiceName: 'Helena - Emotional Professional',
        aiPrompt: 'Tu objetivo es...',
        extractionFields: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCampaignModal = async () => {
    if (!editingBc?.name) return;
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const isExisting = campaigns.find(c => c.id === editingBc.id);
    const fullBc = editingBc as BroadcastCampaign;
    
    if (isExisting) {
      setCampaigns(campaigns.map(c => c.id === editingBc.id ? fullBc : c));
    } else {
      setCampaigns([...campaigns, fullBc]);
    }
    
    if (selectedBc.id === editingBc.id) {
      setSelectedBc(fullBc);
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setEditingBc(null);
    toast('Configuración de campaña actualizada correctamente.', 'success', 'Sincronización OK');
  };

  const handleSavePrompt = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setCampaigns(campaigns.map(c => c.id === selectedBc.id ? selectedBc : c));
    setIsSaving(false);
    toast('Protocolo de conversación AI actualizado y sellado.', 'success', 'Core AI Updated');
  };

  const handleDeleteCampaign = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('¿Estás seguro de eliminar esta campaña de Broadcast? Esta acción es irreversible.')) {
      const newList = campaigns.filter(c => c.id !== id);
      setCampaigns(newList);
      if (selectedBc.id === id && newList.length > 0) {
        setSelectedBc(newList[0]);
      }
      toast('Campaña eliminada del pipeline.', 'warning', 'Recurso Removido');
    }
  };

  const toggleCampaignStatus = (id: string) => {
    const updated = campaigns.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'RUNNING' ? 'PAUSED' : 'RUNNING';
        return { ...c, status: newStatus as any, concurrency: newStatus === 'RUNNING' ? 25 : 0 };
      }
      return c;
    });
    setCampaigns(updated);
    const found = updated.find(c => c.id === id);
    if (found) {
      setSelectedBc(found);
      toast(`Broadcast ${found.status === 'RUNNING' ? 'Iniciado' : 'Pausado'}.`, found.status === 'RUNNING' ? 'success' : 'info');
    }
  };

  const updateCampaignProperty = (key: keyof BroadcastCampaign, value: any) => {
    const updatedBc = { ...selectedBc, [key]: value };
    setSelectedBc(updatedBc);
  };

  const addExtractionField = (template?: Omit<ExtractionField, 'id'>) => {
    if (!selectedBc) return;
    const newField: ExtractionField = {
      id: Math.random().toString(36).substr(2, 5),
      field: template?.field || 'Nuevo Campo',
      type: template?.type || 'STRING',
      required: template?.required || false
    };
    const updatedBc = { ...selectedBc, extractionFields: [...selectedBc.extractionFields, newField] };
    setSelectedBc(updatedBc);
  };

  const updateFieldProperty = (fieldId: string, property: keyof ExtractionField, value: any) => {
    const updatedFields = selectedBc.extractionFields.map(f => 
      f.id === fieldId ? { ...f, [property]: value } : f
    );
    const updatedBc = { ...selectedBc, extractionFields: updatedFields };
    setSelectedBc(updatedBc);
  };

  const removeExtractionField = (fieldId: string) => {
    const updatedFields = selectedBc.extractionFields.filter(f => f.id !== fieldId);
    const updatedBc = { ...selectedBc, extractionFields: updatedFields };
    setSelectedBc(updatedBc);
  };

  const handleDownloadResults = () => {
    toast('Preparando exportación de resultados estructurados. El enlace de descarga estará listo en breve.', 'info', 'Export Engine');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Radio className="mr-4 text-rose-500 animate-pulse" size={36} />
            Broadcast AI Engine
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Motor masivo de llamadas con extracción de datos via LLM.</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => setShowLogs(true)}
             className={`flex items-center space-x-3 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 px-6 py-3 rounded-2xl transition-all ${showLogs ? 'border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' : 'text-slate-400'}`}
           >
             <Terminal size={18} className={showLogs ? 'animate-pulse' : ''} />
             <span className="text-[10px] font-black uppercase tracking-widest">Live Dialer Logs</span>
           </button>
           <button 
             onClick={() => handleOpenModal()}
             className="flex items-center space-x-3 bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-[24px] transition-all shadow-xl shadow-rose-600/30 active:scale-95 group"
           >
             <Plus size={22} className="group-hover:rotate-90 transition-transform" />
             <span className="font-black text-xs uppercase tracking-widest">Nuevo Broadcast</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Pipeline de Emisión */}
        <div className="lg:col-span-4 space-y-4 overflow-y-auto scrollbar-hide max-h-[800px]">
           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4 flex items-center px-4">
             <Database size={14} className="mr-2" /> Pipeline de Emisión
           </h4>
           {campaigns.map(bc => (
             <div 
              key={bc.id} 
              onClick={() => { setSelectedBc(bc); setValidationResults(null); }}
              className={`p-6 rounded-[40px] border-2 cursor-pointer transition-all relative overflow-hidden group ${selectedBc?.id === bc.id ? 'bg-rose-600/10 border-rose-500 shadow-2xl' : 'glass border-slate-800 hover:border-slate-700'}`}
             >
                <div className="flex items-center justify-between mb-4">
                   <div className={`p-2 rounded-xl ${bc.status === 'RUNNING' ? 'bg-rose-500 text-white shadow-[0_0_15px_#f43f5e]' : 'bg-slate-800 text-slate-500'}`}>
                      <Radio size={20} className={bc.status === 'RUNNING' ? 'animate-pulse' : ''} />
                   </div>
                   <div className="flex items-center space-x-2">
                     {bc.isAdaptive && (
                        <div className="bg-blue-600 text-white p-1 rounded-lg animate-pulse" title="Adaptive Mode Active">
                           <Cpu size={12} />
                        </div>
                     )}
                     <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(bc); }}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"
                     >
                       <Settings size={14} />
                     </button>
                     <button 
                      onClick={(e) => handleDeleteCampaign(bc.id, e)}
                      className="p-1.5 hover:bg-rose-500/10 rounded-lg text-slate-500 hover:text-rose-500 transition-all"
                     >
                       <Trash size={14} />
                     </button>
                     <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${bc.status === 'RUNNING' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-500'}`}>
                        {bc.status}
                     </div>
                   </div>
                </div>
                <h3 className="font-black text-white text-base uppercase truncate leading-tight">{bc.name}</h3>
                <div className="mt-6 space-y-3">
                   <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase">
                      <span>Procesado</span>
                      <span>{Math.round((bc.processed / (bc.totalLeads || 1)) * 100)}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-1000 ${bc.status === 'RUNNING' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-slate-600'}`} style={{ width: `${(bc.processed / (bc.totalLeads || 1)) * 100}%` }}></div>
                   </div>
                </div>
                <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-800/50">
                   <div className="flex items-center space-x-2">
                      <Target size={14} className="text-emerald-400" />
                      <span className="text-[11px] font-black text-white">{bc.converted} Leads</span>
                   </div>
                   <div className="flex items-center space-x-2">
                      <Users size={14} className="text-blue-400" />
                      <span className="text-[11px] font-black text-slate-400">{bc.concurrency} Slots</span>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Panel de Control de la Campaña Seleccionada */}
        {selectedBc ? (
          <div className="lg:col-span-8 space-y-8 animate-in fade-in duration-500">
             <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-[28px] bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                         <Activity size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-white uppercase tracking-tight">{selectedBc.name}</h3>
                         <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Panel de Control del Bot</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-4 bg-slate-950 p-2 rounded-[28px] border border-slate-800 shadow-inner">
                      <button 
                        onClick={handleValidateLeads}
                        disabled={isValidating || selectedBc.status === 'RUNNING'}
                        className={`flex items-center space-x-3 px-6 py-3.5 rounded-[20px] transition-all shadow-xl active:scale-95 disabled:opacity-30 ${
                          isValidating 
                            ? 'bg-slate-800 text-blue-400' 
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isValidating ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                        <span className="font-black text-[10px] uppercase tracking-widest">
                          {isValidating ? 'Validando...' : 'Validar Leads'}
                        </span>
                      </button>

                      <button 
                        onClick={() => toggleCampaignStatus(selectedBc.id)}
                        className={`flex items-center space-x-3 px-8 py-3.5 rounded-[20px] transition-all shadow-xl active:scale-95 ${
                          selectedBc.status === 'RUNNING' 
                            ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {selectedBc.status === 'RUNNING' ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                        <span className="font-black text-[10px] uppercase tracking-widest">
                          {selectedBc.status === 'RUNNING' ? 'Pausar Emisión' : 'Iniciar Broadcast'}
                        </span>
                      </button>
                   </div>
                </div>

                {/* Algoritmo Adaptativo Controls */}
                <div className="mb-10 p-8 glass rounded-[40px] border border-blue-500/20 bg-blue-600/5 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <Cpu size={120} />
                   </div>
                   <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="flex items-center space-x-4">
                         <div className={`p-3 rounded-2xl shadow-lg transition-all ${selectedBc.isAdaptive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            <Gauge size={24} />
                         </div>
                         <div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">Adaptive Dialing Protocol</h4>
                            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Escalado dinámico de concurrencia</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => updateCampaignProperty('isAdaptive', !selectedBc.isAdaptive)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${selectedBc.isAdaptive ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-white'}`}
                      >
                         {selectedBc.isAdaptive ? 'Algorithm Active' : 'Enable Adaptive'}
                      </button>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                      <div className="space-y-3">
                         <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Drop Rate</label>
                            <span className="text-xs font-mono font-black text-blue-400">{selectedBc.targetDropRate.toFixed(1)}%</span>
                         </div>
                         <input 
                            type="range" min="0.5" max="10" step="0.1"
                            value={selectedBc.targetDropRate}
                            onChange={(e) => updateCampaignProperty('targetDropRate', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                         />
                      </div>
                      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                         <div className="flex items-center justify-between">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Current Drop Rate</p>
                            <TrendingUp size={10} className={selectedBc.currentDropRate > selectedBc.targetDropRate ? 'text-rose-500' : 'text-emerald-500'} />
                         </div>
                         <p className={`text-2xl font-black tracking-tighter ${selectedBc.currentDropRate > selectedBc.targetDropRate ? 'text-rose-500' : 'text-emerald-400'}`}>
                            {selectedBc.currentDropRate.toFixed(2)}%
                         </p>
                      </div>
                      <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1">
                         <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Scaling Recommendation</p>
                         <p className="text-[11px] font-black text-blue-400 uppercase tracking-tighter mt-1">
                            {selectedBc.currentDropRate > selectedBc.targetDropRate ? 'SCALING DOWN (-2 slots)' : 'SCALING UP (+5 slots)'}
                         </p>
                      </div>
                   </div>
                </div>

                {/* Lead Integrity Audit (If results present) */}
                {validationResults && (
                  <div className="mb-10 animate-in zoom-in-95 duration-500">
                    <div className="p-8 bg-blue-600/5 border-2 border-blue-500/30 rounded-[40px] shadow-inner relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                          <FileCheck size={180} />
                       </div>
                       <div className="flex items-center justify-between mb-8 relative z-10">
                          <div className="flex items-center space-x-4">
                             <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 shadow-lg">
                                <FileCheck size={24} />
                             </div>
                             <div>
                                <h4 className="text-lg font-black text-white uppercase tracking-tight">Lead Integrity Audit</h4>
                                <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Escaneo completado: {validationResults.timestamp}</p>
                             </div>
                          </div>
                          <button onClick={() => setValidationResults(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={18} /></button>
                       </div>

                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                          <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-1">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Formato Válido</p>
                             <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-black text-emerald-400">{validationResults.valid}</p>
                                <span className="text-[9px] text-emerald-600 font-bold">READY</span>
                             </div>
                          </div>
                          <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-1">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Estructura Err</p>
                             <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-black text-rose-500">{validationResults.invalid}</p>
                                <span className="text-[9px] text-rose-800 font-bold flex items-center"><AlertCircle size={10} className="mr-1" /> FIX</span>
                             </div>
                          </div>
                          <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-1">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">Duplicados</p>
                             <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-black text-amber-500">{validationResults.duplicates}</p>
                                <span className="text-[9px] text-amber-800 font-bold">CLEAN</span>
                             </div>
                          </div>
                          <div className="p-5 bg-slate-950/80 rounded-3xl border border-slate-800 space-y-1">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">DNC Blocked</p>
                             <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-black text-slate-400">{validationResults.dncMatches}</p>
                                <span className="text-[9px] text-slate-600 font-bold uppercase">Safe List</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <div className="p-6 bg-slate-900/60 rounded-[32px] border border-slate-800 flex flex-col justify-between group hover:border-emerald-500/20 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Tasa de Extracción</p>
                      <div className="flex items-baseline space-x-2">
                         <h4 className="text-4xl font-black text-emerald-400 tracking-tighter">{((selectedBc.converted / (selectedBc.processed || 1)) * 100).toFixed(1)}%</h4>
                         <span className="text-[10px] text-slate-600 font-bold">SUCCESS</span>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-900/60 rounded-[32px] border border-slate-800 flex flex-col justify-between group hover:border-blue-500/20 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Concurrencia Real</p>
                      <div className="flex items-baseline space-x-3">
                         <h4 className="text-4xl font-black text-white tracking-tighter">{selectedBc.concurrency}</h4>
                         <span className="text-[10px] text-blue-400 font-bold uppercase">Calls Active</span>
                      </div>
                   </div>
                   <div className="p-6 bg-slate-900/60 rounded-[32px] border border-slate-800 flex flex-col justify-between group hover:border-amber-500/20 transition-all">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Pendientes</p>
                      <div className="flex items-baseline space-x-2">
                         <h4 className="text-4xl font-black text-white tracking-tighter">{selectedBc.totalLeads - selectedBc.processed}</h4>
                         <span className="text-[10px] text-slate-600 font-bold">REMAINING</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                   {/* Visualization */}
                   <div className="p-8 bg-slate-950/80 rounded-[40px] border border-slate-800 flex flex-col">
                      <div className="flex items-center justify-between mb-8">
                         <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Telemetría de Campaña</h4>
                         <button 
                          onClick={handleDownloadResults}
                          className="p-2 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-xl transition-all border border-slate-800 shadow-lg"
                         >
                           <Download size={16} />
                         </button>
                      </div>
                      <div className="h-[250px] flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                               <Pie data={statsData} innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                                  {statsData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                               </Pie>
                               <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px' }} />
                            </RePieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="mt-6 space-y-3">
                         {statsData.map((d, i) => (
                           <div key={i} className="flex items-center justify-between text-[10px] font-black uppercase">
                              <div className="flex items-center">
                                 <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: d.color }}></div>
                                 <span className="text-slate-400">{d.name}</span>
                              </div>
                              <span className="text-white">{d.value}</span>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Data Extraction Config */}
                   <div className="p-8 bg-slate-950/80 rounded-[40px] border border-slate-800 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                         <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Extracción Structured Data</h4>
                         <Wand2 size={16} className="text-blue-500" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-slate-900/50 rounded-2xl border border-slate-800">
                         <span className="text-[8px] font-black text-slate-500 uppercase w-full mb-1 ml-1 tracking-widest">Ejemplos Rápidos</span>
                         {FIELD_TEMPLATES.map((tmpl, idx) => (
                           <button 
                             key={idx}
                             onClick={() => addExtractionField(tmpl)}
                             className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-[9px] font-black text-slate-400 hover:text-white hover:border-blue-500 transition-all flex items-center space-x-1.5"
                           >
                             <Plus size={10} />
                             <span>{tmpl.field}</span>
                           </button>
                         ))}
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto pr-2 scrollbar-hide max-h-[350px]">
                         {selectedBc.extractionFields.map(field => (
                            <div key={field.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 group hover:border-blue-500/40 transition-all shadow-inner">
                               <div className="flex items-center justify-between">
                                  <input 
                                    type="text" 
                                    value={field.field}
                                    onChange={(e) => updateFieldProperty(field.id, 'field', e.target.value)}
                                    className="bg-transparent text-[10px] font-black text-white uppercase tracking-tight outline-none focus:text-blue-400 w-full"
                                  />
                                  <button onClick={() => removeExtractionField(field.id)} className="p-1 text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={12} /></button>
                               </div>
                               <div className="flex items-center justify-between">
                                  <div className="flex space-x-2">
                                     <select 
                                       value={field.type}
                                       onChange={(e) => updateFieldProperty(field.id, 'type', e.target.value)}
                                       className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[8px] font-black text-blue-400 uppercase outline-none cursor-pointer"
                                     >
                                        <option value="STRING">STRING</option>
                                        <option value="NUMBER">NUMBER</option>
                                        <option value="BOOLEAN">BOOLEAN</option>
                                        <option value="DATE">DATE</option>
                                     </select>
                                     <button 
                                       onClick={() => updateFieldProperty(field.id, 'required', !field.required)}
                                       className={`px-2 py-1 rounded-lg border text-[8px] font-black uppercase transition-all ${field.required ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-600'}`}
                                     >
                                        {field.required ? 'REQUERIDO' : 'OPCIONAL'}
                                     </button>
                                  </div>
                               </div>
                            </div>
                         ))}
                         <button 
                          onClick={() => addExtractionField()}
                          className="w-full py-3 border-2 border-dashed border-slate-800 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:border-slate-700 transition-all flex items-center justify-center"
                         >
                            <Plus size={14} className="mr-2" /> Personalizar Nuevo Campo
                         </button>
                      </div>
                   </div>
                </div>
             </div>

             {/* AI Prompt / Protocolo de Conversación */}
             <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl space-y-8">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400">
                         <BrainCircuit size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-white uppercase tracking-tight">AI Conversation Protocol</h3>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Instrucciones semánticas del bot para esta campaña</p>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="bg-slate-950 rounded-3xl border border-slate-800 p-8 space-y-4 shadow-inner">
                      <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Lógica de Calificación (Gemini Core)</label>
                      <textarea 
                        className="w-full h-32 bg-transparent text-sm text-slate-300 font-medium outline-none resize-none leading-relaxed"
                        value={selectedBc.aiPrompt}
                        onChange={(e) => updateCampaignProperty('aiPrompt', e.target.value)}
                        placeholder="Describe el objetivo de la llamada y cómo debe calificar al lead..."
                      />
                   </div>
                </div>
                <div className="pt-6 border-t border-slate-800 flex justify-end">
                   <button 
                    onClick={handleSavePrompt}
                    disabled={isSaving}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center space-x-3 disabled:opacity-50"
                   >
                      {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                      <span>{isSaving ? 'Guardando...' : 'Guardar Protocolo AI'}</span>
                   </button>
                </div>
             </div>
          </div>
        ) : (
          <div className="lg:col-span-8 h-full flex flex-col items-center justify-center glass rounded-[56px] border border-slate-800 p-20 text-center opacity-40">
             <Radio size={80} className="text-slate-700 mb-8" />
             <h3 className="text-2xl font-black text-slate-500 uppercase tracking-widest">Selecciona una Campaña</h3>
             <p className="text-sm font-bold text-slate-600 mt-2 max-w-xs leading-relaxed uppercase tracking-wider">Inicia o configura un bot de broadcast desde el panel izquierdo.</p>
          </div>
        )}
      </div>

      {/* Modal de Creación / Edición */}
      {isModalOpen && editingBc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
               <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-rose-600/10 flex items-center justify-center text-rose-500 border border-rose-500/20 shadow-inner">
                     <Settings size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Broadcast Properties</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configuración técnica de la campaña</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl">
                 <X size={24} />
               </button>
            </div>

            <div className="p-12 space-y-10 overflow-y-auto max-h-[70vh] scrollbar-hide">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nombre de Campaña</label>
                 <input 
                   type="text" 
                   value={editingBc.name}
                   onChange={(e) => setEditingBc({...editingBc, name: e.target.value})}
                   className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-rose-500 transition-all shadow-inner"
                   placeholder="Ej: Cobranzas Preventivas Q1"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Voz del Bot</label>
                    <div className="flex items-center space-x-3 bg-slate-950 border-2 border-slate-800 rounded-[28px] px-6 py-4">
                       <Volume2 size={18} className="text-slate-600" />
                       <select 
                        value={editingBc.voiceName}
                        onChange={(e) => setEditingBc({...editingBc, voiceName: e.target.value})}
                        className="flex-1 bg-transparent border-none text-xs text-white font-bold outline-none"
                       >
                         <option value="Helena - Emotional Professional">Helena (Profesional)</option>
                         <option value="Puck - Friendly Casual">Puck (Amistoso)</option>
                         <option value="Kore - Neutral Authority">Kore (Autoridad)</option>
                         <option value="Zephyr - Deep Trust">Zephyr (Confianza)</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Concurrencia Inicial</label>
                    <input 
                      type="number" 
                      value={editingBc.concurrency}
                      onChange={(e) => setEditingBc({...editingBc, concurrency: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-4 text-sm text-white font-mono outline-none focus:border-rose-500 transition-all shadow-inner"
                    />
                  </div>
               </div>

               <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-5">
                    <div className={`p-3 rounded-2xl ${editingBc.isAdaptive ? 'bg-blue-600' : 'bg-slate-800'} text-white shadow-lg transition-all`}>
                      <Gauge size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-widest">Marcado Adaptativo</h4>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Ajuste automático de slots</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setEditingBc({...editingBc, isAdaptive: !editingBc.isAdaptive})}
                    className={`w-14 h-7 rounded-full relative transition-all duration-500 ${editingBc.isAdaptive ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${editingBc.isAdaptive ? 'right-1' : 'left-1'}`}></div>
                  </button>
               </div>
            </div>

            <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end">
               <button 
                onClick={handleSaveCampaignModal}
                disabled={isSaving || !editingBc.name}
                className="flex items-center space-x-4 bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-rose-600/30 transition-all active:scale-95 disabled:opacity-50 group"
               >
                 {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                 <span>{isSaving ? 'Sincronizando' : 'Guardar y Desplegar'}</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Live Dialer Logs Terminal */}
      {showLogs && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowLogs(false)}></div>
          <div className="relative w-full max-w-4xl h-[80vh] glass rounded-[56px] border border-slate-700/50 shadow-[0_0_100px_rgba(244,63,94,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="px-10 py-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <div className="flex items-center space-x-3">
                  <Terminal size={18} className="text-rose-400" />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Broadcast Real-Time Telemetry</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsLogsPaused(!isLogsPaused)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${isLogsPaused ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}`}
                >
                  {isLogsPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                  <span>{isLogsPaused ? 'Resumir' : 'Pausar'}</span>
                </button>
                <button onClick={() => setDialerLogs([])} className="p-2.5 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 text-slate-400 hover:text-rose-500 rounded-xl transition-all">
                  <Trash size={16} />
                </button>
                <button onClick={() => setShowLogs(false)} className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-10 font-mono text-[12px] leading-relaxed scrollbar-hide space-y-1.5 bg-black/40 shadow-inner"
            >
              <div className="mb-6 p-6 border border-rose-500/20 bg-rose-500/5 rounded-3xl">
                <p className="text-rose-400 font-bold mb-1 text-sm uppercase tracking-widest flex items-center">
                  <Activity size={14} className="mr-2" /> Live Broadcast Stream Active
                </p>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest opacity-60">Engine Build: v3.6.1-neural-dialer</p>
              </div>

              {dialerLogs.map((log) => (
                <div key={log.id} className="flex space-x-6 group hover:bg-white/5 px-2 py-1 rounded transition-colors animate-in slide-in-from-left-2 duration-200">
                  <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                  <span className={`shrink-0 w-20 font-black tracking-tighter text-center rounded border px-1 ${
                    log.level === 'INFO' ? 'text-blue-400 border-blue-900/30' :
                    log.level === 'SUCCESS' ? 'text-emerald-400 border-emerald-900/30' :
                    log.level === 'WARN' ? 'text-amber-400 border-amber-900/30' :
                    log.level === 'SYSTEM' ? 'text-purple-400 border-purple-900/30 font-black' :
                    'text-rose-500 border-rose-900/30'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-500 font-bold select-all shrink-0">[{log.callId}]</span>
                  <span className={`${log.level === 'SYSTEM' ? 'text-blue-200 italic' : 'text-slate-200'}`}>{log.message}</span>
                </div>
              ))}

              {dialerLogs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20">
                   <Terminal size={64} className="text-slate-500 mb-4" />
                   <p className="text-xs font-black uppercase tracking-[0.3em]">Buffer vacío. Esperando tráfico...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastAI;