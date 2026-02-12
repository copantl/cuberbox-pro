
import React, { useState } from 'react';
import { 
  Copy, Terminal, Server, Database, Phone, Code, ShieldCheck, Shield,
  ChevronRight, Laptop, Cpu, Settings, Globe, Download, CheckCircle2,
  AlertTriangle, FileCode, SquareTerminal, Lock, HardDrive, Zap,
  Layers, BarChart3, Activity, Network, Share2, GitMerge, Bot,
  // Fix: added missing icons
  Box, Smartphone
} from 'lucide-react';

const Instructions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'CLUSTER' | 'NODES' | 'AI_BRIDGE' | 'POST_INSTALL'>('CLUSTER');

  const CodeBlock = ({ title, code, icon: Icon }: any) => {
    const copyToClipboard = () => {
      navigator.clipboard.writeText(code);
      alert("Snippet copiado al portapapeles de la terminal.");
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
            <span>Copiar Snippet</span>
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
          <Network size={18} className="text-blue-400" />
          <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">Cluster Ops & Deploy</span>
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter uppercase leading-none">CUBERBOX Pro Infrastructure</h1>
        <p className="text-slate-400 text-lg max-w-3xl mx-auto font-medium mt-4">
          Guía maestra para el despliegue de alta disponibilidad (HA) del motor neuronal y clúster SIP en entornos Linux (Debian 12/13).
        </p>
      </div>

      {/* Tabs de Navegación Técnica */}
      <div className="flex bg-slate-900 border-2 border-slate-800 p-2 rounded-[32px] mb-16 shadow-2xl max-w-3xl mx-auto">
        {[
          { id: 'CLUSTER', label: 'Estructura Clúster', icon: Layers },
          { id: 'NODES', label: 'Nodos FreeSwitch', icon: Phone },
          { id: 'AI_BRIDGE', label: 'Go Neural Bridge', icon: Bot },
          { id: 'POST_INSTALL', label: 'Hardening & SSL', icon: ShieldCheck },
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
               <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-400 pointer-events-none">
                  <Network size={300} />
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                  <Database size={32} className="mr-4 text-blue-400" /> Control Plane (Capa de Datos)
               </h2>
               <p className="text-slate-400 mb-10 max-w-2xl text-lg font-medium leading-relaxed">
                  El Control Plane aloja el cerebro de CUBERBOX Pro. Requiere PostgreSQL 16 con redundancia activa y una instancia de Go para el orquestador central.
               </p>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <StepCard num="1" title="Instalar DB Master">
                     <CodeBlock 
                        title="PostgreSQL 16 Setup"
                        icon={Database}
                        code={`# Instalación del repositorio PGDG
curl -fsSL https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor -o /etc/apt/trusted.gpg.d/postgresql.gpg
echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update && apt install -y postgresql-16

# Configuración de red del clúster
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
echo "host all all 10.0.0.0/24 md5" >> /etc/postgresql/16/main/pg_hba.conf
systemctl restart postgresql`}
                     />
                  </StepCard>
                  <StepCard num="2" title="Bootstrap de Esquema">
                     <CodeBlock 
                        title="Neural Schema V4.0 Injection"
                        icon={FileCode}
                        code={`# Crear usuario administrador del clúster
sudo -u postgres psql -c "CREATE USER cuber_master WITH PASSWORD 'Master_SIP_2025_CB';"
sudo -u postgres psql -c "CREATE DATABASE cuberbox_pro OWNER cuber_master;"

# Inyectar tablas de particionamiento forense
sudo -u postgres psql cuberbox_pro < /opt/cuberbox/setup/schema.sql`}
                     />
                  </StepCard>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'NODES' && (
          <div className="space-y-8">
            <StepCard num="1" title="Media Plane (FreeSwitch 1.10.x)">
               <p className="text-slate-400 mb-8 text-lg font-medium leading-relaxed max-w-3xl">
                  Cada nodo FreeSwitch actúa como un esclavo del orquestador de Go. Recomendamos al menos 2 nodos para HA (Alta Disponibilidad).
               </p>
               <CodeBlock 
                  title="Instalación de Nodo SIP"
                  icon={Phone}
                  code={`# Repositorio oficial de SignalWire
apt install -y gnupg2 wget lsb-release
wget -O - https://files.freeswitch.org/repo/deb/debian-release/fs18-release.asc | apt-key add -
echo "deb http://files.freeswitch.org/repo/deb/debian-release/ $(lsb_release -sc) main" > /etc/apt/sources.list.d/freeswitch.list

apt update && apt install -y freeswitch-all \\
freeswitch-mod-rtc freeswitch-mod-v8 freeswitch-mod-sofia \\
freeswitch-mod-tts-commandline freeswitch-mod-lua`}
               />
            </StepCard>

            <StepCard num="2" title="Telemetría ESL & Lua Hooks">
               <p className="text-slate-400 mb-8 font-medium">
                  Configura el canal Event Socket Layer (ESL) para que CUBERBOX pueda controlar las llamadas en tiempo real.
               </p>
               <CodeBlock 
                  title="Deploy Routing Hooks"
                  icon={GitMerge}
                  code={`# Copiar scripts de control al nodo
cp /opt/cuberbox/setup/cuberbox_router.lua /usr/share/freeswitch/scripts/
chown freeswitch:freeswitch /usr/share/freeswitch/scripts/cuberbox_router.lua

# Apertura de ESL para el orquestador
sed -i "s/::1/0.0.0.0/g" /etc/freeswitch/autoload_configs/event_socket.conf.xml
fs_cli -x "reloadxml"`}
               />
            </StepCard>
          </div>
        )}

        {activeTab === 'AI_BRIDGE' && (
          <div className="space-y-12">
            <div className="glass p-12 rounded-[64px] border border-purple-500/20 bg-purple-600/5 mb-16 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 text-purple-400 pointer-events-none">
                  <Bot size={300} />
               </div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tight flex items-center mb-8">
                  <Zap size={32} className="mr-4 text-purple-400" /> Neural Go Orquestrator
               </h2>
               <p className="text-slate-400 mb-10 max-w-2xl text-lg font-medium leading-relaxed">
                  Este binario conecta los eventos SIP con el motor Gemini Pro de Google. Debe correr en modo daemon.
               </p>

               <StepCard num="1" title="Compilación del Engine">
                  <CodeBlock 
                    title="Build Process"
                    icon={Terminal}
                    code={`cd /opt/cuberbox/backend
go mod download
go build -o /usr/local/bin/cuberbox-engine main.go

# Verificar versión neuronal
cuberbox-engine --version`}
                  />
               </StepCard>

               <StepCard num="2" title="Persistencia SystemD">
                  <CodeBlock 
                    title="/etc/systemd/system/cb-engine.service"
                    icon={Settings}
                    code={`[Unit]
Description=Cuberbox Neural Bridge
After=network.target postgresql.service

[Service]
Type=simple
User=root
EnvironmentFile=/etc/cuberbox/engine.env
ExecStart=/usr/local/bin/cuberbox-engine
Restart=always

[Install]
WantedBy=multi-user.target`}
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
                      <Lock size={24} className="mr-4 text-rose-500" /> L7 Firewall Policy
                   </h3>
                   <CodeBlock 
                    title="UFW Security Setup"
                    icon={Shield}
                    code={`# Tráfico Web
ufw allow 80/tcp
ufw allow 443/tcp

# SIP & WebRTC Media Range
ufw allow 5060:5061/udp
ufw allow 16384:32768/udp

# ESL Protection (Whitelist only)
ufw allow from 10.0.0.100 to any port 8021 proto tcp`}
                   />
                </div>
                <div className="p-10 glass rounded-[48px] border border-slate-800 space-y-6">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                      <Globe size={24} className="mr-4 text-blue-500" /> WebRTC Certs
                   </h3>
                   <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      El softphone requiere WSS (WebSockets seguros) y certificados TLS 1.3 vigentes.
                   </p>
                   <CodeBlock 
                    title="Certbot SSL Setup"
                    icon={ShieldCheck}
                    code={`apt install -y certbot python3-certbot-nginx
certbot --nginx -d app.cuberbox.pro -d sip.cuberbox.pro

# Symlink para FreeSwitch Media
ln -s /etc/letsencrypt/live/app.cuberbox.pro/fullchain.pem /etc/freeswitch/tls/wss.pem
ln -s /etc/letsencrypt/live/app.cuberbox.pro/privkey.pem /etc/freeswitch/tls/wss.pem`}
                   />
                </div>
             </div>

             <div className="mt-16 p-12 glass rounded-[64px] border border-emerald-500/20 bg-emerald-500/5 flex items-center space-x-10">
               <div className="w-24 h-24 rounded-[36px] bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner shrink-0">
                 <CheckCircle2 size={48} />
               </div>
               <div>
                 <h3 className="text-3xl font-black text-white">Integridad del Clúster Confirmada</h3>
                 <p className="text-slate-400 mt-2 max-w-3xl text-lg font-medium leading-relaxed">
                   Ejecuta <code className="text-emerald-400 font-mono">cuberbox-engine --test-ha</code> para validar que el orquestador detecta los nodos FreeSwitch y el clúster de base de datos está aceptando conexiones cifradas.
                 </p>
               </div>
             </div>
          </div>
        )}
      </div>

      <div className="mt-20 flex items-center justify-between p-10 glass rounded-[48px] border border-rose-500/20 bg-rose-500/5">
        <div className="flex items-center space-x-6">
          <AlertTriangle className="text-rose-500 animate-pulse" size={40} />
          <p className="text-sm text-rose-200/60 font-black uppercase tracking-widest leading-relaxed">
            ATENCIÓN CRÍTICA: Nunca expongas el puerto ESL (8021) a internet público. <br/>
            Cualquier compromiso permite la ejecución remota de comandos en el núcleo de telefonía.
          </p>
        </div>
        <button className="bg-slate-950 text-rose-500 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-500/20 hover:bg-rose-600 hover:text-white transition-all shadow-xl">Auditoría de Seguridad L7</button>
      </div>
    </div>
  );
};

export default Instructions;
