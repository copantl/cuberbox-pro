
import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Terminal, Cpu, ShieldCheck, Globe, Sliders, Bot, Users, 
  Database, HardDrive, Search, ChevronRight, X, Info, Zap, Shield, 
  Sparkles, Network, Layers, Smartphone, Box, Server, Key, History,
  Trash2, Lock, Activity, FileText, Code, CheckCircle2, AlertTriangle,
  Play, MousePointer2, Smartphone as PhoneIcon, Volume2,
  ShieldAlert, ArrowUpRight, UserCog, UserCheck, Eye, Headphones
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
    summary: 'Definición exhaustiva del sistema RBAC (Role-Based Access Control) que gobierna las capacidades operativas del personal.',
    steps: [
      { title: 'Nivel 1-3: Agente Operativo', desc: 'Acceso restringido a la Estación de Agente. Capacidad de recibir llamadas, realizar marcación manual (si se habilita), tipificar y gestionar el CRM interno. Sin acceso a reportes globales ni configuración.' },
      { title: 'Nivel 4-6: Supervisor GTR', desc: 'Acceso al Command Center y Monitor Real-time. Habilitado para Listen (escucha silenciosa) y Whisper (susurro al agente). Puede gestionar estados de pausa y descargar reportes de su grupo asignado.' },
      { title: 'Nivel 7-8: Campaign Manager', desc: 'Control estratégico del Dialer Engine. Capacidad para crear campañas, importar bases de datos, ajustar Hopper, configurar IVRs y entrenar modelos de IA en el AI Studio.' },
      { title: 'Nivel 9: Administrador Root', desc: 'Autoridad máxima de infraestructura. Único perfil capaz de gestionar SIP Trunks, Nodos del Clúster, API Keys globales, Auditoría Forense y purga de logs de seguridad.' }
    ],
    technicalNote: 'El nivel de acceso es un campo numérico que se valida en cada petición gRPC hacia el core del sistema.',
    compliance: 'ISO/IEC 27001: El acceso a funciones de monitoreo (Level 4+) queda registrado con la IP y timestamp del supervisor.'
  },
  {
    id: 'admin-perm-02',
    title: 'Matriz de Permisos Granulares',
    icon: Shield,
    category: 'ADMINISTRACIÓN',
    summary: 'Cómo configurar excepciones y habilitar funciones específicas por encima del nivel de autoridad base.',
    steps: [
      { title: 'Permisos de Monitoreo', desc: 'Define si un usuario puede realizar "Barge-in" (entrar a la llamada) o solo "Listen". Requiere configuración de canal SIP dedicado.' },
      { title: 'Privilegios de Data', desc: 'Controla quién puede "Purgar Leads" o "Exportar CDR". Estas acciones disparan una alerta de seguridad nivel WARN en el Audit Log.' },
      { title: 'Acceso Neural AI', desc: 'Permiso específico para modificar el prompt sistémico de los bots. Solo recomendado para ingenieros de prompts nivel 7+.' }
    ]
  },

  // --- INSTALACIÓN ---
  {
    id: 'inst-01',
    title: 'Aprovisionamiento de Hardware & OS',
    icon: Cpu,
    category: 'INSTALACIÓN',
    summary: 'Guía de preparación del entorno base para garantizar latencia cero en el procesamiento de audio.',
    steps: [
      { title: 'Selección de Instancia', desc: 'Debian 12/13 (Bookworm) es el único OS soportado oficialmente. Use instancias con soporte AES-NI para cifrado SRTP acelerado por hardware.' },
      { title: 'Configuración de Red', desc: 'Asigne una IP Estática Pública o elija una VPC con latencia < 20ms hacia su Carrier SIP más cercano.' },
      { title: 'Actualización de Kernel', desc: 'Prepare los repositorios y limpie paquetes obsoletos.', code: 'apt update && apt upgrade -y\napt install -y curl git build-essential' }
    ],
    technicalNote: 'Mínimo recomendado: 4 vCPU y 8GB RAM para 50 agentes concurrentes con grabación activa.'
  },
  {
    id: 'inst-02',
    title: 'Despliegue del Clúster Neuronal',
    icon: Server,
    category: 'INSTALACIÓN',
    summary: 'Ejecución del script maestro de instalación y orquestación de servicios.',
    steps: [
      { title: 'Descarga de Repositorio', desc: 'Obtenga la última versión estable del núcleo de CUBERBOX.', code: 'git clone https://github.com/cuberbox/cluster-core.git\ncd cluster-core/setup' },
      { title: 'Ejecución del Script de Setup', desc: 'Inicie el proceso automatizado de compilación del puente Go y configuración de FreeSwitch.', code: 'chmod +x install.sh\nsudo ./install.sh' },
      { title: 'Verificación de Servicios', desc: 'Asegúrese de que el motor Go y FreeSwitch estén en modo activo.', code: 'systemctl status cuberbox-engine\nfs_cli -x "sofia status"' }
    ],
    compliance: 'Norma de seguridad L7: El puerto 8021 debe estar protegido por el firewall UFW.'
  },

  // --- CONFIGURACIÓN ---
  {
    id: 'conf-01',
    title: 'Conectividad SIP & Gateways',
    icon: Globe,
    category: 'CONFIGURACIÓN',
    summary: 'Paso a paso para vincular su Carrier SIP y habilitar llamadas al exterior.',
    steps: [
      { title: 'Crear SIP Trunk', desc: 'En el menú de "Infraestructura SIP", añada una nueva troncal con los datos de su proveedor (Twilio, Voxbone, etc).' },
      { title: 'Auth de Capa SIP', desc: 'Configure el "Username" y "Secret" proporcionados. Seleccione TLS si su carrier soporta señalización cifrada.' },
      { title: 'Ruta de Salida', desc: 'Defina el Dialplan Context. Por defecto "from-trunk" para recibir y "default" para emitir.' }
    ],
    technicalNote: 'Utilice el codec Opus para máxima calidad o G711 PCMU para compatibilidad masiva.'
  },
  {
    id: 'conf-02',
    title: 'Activación del Cerebro IA (Gemini)',
    icon: Bot,
    category: 'CONFIGURACIÓN',
    summary: 'Integración del modelo Gemini Pro para transcripción y bots interactivos.',
    steps: [
      { title: 'Obtener API Key', desc: 'Genere su llave en Google AI Studio y asegúrese de que tenga permisos de generación de contenido.' },
      { title: 'Inyectar al Motor', desc: 'Edite el archivo de configuración del daemon para que el puente Go pueda autenticarse.', code: 'nano /etc/cuberbox/engine.env\nAPI_KEY=su_llave_aqui\n\nsystemctl restart cuberbox-engine' },
      { title: 'Entrenamiento de Prompt', desc: 'Vaya al módulo "AI Studio" de la UI y defina el comportamiento sistémico del agente virtual.' }
    ]
  },

  // --- OPERACIÓN ---
  {
    id: 'op-01',
    title: 'Protocolo de Supervisión GTR',
    icon: Activity,
    category: 'OPERACIÓN',
    summary: 'Uso de la consola de control para la gestión disciplinaria en tiempo real.',
    steps: [
      { title: 'Monitor en Vivo', desc: 'Utilice la vista de "Monitor en Vivo" para ver quién está en llamada y cuánto tiempo lleva en estado "Paused".' },
      { title: 'Escucha Silenciosa', desc: 'Haga clic en el icono de "Ear" para escuchar una llamada activa sin que el agente o el cliente lo noten.' },
      { title: 'Intervención de Llamada', desc: 'Use la función "Barge" para entrar en la conferencia y hablar con ambas partes en caso de crisis.' }
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
    alert("Comando copiado al portapapeles.");
  };

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header Estilizado */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-full mb-4">
          <BookOpen size={18} className="text-blue-400" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">CUBERBOX Knowledge Hub v4.6</span>
        </div>
        <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight">Documentación de Sistema</h1>
        <p className="text-slate-400 text-sm max-w-2xl mx-auto font-medium leading-relaxed">
          Guía técnica exhaustiva para la implementación, blindaje y operación del clúster neuronal CUBERBOX Pro.
        </p>
        
        {/* Buscador Pro */}
        <div className="relative max-w-xl mx-auto mt-10">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={22} />
          <input 
            type="text"
            placeholder="Buscar por módulo, comando o categoría..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-[32px] pl-16 pr-12 py-5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner font-bold placeholder:text-slate-600"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10 flex-1 min-h-0">
        {/* Navegación Lateral de Secciones */}
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
                          <ChevronRight size={18} className={`ml-auto transition-all ${selectedEntry?.id === entry.id ? 'text-blue-400 translate-x-1' : 'text-slate-800 opacity-0 group-hover:opacity-100'}`} />
                       </button>
                     ))}
                  </div>
               </div>
             );
           })}
        </div>

        {/* Visualizador de Contenido Wiki */}
        <div className="col-span-12 lg:col-span-8 flex flex-col min-h-0">
           {selectedEntry ? (
             <div className="glass flex-1 rounded-[64px] border border-slate-700/50 shadow-2xl overflow-y-auto scrollbar-hide p-14 space-y-14 animate-in zoom-in-95 duration-500 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.02),_transparent)]">
                {/* Header del Articulo */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                  <div className="flex items-center space-x-8">
                    <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center shadow-2xl border-4 border-white/5 ${
                      selectedEntry.category === 'INSTALACIÓN' ? 'bg-blue-600 text-white shadow-blue-500/20' :
                      selectedEntry.category === 'CONFIGURACIÓN' ? 'bg-emerald-600 text-white shadow-emerald-500/20' :
                      selectedEntry.category === 'ADMINISTRACIÓN' ? 'bg-amber-600 text-white shadow-amber-500/20' :
                      'bg-rose-600 text-white shadow-rose-500/20'
                    }`}>
                        <selectedEntry.icon size={48} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-3 block">{selectedEntry.category} NODE</span>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{selectedEntry.title}</h2>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-slate-950 px-5 py-3 rounded-2xl border border-slate-800">
                    <History size={16} className="text-slate-600" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rev: Nov 2024</span>
                  </div>
                </div>

                {/* Resumen */}
                <div className="space-y-6">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                     <Info size={16} className="mr-3 text-blue-500" /> Descripción Ejecutiva
                   </h3>
                   <p className="text-2xl text-slate-300 leading-relaxed font-medium italic">"{selectedEntry.summary}"</p>
                </div>

                {/* Pasos Detallados */}
                <div className="space-y-10">
                   <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                     <Sparkles size={16} className="mr-3 text-amber-500" /> Procedimiento Paso a Paso
                   </h3>
                   <div className="space-y-8">
                      {selectedEntry.steps.map((step, i) => (
                        <div key={i} className="group flex flex-col space-y-6 p-10 bg-slate-900/40 border border-slate-800 rounded-[48px] hover:border-blue-500/30 transition-all shadow-inner relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <div className="flex items-start space-x-8">
                              <div className="w-12 h-12 rounded-full bg-slate-950 border-2 border-slate-800 flex items-center justify-center font-black text-xs text-blue-500 shrink-0 group-hover:scale-110 group-hover:border-blue-500 transition-all shadow-lg">{i+1}</div>
                              <div className="flex-1 space-y-4">
                                 <h4 className="text-xl font-black text-white uppercase tracking-tight">{step.title}</h4>
                                 <p className="text-slate-400 font-medium leading-relaxed">{step.desc}</p>
                                 {step.code && (
                                   <div className="mt-6 bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                                      <div className="px-6 py-3 border-b border-slate-900 bg-slate-900/50 flex justify-between items-center">
                                         <div className="flex space-x-1.5">
                                            <div className="w-2 h-2 rounded-full bg-rose-500/50"></div>
                                            <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                                            <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                                         </div>
                                         <button onClick={() => handleCopyCode(step.code!)} className="text-[9px] font-black text-slate-600 hover:text-blue-400 uppercase tracking-widest transition-colors">Copiar Código</button>
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

                {/* Sección Técnica Final */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-6">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                        <Terminal size={16} className="mr-3 text-emerald-500" /> Notas Técnicas de Bajo Nivel
                      </h3>
                      <div className="p-8 bg-slate-950 rounded-[40px] border border-slate-800 shadow-inner relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-5 text-emerald-500 group-hover:scale-110 transition-transform"><Code size={100} /></div>
                         <p className="text-sm text-slate-400 leading-relaxed font-mono italic relative z-10">
                           {selectedEntry.technicalNote || 'Este proceso interactúa directamente con el clúster neuronal de CUBERBOX Pro. Todos los cambios se replican en caliente en los nodos SIP mediante gRPC.'}
                         </p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-4 flex items-center">
                        <ShieldAlert size={16} className="mr-3 text-rose-500" /> Compliance & Seguridad
                      </h3>
                      <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] space-y-6 shadow-2xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-5 text-rose-500 group-hover:scale-110 transition-transform"><Lock size={100} /></div>
                         <div className="flex items-center space-x-4 relative z-10">
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 border border-rose-500/20">
                               <Shield size={24} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Protocolo de Integridad</p>
                               <p className="text-[10px] text-slate-600 font-bold uppercase mt-1">Audit Level: Critical</p>
                            </div>
                         </div>
                         <p className="text-[11px] text-slate-400 leading-relaxed font-bold uppercase tracking-wider relative z-10">
                           {selectedEntry.compliance || 'Se requiere firma criptográfica para validar cualquier cambio estructural en el clúster.'}
                         </p>
                         <div className="flex items-center justify-between pt-4 border-t border-slate-800 relative z-10">
                            <span className="text-[9px] font-black text-slate-700 uppercase">Verification Status</span>
                            <div className="flex items-center space-x-2">
                               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] text-emerald-500"></div>
                               <span className="text-[10px] font-black text-emerald-500">Verified by Cuberbox Security</span>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
           ) : (
             <div className="flex-1 flex flex-col items-center justify-center glass rounded-[64px] border border-slate-800 opacity-30 text-center space-y-8">
                <Search size={100} className="text-slate-700 mx-auto" />
                <div>
                   <h3 className="text-3xl font-black text-slate-600 uppercase tracking-[0.5em]">Sin Resultados</h3>
                   <p className="mt-3 text-sm font-bold text-slate-700 uppercase tracking-widest">Prueba buscando "SIP", "Gemini" o "Instalación".</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Footer del Hub */}
      <div className="p-10 glass rounded-[48px] border border-blue-500/20 bg-blue-600/5 flex flex-col md:flex-row items-center justify-between gap-8 shrink-0 shadow-2xl">
         <div className="flex items-center space-x-8">
            <div className="w-20 h-20 rounded-[28px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner group">
               <LifeBuoy size={40} className="group-hover:rotate-45 transition-transform duration-700" />
            </div>
            <div>
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">¿Necesitas soporte técnico de nivel 3?</h3>
               <p className="text-sm text-slate-400 font-medium max-w-xl">Nuestro equipo de ingenieros SIP está disponible 24/7 para asistir en despliegues de clúster críticos.</p>
            </div>
         </div>
         <button className="bg-white text-slate-900 px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-blue-50 transition-all active:scale-95 flex items-center space-x-3">
            <span>Abrir Ticket Premium</span>
            <ArrowUpRight size={18} />
         </button>
      </div>
    </div>
  );
};

export default UserManual;

const LifeBuoy = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="4.93" x2="9.17" y1="4.93" y2="9.17"/><line x1="14.83" x2="19.07" y1="14.83" y2="19.07"/><line x1="14.83" x2="19.07" y1="9.17" y2="4.93"/><line x1="4.93" x2="9.17" y1="19.07" y2="14.83"/></svg>
);
