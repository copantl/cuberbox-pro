/**
 * @file EmailModule.tsx
 * @description Centro de Operaciones de Email masivo e individual de CUBERBOX Pro.
 */

import React, { useState, useMemo } from 'react';
import { 
  Mail, Send, Users, Layout, BarChart3, Clock, 
  ShieldCheck, AlertCircle, Plus, FileText, Search, 
  Trash2, Edit3, ChevronRight, RefreshCw, 
  Smartphone, MousePointer2, PieChart, TrendingUp, 
  Eye, Save, X, Layers, Filter, Terminal, Copy, Globe,
  Calendar, Play, Pause, Square, ExternalLink, Sparkles,
  Type, Check, Wand2, ArrowUpRight, Award, Zap,
  Target, Database, Info, MousePointerClick
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, LineChart, Line, Legend
} from 'recharts';
import { useToast } from '../ToastContext';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: 'MARKETING' | 'TRANSACTIONAL' | 'SUPPORT';
  lastModified: string;
}

interface EmailCampaign {
  id: string;
  name: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED';
  sent: number;
  total: number;
  openRate: number;
  ctr: number;
  listName: string;
  templateId: string;
  scheduledAt?: string;
}

const INITIAL_TEMPLATES: EmailTemplate[] = [
  { id: 'et_1', name: 'Bienvenida_RealEstate_v1', subject: 'Bienvenido a Cuberbox Real Estate {{name}}', body: 'Hola {{name}},\n\nGracias por interesarte en nuestras propiedades...', category: 'MARKETING', lastModified: '2024-11-20' },
  { id: 'et_2', name: 'Alerta_Inversionista_Q4', subject: 'Oportunidad: Nueva Propiedad en Miami', body: 'Contamos con una nueva unidad con 12% ROI...', category: 'MARKETING', lastModified: '2024-11-21' },
];

const INITIAL_CAMPAIGNS: EmailCampaign[] = [
  { id: 'ec_1', name: 'Oferta Black Friday Florida', status: 'COMPLETED', sent: 15400, total: 15400, openRate: 24.5, ctr: 8.2, listName: 'Miami_Leads_Full', templateId: 'et_1' },
  { id: 'ec_2', name: 'Newsletter Mensual VIP', status: 'SENDING', sent: 3200, total: 10000, openRate: 31.0, ctr: 12.4, listName: 'VIP_Investors', templateId: 'et_2' },
  { id: 'ec_3', name: 'Re-engagement Inactivos', status: 'DRAFT', sent: 0, total: 5000, openRate: 0, ctr: 0, listName: 'Inactive_6mo', templateId: 'et_1' },
];

