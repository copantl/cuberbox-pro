
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Terminal, Cpu, ShieldCheck, Globe, Sliders, Bot, Users, 
  Database, HardDrive, Search, ChevronRight, X, Info, Zap, Shield, 
  Sparkles, Network, Layers, Smartphone, Box, Server, Key, History,
  Trash2, Lock, Activity, FileText, Code, CheckCircle2, AlertTriangle,
  Play, MousePointer2, Smartphone as PhoneIcon, Volume2,
  ShieldAlert, ArrowUpRight, UserCog, UserCheck, Eye, Headphones,
  Github, GitBranch, Globe2
} from 'lucide-react';

interface ManualStep {
  title: string;
  desc: string;
  code?: string;
}

interface ManualEntry {
  id: string;
  title: string;
  icon: any;
  category: 'INSTALACIÓN' | 'CONFIGURACIÓN' | 'ADMINISTRACIÓN' | 'OPERACIÓN';
  summary: string;
  steps: ManualStep[];
  technicalNote?: string;
  compliance?: string;
}

const MANUAL_DATABASE: ManualEntry[] = [
  // --- ADMINISTRACIÓN: PERFILES & NIVELES ---
  {
    id: 'admin-hier-01',
    title: 'Jerarquía de Autoridad (Lvl 1-9)',
    icon: UserCog,
    category: 'ADMINISTRACIÓN',
    summary: 'Definición exhaustiva del sistema RBAC (Role-Based Access Control) que gobierna las capacidades operativas del personal en CUBERBOX ELITE.',
    steps: [
      { title: 'Nivel 1-3: Agente Operativo', desc: 'Acceso restringido a la Estación de Agente. Capacidad de recibir llamadas, realizar marcación manual, tipificar y gestionar el CRM interno. Repositorio UI: https://github.com/cuberbox/frontend-elite' },
      { title: 'Nivel 4-6: Supervisor GTR', desc: 'Acceso al Command Center y Monitor Real-time. Habilitado para Listen (escucha silenciosa) y Whisper (susurro al agente). Puede gestionar estados de pausa y descargar reportes.' },
      { title: 'Nivel 7-8: Campaign Manager', desc: 'Control estratégico del Dialer Engine. Capacidad para crear campañas, importar bases de datos, ajustar Hopper, configurar IVRs y entrenar modelos en el AI Studio.' },
      { title: 'Nivel 9: Administrador Root', desc: 'Autoridad máxima de infraestructura. Único capaz de gestionar SIP Trunks, Nodos del Clúster, API Keys globales y purga de logs forenses.' }
    ],
    technicalNote: 'La validación de nivel se realiza en el middleware de la API Gateway contra el clúster de PostgreSQL 16.',
    compliance: 'ISO/IEC 27001: El acceso a funciones de monitoreo queda registrado con hash de integridad SHA-256.'
  },

  // --- INSTALACIÓN ---
  {
    id: 'inst-01',
    title: 'Aprovisionamiento de Infraestructura',
    icon: Cpu,
    category: 'INSTALACIÓN',
    summary: 'Guía de despliegue para el stack tecnológico de CUBERBOX PRO en entornos Linux Debian.',
    steps: [
      { title: 'Clonar Repositorio de Setup', desc: 'Obtenga las herramientas de automatización para el despliegue del clúster.', code: 'git clone https://github.com/cuberbox/cluster-setup.git\ncd cluster-setup' },
      { title: 'Configuración de Nodos', desc: 'Edite el inventario de nodos SIP y de base de datos en el archivo de configuración.', code: 'nano inventory.ini\n# Definir nodos FS y DB' },
      { title: 'Despliegue Automatizado', desc: 'Ejecute el script maestro para instalar FreeSwitch, PostgreSQL y el Neural Bridge.', code: 'sudo ./deploy-stack.sh --env=production' }
    ],
    technicalNote: 'Se recomienda Debian 12 con soporte AES-NI para cifrado de audio SRTP.'
  },
  {
    id: 'inst-02',
    title: 'Compilación del Neural Bridge',
    icon: Bot,
    category: 'INSTALACIÓN',
    summary: 'Instalación del puente Go que conecta los eventos SIP con los modelos Gemini Pro de Google.',
    steps: [
      { title: 'Dependencias de Go', desc: 'Requiere Go 1.22+. Descargue el código fuente del puente neuronal.', code: 'git clone https://github.com/cuberbox/neural-bridge.git\ncd neural-bridge' },
      { title: 'Build del Binario', desc: 'Compile el ejecutable optimizado para su arquitectura.', code: 'go mod tidy\ngo build -o cuberbox-engine main.go' },
      { title: 'Persistencia SystemD', desc: 'Configure el motor como un daemon de sistema para garantizar 99.9% uptime.', code: 'cp cuberbox-engine.service /etc/systemd/system/\nsystemctl enable --now cuberbox-engine' }
    ],
    technicalNote: 'El binario interactúa con FreeSwitch vía ESL (Event Socket Layer) en el puerto 8021.'
  },

  // --- CONFIGURACIÓN ---
  {
    id: 'conf-01',
    title: 'Interconexión SIP Carrier',
    icon: Globe,
    category: 'CONFIGURACIÓN',
    summary: 'Procedimiento para vincular troncales SIP y aprovisionar DIDs de entrada.',
    steps: [
      { title: 'Vincular Trunk', desc: 'En el menú Infraestructura > Carrier Trunks, añada los datos de su proveedor SIP.' },
      { title: 'Aprovisionar DIDs', desc: 'Importe sus números y asígnelos a una campaña o flujo IVR específico.' },
      { title: 'Validación de Ruta', desc: 'Use el CLI integrado para verificar el registro del gateway.', code: 'fs_cli -x "sofia profile external rescan"\nfs_cli -x "sofia status"' }
    ]
  },
  {
    id: 'conf-02',
    title: 'Entrenamiento de AI Studio',
    icon: Sparkles,
    category: 'CONFIGURACIÓN',
    summary: 'Configuración del modelo Gemini 3 Pro para transcripción y bots inteligentes.',
    steps: [
      { title: 'API Key de Gemini', desc: 'Obtenga su llave en Google AI Studio y regístrela en la plataforma.' },
      { title: 'Diseño de Prompts', desc: 'Defina la personalidad, el tono y los objetivos de extracción del bot.' },
      { title: 'Test de Conversación', desc: 'Utilice el Sandbox integrado para validar la respuesta de la IA antes de enviarla a producción.' }
    ],
    technicalNote: 'El motor utiliza gemini-3-pro-preview para tareas de razonamiento complejo en llamadas de ventas.'
  },

  // --- OPERACIÓN ---
  {
    id: 'op-01',
    title: 'Monitor Real-Time & GTR',
    icon: Activity,
    category: 'OPERACIÓN',
    summary: 'Gestión táctica de la planta operativa y supervisión disciplinaria.',
    steps: [
      { title: 'Supervisión de Bridges', desc: 'Vea las conferencias activas y realice escuchas silenciosas (Listen).' },
      { title: 'Control de Estados', desc: 'Cambie el estado de un agente de forma remota si excede sus tiempos de pausa.' },
      { title: 'Métrica de SLA', desc: 'Monitoree el porcentaje de llamadas contestadas antes de los 20 segundos.' }
    ]
  }
];

