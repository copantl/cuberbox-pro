import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Copy, Terminal, Server, Database, Phone, Code, ShieldCheck, 
  Zap, Github, TerminalSquare, AlertCircle, Play, ChevronRight,
  Layers, Monitor, Globe, ChevronLeft,
  // Added missing CheckCircle2 import
  CheckCircle2
} from 'lucide-react';

const Instructions: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ONE_LINER' | 'MANUAL' | 'POST_INSTALL'>('ONE_LINER');

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

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 pb-40 animate-in fade-in duration-700">
      <div className="text-center mb-20 space-y-4">
        <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-full mb-6">
          <Zap size={18} className="text-blue-400 animate-pulse" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Phoenix Release v5.0.0</span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CUBERBOX Deployment</h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto font-medium mt-4">
          La nueva arquitectura Phoenix elimina errores de autenticación externa e inyecta seguridad directamente en el kernel de Debian 12.
        </p>
      </div>

      <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[32px] mb-16 shadow-2xl max-w-2xl mx-auto">
        {[
          { id: 'ONE_LINER', label: 'Fast Setup', icon: Zap },
          { id: 'MANUAL', label: 'Manual Steps', icon: Terminal },
          { id: 'POST_INSTALL', label: 'Finalize', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        {activeTab === 'ONE_LINER' && (
          <div className="glass p-12 rounded-[64px] border border-blue-500/20 bg-blue-600/5 mb-16 relative overflow-hidden">
             <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                <ShieldCheck size={32} className="mr-4 text-emerald-400" /> Protocolo de Inyección Phoenix
             </h2>
             <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-2xl font-medium">
                El nuevo instalador 5.0.0 utiliza <strong>GPG Binary Streams</strong>. No requiere descargar llaves de repositorios externos, eliminando errores 401 de SignalWire para siempre.
             </p>
             <CodeBlock 
                title="Master Phoenix One-Liner"
                icon={TerminalSquare}
                code={`wget -O install.sh https://raw.githubusercontent.com/copantl/cuberbox-pro/main/setup/install.sh && chmod +x install.sh && sudo ./install.sh`}
             />
             <div className="p-8 bg-slate-900 border border-slate-800 rounded-[36px] flex items-start space-x-6">
                <AlertCircle size={24} className="text-emerald-500 mt-1 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Entorno Garantizado</h4>
                  <p className="text-xs text-slate-500 leading-relaxed uppercase tracking-wider font-bold">
                     Diseñado para Debian 12 (Bookworm). Realiza una limpieza total de instalaciones previas y re-escribe los keyrings del sistema para un arranque limpio.
                  </p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'MANUAL' && (
          <div className="space-y-8">
             <div className="p-10 glass rounded-[48px] border border-slate-800">
                <h3 className="text-2xl font-black text-white uppercase mb-6 flex items-center"><Terminal className="mr-4 text-blue-500" /> Sincronización Manual</h3>
                <p className="text-slate-400 mb-8 font-medium">Si prefieres el control total, sigue estos pasos secuenciales en tu terminal SSH.</p>
                <div className="space-y-4">
                   <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Paso 1: Clonar Estructura</p>
                      <code className="text-emerald-400 text-xs">git clone https://github.com/copantl/cuberbox-pro.git /opt/cuberbox</code>
                   </div>
                   <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Paso 2: Inyectar Permisos</p>
                      <code className="text-emerald-400 text-xs">chmod +x /opt/cuberbox/setup/install.sh</code>
                   </div>
                   <div className="p-6 bg-slate-950 rounded-3xl border border-slate-800">
                      <p className="text-[10px] font-black text-blue-500 uppercase mb-2">Paso 3: Desplegar Clúster</p>
                      <code className="text-emerald-400 text-xs">sudo /opt/cuberbox/setup/install.sh</code>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'POST_INSTALL' && (
           <div className="max-w-4xl mx-auto text-center space-y-12">
              <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white mx-auto shadow-2xl animate-pulse">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Nodo Inicializado</h2>
                <p className="text-slate-400 text-lg mt-4 font-medium">
                  CUBERBOX Phoenix v5.0.0 está ahora gobernando los hilos de tu servidor.
                </p>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="bg-white text-slate-900 px-16 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-100 transition-all active:scale-95 flex items-center justify-center mx-auto space-x-4"
              >
                <span>Acceder a la Consola</span>
                <Play size={20} fill="currentColor" />
              </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;