const EmailModule: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'MARKETING' | 'AGENT'>('MARKETING');
  const [activeTab, setActiveTab] = useState<'CAMPAIGNS' | 'TEMPLATES' | 'ANALYTICS'>('CAMPAIGNS');
  
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(INITIAL_CAMPAIGNS);
  const [templates, setTemplates] = useState<EmailTemplate[]>(INITIAL_TEMPLATES);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [agentCompose, setAgentCompose] = useState({ to: '', subject: '', templateId: '', body: '' });
  const [isStrictTemplateMode, setIsStrictTemplateMode] = useState(true);

  const volumeData = [
    { name: 'Lun', sent: 12000 },
    { name: 'Mar', sent: 15000 },
    { name: 'Mie', sent: 10000 },
    { name: 'Jue', sent: 11000 },
    { name: 'Vie', sent: 13000 },
    { name: 'Sab', sent: 14000 },
    { name: 'Dom', sent: 16000 },
  ];

  const engagementData = [
    { name: 'Lun', openRate: 22.4, ctr: 6.2 },
    { name: 'Mar', openRate: 25.8, ctr: 7.5 },
    { name: 'Mie', openRate: 28.1, ctr: 8.9 },
    { name: 'Jue', openRate: 24.5, ctr: 7.1 },
    { name: 'Vie', openRate: 31.2, ctr: 10.4 },
    { name: 'Sab', openRate: 29.8, ctr: 9.6 },
    { name: 'Dom', openRate: 33.5, ctr: 12.1 },
  ];

  const handleSaveCampaign = async () => {
    if (!selectedCampaign?.name) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    
    if (campaigns.find(c => c.id === selectedCampaign.id)) {
      setCampaigns(campaigns.map(c => c.id === selectedCampaign.id ? selectedCampaign : c));
    } else {
      setCampaigns([...campaigns, { ...selectedCampaign, status: 'DRAFT', sent: 0, openRate: 0, ctr: 0 }]);
    }
    
    setIsSaving(false);
    setIsCampaignModalOpen(false);
    toast('Configuración de envío masivo sincronizada.', 'success');
  };

  const handleStartCampaign = (id: string) => {
    setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'SENDING' } : c));
    toast('Motor de emisión masiva iniciado.', 'success', 'Email Blast');
  };

  const openNewCampaign = () => {
    setSelectedCampaign({
      id: `ec_${Math.random().toString(36).substr(2, 5)}`,
      name: '',
      status: 'DRAFT',
      sent: 0,
      total: 1000,
      openRate: 0,
      ctr: 0,
      listName: 'Seleccionar Lista...',
      templateId: templates[0].id
    });
    setIsCampaignModalOpen(true);
  };

  const openEditCampaign = (c: EmailCampaign) => {
    setSelectedCampaign({ ...c });
    setIsCampaignModalOpen(true);
  };

  const openEditTemplate = (t: EmailTemplate) => {
    setSelectedTemplate({ ...t });
    setIsTemplateModalOpen(true);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-8 animate-in fade-in duration-700 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
        <div className="flex items-center space-x-5">
           <div className={`p-4 rounded-[24px] ${viewMode === 'MARKETING' ? 'bg-indigo-600' : 'bg-emerald-600'} text-white shadow-2xl transition-all duration-500`}>
              <Mail size={32} />
           </div>
           <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                {viewMode === 'MARKETING' ? 'Email Intelligence Hub' : 'Agent Desktop Mailer'}
              </h2>
              <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                {viewMode === 'MARKETING' ? 'Gestión Unificada de Campañas Masivas' : 'Comunicación Individual Directa'}
              </p>
           </div>
        </div>

        <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[24px] shadow-inner">
           <button 
             onClick={() => setViewMode('MARKETING')} 
             className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'MARKETING' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
           >
              Marketing
           </button>
           <button 
             onClick={() => setViewMode('AGENT')} 
             className={`px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'AGENT' ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20' : 'text-slate-500 hover:text-slate-300'}`}
           >
              Agent
           </button>
        </div>
      </div>

      {viewMode === 'MARKETING' ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex space-x-10 mb-8 border-b border-slate-800">
             {[
               { id: 'CAMPAIGNS', label: 'Blast Campaigns', icon: Zap },
               { id: 'TEMPLATES', label: 'HSM Builder', icon: Layout },
               { id: 'ANALYTICS', label: 'Insights', icon: BarChart3 },
             ].map(t => (
               <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center space-x-3 pb-4 text-[11px] font-black uppercase tracking-[0.2em] border-b-4 transition-all ${activeTab === t.id ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
               >
                  <t.icon size={16} />
                  <span>{t.label}</span>
               </button>
             ))}
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {activeTab === 'CAMPAIGNS' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center px-2">
                   <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Active Pipelines</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoreo de emisión en tiempo real</p>
                   </div>
                   <button 
                    onClick={openNewCampaign}
                    className="flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 group"
                   >
                      <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                      <span>Nueva Campaña</span>
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                   {campaigns.map(c => (
                     <div key={c.id} className="p-10 rounded-[48px] bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 transition-all shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-8">
                           <div className={`p-4 rounded-2xl ${c.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : c.status === 'SENDING' ? 'bg-amber-500/10 text-amber-400 animate-pulse' : 'bg-slate-950 text-slate-500'} border border-white/5`}>
                              <Zap size={24} />
                           </div>
                           <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${c.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-950 text-slate-500'}`}>
                              {c.status}
                           </div>
                        </div>

                        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2 truncate">{c.name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-8 flex items-center">
                           <Users size={12} className="mr-2 text-indigo-500" /> {c.listName}
                        </p>

                        <div className="space-y-4 mb-8">
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-500">Progreso</span>
                              <span className="text-white">{Math.round((c.sent / c.total) * 100)}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                              <div className={`h-full transition-all duration-1000 ${c.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-600'}`} style={{ width: `${(c.sent / c.total) * 100}%` }}></div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-6 border-t border-slate-800/50">
                           <div>
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Open Rate</p>
                              <p className="text-lg font-black text-indigo-400">{c.openRate}%</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sent</p>
                              <p className="text-lg font-black text-white">{c.sent.toLocaleString()}</p>
                           </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-800/50">
                           <div className="flex space-x-2">
                              <button onClick={() => openEditCampaign(c)} className="p-3 bg-slate-950 hover:bg-indigo-600 text-slate-500 hover:text-white rounded-xl transition-all border border-slate-800"><Edit3 size={16} /></button>
                              <button onClick={() => setCampaigns(campaigns.filter(x => x.id !== c.id))} className="p-3 bg-slate-950 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl transition-all border border-slate-800"><Trash2 size={16} /></button>
                           </div>
                           {c.status === 'DRAFT' && (
                             <button 
                              onClick={() => handleStartCampaign(c.id)}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-[15px] text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 flex items-center"
                             >
                               <Play size={12} className="mr-2" /> Blast Off
                             </button>
                           )}
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'TEMPLATES' && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                 <div className="flex justify-between items-center px-2">
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Design Library</h3>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Gestión de activos creativos</p>
                    </div>
                    <button 
                      onClick={() => { setSelectedTemplate({ id: '', name: '', subject: '', body: '', category: 'MARKETING', lastModified: '' }); setIsTemplateModalOpen(true); }}
                      className="flex items-center space-x-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl"
                    >
                       <Plus size={18} />
                       <span>Crear Plantilla</span>
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {templates.map(t => (
                      <div key={t.id} className="glass p-8 rounded-[40px] border border-slate-700/50 hover:border-indigo-500/30 transition-all group flex flex-col h-full shadow-xl">
                         <div className="w-full aspect-[4/3] bg-slate-950 rounded-3xl mb-6 relative overflow-hidden flex items-center justify-center border border-slate-800">
                            <FileText size={48} className="text-slate-800 group-hover:text-indigo-600 transition-colors" />
                            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-all"></div>
                         </div>
                         <h4 className="font-black text-white uppercase text-sm mb-1 truncate">{t.name}</h4>
                         <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-6">{t.category}</p>
                         
                         <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between">
                            <span className="text-[9px] text-slate-600 font-bold">{t.lastModified}</span>
                            <div className="flex space-x-1">
                               <button onClick={() => openEditTemplate(t)} className="p-2.5 bg-slate-900 text-slate-500 hover:text-white rounded-xl transition-all border border-slate-800"><Edit3 size={14} /></button>
                               <button onClick={() => setTemplates(templates.filter(x => x.id !== t.id))} className="p-2.5 bg-slate-900 text-slate-500 hover:text-rose-500 rounded-xl transition-all border border-slate-800"><Trash2 size={14} /></button>
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'ANALYTICS' && (
              <div className="space-y-10 animate-in zoom-in-95 duration-700">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {[
                      { label: 'Total Sent', val: '45.2K', icon: Send, col: 'indigo' },
                      { label: 'Avg Open Rate', val: '28.4%', icon: Eye, col: 'blue' },
                      { label: 'Conversion', val: '12.1%', icon: Target, col: 'emerald' },
                      { label: 'Reputation', val: 'High', icon: ShieldCheck, col: 'amber' },
                    ].map((k, i) => (
                      <div key={i} className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-xl flex flex-col justify-between group">
                         <div className={`p-3 rounded-2xl bg-${k.col}-600/10 text-${k.col}-400 w-fit mb-6 border border-white/5`}>
                            <k.icon size={20} />
                         </div>
                         <h3 className="text-2xl font-black text-white uppercase tracking-tight">{k.val}</h3>
                         <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{k.label}</p>
                      </div>
                    ))}
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Volume Chart */}
                    <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl relative overflow-hidden bg-slate-900/40">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center">
                        <TrendingUp size={20} className="mr-3 text-indigo-500" /> Emission Volume
                      </h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={volumeData}>
                              <defs>
                                  <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px' }} />
                              <Area type="monotone" dataKey="sent" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSent)" />
                            </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Engagement Performance Chart */}
                    <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl relative overflow-hidden bg-slate-900/40">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 flex items-center">
                        <MousePointerClick size={20} className="mr-3 text-emerald-500" /> Engagement Ratios
                      </h3>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={engagementData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                              <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                              <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} unit="%" />
                              <Tooltip 
                                cursor={{ stroke: '#1e293b', strokeWidth: 2 }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '24px', padding: '12px' }} 
                              />
                              <Legend 
                                verticalAlign="top" 
                                align="right" 
                                height={36} 
                                iconType="circle"
                                wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}
                              />
                              <Line 
                                name="Open Rate" 
                                type="monotone" 
                                dataKey="openRate" 
                                stroke="#6366f1" 
                                strokeWidth={4} 
                                dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                              <Line 
                                name="CTR" 
                                type="monotone" 
                                dataKey="ctr" 
                                stroke="#10b981" 
                                strokeWidth={4} 
                                dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }}
                                activeDot={{ r: 6, strokeWidth: 0 }}
                              />
                            </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-10">
          <div className="flex-1 glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl flex flex-col space-y-8 overflow-y-auto scrollbar-hide relative overflow-hidden">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none text-emerald-500 group-hover:scale-110 transition-transform duration-700">
                <Smartphone size={200} />
             </div>

             <div className="flex items-center justify-between border-b border-slate-800 pb-8 relative z-10">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[28px] bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                      <Plus size={32} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">Direct Messaging</h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Mailing individual prioritario</p>
                   </div>
                </div>
                <div className="flex items-center space-x-3 bg-slate-950 p-2 rounded-2xl border border-slate-800 shadow-inner">
                   <span className="text-[10px] font-black text-slate-500 uppercase px-4">Modo Estricto</span>
                   <button 
                    onClick={() => setIsStrictTemplateMode(!isStrictTemplateMode)}
                    className={`w-12 h-6 rounded-full relative transition-all duration-500 ${isStrictTemplateMode ? 'bg-emerald-600' : 'bg-slate-700'}`}
                   >
                     <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-xl ${isStrictTemplateMode ? 'right-0.5' : 'left-0.5'}`}></div>
                   </button>
                </div>
             </div>

             <div className="space-y-10 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Destinatario (Lead Email)</label>
                      <div className="relative group">
                         <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" size={20} />
                         <input 
                           type="email" 
                           value={agentCompose.to} 
                           onChange={e => setAgentCompose({...agentCompose, to: e.target.value})} 
                           placeholder="john.wick@continental.com" 
                           className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-bold outline-none focus:border-emerald-500 transition-all shadow-inner" 
                         />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Plantilla HSM</label>
                      <select 
                        value={agentCompose.templateId}
                        onChange={e => {
                          const t = templates.find(temp => temp.id === e.target.value);
                          if (t) setAgentCompose({...agentCompose, templateId: t.id, subject: t.subject, body: t.body});
                        }}
                        className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-emerald-500 appearance-none shadow-inner cursor-pointer"
                      >
                         <option value="">-- PERSONALIZADO --</option>
                         {templates.map(t => (
                           <option key={t.id} value={t.id}>{t.name}</option>
                         ))}
                      </select>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Subject (Asunto)</label>
                   <input 
                     type="text" 
                     value={agentCompose.subject} 
                     onChange={e => setAgentCompose({...agentCompose, subject: e.target.value})} 
                     placeholder="Asunto del correo..." 
                     className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-black uppercase tracking-tight outline-none focus:border-emerald-500 shadow-inner" 
                   />
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center ml-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Cuerpo del Mensaje</label>
                      <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center">
                        <Zap size={10} className="mr-1" /> Rich Text Enabled
                      </span>
                   </div>
                   <textarea 
                      readOnly={isStrictTemplateMode && !!agentCompose.templateId}
                      value={agentCompose.body}
                      onChange={e => { if (!isStrictTemplateMode) setAgentCompose({...agentCompose, body: e.target.value}); }}
                      className={`w-full h-80 bg-slate-950 border-2 border-slate-800 rounded-[40px] p-10 text-sm text-slate-300 font-medium outline-none focus:border-emerald-500 transition-all shadow-inner leading-relaxed resize-none ${isStrictTemplateMode && agentCompose.templateId ? 'opacity-80' : ''}`}
                      placeholder="Escribe el contenido del email..."
                   />
                </div>
             </div>

             <div className="pt-10 border-t border-slate-800 flex justify-end">
                <button 
                 onClick={() => { toast('Email individual despachado.', 'success'); setAgentCompose({ to: '', subject: '', templateId: '', body: '' }); }} 
                 className="bg-emerald-600 hover:bg-emerald-500 text-white px-14 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(16,185,129,0.3)] active:scale-95 flex items-center space-x-4 transition-all"
                >
                   <span>Sellar y Enviar</span>
                   <Send size={20} />
                </button>
             </div>
          </div>

          <div className="w-full lg:w-96 flex flex-col space-y-8">
             <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-[32px] bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 mb-6">
                   <ShieldCheck size={40} />
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Agent Quota</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 mb-8">Seguridad Operativa</p>
                
                <div className="relative w-48 h-48 mb-8">
                   <svg className="w-full h-full rotate-[-90deg]">
                      <circle cx="96" cy="96" r="88" className="stroke-slate-800 stroke-[8px] fill-none" />
                      <circle cx="96" cy="96" r="88" className="stroke-emerald-500 stroke-[8px] fill-none" style={{ strokeDasharray: '552', strokeDashoffset: `${552 - (552 * 0.84)}` }} />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">420</span>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">de 500</span>
                   </div>
                </div>
                
                <p className="text-[10px] text-slate-600 font-bold leading-relaxed uppercase">
                   84% de cuota utilizada. <br/>
                   <span className="text-emerald-500">Reset en 6h 12m</span>
                </p>
             </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isCampaignModalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsCampaignModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg">
               <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-500 border border-indigo-500/20 shadow-inner">
                     <Zap size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Campaign Orquestrator</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configuración estructural del Blast</p>
                  </div>
               </div>
               <button onClick={() => setIsCampaignModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl"><X size={24} /></button>
            </div>

            <div className="p-12 overflow-y-auto space-y-10 scrollbar-hide max-h-[70vh]">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Internal Name</label>
                 <input 
                   type="text" 
                   value={selectedCampaign.name}
                   onChange={e => setSelectedCampaign({...selectedCampaign, name: e.target.value})}
                   className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-indigo-500 transition-all shadow-inner"
                   placeholder="Ej: Oferta Q4 Inversionistas"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Target Data List</label>
                    <div className="relative">
                       <Database className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                       <select 
                         className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-xs text-white font-bold outline-none focus:border-indigo-500 appearance-none shadow-inner"
                       >
                          <option>BI_Segment_Active_Users</option>
                          <option>Import_CSV_Nov_2024</option>
                       </select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Master Template</label>
                    <div className="relative">
                       <Layout className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                       <select 
                         value={selectedCampaign.templateId}
                         onChange={e => setSelectedCampaign({...selectedCampaign, templateId: e.target.value})}
                         className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-xs text-white font-bold outline-none focus:border-indigo-500 appearance-none shadow-inner"
                       >
                          {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                       </select>
                    </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end">
               <button 
                onClick={handleSaveCampaign}
                disabled={isSaving}
                className="flex items-center space-x-4 bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-50 group"
               >
                 {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                 <span>Sincronizar Campaña</span>
               </button>
            </div>
          </div>
        </div>
      )}

      {isTemplateModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsTemplateModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg">
               <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                     <Layout size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Content Core</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Diseño dinámico de activos</p>
                  </div>
               </div>
               <button onClick={() => setIsTemplateModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl"><X size={24} /></button>
            </div>

            <div className="p-12 overflow-y-auto space-y-8 scrollbar-hide max-h-[70vh]">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Template Name</label>
                     <input type="text" value={selectedTemplate.name} onChange={e => setSelectedTemplate({...selectedTemplate, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-bold outline-none focus:border-emerald-500" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Category</label>
                     <select value={selectedTemplate.category} onChange={e => setSelectedTemplate({...selectedTemplate, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-bold outline-none focus:border-emerald-500 appearance-none">
                        <option value="MARKETING">MARKETING</option>
                        <option value="TRANSACTIONAL">TRANSACTIONAL</option>
                        <option value="SUPPORT">SUPPORT</option>
                     </select>
                  </div>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Master Subject</label>
                  <input type="text" value={selectedTemplate.subject} onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-black uppercase tracking-tight outline-none focus:border-emerald-500" />
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center ml-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Body Design</label>
                     <div className="flex space-x-2">
                        <button className="text-[8px] font-black uppercase bg-slate-900 border border-slate-800 px-3 py-1 rounded text-emerald-400">{"{{name}}"}</button>
                     </div>
                  </div>
                  <textarea 
                    value={selectedTemplate.body}
                    onChange={e => setSelectedTemplate({...selectedTemplate, body: e.target.value})}
                    className="w-full h-80 bg-slate-950 border border-slate-800 rounded-[40px] p-10 text-sm text-slate-300 font-medium outline-none focus:border-emerald-500 leading-relaxed resize-none"
                  />
               </div>
            </div>

            <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end">
               <button 
                onClick={() => {
                   if (templates.find(t => t.id === selectedTemplate.id)) {
                      setTemplates(templates.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
                   } else {
                      setTemplates([...templates, { ...selectedTemplate, id: `et_${Date.now()}`, lastModified: new Date().toISOString().split('T')[0] }]);
                   }
                   setIsTemplateModalOpen(false);
                   toast('Plantilla sellada.', 'success');
                }}
                className="flex items-center space-x-4 bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 group"
               >
                 <Save size={20} />
                 <span>Sellar Diseño</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailModule;