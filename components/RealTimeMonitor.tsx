/**
 * @file RealTimeMonitor.tsx
 * @description Centro de comando Asterisk: ConfBridge, PJSIP y AMI Telemetry.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Users, PhoneCall, Clock, AlertTriangle, TrendingUp, ChevronRight,
  Zap, PhoneForwarded, LayoutGrid, Monitor, Headphones, Radio, Mic, ShieldAlert,
  Server as ServerIcon, Globe, RefreshCw, ShieldCheck, User, Search, Play,
  Pause, MoreVertical, MessageSquare, Volume2, Ear, Mic2, Users2, X, AlertCircle,
  PhoneIncoming, PhoneOutgoing, Layers, Settings, Info, Wifi, Database, 
  Cpu, HardDrive, BarChart3, Terminal, Timer, Hourglass,
  Smile, Signal, Maximize2, Trophy, Target, Award, Shapes, Filter,
  VolumeX, Lock, PhoneOff, Plus, UserCheck, CheckCircle2, History,
  Power
} from 'lucide-react';
import Wallboard from './Wallboard';
import { MOCK_USERS_LIST } from '../constants';
import { ConferenceRoom, GTRAgentMetric, GTRQueueMetric } from '../types';
import { useToast } from '../ToastContext';
import Logo from './Logo';

const RealTimeMonitor: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'BRIDGES' | 'AGENTS' | 'AMI_EVENTS'>('BRIDGES');
  const [isWallboardOpen, setIsWallboardOpen] = useState(false);

  return (
    <div className="space-y-8 h-full flex flex-col animate-in fade-in duration-700 pb-10">
      {isWallboardOpen && <Wallboard onClose={() => setIsWallboardOpen(false)} />}

      <div className="flex items-center justify-between shrink-0">
         <div className="flex items-center space-x-5">
            <Logo className="w-10 h-10" />
            <div>
               <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  Asterisk Node Monitor
               </h2>
               <p className="text-slate-400 text-sm font-medium">Control de canales PJSIP y eventos de Manager Interface.</p>
            </div>
         </div>
         <button 
           onClick={() => setIsWallboardOpen(true)}
           className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-[24px] font-black text-[11px] uppercase tracking-widest shadow-xl transition-all flex items-center space-x-3"
         >
            <Maximize2 size={20} />
            <span>Launch Wallboard</span>
         </button>
      </div>

      <div className="flex space-x-2 bg-slate-900 border-2 border-slate-800 p-1.5 rounded-3xl shrink-0 overflow-x-auto scrollbar-hide">
         {[
           { id: 'BRIDGES', label: 'ConfBridges Activos', icon: Headphones },
           { id: 'AGENTS', label: 'PJSIP Endpoints', icon: Users },
           { id: 'AMI_EVENTS', label: 'AMI Event Stream', icon: Radio },
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={`flex items-center space-x-3 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3 rounded-2xl transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-orange-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
           >
             <tab.icon size={16} />
             <span>{tab.label}</span>
           </button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
         <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl flex flex-col items-center justify-center text-center opacity-40 py-40">
            <Activity size={80} className="text-orange-500 mb-8 animate-pulse" />
            <h3 className="text-3xl font-black text-white uppercase tracking-widest">Telemetría de Red Asterisk</h3>
            <p className="text-sm text-slate-500 mt-4 uppercase font-bold tracking-widest">Sincronizado vía AMI Bridge v6.0</p>
         </div>
      </div>
    </div>
  );
};

export default RealTimeMonitor;