const UserManual: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ManualEntry | null>(MANUAL_DATABASE[0]);

  const filteredManual = useMemo(() => {
    if (!searchQuery) return MANUAL_DATABASE;
    return MANUAL_DATABASE.filter(s => 
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Copiado al portapapeles.");
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-full mb-4">
          <BookOpen size={18} className="text-blue-400" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">CUBERBOX Knowledge Hub v4.6</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight">Documentación Técnica</h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium leading-relaxed">
          Manual oficial de arquitectura, despliegue y operación para el clúster CUBERBOX ELITE.
        </p>
        
        <div className="relative max-w-xl mx-auto mt-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
          <input 
            type="text"
            placeholder="Buscar por módulo o repositorio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-[32px] pl-16 pr-12 py-5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner font-bold placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10 flex-1 min-h-0">
        <div className="col-span-12 lg:col-span-4 flex flex-col space-y-10 overflow-y-auto scrollbar-hide pr-2">
           {['INSTALACIÓN', 'CONFIGURACIÓN', 'ADMINISTRACIÓN', 'OPERACIÓN'].map(cat => {
             const items = filteredManual.filter(e => e.category === cat);
             if (items.length === 0) return null;
             return (
               <div key={cat} className="space-y-4">
                  <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] px-4 border-l-4 border-slate-800 ml-1">{cat}</h4>
                  <div className="space-y-2">
                     {items.map(entry => (
                       <button
                        key={entry.id}
                        onClick={() => setSelectedEntry(entry)}
                        className={`w-full flex items-center p-5 rounded-[28px] border-2 transition-all group relative overflow-hidden ${
                          selectedEntry?.id === entry.id 
                            ? 'bg-blue-600/10 border-blue-500 shadow-xl' 
                            : 'glass border-slate-800 hover:bg-slate-800/40 hover:border-slate-700'
                        }`}
                       >
                          <div className={`p-3 rounded-2xl mr-5 transition-all ${selectedEntry?.id === entry.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}`}>
                             <entry.icon size={22} />
                          </div>
                          <span className={`text-[11px] font-black uppercase tracking-widest text-left ${selectedEntry?.id === entry.id ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>{entry.title}</span>
                       </button>
                     ))}
                  </div>
               </div>
             );
           })}
        </div>

        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
           {selectedEntry ? (
             <div className="glass flex-1 rounded-[64px] border border-slate-700/50 shadow-2xl overflow-y-auto scrollbar-hide p-14 space-y-14 animate-in zoom-in-95 duration-500 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.02),_transparent)]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex items-center space-x-8">
                    <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center shadow-2xl border-4 border-white/5 ${
                      selectedEntry.category === 'INSTALACIÓN' ? 'bg-blue-600 text-white' :
                      selectedEntry.category === 'CONFIGURACIÓN' ? 'bg-emerald-600 text-white' :
                      selectedEntry.category === 'ADMINISTRACIÓN' ? 'bg-amber-600 text-white' :
                      'bg-rose-600 text-white'
                    }`}>
                        <selectedEntry.icon size={48} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3 block">{selectedEntry.category} NODE</span>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedEntry.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800">
                    <Github size={16} className="text-slate-600" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Open Source Core</span>
                  </div>
                </div>

                <div className="space-y-6">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                     <Info size={16} className="mr-3 text-blue-500" /> Resumen Ejecutivo
                   </h3>
                   <p className="text-2xl text-slate-300 leading-relaxed font-medium italic">"{selectedEntry.summary}"</p>
                </div>

                <div className="space-y-10">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                     <Sparkles size={16} className="mr-3 text-amber-500" /> Procedimiento
                   </h3>
                   <div className="space-y-8">
                      {selectedEntry.steps.map((step, i) => (
                        <div key={i} className="group flex flex-col space-y-6 p-10 bg-slate-900/40 border border-slate-800 rounded-[48px] hover:border-blue-500/30 transition-all shadow-inner relative overflow-hidden">
                           <div className="flex items-start space-x-8">
                              <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center font-black text-xs text-blue-500 shrink-0 shadow-lg">{i+1}</div>
                              <div className="flex-1 space-y-4">
                                 <h4 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h4>
                                 <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                 {step.code && (
                                   <div className="mt-6 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                                      <div className="px-6 py-3 border-b border-slate-900 bg-slate-900/50 flex justify-between items-center">
                                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bash / Linux</span>
                                         <button onClick={() => handleCopyCode(step.code!)} className="text-[9px] font-black text-slate-600 hover:text-blue-400 uppercase tracking-widest">Copiar</button>
                                      </div>
                                      <pre className="p-8 text-sm font-mono text-emerald-400/90 leading-relaxed overflow-x-auto scrollbar-hide">
                                         <code>{step.code}</code>
                                      </pre>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                        <Github size={16} className="mr-3 text-emerald-500" /> Repositorios de Referencia
                      </h3>
                      <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800 space-y-4">
                         <a href="https://github.com/cuberbox/neural-bridge" target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-blue-600/10 transition-all border border-slate-800 group">
                            <span className="text-[10px] font-black text-slate-300 uppercase">Neural Bridge (Go)</span>
                            <ArrowUpRight size={14} className="text-blue-400" />
                         </a>
                         <a href="https://github.com/cuberbox/cluster-setup" target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-blue-600/10 transition-all border border-slate-800 group">
                            <span className="text-[10px] font-black text-slate-300 uppercase">Cluster Setup (Ansible)</span>
                            <ArrowUpRight size={14} className="text-blue-400" />
                         </a>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                        <ShieldAlert size={16} className="mr-3 text-rose-500" /> Cumplimiento Legal
                      </h3>
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-4 shadow-2xl">
                         <p className="text-[10px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider">
                           {selectedEntry.compliance || 'Se requiere validación SHA-256 para cualquier cambio estructural en el clúster.'}
                         </p>
                         <div className="flex items-center space-x-2 pt-4 border-t border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Verified Security v4.6</span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center glass rounded-[64px] border border-slate-800 opacity-30 text-center space-y-8">
                <Search size={100} className="text-slate-700 mx-auto" />
                <h3 className="text-3xl font-black text-slate-600 uppercase tracking-[0.5em]">Sin Resultados</h3>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UserManual;
