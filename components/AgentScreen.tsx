
/**
 * @file AgentScreen.tsx
 * @description Estación de agente PRO. 
 * Incluye Waveforms de audio, Rebatidor de Objeciones, Transferencia SIP y lógica de estados corregida.
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, PhoneOff, Pause, Play, Headphones, Clock, User, 
  Sparkles, CheckCircle2, X, PhoneIncoming, MessageSquare,
  ClipboardList, FileText, Quote, Coffee, ShieldAlert,
  AlertCircle, RefreshCw, ChevronRight, Zap, Info, Mic, MicOff,
  Volume2, VolumeX, MoreHorizontal, UserPlus, Send, TrendingUp,
  MapPin, Calendar, CreditCard, Activity, Star,
  Target, ListChecks, History as HistoryIcon, Brain as BrainIcon,
  Wifi, ShieldCheck, HeartPulse, AlertTriangle, FastForward,
  PlayCircle, UserSearch, Fingerprint, Database, Search,
  PhoneForwarded, Users2, ArrowRightLeft, Check, Trophy,
  CircleDot, HelpCircle, Mail, MessageCircle, Eye, Smartphone,
  Shield, Timer, Lock, Unlock, ZapOff, Copy, LifeBuoy,
  Dialpad, Save, Terminal, Power, Radio, Volume1,
  UserCheck,
  CheckCircle
} from 'lucide-react';
import { PAUSE_CODES, MOCK_CAMPAIGNS, MOCK_USER, MOCK_CALL_CODES, MOCK_USERS_LIST } from '../constants';
import { CallCode, User as UserType, PauseCode, Campaign } from '../types';
import { useToast } from '../ToastContext';
// Added missing import for Logo component
import Logo from './Logo';

// --- DATA DE OBJECIONES ---
const OBJECTIONS_DATA = [
  { 
    id: 'obj1', 
    trigger: 'No tengo presupuesto ahora', 
    rebuttal: 'Entiendo totalmente. De hecho, la mayoría de nuestros clientes VIP empezaron buscando optimizar costos. ¿Si le demuestro que este servicio se paga solo en 3 meses, estaría abierto a una prueba?',
    efficiency: 92
  },
  { 
    id: 'obj2', 
    trigger: 'Ya trabajo con la competencia', 
    rebuttal: 'Es excelente que ya use esta tecnología. Eso significa que usted valora la eficiencia. ¿Qué es lo que más le gusta de ellos y qué es lo único que cambiaría si tuviera una varita mágica?',
    efficiency: 85
  },
  { 
    id: 'obj3', 
    trigger: 'Llámame el próximo trimestre', 
    rebuttal: 'Puedo agendarlo, pero en 90 días los precios de preventa habrán expirado. ¿Le parece si bloqueamos el precio hoy con una reserva mínima sin compromiso?',
    efficiency: 78
  },
  { 
    id: 'obj4', 
    trigger: 'No soy la persona que decide', 
    rebuttal: 'Comprendo. Para no hacerle perder tiempo a su director, ¿podría decirme qué tres puntos son vitales para él en este proyecto? Así le preparo una propuesta ejecutiva lista.',
    efficiency: 95
  },
];

// --- SUB-COMPONENTE: WAVEFORM ANIMATION ---
const AudioWaveform = () => (
  <div className="flex items-center justify-center space-x-1 h-8 px-4">
    {[...Array(12)].map((_, i) => (
      <div 
        key={i} 
        className="w-1 bg-emerald-400 rounded-full animate-wave" 
        style={{ 
          height: `${Math.random() * 100}%`,
          animationDelay: `${i * 0.1}s` 
        }}
      ></div>
    ))}
  </div>
);

const AgentScreen: React.FC<{ user?: UserType }> = ({ user = MOCK_USER }) => {
  const { toast } = useToast();
  
  // --- Estados de Sesión ---
  const [isLaunched, setIsLaunched] = useState(false);
  const [isBooting, setIsBooting] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  
  // --- Estados de Operación ---
  const [status, setStatus] = useState<'READY' | 'PAUSED' | 'INCALL' | 'WRAPUP' | 'RINGING' | 'PREVIEW'>('READY');
  const [timer, setTimer] = useState(0);
  const [currentLead, setCurrentLead] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'CRM' | 'SCRIPT' | 'OBJECTIONS' | 'COPILOT'>('CRM');
  
  // --- Periferia ---
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [activePauseCode, setActivePauseCode] = useState<PauseCode | null>(null);
  const [selectedDisposition, setSelectedDisposition] = useState<string>("");
  const [transferSearch, setTransferSearch] = useState("");

  const activeCampaign = MOCK_CAMPAIGNS.find(c => c.id === selectedCampaignId);
  const allowedPauseCodes = PAUSE_CODES.filter(pc => activeCampaign?.pauseCodeIds?.includes(pc.id));
  const campaignCallCodes = MOCK_CALL_CODES.filter(cc => activeCampaign?.callCodeIds?.includes(cc.id));

  const closers = MOCK_USERS_LIST.filter(u => u.userLevel >= 6).map(u => ({
    ...u,
    isAvailable: Math.random() > 0.4,
    specialty: ['Seguros', 'Retención', 'Ventas High-Ticket'][Math.floor(Math.random()*3)]
  }));

  // --- Efecto: Cronómetro ---
  useEffect(() => {
    let t: any;
    if (isLaunched && status !== 'READY' && status !== 'RINGING') {
      t = setInterval(() => setTimer(prev => prev + 1), 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(t);
  }, [status, isLaunched]);

  // --- Efecto: Simulador de Hopper (Inyector) ---
  useEffect(() => {
    if (isLaunched && status === 'READY') {
      const t = setTimeout(() => {
        setStatus('PREVIEW');
        toast('Inyectando Target... (Beep)', 'info', 'Dialer Core');
        setCurrentLead({ 
          id: '99482',
          name: 'Harrison Ford', 
          phone: '+1 310-555-0100', 
          location: 'Los Angeles, CA',
          campaign: activeCampaign?.name,
          email: 'harrison.f@example.com',
          lastPurchase: '$1,250.00',
          tier: 'VIP Gold',
          scoring: 92,
          notes: 'Interesado en propiedades de lujo. Prefiere contacto matutino.',
          history: [
            { date: '2024-11-20', status: 'NI', agent: 'Maria G.', note: 'Sin presupuesto' },
            { date: '2024-11-15', status: 'CBK', agent: 'System', note: 'Rellamada automática' },
          ]
        });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [status, isLaunched]);

  // --- Handlers Operativos ---
  const handleLaunchStation = async () => {
    if (!selectedCampaignId) {
      toast('Seleccione una campaña.', 'error');
      return;
    }
    setIsBooting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsBooting(false);
    setIsLaunched(true);
    toast('Terminal Registrada. (Sincronización Completa)', 'success');
  };

  const handleStartDial = () => {
    setStatus('RINGING');
    toast('Marcando... (Tono de llamada)', 'info');
    setTimeout(() => {
      setStatus('INCALL');
      toast('Lead Conectado. (Conexión SIP Establecida)', 'success');
    }, 2000);
  };

  const handleSkip = () => {
    setStatus('READY');
    setCurrentLead(null);
    toast('Lead Descartado.', 'info');
  };

  const handleHangup = () => {
    setStatus('WRAPUP');
    setIsMuted(false);
    setIsOnHold(false);
    toast('Llamada Finalizada. Guarde la gestión.', 'info');
  };

  const handleSaveWrapUp = () => {
    if (!selectedDisposition) {
      toast('Seleccione una tipificación.', 'error');
      return;
    }
    setStatus('READY');
    setCurrentLead(null);
    setSelectedDisposition("");
    toast('Gestión Guardada. (Sync CRM OK)', 'success');
  };

  const handleCopyRebuttal = (text: string) => {
    navigator.clipboard.writeText(text);
    toast('Rebatido copiado al portapapeles.', 'success', 'Sales Assistant');
  };

  const handleTransfer = (targetName: string) => {
    toast(`Transfiriendo llamada a ${targetName}...`, 'warning', 'SIP Transfer');
    setTimeout(() => {
      setShowTransferModal(false);
      handleHangup();
      toast('Transferencia completada con éxito.', 'success');
    }, 2000);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const rs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`;
  };

  // --- Lógica de Atmósfera Visual ---
  const getAtmosphere = () => {
    switch(status) {
      case 'INCALL': return { border: 'border-emerald-500/50', bg: 'bg-emerald-500', text: 'En Llamada', icon: Phone, glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]', overlay: 'bg-emerald-950/5' };
      case 'PAUSED': return { border: 'border-amber-500/50', bg: 'bg-amber-500', text: `PAUSA: ${activePauseCode?.name || 'Local'}`, icon: Coffee, glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]', overlay: 'bg-amber-950/5' };
      case 'PREVIEW': return { border: 'border-cyan-500/50', bg: 'bg-cyan-600', text: 'Analizando Lead', icon: UserSearch, glow: 'shadow-[0_0_30px_rgba(8,145,178,0.3)]', overlay: 'bg-cyan-950/5' };
      case 'WRAPUP': return { border: 'border-rose-500/50', bg: 'bg-rose-500', text: 'Wrap-up (Cierre)', icon: ListChecks, glow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]', overlay: 'bg-rose-950/5' };
      case 'RINGING': return { border: 'border-blue-500/50', bg: 'bg-blue-600', text: 'Marcando...', icon: RefreshCw, glow: 'animate-pulse', overlay: 'bg-blue-950/5' };
      default: return { border: 'border-slate-800', bg: 'bg-slate-800', text: 'Esperando Lead', icon: Activity, glow: 'shadow-2xl', overlay: '' };
    }
  };

  const atm = getAtmosphere();

  // --- Vista: Launchpad ---
  if (!isLaunched) {
    return (
      <div className="h-full flex items-center justify-center p-6 animate-in fade-in duration-700">
        <div className="w-full max-w-5xl glass rounded-[64px] border-2 border-slate-800 shadow-2xl overflow-hidden relative">
          {isBooting && (
            <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center space-y-8 animate-in fade-in">
               <div className="relative">
                  <div className="w-32 h-32 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                  <Terminal size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" />
               </div>
               <h3 className="text-2xl font-black text-white uppercase tracking-[0.2em]">Enlazando Terminal...</h3>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 h-[700px]">
            <div className="md:col-span-4 bg-slate-900/50 p-12 border-r border-slate-800 flex flex-col justify-between">
              <div>
                <Logo className="w-20 h-20 mb-8" />
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-4">Cuberbox<br/>Launchpad</h2>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Seleccione su canal operativo para iniciar sesión SIP.</p>
              </div>
              <div className="space-y-4">
                 <div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400"><User size={20} /></div>
                    <div>
                       <p className="text-xs font-black text-white uppercase">{user.fullName}</p>
                       <p className="text-[9px] text-slate-500 font-bold uppercase">Ext: {user.extension}</p>
                    </div>
                 </div>
              </div>
            </div>
            <div className="md:col-span-8 p-12 flex flex-col">
              <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Campañas Disponibles</h3>
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto scrollbar-hide">
                 {MOCK_CAMPAIGNS.map(camp => (
                   <button 
                    key={camp.id}
                    onClick={() => setSelectedCampaignId(camp.id)}
                    className={`p-8 rounded-[48px] border-2 text-left transition-all relative group ${selectedCampaignId === camp.id ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'glass border-slate-800 hover:border-slate-700'}`}
                   >
                      <div className={`p-4 rounded-2xl w-fit mb-6 ${selectedCampaignId === camp.id ? 'bg-blue-600 text-white' : 'bg-slate-950 text-slate-700'}`}>
                         <Radio size={24} />
                      </div>
                      <h4 className="font-black text-lg text-white uppercase mb-2">{camp.name}</h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{camp.campaignType} • {camp.dialMethod}</p>
                      {selectedCampaignId === camp.id && <div className="absolute top-6 right-6 text-blue-400 animate-in zoom-in"><CheckCircle2 size={24} /></div>}
                   </button>
                 ))}
              </div>
              <button 
                onClick={handleLaunchStation}
                disabled={!selectedCampaignId}
                className="mt-10 bg-blue-600 hover:bg-blue-500 text-white py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center space-x-4"
              >
                <span>Sincronizar Estación</span>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col gap-6 animate-in fade-in duration-1000 pb-4 overflow-hidden select-none ${atm.overlay}`}>
      
      {/* 1. TOP BAR: TELEMETRÍA Y CONTROL DE ESTADO */}
      <div className={`shrink-0 glass rounded-[32px] border-2 ${atm.border} p-4 flex items-center justify-between transition-all duration-700 ${atm.glow} relative overflow-hidden`}>
         <div className="flex items-center space-x-8 relative z-10">
            <div className="flex items-center space-x-4">
               <div className={`w-14 h-14 rounded-2xl ${atm.bg} flex items-center justify-center text-white shadow-lg transition-all`}>
                  <atm.icon size={28} className={status === 'PAUSED' || status === 'RINGING' ? 'animate-pulse' : ''} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none">{atm.text}</h3>
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center bg-slate-950/50 px-3 py-1 rounded-lg">
                      <Clock size={12} className="mr-2 text-blue-400" /> {formatTime(timer)}
                    </p>
                    {status === 'INCALL' && <AudioWaveform />}
                  </div>
               </div>
            </div>
         </div>

         <div className="flex items-center space-x-4 relative z-10">
            {status === 'READY' || status === 'PREVIEW' ? (
              <button 
                onClick={() => setShowPauseModal(true)}
                className="group bg-amber-500/10 border-2 border-amber-500/40 hover:bg-amber-500 text-amber-500 hover:text-black px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all flex items-center space-x-3 active:scale-95 shadow-xl"
              >
                <Pause size={18} fill="currentColor" />
                <span>SOLICITAR PAUSA</span>
              </button>
            ) : status === 'PAUSED' ? (
              <button 
                onClick={() => { setStatus('READY'); setActivePauseCode(null); toast('Estación en línea.', 'success'); }}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center space-x-3 active:scale-95 animate-glow"
              >
                <Play size={18} fill="currentColor" />
                <span>REANUDAR</span>
              </button>
            ) : null}

            {status === 'WRAPUP' && (
              <button 
                onClick={handleSaveWrapUp}
                className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center space-x-3 active:scale-95 animate-bounce"
              >
                <Save size={18} />
                <span>GUARDAR GESTIÓN</span>
              </button>
            )}

            <div className="h-10 w-px bg-slate-800 mx-2"></div>

            <div className="flex items-center space-x-2">
               <button onClick={() => { setIsLaunched(false); toast('Desconectado.'); }} className="p-4 bg-slate-900 border-2 border-slate-800 hover:bg-rose-600 text-slate-500 hover:text-white rounded-2xl transition-all shadow-xl"><Power size={20} /></button>
               <div className="flex items-center space-x-4 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800 shadow-inner">
                  <div className="flex flex-col text-right">
                     <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Extensión</span>
                     <span className="text-sm font-black text-blue-400 font-mono">{user.extension}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 border border-slate-700 shadow-lg">
                     <Headphones size={22} />
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* 2. ESPACIO DE TRABAJO DUAL */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        
        {/* COLUMNA CRM & AYUDAS (8 SPAN) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
           <div className="glass flex-1 rounded-[48px] border border-slate-700/50 shadow-2xl flex flex-col overflow-hidden bg-gradient-to-br from-[#0a0f1e] to-transparent">
              {/* TABS DE AYUDA */}
              <div className="flex bg-slate-900/80 p-4 border-b border-slate-800 space-x-2 shrink-0">
                 {[
                   { id: 'CRM', label: 'FICHA CLIENTE', icon: Database, color: 'text-blue-400' },
                   { id: 'SCRIPT', label: 'SALES SCRIPT', icon: FileText, color: 'text-emerald-400' },
                   { id: 'OBJECTIONS', label: 'OBJECCIONES', icon: LifeBuoy, color: 'text-rose-400' },
                   { id: 'COPILOT', label: 'AI COPILOT', icon: Sparkles, color: 'text-purple-400' },
                 ].map(tab => (
                   <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:bg-white/5'}`}
                   >
                     <tab.icon size={16} className={activeTab === tab.id ? 'text-white' : tab.color} />
                     <span>{tab.label}</span>
                   </button>
                 ))}
              </div>

              <div className="flex-1 p-10 overflow-y-auto scrollbar-hide relative">
                 {!currentLead ? (
                   <div className="h-full flex flex-col items-center justify-center opacity-30">
                      <div className="w-32 h-32 rounded-full border-4 border-dashed border-blue-500/20 flex items-center justify-center animate-spin-slow mb-8">
                         <RefreshCw size={56} className="text-blue-500/40" />
                      </div>
                      <h4 className="text-2xl font-black text-slate-700 uppercase tracking-widest">Esperando señal de red...</h4>
                   </div>
                 ) : activeTab === 'CRM' ? (
                   <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-8">
                            <div className="flex items-center space-x-8">
                               <div className="w-24 h-24 rounded-[36px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10 group-hover:scale-105 transition-transform">
                                  {currentLead.name.charAt(0)}
                               </div>
                               <div>
                                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">{currentLead.name}</h3>
                                  <div className="flex items-center space-x-4 mt-2">
                                     <span className="px-4 py-1 bg-amber-500/10 text-amber-500 rounded-lg text-[10px] font-black border border-amber-500/20 uppercase flex items-center"><Star size={12} className="mr-2" fill="currentColor" /> {currentLead.tier}</span>
                                     <span className="text-[11px] text-slate-600 font-bold uppercase tracking-widest">#{currentLead.id}</span>
                                  </div>
                               </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                               {[
                                 { label: 'Teléfono', val: currentLead.phone, icon: Phone, color: 'text-blue-400' },
                                 { label: 'Email', val: currentLead.email, icon: Mail, color: 'text-emerald-400' },
                                 { label: 'Ubicación', val: currentLead.location, icon: MapPin, color: 'text-rose-400' },
                               ].map((item, i) => (
                                 <div key={i} className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-[24px] group hover:border-blue-500/30 transition-all shadow-inner">
                                    <div className="flex items-center space-x-5">
                                       <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 ${item.color}`}><item.icon size={18} /></div>
                                       <div>
                                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{item.label}</p>
                                          <p className="text-sm font-black text-white tracking-tight">{item.val}</p>
                                       </div>
                                    </div>
                                    <button onClick={() => { navigator.clipboard.writeText(item.val); toast('Copiado'); }} className="p-3 text-slate-700 hover:text-blue-400 transition-colors"><Copy size={16} /></button>
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div className="space-y-8">
                            <h4 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                               <TrendingUp size={16} className="mr-3 text-emerald-500" /> Lead IQ
                            </h4>
                            <div className="p-10 bg-slate-900 border-2 border-slate-800 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-8 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform"><BrainIcon size={120} /></div>
                               <div className="flex justify-between items-center relative z-10">
                                  <div className="space-y-2">
                                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score de Cierre</p>
                                     <p className="text-7xl font-black text-emerald-400 tracking-tighter tabular-nums">{currentLead.scoring}%</p>
                                  </div>
                                  <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-xl"><TrendingUp size={40} /></div>
                               </div>
                               <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800 relative z-10">
                                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Resumen Neural</p>
                                  <p className="text-xs text-slate-400 font-medium italic leading-relaxed">"{currentLead.notes}"</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ) : activeTab === 'OBJECTIONS' ? (
                   <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                      <div className="flex items-center space-x-4 mb-8">
                         <div className="p-4 bg-rose-500/10 rounded-3xl text-rose-500 border border-rose-500/20 shadow-inner">
                            <LifeBuoy size={32} />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Objection Rebuttal Center</h3>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Guiones de contra-oferta optimizados</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {OBJECTIONS_DATA.map(obj => (
                            <div key={obj.id} className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] group hover:border-rose-500/40 transition-all shadow-inner relative overflow-hidden flex flex-col">
                               <div className="flex items-start justify-between mb-6">
                                  <h4 className="text-lg font-black text-white uppercase tracking-tight flex items-center">
                                     <AlertTriangle size={18} className="mr-3 text-amber-500" /> {obj.trigger}
                                  </h4>
                                  <div className="bg-emerald-500/10 px-3 py-1 rounded-lg text-[10px] font-black text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">Eff: {obj.efficiency}%</div>
                               </div>
                               <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800/50 flex-1 mb-6">
                                  <p className="text-sm text-slate-300 leading-relaxed italic">
                                     <Quote size={16} className="inline mr-2 text-rose-500/30" />
                                     {obj.rebuttal}
                                  </p>
                               </div>
                               <button 
                                onClick={() => handleCopyRebuttal(obj.rebuttal)}
                                className="w-full py-4 bg-slate-800 hover:bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-3 active:scale-95"
                               >
                                 <Copy size={16} />
                                 <span>COPIAR REBATIDO</span>
                               </button>
                            </div>
                         ))}
                      </div>
                   </div>
                 ) : activeTab === 'SCRIPT' ? (
                   <div className="p-10 bg-slate-900 border-2 border-blue-500/20 rounded-[56px] relative shadow-inner animate-in slide-in-from-bottom-4">
                      <Quote size={80} className="absolute top-0 right-0 p-8 opacity-5 text-blue-500" />
                      <p className="text-3xl text-slate-200 leading-relaxed font-medium italic relative z-10">
                         "¡Hola! ¿Tengo el gusto con <span className="text-blue-400 font-black not-italic underline">Mr. {currentLead.name.split(' ')[1]}</span>? Le saludo de <span className="bg-blue-500/20 px-2 rounded font-black not-italic text-blue-300">Cuberbox Pro</span>. He visto que tiene interés en el portafolio de inversión inmobiliaria de Q4..."
                      </p>
                      <div className="mt-12 flex space-x-4">
                         <span className="px-6 py-2 bg-blue-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">INTRODUCCIÓN</span>
                         <button className="px-6 py-2 bg-slate-800 text-slate-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all">CUERPO VENTA</button>
                         <button className="px-6 py-2 bg-slate-800 text-slate-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all">CIERRE</button>
                      </div>
                   </div>
                 ) : null}
              </div>
           </div>
        </div>

        {/* COLUMNA SOFTPHONE Y CLOSERS (4 SPAN) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 min-h-0">
           
           {/* CONSOLA SOFTPHONE */}
           <div className={`glass p-10 rounded-[56px] border-2 shadow-2xl flex flex-col items-center space-y-10 relative overflow-hidden transition-all duration-700 ${status === 'INCALL' ? 'border-emerald-500/40 bg-gradient-to-br from-[#0a1e15] to-black' : 'border-slate-800 bg-gradient-to-br from-[#0f172a] to-black'}`}>
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
              
              {status === 'PREVIEW' ? (
                <div className="w-full text-center space-y-12 py-10 animate-in zoom-in-95 duration-500 relative z-10">
                   <div className="relative">
                      <div className="w-28 h-28 rounded-full bg-blue-600/10 flex items-center justify-center mx-auto border-2 border-blue-500/40 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                         <Smartphone size={48} className="text-blue-400 animate-bounce" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-emerald-500 p-2 rounded-xl text-white shadow-xl animate-pulse"><Zap size={16} fill="currentColor" /></div>
                   </div>
                   <div>
                      <p className="text-4xl font-black text-white tracking-tighter font-mono">{currentLead?.phone}</p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-4">Bridge Local: Standby</p>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={handleSkip} className="flex-1 py-5 rounded-[28px] bg-slate-900 border-2 border-slate-800 text-slate-500 hover:text-rose-500 hover:border-rose-500/40 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95">SKIP</button>
                      <button onClick={handleStartDial} className="flex-[2] py-5 rounded-[28px] bg-blue-600 hover:bg-blue-500 text-white font-black text-[12px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95 flex items-center justify-center space-x-4 group">
                         <Phone size={22} fill="currentColor" className="group-hover:rotate-12 transition-transform" />
                         <span>DIAL NOW</span>
                      </button>
                   </div>
                </div>
              ) : status === 'INCALL' || status === 'RINGING' ? (
                <div className="w-full space-y-10 animate-in zoom-in-95 duration-500 relative z-10">
                   <div className="text-center py-6">
                      <div className="relative inline-block">
                         <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white mx-auto shadow-2xl border-4 border-white/10 transition-all ${isOnHold ? 'bg-amber-500 scale-90' : 'bg-emerald-500 animate-pulse'}`}>
                            {isOnHold ? <VolumeX size={40} /> : <Volume2 size={40} />}
                         </div>
                         <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-xl"><Wifi size={16} /></div>
                      </div>
                      <p className="text-2xl font-black text-white mt-8 tracking-tighter uppercase truncate px-4">{currentLead?.name}</p>
                      <p className="text-xl font-mono font-black text-emerald-400 tabular-nums mt-2">{formatTime(timer)}</p>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      <button onClick={() => setIsMuted(!isMuted)} className={`p-6 rounded-[30px] border-2 transition-all flex flex-col items-center justify-center space-y-3 active:scale-90 shadow-xl ${isMuted ? 'bg-rose-600/20 border-rose-500 text-rose-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                         {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                         <span className="text-[9px] font-black uppercase tracking-widest">MUTE</span>
                      </button>
                      <button onClick={() => setIsOnHold(!isOnHold)} className={`p-6 rounded-[30px] border-2 transition-all flex flex-col items-center justify-center space-y-3 active:scale-90 shadow-xl ${isOnHold ? 'bg-amber-600/20 border-amber-500 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600'}`}>
                         <VolumeX size={24} />
                         <span className="text-[9px] font-black uppercase tracking-widest">HOLD</span>
                      </button>
                      <button onClick={() => setShowTransferModal(true)} className="p-6 rounded-[30px] border-2 bg-slate-950 border-slate-800 text-slate-500 hover:border-blue-500/40 hover:text-blue-400 transition-all flex flex-col items-center justify-center space-y-3 active:scale-90 shadow-xl">
                         <PhoneForwarded size={24} />
                         <span className="text-[9px] font-black uppercase tracking-widest">TRANSF</span>
                      </button>
                   </div>
                   <button onClick={handleHangup} className="w-full py-8 rounded-[36px] bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-[0.4em] shadow-xl transition-all active:scale-95 group flex items-center justify-center space-x-6">
                      <PhoneOff size={28} className="group-hover:rotate-12 transition-transform" />
                      <span>COLGAR</span>
                   </button>
                </div>
              ) : status === 'WRAPUP' ? (
                <div className="w-full space-y-8 py-4 relative z-10 animate-in fade-in duration-500 h-full flex flex-col">
                   <div className="flex items-center space-x-4 mb-4">
                      <ListChecks size={24} className="text-blue-400" />
                      <h4 className="text-lg font-black text-white uppercase tracking-tight">Tipificar Gestión</h4>
                   </div>
                   <div className="grid grid-cols-1 gap-3 overflow-y-auto scrollbar-hide pr-2 flex-1">
                      {campaignCallCodes.map(code => (
                        <button 
                          key={code.id}
                          onClick={() => setSelectedDisposition(code.id)}
                          className={`p-6 rounded-3xl border-2 text-left transition-all relative flex items-center justify-between group active:scale-95 ${selectedDisposition === code.id ? 'bg-blue-600/10 border-blue-500 shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                           <div className="flex items-center space-x-4">
                              <div className={`w-3 h-3 rounded-full ${code.isSale ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-slate-700'}`}></div>
                              <div>
                                 <span className={`text-xs font-black uppercase tracking-tight ${selectedDisposition === code.id ? 'text-white' : 'text-slate-300'}`}>{code.name}</span>
                                 <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5 tracking-widest">{code.id}</p>
                              </div>
                           </div>
                           {selectedDisposition === code.id && <Check size={18} className="text-blue-400 animate-in zoom-in" />}
                        </button>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="text-center py-28 opacity-20"><Activity size={80} className="text-slate-800 mx-auto mb-6 animate-pulse" /><h4 className="text-2xl font-black text-slate-800 uppercase tracking-widest">Dialer Idle</h4></div>
              )}
           </div>

           {/* CLOSERS / SUPERVISORES PANEL */}
           <div className="glass flex-1 rounded-[56px] border-2 border-slate-800 p-10 flex flex-col min-h-0 bg-gradient-to-br from-[#0a0f1e]/40 to-transparent">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center space-x-5">
                    <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20"><Trophy size={24} /></div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Network Closers</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Soporte SIP en línea</p>
                    </div>
                 </div>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                 {closers.map(closer => (
                   <div key={closer.id} className="p-6 rounded-[36px] bg-slate-900 border-2 border-slate-800 flex items-center justify-between group hover:border-amber-500/30 transition-all shadow-2xl relative overflow-hidden">
                      {closer.isAvailable && <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>}
                      <div className="flex items-center space-x-4">
                         <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-400 border border-slate-700 shadow-xl">{closer.fullName.charAt(0)}</div>
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-4 border-[#0a0f1e] ${closer.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-black text-white uppercase truncate w-32">{closer.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest flex items-center"><ShieldCheck size={10} className="mr-1.5 text-blue-400" /> {closer.specialty}</p>
                         </div>
                      </div>
                      <button 
                        onClick={() => handleTransfer(closer.fullName)}
                        disabled={!closer.isAvailable || status !== 'INCALL'}
                        className={`p-3 rounded-xl transition-all shadow-xl active:scale-90 ${closer.isAvailable && status === 'INCALL' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-950 text-slate-800 cursor-not-allowed'}`}
                      >
                         <PhoneForwarded size={16} />
                      </button>
                   </div>
                 ))}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-800"><div className="p-5 bg-slate-950 rounded-3xl border border-slate-800 flex items-center space-x-5 shadow-inner"><Info size={24} className="text-blue-500 shrink-0" /><p className="text-[9px] text-slate-600 font-bold uppercase leading-relaxed tracking-wider">Cierre asistido disponible. <span className="text-blue-400">Promedio SIP: 42s.</span></p></div></div>
           </div>
        </div>
      </div>

      {/* SELECTOR DE PAUSA (MODAL) */}
      {showPauseModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-[0_0_150px_rgba(245,158,11,0.2)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
              <div className="p-12 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
                 <div className="flex items-center space-x-6">
                    <div className="p-5 bg-amber-600/10 rounded-[28px] text-amber-500 border border-amber-500/20 shadow-inner"><Coffee size={36} /></div>
                    <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Dispatcher de Pausa</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-3">Adherencia en tiempo real</p>
                    </div>
                 </div>
                 <button onClick={() => setShowPauseModal(false)} className="p-5 bg-slate-800 hover:bg-rose-500/10 rounded-3xl text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-2xl"><X size={28} /></button>
              </div>
              <div className="p-12 grid grid-cols-2 gap-6">
                 {allowedPauseCodes.map(code => (
                   <button 
                    key={code.id}
                    onClick={() => { setStatus('PAUSED'); setActivePauseCode(code); setShowPauseModal(false); toast(`Estado: ${code.name}`); }}
                    className="p-10 rounded-[48px] border-2 border-slate-800 bg-slate-950/40 hover:border-amber-500 hover:bg-amber-600/5 transition-all text-left group relative overflow-hidden active:scale-95 shadow-xl"
                   >
                      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Zap size={80} style={{ color: code.color }} /></div>
                      <div className="flex items-center space-x-6 relative z-10">
                         <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl border border-white/5" style={{ backgroundColor: `${code.color}30`, color: code.color }}><Coffee size={24} /></div>
                         <div>
                            <h4 className="font-black text-white uppercase text-lg tracking-tight leading-none mb-2">{code.name}</h4>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${code.billable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-500'}`}>{code.billable ? 'PRODUCTIVO' : 'PAUSA LIBRE'}</span>
                         </div>
                      </div>
                   </button>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* HUB DE TRANSFERENCIA (MODAL) */}
      {showTransferModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-full max-w-5xl h-[80vh] glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
              <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
                 <div className="flex items-center space-x-6">
                    <div className="p-4 bg-blue-600/10 rounded-[22px] text-blue-400 border border-blue-500/20 shadow-inner"><PhoneForwarded size={32} /></div>
                    <div>
                       <h3 className="text-3xl font-black text-white uppercase tracking-tighter">SIP Transfer Hub</h3>
                       <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Conectividad global multicanal</p>
                    </div>
                 </div>
                 <button onClick={() => setShowTransferModal(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700"><X size={28} /></button>
              </div>

              <div className="flex-1 min-h-0 flex gap-10 p-12">
                 {/* DIALPAD COL */}
                 <div className="w-96 flex flex-col items-center justify-center space-y-10 shrink-0">
                    <div className="w-full p-6 bg-slate-950 rounded-[40px] border-2 border-slate-800 shadow-inner">
                       <input 
                        type="text" 
                        placeholder="NÚMERO SIP" 
                        value={transferSearch}
                        onChange={e => setTransferSearch(e.target.value)}
                        className="w-full bg-transparent text-center text-4xl font-mono font-black text-blue-400 outline-none placeholder-slate-800"
                       />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                       {[1, 2, 3, 4, 5, 6, 7, 8, 9, '*', 0, '#'].map(key => (
                          <button 
                            key={key}
                            onClick={() => setTransferSearch(prev => prev + key.toString())}
                            className="w-20 h-20 rounded-[24px] bg-slate-900 border-2 border-slate-800 text-2xl font-black text-white hover:bg-blue-600 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-90"
                          >
                             {key}
                          </button>
                       ))}
                    </div>
                    <button 
                      onClick={() => handleTransfer(transferSearch)}
                      disabled={!transferSearch}
                      className="w-full py-6 rounded-[32px] bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-[0.3em] shadow-xl transition-all active:scale-95 disabled:opacity-30 disabled:grayscale"
                    >
                       TRANSFERIR AHORA
                    </button>
                 </div>

                 <div className="h-full w-px bg-slate-800"></div>

                 {/* CLOSERS LIST COL */}
                 <div className="flex-1 flex flex-col min-h-0">
                    <div className="relative mb-8">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                       <input type="text" placeholder="BUSCAR EXTENSIÓN O AGENTE..." className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner" />
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-2">
                       {closers.map(closer => (
                          <div key={closer.id} className="p-6 rounded-[40px] bg-slate-900/60 border border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-lg relative overflow-hidden">
                             <div className="flex items-center space-x-6">
                                <div className="relative">
                                   <div className="w-16 h-16 rounded-[24px] bg-slate-800 flex items-center justify-center font-black text-white border border-slate-700 shadow-xl group-hover:scale-105 transition-transform">{closer.fullName.charAt(0)}</div>
                                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#0a0f1e] ${closer.isAvailable ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></div>
                                </div>
                                <div>
                                   <h4 className="font-black text-white uppercase tracking-tight">{closer.fullName}</h4>
                                   <p className="text-[10px] text-slate-500 font-black uppercase mt-1 tracking-widest flex items-center">EXT {closer.extension} • <ShieldCheck size={10} className="mx-1.5 text-blue-400" /> {closer.specialty}</p>
                                </div>
                             </div>
                             <div className="flex space-x-2">
                                <button onClick={() => handleTransfer(closer.fullName)} disabled={!closer.isAvailable} className="px-6 py-3 bg-slate-800 hover:bg-blue-600 text-[9px] font-black text-white uppercase tracking-widest rounded-xl transition-all shadow-xl disabled:opacity-30">Blind</button>
                                <button onClick={() => toast(`Consultando con ${closer.fullName}...`, 'info')} disabled={!closer.isAvailable} className="px-6 py-3 bg-slate-800 hover:bg-emerald-600 text-[9px] font-black text-white uppercase tracking-widest rounded-xl transition-all shadow-xl disabled:opacity-30">Consultar</button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AgentScreen;
