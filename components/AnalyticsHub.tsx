
import React, { useState } from 'react';
import { 
  BarChart3, Database, Globe, Key, ShieldCheck, ExternalLink, 
  RefreshCw, Plus, Trash2, Settings, CheckCircle, AlertCircle, 
  Copy, Layers, Zap, Info, ChevronRight, Share2, Terminal,
  Lock, Globe2, Code2, Play, Table, Eye, FileJson, ShieldAlert
} from 'lucide-react';

const AnalyticsHub: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'CONFIG' | 'EMBED' | 'LOGS'>('CONFIG');
  const [testStatus, setTestStatus] = useState<'IDLE' | 'TESTING' | 'SUCCESS' | 'ERROR'>('IDLE');
  
  const [embedConfig, setEmbedConfig] = useState({
    dashboardId: '7482-af23-11ed',
    supersetDomain: 'https://bi.cuberbox-infra.net',
    allowedDomains: 'app.cuberbox.pro, localhost:3000',
    guestTokenExpiry: '60'
  });

  const biTools = [
    { id: '1', name: 'Apache Superset Pro', status: 'CONNECTED', lastSync: '2m ago', type: 'DIRECT_SQL', version: 'v4.1.0' },
    { id: '2', name: 'PowerBI Embedded', status: 'STANDBY', lastSync: '1h ago', type: 'API_PUSH', version: 'Cloud' }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Notificación minimalista in-app podría ir aquí
  };

  const runConnectionTest = async () => {
    setTestStatus('TESTING');
    await new Promise(resolve => setTimeout(resolve, 2000));
    setTestStatus('SUCCESS');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <BarChart3 className="mr-4 text-emerald-400" size={36} />
            BI & Analytics Hub
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Sincronización del Data Warehouse neuronal con motores de visualización externos.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="flex bg-slate-900 border-2 border-slate-800 p-1.5 rounded-[24px] shadow-inner">
            {[
              { id: 'CONFIG', label: 'Data Source', icon: Database },
              { id: 'EMBED', label: 'Embedding SDK', icon: Code2 },
              { id: 'LOGS', label: 'Acceso BI', icon: Terminal },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? `bg-blue-600 text-white shadow-xl` : 'text-slate-500 hover:text-slate-300'}`}
              >
                <tab.icon size={14} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          
          {activeTab === 'CONFIG' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                   <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 rounded-[28px] bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                         <Share2 size={32} />
                      </div>
                      <div>
                         <h3 className="text-2xl font-black text-white uppercase tracking-tight">PostgreSQL Bridge</h3>
                         <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Credenciales de Acceso Directo</p>
                      </div>
                   </div>
                   <button 
                    onClick={runConnectionTest}
                    disabled={testStatus === 'TESTING'}
                    className={`px-6 py-2.5 rounded-full border-2 font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                      testStatus === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 
                      testStatus === 'TESTING' ? 'bg-blue-600/10 border-blue-500 text-blue-400 animate-pulse' :
                      'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                   >
                     {testStatus === 'TESTING' ? 'Verificando...' : testStatus === 'SUCCESS' ? 'Vínculo Establecido' : 'Test Connection'}
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-3">Endpoint de Red</h4>
                      <div className="space-y-4">
                         {[
                           { label: 'Host / URI', val: 'db.cuberbox-pro.net', icon: Globe2 },
                           { label: 'Database', val: 'cuberbox_bi_warehouse', icon: Database },
                           { label: 'Port', val: '5432', icon: Settings },
                         ].map((item, i) => (
                           <div key={i} className="p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-2 group hover:border-emerald-500/30 transition-all">
                              <div className="flex justify-between items-center">
                                 <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center">
                                    <item.icon size={12} className="mr-2" /> {item.label}
                                 </span>
                                 <button onClick={() => handleCopy(item.val)} className="text-emerald-500 hover:text-emerald-400 transition-colors"><Copy size={12} /></button>
                              </div>
                              <p className="text-xs font-mono text-white">{item.val}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] border-b border-slate-800 pb-3">Auth & Security</h4>
                      <div className="p-8 bg-slate-900/60 rounded-[40px] border border-slate-800 space-y-6 shadow-inner">
                         <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                               <Lock size={24} />
                            </div>
                            <div>
                               <p className="text-xs font-black text-white uppercase tracking-tight">BI_USER_READ_ONLY</p>
                               <p className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Permisos: SELECT ONLY</p>
                            </div>
                         </div>
                         <div className="relative">
                            <input type="password" value="************************" readOnly className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-slate-400 outline-none" />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">Revelar</button>
                         </div>
                         <div className="flex space-x-2">
                           <button className="flex-1 py-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/20 transition-all">Rotar Claves</button>
                           <button className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 hover:text-blue-400 transition-all"><FileJson size={18} /></button>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="glass p-10 rounded-[56px] border border-slate-800 shadow-xl space-y-8">
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                       <Play size={20} className="mr-3 text-blue-500" /> Validation Lab
                    </h3>
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">SQL Scratchpad</span>
                 </div>
                 <div className="space-y-4">
                    <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden">
                       <div className="px-6 py-3 border-b border-slate-900 bg-slate-900/50 flex justify-between">
                          <span className="text-[10px] font-mono text-emerald-500">query_test_v1.sql</span>
                          <span className="text-[10px] font-black text-slate-700 uppercase">PostgreSQL 16</span>
                       </div>
                       <textarea 
                        className="w-full h-32 bg-transparent p-6 text-xs font-mono text-slate-300 outline-none resize-none"
                        defaultValue={`SELECT campaign_id, count(*) as leads \nFROM leads_performance \nWHERE status = 'SALE' \nGROUP BY 1 LIMIT 5;`}
                       />
                    </div>
                    <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all">Ejecutar Validación de Datos</button>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'EMBED' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl space-y-10">
                  <div className="flex items-start justify-between">
                     <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-[28px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                           <Code2 size={32} />
                        </div>
                        <div>
                           <h3 className="text-2xl font-black text-white uppercase tracking-tight">Superset Embedded SDK</h3>
                           <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Configuración de Dashboards Nativos</p>
                        </div>
                     </div>
                     <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">SDK v0.2.0 Active</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dashboard UUID (Superset)</label>
                        <input 
                          type="text" 
                          value={embedConfig.dashboardId}
                          onChange={e => setEmbedConfig({...embedConfig, dashboardId: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-blue-500 shadow-inner font-mono" 
                        />
                     </div>
                     <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Superset Instance URL</label>
                        <input 
                          type="text" 
                          value={embedConfig.supersetDomain}
                          onChange={e => setEmbedConfig({...embedConfig, supersetDomain: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-xs text-blue-400 outline-none focus:border-blue-500 shadow-inner font-mono" 
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Allowed CORS Domains (Comma separated)</label>
                     <div className="relative">
                        <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                        <input 
                          type="text" 
                          value={embedConfig.allowedDomains}
                          onChange={e => setEmbedConfig({...embedConfig, allowedDomains: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-3xl pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner"
                        />
                     </div>
                  </div>

                  <div className="p-8 bg-blue-600/5 border border-blue-500/20 rounded-[40px] flex items-start space-x-6">
                     <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400">
                        <Zap size={24} />
                     </div>
                     <div className="flex-1">
                        <h5 className="text-xs font-black text-white uppercase tracking-widest mb-1">Generación de Guest Tokens</h5>
                        <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-wider mb-4">
                           Para que el embebido sea seguro, CUBERBOX debe firmar peticiones JWT. Configura la duración de sesión del token.
                        </p>
                        <div className="flex items-center space-x-4">
                           <input type="range" min="15" max="240" step="15" value={embedConfig.guestTokenExpiry} onChange={e => setEmbedConfig({...embedConfig, guestTokenExpiry: e.target.value})} className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                           <span className="text-xs font-mono font-black text-blue-400">{embedConfig.guestTokenExpiry} min</span>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-800 flex justify-end">
                     <button className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95">Sincronizar Config SDK</button>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'LOGS' && (
            <div className="glass p-10 rounded-[56px] border border-slate-800 shadow-2xl animate-in slide-in-from-top-4 duration-500 min-h-[500px] flex flex-col">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                     <Terminal size={20} className="mr-3 text-slate-500" /> Engine Integration Logs
                  </h3>
                  <button className="text-[10px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest">Clear Buffer</button>
               </div>
               <div className="flex-1 bg-slate-950 rounded-[40px] p-8 font-mono text-[11px] space-y-2 overflow-y-auto scrollbar-hide border border-slate-900 shadow-inner">
                  <p className="text-slate-600">[{new Date().toLocaleTimeString()}] INITIALIZING ANALYTICS_HUB_BRIDGE...</p>
                  <p className="text-emerald-400/80">[{new Date().toLocaleTimeString()}] AUTH: Superset_Service_Account authenticated via JWT</p>
                  <p className="text-blue-400/80">[{new Date().toLocaleTimeString()}] QUERY: Incoming SELECT from 172.16.4.12 (id: 742)</p>
                  <p className="text-slate-500">[{new Date().toLocaleTimeString()}] DATA: Exported 12,400 bytes to Apache Superset instance</p>
                  <p className="text-amber-500/80">[{new Date().toLocaleTimeString()}] WARN: Query execution time > 200ms detected on table leads_performance</p>
                  <p className="text-emerald-400/80">[{new Date().toLocaleTimeString()}] HEARTBEAT: External BI tool status UP</p>
               </div>
            </div>
          )}
        </div>

        {/* Health & Sidebar Stats */}
        <div className="lg:col-span-4 space-y-8">
           <div className="glass p-10 rounded-[64px] border border-slate-700/50 shadow-2xl flex flex-col">
              <h3 className="text-xl font-black mb-10 flex items-center tracking-tight text-white uppercase">
                 <ShieldCheck className="mr-4 text-blue-500" size={28} />
                 Estado BI Core
              </h3>
              
              <div className="space-y-6">
                 {biTools.map(tool => (
                    <div key={tool.id} className="p-6 rounded-[32px] bg-slate-900/60 border border-slate-800 space-y-4 group hover:border-blue-500/30 transition-all">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                             <div className={`w-2.5 h-2.5 rounded-full ${tool.status === 'CONNECTED' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-slate-700'}`}></div>
                             <span className="text-xs font-black text-white uppercase tracking-widest">{tool.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">{tool.lastSync}</span>
                       </div>
                       <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-600">
                          <span>Build: {tool.version}</span>
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">{tool.type}</span>
                       </div>
                    </div>
                 ))}

                 <div className="p-8 bg-slate-950/80 rounded-[40px] border border-slate-800 shadow-inner">
                    <div className="flex items-center justify-between mb-6">
                       <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tráfico BI (24h)</h4>
                       <Activity className="text-blue-500" size={14} />
                    </div>
                    <div className="space-y-5">
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-tighter">
                             <span>Query Volume</span>
                             <span className="text-emerald-400">12,402</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                             <div className="h-full bg-emerald-600 shadow-[0_0_10px_#10b981]" style={{ width: '65%' }}></div>
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between text-[11px] font-black text-white uppercase tracking-tighter">
                             <span>API Data Pulls</span>
                             <span className="text-blue-400">4,120</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-600 shadow-[0_0_10px_#3b82f6]" style={{ width: '40%' }}></div>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 glass rounded-[40px] border border-blue-500/20 bg-blue-600/5">
                    <div className="flex items-center space-x-4 mb-4">
                       <ShieldAlert className="text-blue-400" size={20} />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">Seguridad de Capas</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                       El tráfico entre CUBERBOX y Superset está encapsulado vía <span className="text-white">TLS 1.3</span>. Las IPs autorizadas se validan mediante el Firewall de Capa 7.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsHub;

// Mini Icon implementation
const Activity = ({ size, className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
