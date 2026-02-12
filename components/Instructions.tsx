
import React, { useState } from 'react';
import { 
  Copy, Terminal, Server, Database, Phone, Code, ShieldCheck, Shield,
  ChevronRight, Laptop, Cpu, Settings, Globe, Download, CheckCircle2,
  AlertTriangle, FileCode, SquareTerminal, Lock, HardDrive, Zap,
  Layers, BarChart3, Activity, Network, Share2, GitMerge, Bot,
  Box, Smartphone, Github, GitBranch
} from 'lucide-react';

const Instructions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLUSTER' | 'NODES' | 'AI_BRIDGE' | 'POST_INSTALL'>('CLUSTER');

  const CodeBlock = ({ title, code, icon: Icon }: any) => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(code);
      alert("Snippet copiado.");
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
            <span>Copiar</span>
          </button>
        </div>
        <pre className="p-8 text-[13px] text-blue-100/90 overflow-x-auto font-mono leading-relaxed bg-black/20 scrollbar-hide">
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
      <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 pb-40">
      <div className="text-center mb-20 space-y-4">
        <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 px-6 py-2.5 rounded-full mb-6">
          <Github size={18} className="text-blue-400" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Official Repositories Linked</span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CUBERBOX Pro Operations</h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto font-medium mt-4">
          Guía técnica para el aprovisionamiento masivo de nodos y orquestación Gemini.
        </p>
      </div>

      <div className="flex bg-slate-900 border-2 border-slate-800 p-2 rounded-[32px] mb-16 shadow-2xl max-w-3xl mx-auto">
        {[
          { id: 'CLUSTER', label: 'Infra Core', icon: Layers },
          { id: 'NODES', label: 'Media Plane', icon: Phone },
          { id: 'AI_BRIDGE', label: 'Neural Go', icon: Bot },
          { id: 'POST_INSTALL', label: 'Security SSL', icon: ShieldCheck },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center space-x-3 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={16} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
        {activeTab === 'CLUSTER' && (
          <div className="space-y-12">
            <div className="glass p-12 rounded-[64px] border border-blue-500/20 bg-blue-600/5 mb-16 relative overflow-hidden">
               <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                  <Database size={32} className="mr-4 text-blue-400" /> Control Plane (Data & Setup)
               </h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StepCard num="1" title="Clonar Setup Repositor">
                     <CodeBlock 
                        title="Repository Checkout"
                        icon={GitBranch}
                        code={`git clone https://github.com/cuberbox/cluster-setup.git
cd cluster-setup/scripts

# Dar permisos al instalador de Debian 12/13
chmod +x full-stack-install.sh`}
                     />
                  </StepCard>
                  <StepCard num="2" title="Bootstrap de Esquema V4">
                     <CodeBlock 
                        title="Database Schema Injection"
                        icon={FileCode}
                        code={`# Crear usuario administrador root
sudo -u postgres psql -c "CREATE USER cuber_master WITH PASSWORD 'Master_SIP_2025_CB';"

# Inyectar esquema oficial
sudo -u postgres psql < /opt/cuberbox/setup/schema.sql`}
                     />
                  </StepCard>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'NODES' && (
          <div className="space-y-8">
            <StepCard num="1" title="FreeSwitch Node provision">
               <CodeBlock 
                  title="Node Installation"
                  icon={Phone}
                  code={`# Instalar repositorio oficial de SignalWire
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | apt-key add -
echo "deb http://files.freeswitch.org/repo/deb/debian-release/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/freeswitch.list

apt update && apt install -y freeswitch-all freeswitch-mod-lua`}
               />
            </StepCard>

            <StepCard num="2" title="Repositorio de Lógica SIP">
               <p className="text-slate-400 mb-8 font-medium italic">Sincronice sus dialplans personalizados desde el repositorio de core.</p>
               <CodeBlock 
                  title="Dialplan Sync"
                  icon={GitMerge}
                  code={`git clone https://github.com/cuberbox/pro-core.git
cp pro-core/setup/dialplan.xml /etc/freeswitch/dialplan/default/cuberbox.xml
fs_cli -x "reloadxml"`}
               />
            </StepCard>
          </div>
        )}

        {activeTab === 'AI_BRIDGE' && (
          <div className="space-y-12">
            <div className="glass p-12 rounded-[64px] border border-purple-500/20 bg-purple-600/5 mb-16 relative overflow-hidden">
               <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                  <Zap size={32} className="mr-4 text-purple-400" /> Go Neural Bridge
               </h2>
               <StepCard num="1" title="Build desde Código Fuente">
                  <CodeBlock 
                    title="Source Checkout"
                    icon={Github}
                    code={`git clone https://github.com/cuberbox/neural-bridge.git
cd neural-bridge
go mod tidy
go build -o /usr/local/bin/cuberbox-engine main.go`}
                  />
               </StepCard>
            </div>
          </div>
        )}

        {activeTab === 'POST_INSTALL' && (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 glass rounded-[48px] border border-slate-800 space-y-6">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                      <Lock size={24} className="mr-4 text-rose-500" /> Firewall Policy
                   </h3>
                   <CodeBlock 
                    title="UFW Hardening"
                    icon={Shield}
                    code={`# Permitir SIP & WebRTC
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp
ufw allow 7443/tcp # WSS Softphone`}
                   />
                </div>
                <div className="p-10 glass rounded-[48px] border border-slate-800 space-y-6">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                      <Globe size={24} className="mr-4 text-blue-500" /> WebRTC WSS Certs
                   </h3>
                   <CodeBlock 
                    title="Certbot SSL"
                    icon={ShieldCheck}
                    code={`certbot --nginx -d sip.cuberbox-pro.net
ln -s /etc/letsencrypt/live/sip.cuberbox-pro.net/fullchain.pem /etc/freeswitch/tls/wss.pem`}
                   />
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Instructions;
