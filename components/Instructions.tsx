import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Copy, Terminal, Server, Database, Phone, Code, ShieldCheck, Shield,
  ChevronRight, Laptop, Cpu, Settings, Globe, Download, CheckCircle2,
  AlertTriangle, FileCode, SquareTerminal, Lock, HardDrive, Zap,
  Layers, BarChart3, Activity, Network, Share2, GitMerge, Bot,
  Box, Smartphone, Github, GitBranch, TerminalSquare, AlertCircle,
  Monitor
} from 'lucide-react';

const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ONE_LINER' | 'MANUAL' | 'CLUSTER' | 'POST_INSTALL'>('ONE_LINER');

  const CodeBlock = ({ title, code, icon: Icon }: any) => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(code);
      alert("Snippet copiado al portapapeles.");
    };

    return (
      <div className="bg-slate-950/90 border border-slate-800 rounded-[32px] overflow-hidden mb-8 shadow-2xl group">
        <div className="px-8 py-5 bg-slate-900/50 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2.5 bg-blue-600/10 rounded-xl text-blue-400">
              <Icon size={18} />
            </div>
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">{title}</span>
          </div>
          <button 
            onClick={copyToClipboard}
            className="flex items-center space-x-2 text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase px-4 py-1.5 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500"
          >
            <Copy size={12} />
            <span>Copiar Comando</span>
          </button>
        </div>
        <pre className="p-8 text-[13px] text-emerald-400/90 overflow-x-auto font-mono leading-relaxed bg-black/20 scrollbar-hide">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  const StepCard = ({ num, title, children }: any) => (
    <div className="relative pl-16 pb-12 border-l-2 border-slate-800/50 last:border-none">
      <div className="absolute left-[-22px] top-0 w-11 h-11 rounded-[14px] bg-blue-600 flex items-center justify-center font-black text-white shadow-xl shadow-blue-600/30 border-4 border-slate-950 z-10">
        {num}
      </div>
      <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 pb-40 animate-in fade-in duration-700">
      <div className="text-center mb-20 space-y-4">
        <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-full mb-6">
          <Github size={18} className="text-blue-400" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Official Deployment Guide</span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CUBERBOX Operations</h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto font-medium mt-4">
          Protocolos de despliegue para el clúster CUBERBOX PRO en entornos de alta disponibilidad (Debian 12/13).
        </p>
      </div>

      <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[32px] mb-16 shadow-2xl max-w-4xl mx-auto overflow-x-auto scrollbar-hide">
        {[
          { id: 'ONE_LINER', label: 'Instalación Flash', icon: Zap },
          { id: 'MANUAL', label: 'Paso a Paso', icon: Terminal },
          { id: 'CLUSTER', label: 'Arquitectura', icon: Layers },
          { id: 'POST_INSTALL', label: 'Finalizar', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-3 py-4 px-6 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        {activeTab === 'ONE_LINER' && (
          <div className="space-y-12">
            <div className="glass p-12 rounded-[64px] border border-blue-500/20 bg-blue-600/5 mb-16 relative overflow-hidden">
               <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                  <Zap size={32} className="mr-4 text-blue-400 animate-pulse" /> Build v4.9.0 "RECKONING"
               </h2>
               <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl font-medium">
                  Esta versión soluciona los errores 401 de SignalWire mediante <strong>inyección de llaves GPG embebidas</strong> y elimina la dependencia del comando obsoleto <code>apt-key</code>.
               </p>
               <CodeBlock 
                  title="Master Setup One-Liner (Build 4.9.0)"
                  icon={TerminalSquare}
                  code={`wget -O install.sh https://raw.githubusercontent.com/copantl/cuberbox-pro/main/setup/install.sh && chmod +x install.sh && sudo ./install.sh`}
               />
               <div className="p-8 bg-slate-900 border border-slate-800 rounded-[36px] flex items-start space-x-6">
                  <AlertCircle size={24} className="text-emerald-500 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Reparación de Seguridad Confirmada</h4>
                    <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                       Se ha migrado al sistema de keyrings moderno de Debian 12. Ya no se requiere comunicación externa para la validación de firmas digitales inicial.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'MANUAL' && (
          <div className="space-y-4">
            <StepCard num="1" title="Sincronizar Repositorio Maestro">
               <p className="text-slate-400 mb-6">Obtén el núcleo estructural de CUBERBOX utilizando la ruta oficial corregida.</p>
               <CodeBlock 
                  title="Source Checkout"
                  icon={GitBranch}
                  code={`git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox\ncd /opt/cuberbox`}
               />
            </StepCard>

            <StepCard num="2" title="Compilar Backend (Reckoning Bridge)">
               <p className="text-slate-400 mb-6">Configura el entorno para usar el orquestador Go con el bridge de eventos v4.9.0.</p>
               <CodeBlock 
                  title="Go Reckoning Build"
                  icon={Code}
                  code={`cd /opt/cuberbox/backend\nexport GOPROXY=https://proxy.golang.org,direct\ngo mod init github.com/copantl/cuberbox-pro/backend\ngo get github.com/fiorix/go-eventsocket/eventsocket\ngo mod tidy\ngo build -o cuberbox-engine main.go\nsudo mv cuberbox-engine /usr/local/bin/`}
               />
            </StepCard>

            <StepCard num="3" title="Activar Stack SIP (GPG Injected)">
               <p className="text-slate-400 mb-6">Instala FreeSwitch usando el nuevo motor de inyección de firmas v4.9.0.</p>
               <CodeBlock 
                  title="SIP Plane Stability"
                  icon={Phone}
                  code={`# El instalador v4.9.0 maneja esto automáticamente inyectando la llave en /usr/share/keyrings/\nsudo apt-get update && sudo apt-get install -y freeswitch-all`}
               />
            </StepCard>
          </div>
        )}

        {activeTab === 'CLUSTER' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="p-12 glass rounded-[64px] border border-slate-800 space-y-8">
                <div className="p-4 bg-emerald-600/10 rounded-3xl text-emerald-400 border border-emerald-500/20 w-fit shadow-lg">
                   <Layers size={32} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Esquema SQL</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                   Optimizado para PostgreSQL 16 con soporte UUID v4 nativo.
                </p>
                <CodeBlock 
                  title="Database Injection"
                  icon={Database}
                  code={`sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql`}
                />
             </div>
             <div className="p-12 glass rounded-[64px] border border-slate-800 space-y-8">
                <div className="p-4 bg-blue-600/10 rounded-3xl text-blue-400 border border-blue-500/20 w-fit shadow-lg">
                   <Monitor size={32} />
                </div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">UI Dist</h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                   Sirve el frontend compilado mediante Nginx para máximo rendimiento.
                </p>
                <CodeBlock 
                  title="Nginx Config"
                  icon={Globe}
                  code={`sudo cp /opt/cuberbox/setup/nginx.conf /etc/nginx/sites-available/cuberbox\nsudo systemctl restart nginx`}
                />
             </div>
          </div>
        )}

        {activeTab === 'POST_INSTALL' && (
          <div className="max-w-4xl mx-auto space-y-12">
             <div className="p-12 glass rounded-[64px] border border-blue-500/20 bg-blue-600/5 text-center space-y-8">
                <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl">
                   <ShieldCheck size={40} />
                </div>
                <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Configuración Finalizada</h3>
                <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
                   El clúster Build 4.9.0 está activo. Abre el asistente visual para finalizar el registro de tu API KEY y SIP Trunks.
                </p>
                <button 
                  onClick={() => navigate('/setup-wizard')}
                  className="bg-white text-slate-900 px-14 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-100 transition-all active:scale-95"
                >
                   Ir al Asistente Visual
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;