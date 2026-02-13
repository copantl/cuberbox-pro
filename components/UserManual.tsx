import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Terminal, Cpu, ShieldCheck, Globe, Sliders, Bot, Users, 
  Database, HardDrive, Search, ChevronRight, X, Info, Zap, Shield, 
  Sparkles, Network, Layers, Smartphone, Box, Server, Key, History,
  Trash2, Lock, Activity, FileText, Code, CheckCircle2, AlertTriangle,
  Play, MousePointer2, Smartphone as PhoneIcon, Volume2,
  ShieldAlert, ArrowUpRight, UserCog, UserCheck, Eye, Headphones,
  Github, GitBranch, Globe2, TerminalSquare, AlertCircle
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
  // --- INSTALACIÓN ---
  {
    id: 'inst-01',
    title: 'Despliegue Flash (Ironclad Mitigated)',
    icon: Zap,
    category: 'INSTALACIÓN',
    summary: 'Procedimiento estándar para desplegar CUBERBOX ELITE con protección contra fallos de mirror SIP.',
    steps: [
      { title: 'Conexión SSH', desc: 'Acceda a su terminal como usuario Root.' },
      { title: 'Ejecutar Instalador Maestro', desc: 'El script V4.8.6 utiliza wget con timeout y validación de bytes para evitar bloqueos en el paso de llaves GPG.', code: 'wget -O install.sh https://raw.githubusercontent.com/copantl/cuberbox-pro/main/setup/install.sh && chmod +x install.sh && sudo ./install.sh' },
      { title: 'Verificación de Daemons', desc: 'El script activará freeswitch y el motor neuronal Go usando la rama mr11.3 estable.' }
    ],
    technicalNote: 'La versión 4.8.6 soluciona el "hang" en la configuración del Media Plane mediante reintentos automáticos y detección de errores 404 en la descarga de llaves.',
    compliance: 'ISO/IEC 27001: Logs de instalación protegidos vía SHA-256 en /var/log/cuberbox_install.log.'
  },
  {
    id: 'inst-02',
    title: 'Compilación Manual del Engine (Fix Auth)',
    icon: TerminalSquare,
    category: 'INSTALACIÓN',
    summary: 'Guía técnica para administradores que requieren compilar el orquestador Go evitando errores de terminal Git.',
    steps: [
      { title: 'Clonar Repositorio', desc: 'Obtenga el código fuente del repositorio oficial.', code: 'git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox' },
      { title: 'Evitar Bloqueos de Git', desc: 'Configure el entorno para usar el proxy oficial de Go.', code: 'export GOPROXY=https://proxy.golang.org,direct\ncd /opt/cuberbox/backend' },
      { title: 'Build del Binario', desc: 'Compile el orquestador SIP.', code: 'go mod tidy\ngo build -o cuberbox-engine main.go' }
    ],
    technicalNote: 'El uso de GOPROXY evita que Go intente autenticarse en GitHub interactivamente.'
  },

  // --- ADMINISTRACIÓN: PERFILES & NIVELES ---
  {
    id: 'admin-hier-01',
    title: 'Jerarquía de Autoridad (Lvl 1-9)',
    icon: UserCog,
    category: 'ADMINISTRACIÓN',
    summary: 'Definición del sistema RBAC (Role-Based Access Control) que gobierna las capacidades operativas en CUBERBOX ELITE.',
    steps: [
      { title: 'Nivel 1-3: Agente', desc: 'Acceso a Estación de Agente y CRM.' },
      { title: 'Nivel 4-6: Supervisor GTR', desc: 'Monitor Real-time, Listen, Whisper y gestión de pausas.' },
      { title: 'Nivel 7-8: Campaign Manager', desc: 'Control de Dialer, Importación de Leads y AI Studio.' },
      { title: 'Nivel 9: Administrador Root', desc: 'Infraestructura, SIP Trunks y API Keys.' }
    ]
  },

  // --- CONFIGURACIÓN ---
  {
    id: 'conf-01',
    title: 'Provisionamiento de Carrier SIP',
    icon: Globe,
    category: 'CONFIGURACIÓN',
    summary: 'Procedimiento para vincular troncales SIP y aprovisionar números de entrada (DIDs).',
    steps: [
      { title: 'Añadir Troncal', desc: 'En el módulo de Telefonía Core, registre su proveedor con Host, Usuario y Password.' },
      { title: 'Validación de Registro', desc: 'Utilice el System CLI integrado para verificar el estado de la troncal.', code: 'sofia profile external rescan\nsofia status gateway <nombre_carrier>' }
    ]
  },
  {
    id: 'conf-02',
    title: 'AI Neural Bridge (Gemini)',
    icon: Sparkles,
    category: 'CONFIGURACIÓN',
    summary: 'Configuración de la IA para transcripción, análisis de sentimientos y bots de broadcast.',
    steps: [
      { title: 'API Key Generation', desc: 'Genere su llave en Google AI Studio.' },
      { title: 'Prompt Engineering', desc: 'Defina las instrucciones del sistema en el AI Studio de CUBERBOX.' }
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
    alert("Código copiado al portapapeles.");
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-full mb-4">
          <BookOpen size={18} className="text-blue-400" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">CUBERBOX Knowledge Hub v4.8</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight">Documentación de Sistema</h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium leading-relaxed">
          Guía técnica para el despliegue de infraestructura, operación táctica y configuración del motor neuronal.
        </p>
        
        <div className="relative max-w-xl mx-auto mt-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
          <input 
            type="text"
            placeholder="Buscar por módulo o procedimiento..."
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
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Git: copantl/cuberbox-pro</span>
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
                                         <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Bash / Linux Terminal</span>
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
                        <Github size={16} className="mr-3 text-emerald-500" /> Repositorio
                      </h3>
                      <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800 space-y-4">
                         <a href="https://github.com/copantl/cuberbox-pro" target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-slate-900 hover:bg-blue-600/10 transition-all border border-slate-800 group">
                            <span className="text-[10px] font-black text-slate-300 uppercase">CUBERBOX Pro Repo</span>
                            <ArrowUpRight size={14} className="text-blue-400" />
                         </a>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                        <ShieldAlert size={16} className="mr-3 text-rose-500" /> Blindaje L7
                      </h3>
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-4 shadow-2xl">
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                           {selectedEntry.compliance || 'Se requiere validación SHA-256 para cualquier cambio estructural en el clúster.'}
                         </p>
                         <div className="flex items-center space-x-2 pt-4 border-t border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                            <span className="text-[10px] font-black text-emerald-500 uppercase">Verificado v4.8.6</span>
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