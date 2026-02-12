
/**
 * @file ExternalCRMHub.tsx
 * @description Centro de visualización de ecosistemas ERP/CRM externos integrados.
 */

import React, { useState } from 'react';
import { 
  Globe, Server, ShieldCheck, ExternalLink, RefreshCw, 
  Link as LinkIcon, Database, Info, Layers, Zap,
  Search, Lock, CheckCircle2, AlertCircle, Share2,
  Monitor, LayoutGrid, Settings, ArrowUpRight
} from 'lucide-react';
import { useToast } from '../ToastContext';

const CRM_PARTNERS = [
  { id: 'odoo', name: 'Odoo Enterprise', url: 'https://odoo-instance.cuberbox.pro', color: 'from-purple-600 to-indigo-700', icon: '💎', status: 'ACTIVE' },
  { id: 'idempiere', name: 'iDempiere OSGi', url: 'https://idempiere.corp.net', color: 'from-blue-600 to-cyan-700', icon: '🏛️', status: 'ACTIVE' },
  { id: 'workforce', name: 'Workforce Hub', url: 'https://workforce.cuberbox-infra.net', color: 'from-emerald-600 to-teal-700', icon: '👥', status: 'STANDBY' },
];

const ExternalCRMHub: React.FC = () => {
  const { toast } = useToast();
  const [activePartner, setActivePartner] = useState(CRM_PARTNERS[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    toast(`Bridge con ${activePartner.name} sincronizado.`, 'success', 'API Handshake OK');
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Globe className="mr-4 text-emerald-400" size={32} />
            ERP Integration Hub
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Explora y gestiona los puentes de datos con sistemas de terceros.</p>
        </div>
        <div className="flex space-x-3 bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[24px] shadow-inner">
           {CRM_PARTNERS.map(p => (
             <button 
               key={p.id}
               onClick={() => setActivePartner(p)}
               className={`px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${activePartner.id === p.id ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
             >
                {p.name}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-8 min-h-0">
        {/* Explorador de Instancia (Iframe Mock) */}
        <div className="col-span-12 lg:col-span-9 flex flex-col min-h-0">
           <div className="glass flex-1 rounded-[64px] border-2 border-slate-800 overflow-hidden flex flex-col relative group shadow-[0_0_80px_rgba(0,0,0,0.5)]">
              {/* Toolbar del Iframe */}
              <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between z-10">
                 <div className="flex items-center space-x-6">
                    <div className="flex space-x-2">
                       <div className="w-3 h-3 rounded-full bg-rose-500/40"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-500/40"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-500/40"></div>
                    </div>
                    <div className="px-6 py-2 bg-slate-950 border border-slate-800 rounded-full text-[10px] font-mono text-slate-500 w-[500px] truncate shadow-inner">
                       {activePartner.url}/web?lead_id=948271&agent_ext=1001
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <button onClick={handleSync} className={`p-3 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white transition-all ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={18} /></button>
                    <button className="p-3 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all"><ExternalLink size={18} /></button>
                 </div>
              </div>

              {/* Contenedor del ERP */}
              <div className="flex-1 bg-slate-950 relative">
                 <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in duration-1000">
                    <div className={`w-32 h-32 rounded-[48px] bg-gradient-to-br ${activePartner.color} flex items-center justify-center text-6xl shadow-2xl border-4 border-white/10 group-hover:scale-110 transition-transform duration-700`}>
                       {activePartner.icon}
                    </div>
                    <div className="space-y-4">
                       <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Sesión {activePartner.name}</h3>
                       <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium leading-relaxed">
                          La integración nativa de CUBERBOX está enviando telemetría SIP a esta instancia. <br/>
                          <span className="text-emerald-500 font-bold uppercase tracking-widest mt-2 block">Capa WebRTC Puente: Conectada</span>
                       </p>
                    </div>
                    <div className="grid grid-cols-3 gap-6 w-full max-w-2xl mt-12">
                       {[
                         { label: 'Screen Pop', val: 'Habilitado', icon: Monitor },
                         { label: 'Push Data', val: 'Activo', icon: Zap },
                         { label: 'Auth Bridge', val: 'JWT Valid', icon: ShieldCheck },
                       ].map((item, i) => (
                         <div key={i} className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-2 group/item hover:border-blue-500/30 transition-all">
                            <item.icon size={20} className="text-blue-500 mb-2 mx-auto" />
                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{item.label}</p>
                            <p className="text-xs font-black text-white uppercase">{item.val}</p>
                         </div>
                       ))}
                    </div>
                 </div>
                 {/* Visual Background Decoration */}
                 <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent pointer-events-none"></div>
              </div>
           </div>
        </div>

        {/* Sidebar de Telemetría ERP */}
        <div className="col-span-12 lg:col-span-3 space-y-8">
           <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                 <Layers className="mr-3 text-blue-400" size={24} />
                 API Status
              </h3>
              
              <div className="space-y-6">
                 {CRM_PARTNERS.map(p => (
                    <div key={p.id} className={`p-5 rounded-3xl border transition-all ${activePartner.id === p.id ? 'bg-blue-600/10 border-blue-500/40' : 'bg-slate-900/60 border-slate-800'}`}>
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-white uppercase tracking-tight">{p.name}</span>
                          <div className={`w-2 h-2 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-amber-500 shadow-[0_0_8px_#f59e0b]'}`}></div>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Latencia API</span>
                          <span className="text-[9px] font-mono font-black text-slate-300">42ms</span>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-10 pt-8 border-t border-slate-800">
                 <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800 space-y-4 shadow-inner">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mapping Integrity</h4>
                    <div className="space-y-3">
                       {['customer_id', 'call_uuid', 'agent_ext'].map(field => (
                          <div key={field} className="flex items-center justify-between">
                             <code className="text-[9px] text-blue-400 font-mono">{field}</code>
                             <CheckCircle2 size={12} className="text-emerald-500" />
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 glass rounded-[48px] border border-rose-500/20 bg-rose-500/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-400 group-hover:scale-110 transition-transform">
                 <Lock size={100} />
              </div>
              <h4 className="font-black text-lg text-white uppercase tracking-tighter flex items-center">
                 <ShieldCheck className="mr-3 text-rose-500" size={20} />
                 Compliance
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
                 Todos los tokens de sesión externos son rotados automáticamente cada 12 horas para cumplir con la norma SOC2.
              </p>
              <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-white transition-all shadow-xl">
                 Auditar Conexiones
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ExternalCRMHub;
