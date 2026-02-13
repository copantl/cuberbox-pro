/**
 * @file TelephonyConfig.tsx
 * @description Gestión estructural de Asterisk: PJSIP Endpoints, DIDs y AMI.
 */

import React, { useState, useEffect } from 'react';
import { 
  Phone, Server, Globe, Key, Shield, Hash, Activity, Plus, Trash2, 
  Settings, Save, RefreshCw, CheckCircle, XCircle, Layers, Radio,
  Smartphone, Monitor, Zap, ListFilter, Cpu, Database, Search, 
  ArrowRightLeft, X, ShieldCheck, Terminal as TerminalIcon, Power, 
  ToggleLeft, ToggleRight, ChevronRight, Info, Lock, Unlock, PhoneIncoming,
  Edit2, Clock
} from 'lucide-react';
import { SIPTrunk, DID } from '../types';
import { MOCK_DIDS, MOCK_TRUNKS, MOCK_CAMPAIGNS } from '../constants';
import AsteriskCLI from './AsteriskCLI';
import { useToast } from '../ToastContext';

const TelephonyConfig: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'AST' | 'TRUNKS' | 'DIDS' | 'EXTENSIONS' | 'CLI'>('TRUNKS');
  const [trunks, setTrunks] = useState<SIPTrunk[]>(MOCK_TRUNKS);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [isTrunkModalOpen, setIsTrunkModalOpen] = useState(false);
  const [editingTrunk, setEditingTrunk] = useState<Partial<SIPTrunk> | null>(null);

  const handleGlobalSync = async () => {
    setIsSyncing(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsSyncing(false);
    toast('DialPlan y PJSIP recargados en todos los nodos.', 'success', 'Asterisk Integrity OK');
  };

  const handleOpenTrunkModal = (trunk?: SIPTrunk) => {
    if (trunk) {
      setEditingTrunk({ ...trunk });
    } else {
      setEditingTrunk({
        id: `trunk_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        host: '',
        username: '',
        secret: '',
        protocol: 'PJSIP',
        port: 5060,
        context: 'cuberbox-inbound',
        isActive: true,
        status: 'requesting',
        codecs: ['ulaw', 'alaw', 'opus'],
        latency: 0
      });
    }
    setIsTrunkModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Phone className="mr-4 text-orange-500" size={32} />
            Infraestructura Asterisk
          </h2>
          <p className="text-slate-400 text-sm font-medium">Configuración PJSIP, troncales carrier y terminal AMI.</p>
        </div>
        <div className="flex space-x-4">
           <button onClick={handleGlobalSync} disabled={isSyncing} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-3.5 rounded-3xl transition-all shadow-xl flex items-center active:scale-95 disabled:opacity-50">
              {isSyncing ? <RefreshCw className="animate-spin mr-2" size={18} /> : <ShieldCheck size={18} className="mr-2" />}
              <span className="font-black text-[10px] uppercase tracking-widest">Reload Dialplan</span>
           </button>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
        {[
          { id: 'AST', icon: Server, label: 'Asterisk Node' },
          { id: 'TRUNKS', icon: Globe, label: 'PJSIP Trunks' },
          { id: 'DIDS', icon: Hash, label: 'DIDs' },
          { id: 'EXTENSIONS', icon: Smartphone, label: 'Endpoints' },
          { id: 'CLI', icon: TerminalIcon, label: 'Asterisk CLI' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-xl' : 'bg-slate-800/40 text-slate-500 border border-slate-700/50 hover:bg-slate-800'}`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'CLI' ? <AsteriskCLI /> : (
          <div className="glass rounded-[48px] border border-slate-700/50 p-10 shadow-2xl h-full">
            {activeTab === 'TRUNKS' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-right-4 duration-500">
                {trunks.map(trunk => (
                  <div key={trunk.id} onClick={() => handleOpenTrunkModal(trunk)} className="p-8 rounded-[40px] bg-slate-900/60 border border-slate-800 hover:border-orange-500/40 transition-all group relative overflow-hidden cursor-pointer">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-5">
                           <div className="w-14 h-14 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-inner">
                              <Globe size={24} />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-white uppercase">{trunk.name}</h4>
                              <p className="text-[10px] font-mono text-slate-500 font-bold">PJSIP: {trunk.host}</p>
                           </div>
                        </div>
                        <div className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${trunk.status === 'registered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                           {trunk.status}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 text-center">
                           <p className="text-[8px] font-black text-slate-600 uppercase">Jitter</p>
                           <p className="text-xl font-black text-blue-400 font-mono">{trunk.latency}ms</p>
                        </div>
                        <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 text-center">
                           <p className="text-[8px] font-black text-slate-600 uppercase">Context</p>
                           <p className="text-xs font-black text-white truncate">{trunk.context}</p>
                        </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'AST' && (
              <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
                 <div className="flex items-center space-x-8">
                    <div className="w-24 h-24 rounded-[32px] bg-orange-600/10 flex items-center justify-center text-orange-400 border border-orange-500/20 shadow-inner">
                       <Server size={48} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Nodo Maestro Asterisk 21</h2>
                       <p className="text-sm text-slate-500 font-medium">Build: Phoenix Titan LTS v6.0</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-inner">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">AMI Status</h4>
                       <div className="flex items-center space-x-4">
                          <Zap size={32} className="text-orange-500 animate-pulse" />
                          <p className="text-2xl font-black text-white">AUTHENTICATED</p>
                       </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-inner">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Canales PJSIP</h4>
                       <div className="flex items-center space-x-4">
                          <Activity size={32} className="text-emerald-500" />
                          <p className="text-3xl font-black text-white">842 / 2.5K</p>
                       </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-slate-900 border border-slate-800 shadow-inner">
                       <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">ARI Listener</h4>
                       <div className="flex items-center space-x-4">
                          <RefreshCw size={32} className="text-blue-500" />
                          <p className="text-3xl font-black text-white">IDLE</p>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TelephonyConfig;