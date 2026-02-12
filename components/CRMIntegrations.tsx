
import React, { useState } from 'react';
import { 
  Database, Plus, Link, Link2Off, Settings, CheckCircle, RefreshCw, 
  ExternalLink, Globe, Key, CloudSync, Trash2, Box, Layers, Code
} from 'lucide-react';
import { CRMIntegration } from '../types';
import { MOCK_CRM_INTEGRATIONS } from '../constants';

const PROVIDERS = [
  { id: 'ODOO', name: 'Odoo ERP', icon: '💎', color: 'from-purple-500 to-purple-700' },
  { id: 'IDEMPIERE', name: 'iDempiere', icon: '🏛️', color: 'from-blue-500 to-blue-700' },
  { id: 'WORKFORCE', name: 'Workforce', icon: '👥', color: 'from-emerald-500 to-emerald-700' },
  { id: 'SALESFORCE', name: 'Salesforce', icon: '☁️', color: 'from-cyan-500 to-cyan-700' },
  { id: 'CUSTOM', name: 'Custom Webhook', icon: '⚡', color: 'from-amber-500 to-amber-700' },
];

const CRMIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<CRMIntegration[]>(MOCK_CRM_INTEGRATIONS);
  const [selectedIntegration, setSelectedIntegration] = useState<CRMIntegration | null>(integrations[0]);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleToggleActive = (id: string) => {
    setIntegrations(integrations.map(int => 
      int.id === id ? { ...int, isActive: !int.isActive } : int
    ));
    if (selectedIntegration?.id === id) {
      setSelectedIntegration({ ...selectedIntegration, isActive: !selectedIntegration.isActive });
    }
  };

  const handleTestConnection = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSyncing(false);
    alert('Conexión exitosa con el endpoint del CRM.');
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <CloudSync className="mr-3 text-blue-400" size={28} />
            Ecosistema CRM
          </h2>
          <p className="text-slate-400 text-sm">Integra CUBERBOX con tus sistemas de negocio para flujos de datos bidireccionales.</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20">
          <Plus size={18} />
          <span className="font-bold text-sm text-white">CONECTAR CRM</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar: Mis Conexiones */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Conexiones Activas</h4>
          {integrations.map((int) => {
            const provider = PROVIDERS.find(p => p.id === int.provider);
            return (
              <div 
                key={int.id}
                onClick={() => setSelectedIntegration(int)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                  selectedIntegration?.id === int.id 
                    ? 'glass border-blue-500/50 bg-blue-600/5 shadow-xl shadow-blue-600/5' 
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${provider?.color} flex items-center justify-center text-2xl shadow-lg`}>
                    {provider?.icon}
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${int.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700 text-slate-500'}`}>
                    {int.isActive ? 'Conectado' : 'Inactivo'}
                  </div>
                </div>
                <h4 className="font-bold text-white text-lg">{int.name}</h4>
                <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">{int.apiUrl}</p>
                <div className="mt-4 flex items-center justify-between">
                   <div className="flex -space-x-1.5">
                      {int.syncEvents.map((evt, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center" title={evt}>
                          <RefreshCw size={10} className="text-blue-400" />
                        </div>
                      ))}
                   </div>
                   <button 
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(int.id); }}
                    className={`p-2 rounded-xl border transition-all ${int.isActive ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-700 text-slate-500'}`}
                   >
                     {int.isActive ? <Link2Off size={16} /> : <Link size={16} />}
                   </button>
                </div>
              </div>
            );
          })}

          <div className="p-8 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center group cursor-pointer hover:border-slate-700 transition-all">
             <Box className="text-slate-700 mb-3 group-hover:scale-110 transition-transform" size={32} />
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Catálogo de Providers</p>
          </div>
        </div>

        {/* Editor de Integración */}
        <div className="col-span-12 lg:col-span-8">
          {selectedIntegration ? (
            <div className="glass p-8 rounded-[40px] border border-slate-700/50 space-y-8 animate-in fade-in zoom-in-95 duration-300 shadow-2xl">
               <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-3xl border border-slate-800">
                      {PROVIDERS.find(p => p.id === selectedIntegration.provider)?.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white">{selectedIntegration.name}</h3>
                      <p className="text-sm text-slate-500">Configuración de Bridge para {selectedIntegration.provider}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-3 bg-slate-800 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-2xl transition-all"><Trash2 size={20} /></button>
                    <button 
                      onClick={handleTestConnection}
                      disabled={isSyncing}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50"
                    >
                      {isSyncing ? <RefreshCw className="animate-spin" size={18} /> : <ExternalLink size={18} />}
                      <span className="font-bold text-sm">Test Link</span>
                    </button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                      <Globe size={12} className="mr-1" /> API Endpoint URL
                    </label>
                    <input 
                      type="text" 
                      value={selectedIntegration.apiUrl}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-sm text-slate-300 outline-none focus:border-blue-500 transition-all font-mono" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                      <Key size={12} className="mr-1" /> Secret Key / OAuth Token
                    </label>
                    <input 
                      type="password" 
                      value={selectedIntegration.apiKey}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 text-sm text-slate-300 outline-none focus:border-blue-500 transition-all font-mono" 
                    />
                  </div>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Eventos de Sincronización</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['CALL_START', 'CALL_END', 'DISPOSITION', 'RECORDING'].map(evt => (
                       <button 
                        key={evt}
                        className={`p-4 rounded-2xl border text-center transition-all ${
                          selectedIntegration.syncEvents.includes(evt as any)
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-lg shadow-blue-500/5'
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                        }`}
                       >
                         <div className="flex flex-col items-center space-y-2">
                           {selectedIntegration.syncEvents.includes(evt as any) ? <CheckCircle size={16} /> : <Layers size={16} />}
                           <span className="text-[9px] font-black uppercase tracking-tighter">{evt.replace('_', ' ')}</span>
                         </div>
                       </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Field Mapping (Lead Data)</h4>
                    <button className="text-[10px] font-bold text-blue-400 hover:underline flex items-center"><Code size={12} className="mr-1" /> JSON Schema</button>
                  </div>
                  <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-hide">
                    {Object.entries(selectedIntegration.fieldMapping).map(([vici, crm], idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-slate-900/50 border border-slate-800 rounded-2xl group">
                         <div className="flex-1 bg-slate-950 px-4 py-2 rounded-xl text-xs font-mono text-blue-400 border border-slate-800">CUBERBOX: <span className="text-white">{vici}</span></div>
                         <RefreshCw size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                         <input 
                           type="text" 
                           defaultValue={crm} 
                           className="flex-1 bg-slate-950 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 border border-slate-800 outline-none focus:border-emerald-500" 
                         />
                      </div>
                    ))}
                    <button className="w-full py-3 rounded-2xl border border-dashed border-slate-800 text-slate-600 hover:text-slate-400 hover:border-slate-700 transition-all text-xs font-bold uppercase tracking-widest mt-2 flex items-center justify-center">
                       <Plus size={14} className="mr-2" /> Añadir Mapeo
                    </button>
                  </div>
               </div>

               <div className="pt-6 border-t border-slate-800 flex justify-end">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center space-x-2 active:scale-95">
                    <CloudSync size={20} />
                    <span>GUARDAR INTEGRACIÓN</span>
                  </button>
               </div>
            </div>
          ) : (
            <div className="h-full glass rounded-[40px] border border-slate-700/50 flex flex-col items-center justify-center p-20 text-center space-y-6 opacity-50">
               <Database size={64} className="text-slate-700" />
               <div>
                 <h3 className="text-2xl font-black text-slate-400">Selecciona un CRM</h3>
                 <p className="text-sm text-slate-500 max-w-xs mt-2">Gestiona los endpoints de sincronización y las credenciales de acceso para tus sistemas externos.</p>
               </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-10 glass rounded-[40px] border border-slate-700/50 bg-gradient-to-r from-blue-600/5 to-emerald-600/5">
         <div className="flex items-center space-x-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-600/20 flex items-center justify-center text-blue-400 shadow-inner">
               <Settings size={40} className="animate-spin-slow" />
            </div>
            <div>
               <h3 className="text-xl font-black text-white">Configuración del Bridge Global</h3>
               <p className="text-sm text-slate-400 max-w-2xl mt-2">El motor CUBERBOX procesa eventos de telefonía en tiempo real. Activa el "Screen Pop" para que tus agentes vean la ficha del cliente en Odoo o iDempiere automáticamente al sonar la llamada.</p>
               <button className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all border border-slate-700">Explorar Documentación SDK</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CRMIntegrations;
