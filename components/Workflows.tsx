
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitMerge, ArrowRight, Database, Users, PhoneCall, Bot, 
  ShieldCheck, MessageSquare, CloudSync, Layers, Zap, 
  Terminal, Globe, Server, CheckCircle2, ChevronRight, Info,
  Headphones, Radio, UserCog, ShieldAlert, BarChart3, 
  LineChart, Coffee, Smartphone, ListFilter, 
  LayoutDashboard, Share2, ShieldX, LayoutGrid, Shield, 
  BookOpen, Settings, Phone, Cpu, Search,
  Sparkles, Zap as ZapIcon, Activity as ActivityIcon
} from 'lucide-react';

interface WorkflowStep {
  icon: any;
  label: string;
  desc: string;
  path: string;
  isLast?: boolean;
  status?: 'HEALTHY' | 'SYNCING' | 'ALERT';
}

interface Workflow {
  title: string;
  description: string;
  configPath: string;
  accent: string;
  steps: WorkflowStep[];
}

const Workflows: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<number>(0);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setIsEngineReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const workflowSteps: Workflow[] = [
    {
      title: "Core Operativo & Omnicanal",
      description: "Flujo de vida del lead desde la ingesta hasta la conversión omnicanal masiva.",
      configPath: "/",
      accent: "blue",
      steps: [
        { icon: LayoutDashboard, label: "Dashboard Control", desc: "Vista general de la operación.", path: "/", status: 'HEALTHY' },
        { icon: Database, label: "Ingesta de leads", desc: "Carga masiva y limpieza de datos.", path: "/lists", status: 'HEALTHY' },
        { icon: Users, label: "Estrategia Campaña", desc: "Segmentación y reglas de negocio.", path: "/campaigns", status: 'SYNCING' },
        { icon: LayoutGrid, label: "Hub Omnicanal", desc: "WhatsApp y redes sociales vinculadas.", path: "/whatsapp", status: 'HEALTHY' },
        { icon: PhoneCall, label: "Estación de Agente", desc: "Gestión de llamadas y CRM Pop-up.", path: "/agent", status: 'HEALTHY' },
        { icon: CloudSync, label: "Sync CRM", desc: "Actualización bidireccional de datos.", path: "/crm", status: 'HEALTHY' }
      ]
    },
    {
      title: "Cerebro IA & Automatización",
      description: "Arquitectura neuronal para el procesamiento de voz y bots masivos impulsados por Gemini.",
      configPath: "/ai-studio",
      accent: "purple",
      steps: [
        { icon: Share2, label: "Diseñador IVR", desc: "Flujos de audio y árboles de decisión.", path: "/ivr", status: 'HEALTHY' },
        { icon: Bot, label: "AI Studio", desc: "Entrenamiento de prompts avanzados.", path: "/ai-studio", status: 'HEALTHY' },
        { icon: Radio, label: "Broadcast AI", desc: "Emisión masiva con extracción LLM.", path: "/broadcast-ai", status: 'HEALTHY' },
        { icon: ShieldX, label: "DNC Pro-Shield", desc: "Filtrado de exclusión legal activo.", path: "/dnc", status: 'HEALTHY' },
        { icon: ShieldCheck, label: "Control Calidad", desc: "Auditoría automatizada de sentimientos.", path: "/qa", status: 'SYNCING' }
      ]
    },
    {
      title: "Telemetría & Capa de Datos",
      description: "Configuración técnica del motor SIP y capas de datos BI Warehouse.",
      configPath: "/telephony",
      accent: "emerald",
      steps: [
        { icon: Phone, label: "Telefonía Core", desc: "SIP Trunks, DIDs y Dial Plans.", path: "/telephony", status: 'HEALTHY' },
        { icon: ActivityIcon, label: "Monitor en Vivo", desc: "Supervisión táctica de canales.", path: "/realtime", status: 'HEALTHY' },
        { icon: Server, label: "Infraestructura SIP", desc: "Clúster de FreeSwitch y nodos Go.", path: "/cluster", status: 'HEALTHY' },
        { icon: LineChart, label: "BI & Analytics", desc: "Acceso SQL a Data Warehouse.", path: "/analytics-hub", status: 'HEALTHY' },
        { icon: BarChart3, label: "Reportes CDR", desc: "Auditoría histórica de costos.", path: "/reports", status: 'HEALTHY' },
        { icon: Shield, label: "Seguridad & Logs", desc: "Trazabilidad forense SHA-256.", path: "/audit", status: 'HEALTHY' }
      ]
    }
  ];

  const FlowNode: React.FC<WorkflowStep> = ({ icon: Icon, label, desc, path, isLast, status }) => (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        <button 
          onClick={() => navigate(path)}
          className={`w-20 h-20 rounded-[30px] bg-slate-950 border-2 border-slate-800 flex items-center justify-center transition-all group relative z-10 hover:scale-110 hover:border-blue-500 shadow-2xl overflow-hidden`}
        >
           <Icon size={32} className="text-slate-400 group-hover:text-blue-400 transition-colors duration-300" />
           <div className={`absolute top-0 right-0 p-1.5 ${status === 'HEALTHY' ? 'text-emerald-500' : status === 'SYNCING' ? 'text-blue-400' : 'text-rose-500'}`}>
              <div className={`w-2.5 h-2.5 rounded-full bg-current ${status === 'SYNCING' ? 'animate-ping' : ''} shadow-[0_0_10px_currentColor]`}></div>
           </div>
           <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
        {!isLast && (
          <div className="w-1.5 h-20 bg-gradient-to-b from-blue-500/30 via-slate-800/40 to-transparent"></div>
        )}
      </div>
      <div 
        onClick={() => navigate(path)}
        className="ml-10 pt-4 group cursor-pointer block flex-1"
      >
         <div className="flex items-center space-x-3">
            <h4 className="font-black text-white text-xl uppercase tracking-tighter group-hover:text-blue-400 transition-all duration-300">{label}</h4>
            <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${
              status === 'HEALTHY' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 
              status === 'SYNCING' ? 'border-blue-500/20 text-blue-400 bg-blue-500/5' : 
              'border-rose-500/20 text-rose-500 bg-rose-500/5'
            }`}>
              {status}
            </span>
         </div>
         <p className="text-[11px] text-slate-500 mt-1 max-w-sm font-bold uppercase tracking-widest group-hover:text-slate-300 leading-relaxed transition-all">
            {desc}
         </p>
         <div className="mt-3 flex items-center text-[9px] text-blue-500 font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
            <span>Abrir Terminal</span>
            <ArrowRight size={12} className="ml-1.5" />
         </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <GitMerge className="mr-4 text-blue-500" size={36} />
            Blueprint Architecture
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Navegación estructural dinámica del ecosistema CUBERBOX.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-6 py-3.5 rounded-[24px] shadow-xl">
              <Cpu size={18} className="text-blue-500" />
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Router: Active (v4.0)</span>
           </div>
           <div className="flex items-center space-x-3 bg-emerald-500/10 border border-emerald-500/20 px-6 py-3.5 rounded-[24px]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Core Sync</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Panel de Bibliotecas */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
           <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-4 mb-4">Módulos de Sistema</h4>
           <div className="space-y-3">
             {workflowSteps.map((wf, idx) => (
               <button
                key={idx}
                onClick={() => setActiveWorkflow(idx)}
                className={`w-full p-8 rounded-[48px] border-2 text-left transition-all relative overflow-hidden group ${
                  activeWorkflow === idx 
                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_20px_50px_rgba(59,130,246,0.2)] scale-[1.02]' 
                    : 'glass border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                }`}
               >
                 {activeWorkflow === idx && (
                   <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 shadow-[0_0_15px_#3b82f6]"></div>
                 )}
                 <div className="flex items-center justify-between mb-4">
                    <h3 className={`font-black text-sm uppercase tracking-widest ${activeWorkflow === idx ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                      {wf.title}
                    </h3>
                    <ChevronRight size={20} className={`transition-all duration-300 ${activeWorkflow === idx ? 'text-blue-400 translate-x-1' : 'text-slate-700 group-hover:text-slate-500'}`} />
                 </div>
                 <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter group-hover:text-slate-400">
                    {wf.description}
                 </p>
               </button>
             ))}
           </div>

           <div className="p-10 glass rounded-[48px] border border-blue-500/20 bg-blue-600/5 mt-10 space-y-6">
              <h4 className="font-black text-xs text-white uppercase tracking-widest flex items-center">
                <Info size={18} className="mr-3 text-blue-400" /> Operación de Nodo
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
                Los nodos representan procesos críticos del servidor. Haz clic en cualquier icono para una inyección directa en el módulo de configuración.
              </p>
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                 <span className="text-[9px] font-black text-slate-600 uppercase">Routing Target</span>
                 <span className="text-[10px] font-black text-emerald-400"> &lt; 50ms Latency</span>
              </div>
           </div>
        </div>

        {/* Lienzo del Blueprint (Canvas) */}
        <div className="col-span-12 lg:col-span-8 h-full">
           <div className="glass p-16 rounded-[64px] border border-slate-700/50 shadow-2xl relative overflow-hidden h-full min-h-[850px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent group/canvas">
              
              {/* Neuronal Grid Pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[length:60px_60px] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)]"></div>
              
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none group-hover/canvas:opacity-[0.05] transition-opacity duration-1000">
                 <GitMerge size={600} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                 <div className="flex items-center space-x-8 mb-16">
                    <div className="relative">
                       <div className="w-20 h-20 rounded-[32px] bg-blue-600 flex items-center justify-center text-white shadow-[0_0_40px_rgba(59,130,246,0.6)] animate-pulse">
                          <ZapIcon size={40} fill="currentColor" />
                       </div>
                       <div className="absolute -bottom-2 -right-2 p-2 bg-slate-900 border-2 border-blue-500 rounded-xl text-blue-400">
                          <ActivityIcon size={16} />
                       </div>
                    </div>
                    <div>
                       <h3 className="text-4xl font-black text-white uppercase tracking-tighter leading-none">{workflowSteps[activeWorkflow].title}</h3>
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-[0.4em] mt-3 italic opacity-60">Visual Control Map v4.0.1</p>
                    </div>
                 </div>

                 <div className="flex-1 space-y-0 pl-6 overflow-y-auto scrollbar-hide pr-4">
                    {workflowSteps[activeWorkflow].steps.map((step, idx) => (
                      <FlowNode 
                        key={idx} 
                        icon={step.icon} 
                        label={step.label} 
                        desc={step.desc} 
                        path={step.path}
                        status={step.status}
                        isLast={idx === workflowSteps[activeWorkflow].steps.length - 1} 
                      />
                    ))}
                 </div>

                 <div className="mt-12 p-12 rounded-[56px] bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-10 shadow-inner group">
                    <div className="flex items-center space-x-8">
                       <div className="p-6 rounded-[28px] bg-blue-600/10 text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform duration-500 shadow-lg">
                          <Server size={36} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Infraestructura Maestra</p>
                          <h4 className="text-2xl font-black text-white uppercase mt-1 tracking-tight">System Bridge</h4>
                       </div>
                    </div>
                    <button 
                      onClick={() => navigate(workflowSteps[activeWorkflow].configPath)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-14 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(59,130,246,0.3)] transition-all active:scale-95 flex items-center space-x-5 group"
                    >
                       <span>Configurar Proceso</span>
                       <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Workflows;
