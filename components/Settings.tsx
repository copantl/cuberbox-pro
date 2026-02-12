import React, { useState } from 'react';
import { 
  Save, Server, Database, Key, ShieldCheck, Volume2, Clock, Bell, Globe, 
  MessageSquare, Zap, Target, Palette, Sun, Moon, Droplets, Box, 
  Facebook, Instagram, Music, Smartphone, Lock, RefreshCw, Eye, 
  EyeOff, User as UserIcon, Trees, Sunset, Zap as ZapIcon, Layout, 
  Link2, ExternalLink, CheckCircle, Copy, AlertTriangle, Shield,
  Code, Info, ChevronRight, Fingerprint, Sparkles, Network,
  Webhook, Terminal, Plus, Trash2, Cpu, Activity, ShieldAlert,
  Mic2, Headphones, ListFilter, Sliders, Settings as SettingsIcon,
  ToggleRight, Power
} from 'lucide-react';
// Fix: Removed SSOConfig which is not exported from types.ts
import { ThemeType, User, UserRole } from '../types';
import { useToast } from '../ToastContext';

interface SettingsProps {
  user: User;
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, currentTheme, onThemeChange }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'SYSTEM' | 'VOICE' | 'SECURITY' | 'UI' | 'SSO' | 'API'>('UI');
  const [showSecret, setShowSecret] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // States para Seguridad
  const [ipWhitelist, setIpWhitelist] = useState(['192.168.1.1', '10.0.0.42']);
  const [newIp, setNewIp] = useState('');

  // States para FS Core
  const [fsConfig, setFsConfig] = useState({
    eslHost: '127.0.0.1',
    eslPort: '8021',
    maxChannels: '500',
    logLevel: 'NOTICE'
  });

  // States para Audio
  const [audioConfig, setAudioConfig] = useState({
    defaultCodec: 'Opus',
    jitterBuffer: '40',
    vadSensitivity: 'Medium',
    recordingFormat: 'WAV (High Quality)'
  });

  const isAdmin = user.role === UserRole.ADMIN;

  const handleSaveAll = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
    toast('Configuración de infraestructura sincronizada.', 'success', 'System Core');
  };

  const addIp = () => {
    if (newIp && !ipWhitelist.includes(newIp)) {
      setIpWhitelist([...ipWhitelist, newIp]);
      setNewIp('');
      toast('IP añadida a la capa de confianza.', 'info');
    }
  };

  const ThemeCard = ({ id, name, icon: Icon, color, desc, previewColors }: { 
    id: ThemeType, 
    name: string, 
    icon: any, 
    color: string, 
    desc: string,
    previewColors: string[]
  }) => (
    <button 
      onClick={() => onThemeChange(id)}
      className={`relative p-8 rounded-[40px] border-2 text-left transition-all group overflow-hidden ${
        currentTheme === id 
          ? 'bg-blue-600/10 border-blue-500 shadow-2xl scale-[1.02]' 
          : 'glass border-slate-800 hover:bg-slate-800/50 hover:border-slate-600'
      }`}
    >
      {currentTheme === id && (
        <div className="absolute top-4 right-4 bg-blue-500 p-1.5 rounded-full text-white shadow-lg animate-in zoom-in">
          <CheckCircle size={14} />
        </div>
      )}
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${color}`}>
        <Icon size={28} />
      </div>
      <h4 className="font-black text-sm uppercase tracking-widest text-white">{name}</h4>
      <p className="text-[10px] text-slate-500 mt-2 font-bold leading-relaxed mb-6 uppercase tracking-wider">{desc}</p>
      
      <div className="flex space-x-1.5 pt-4 border-t border-slate-800/50">
        {previewColors.map((c, i) => (
          <div key={i} className={`w-3 h-3 rounded-full shadow-inner`} style={{ backgroundColor: c }}></div>
        ))}
      </div>
    </button>
  );

  return (
    <div className="max-w-6xl space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter flex items-center uppercase">
            <SettingsIcon className="mr-4 text-blue-400" size={32} />
            Configuración de Sistema
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Ajustes globales de infraestructura, seguridad y atmósfera visual.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center space-x-3"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          <span>{isSaving ? 'Sincronizando...' : 'Guardar Cambios Globales'}</span>
        </button>
      </div>

      <div className="flex space-x-1 bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[24px] w-fit shadow-inner overflow-x-auto scrollbar-hide">
        {[
          { id: 'UI', icon: Palette, label: 'Visual Engine', roles: [UserRole.ADMIN, UserRole.AGENT, UserRole.MANAGER] },
          { id: 'SECURITY', icon: Lock, label: 'Ciberseguridad', roles: [UserRole.ADMIN, UserRole.MANAGER] },
          { id: 'SYSTEM', icon: Server, label: 'FS Core', roles: [UserRole.ADMIN] },
          { id: 'VOICE', icon: Volume2, label: 'Audio Engine', roles: [UserRole.ADMIN] },
          { id: 'SSO', icon: Link2, label: 'Identity Bridge', roles: [UserRole.ADMIN] },
          { id: 'API', icon: Network, label: 'Integraciones', roles: [UserRole.ADMIN] },
        ].filter(tab => tab.roles.includes(user.role)).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-3 px-8 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'UI' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ThemeCard 
                  id="midnight" 
                  name="Midnight Blue" 
                  icon={Moon} 
                  color="bg-slate-950 text-blue-400 border-blue-500/20" 
                  desc="Aumenta el contraste y reduce la fatiga visual nocturna."
                  previewColors={['#020617', '#3b82f6', '#1e3a8a']}
                />
                <ThemeCard 
                  id="obsidian" 
                  name="Obsidian OLED" 
                  icon={Box} 
                  color="bg-black text-slate-200 border-white/10" 
                  desc="Negros puros diseñados para máxima concentración."
                  previewColors={['#000000', '#525252', '#ffffff']}
                />
                <ThemeCard 
                  id="minimal" 
                  name="Arctic White" 
                  icon={Sun} 
                  color="bg-slate-100 text-slate-900 border-slate-300" 
                  desc="Entorno claro y profesional para turnos diurnos."
                  previewColors={['#f1f5f9', '#0f172a', '#334155']}
                />
                <ThemeCard 
                  id="cyber" 
                  name="Neon Cyber" 
                  icon={ZapIcon} 
                  color="bg-zinc-950 text-fuchsia-500 border-fuchsia-500/20" 
                  desc="Interfaz de alto impacto con acentos futuristas."
                  previewColors={['#09090b', '#d946ef', '#06b6d4']}
                />
             </div>
          </div>
        )}

        {activeTab === 'SECURITY' && (
          <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass p-10 rounded-[56px] border border-slate-700/50 space-y-8">
                  <div className="flex items-center space-x-4">
                     <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500 border border-amber-500/20">
                        <ShieldAlert size={24} />
                     </div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">Políticas de Acceso</h3>
                  </div>
                  <div className="space-y-6">
                     <div className="flex items-center justify-between p-5 bg-slate-950/60 border border-slate-800 rounded-3xl group">
                        <div>
                           <p className="text-xs font-black text-white uppercase">Doble Factor Obligatorio (MFA)</p>
                           <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Requerir token para roles Admin/Manager</p>
                        </div>
                        <button className="w-12 h-6 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></button>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiración de Sesión (minutos)</label>
                        <input type="number" defaultValue="60" className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white font-mono" />
                     </div>
                  </div>
               </div>

               <div className="glass p-10 rounded-[56px] border border-slate-700/50 space-y-8">
                  <div className="flex items-center space-x-4">
                     <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20">
                        <Globe size={24} />
                     </div>
                     <h3 className="text-xl font-black text-white uppercase tracking-tight">IP Whitelisting (L7 Firewall)</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex space-x-3">
                        <input 
                          type="text" 
                          placeholder="Añadir dirección IP..." 
                          value={newIp}
                          onChange={e => setNewIp(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-emerald-400 font-mono" 
                        />
                        <button onClick={addIp} className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all"><Plus size={20} /></button>
                     </div>
                     <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 scrollbar-hide">
                        {ipWhitelist.map(ip => (
                          <div key={ip} className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                             <span className="text-xs font-mono text-slate-300">{ip}</span>
                             <button onClick={() => setIpWhitelist(ipWhitelist.filter(x => x !== ip))} className="text-slate-600 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'SYSTEM' && (
           <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
              <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl space-y-12">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                       <div className="p-4 bg-emerald-600/10 rounded-3xl text-emerald-400 border border-emerald-500/20">
                          <Cpu size={32} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight">FreeSwitch Core Engine</h3>
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Parámetros Críticos de la Capa SIP</p>
                    </div>
                    </div>
                    <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Engine Nominal</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Event Socket Host (ESL)</label>
                       <input type="text" value={fsConfig.eslHost} onChange={e => setFsConfig({...fsConfig, eslHost: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white font-mono" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ESL Port</label>
                       <input type="number" value={fsConfig.eslPort} onChange={e => setFsConfig({...fsConfig, eslPort: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white font-mono" />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Max Concurrent Channels</label>
                       <input type="number" value={fsConfig.maxChannels} onChange={e => setFsConfig({...fsConfig, maxChannels: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-blue-400 font-black" />
                    </div>
                 </div>

                 <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 space-y-6">
                    <div className="flex items-center space-x-3 mb-2">
                       <Activity size={18} className="text-blue-500" />
                       <h4 className="text-xs font-black text-white uppercase tracking-widest">Optimización de Carga</h4>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-slate-950/80 border border-slate-800 rounded-3xl">
                       <div>
                          <p className="text-xs font-black text-white uppercase">Protección Auto-Throttle</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Limitar llamadas nuevas si el CPU supera el 85%</p>
                       </div>
                       <button className="w-12 h-6 bg-emerald-600 rounded-full relative shadow-lg shadow-emerald-600/20"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'VOICE' && (
           <div className="animate-in slide-in-from-right-4 duration-500 space-y-8">
              <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl space-y-10">
                 <div className="flex items-center space-x-6">
                    <div className="p-4 bg-blue-600/10 rounded-3xl text-blue-400 border border-blue-500/20">
                       <Mic2 size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white uppercase tracking-tight">Audio Engine Control</h3>
                       <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Procesamiento de Voz y Codecs</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Codec Master Priority</label>
                       <select value={audioConfig.defaultCodec} onChange={e => setAudioConfig({...audioConfig, defaultCodec: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white font-bold outline-none appearance-none">
                          <option>Opus (High-Def)</option>
                          <option>G711 PCMU (Standard)</option>
                          <option>G722 (Wideband)</option>
                       </select>
                    </div>
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Static Jitter Buffer (ms)</label>
                       <div className="flex items-center space-x-4">
                          <input type="range" min="10" max="200" step="10" value={audioConfig.jitterBuffer} onChange={e => setAudioConfig({...audioConfig, jitterBuffer: e.target.value})} className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                          <span className="text-xs font-mono font-black text-blue-400 w-12">{audioConfig.jitterBuffer}ms</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 space-y-6">
                       <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                          <Headphones size={18} className="mr-3 text-emerald-400" /> Voice Activity Detection (VAD)
                       </h4>
                       <div className="grid grid-cols-3 gap-3">
                          {['Low', 'Medium', 'High'].map(v => (
                             <button key={v} onClick={() => setAudioConfig({...audioConfig, vadSensitivity: v})} className={`py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${audioConfig.vadSensitivity === v ? 'bg-blue-600 border-blue-500 text-white shadow-xl' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>{v}</button>
                          ))}
                       </div>
                    </div>

                    <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 space-y-6">
                       <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center">
                          <Save size={18} className="mr-3 text-blue-400" /> Archivo de Grabación Master
                       </h4>
                       <select value={audioConfig.recordingFormat} onChange={e => setAudioConfig({...audioConfig, recordingFormat: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-slate-300 font-bold outline-none">
                          <option>WAV (High Quality)</option>
                          <option>MP3 (Standard Compression)</option>
                          <option>OGG Vorbis (Efficient)</option>
                       </select>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'SSO' && isAdmin && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="glass p-10 rounded-[48px] border border-slate-700/50 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center space-x-8 relative z-10">
                   <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-2xl border border-blue-400/30">
                      <Fingerprint size={44} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">SSO Gateway (Keycloak / OIDC)</h3>
                      <p className="text-sm text-slate-400 mt-1 max-w-md">Integra CUBERBOX con tu proveedor de identidad corporativo.</p>
                   </div>
                </div>
                <button 
                  className="bg-white text-slate-900 px-8 py-3.5 rounded-[18px] font-black text-[11px] uppercase tracking-widest active:scale-95"
                >
                  Test Connection
                </button>
             </div>
          </div>
        )}

        {activeTab === 'API' && isAdmin && (
           <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="glass p-10 rounded-[48px] border border-slate-700/50 shadow-2xl relative overflow-hidden">
                 <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center space-x-6">
                       <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                          <Webhook size={32} />
                       </div>
                       <div>
                          <h3 className="text-2xl font-black text-white uppercase tracking-tight">CUBERBOX API Gateway</h3>
                          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Endpoints Globales & Webhooks</p>
                       </div>
                    </div>
                    <button className="bg-blue-600 text-white px-8 py-3.5 rounded-[18px] font-black text-[11px] uppercase tracking-widest active:scale-95 shadow-xl">Generar Nueva API Key</button>
                 </div>

                 <div className="space-y-6">
                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-[32px] flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                       <div className="flex items-center space-x-4">
                          <Terminal className="text-slate-600 group-hover:text-emerald-500 transition-colors" size={20} />
                          <div>
                             <p className="text-xs font-black text-white uppercase tracking-widest">Master API Key</p>
                             <p className="text-[10px] font-mono text-slate-500 mt-1">cbx_live_pk_****************************</p>
                          </div>
                       </div>
                       <div className="flex items-center space-x-2">
                          <button className="p-2 text-slate-500 hover:text-white transition-colors"><Copy size={16} /></button>
                          <button className="p-2 text-rose-500 hover:text-rose-400 transition-colors"><Trash2 size={16} /></button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Settings;