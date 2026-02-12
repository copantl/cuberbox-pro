
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Trash2, Play, Pause, Database, ChevronRight, X, Cpu, AlertCircle } from 'lucide-react';
import { useToast } from '../ToastContext';

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'NOTICE' | 'WARNING' | 'ERR' | 'CRIT' | 'LUA';
  message: string;
}

const FreeswitchCLI: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [command, setCommand] = useState("");
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mockMessages = [
    { level: 'DEBUG', message: 'sofia.c:2344 Incoming INVITE from carrier_twilio_prim' },
    { level: 'LUA', message: 'cuberbox_router.lua:12 [TELEMETRY] Dispatching CUSTOM event: cuberbox::telemetry' },
    { level: 'NOTICE', message: 'switch_xml.c:642 Config Reloaded: Trunks and DIDs synchronized with PostgreSQL' },
    { level: 'INFO', message: 'mod_dialplan_xml.c:332 [CUBERBOX TRACE] Mapping DID +13055550122 -> Camp: Real Estate' },
    { level: 'NOTICE', message: 'switch_channel.c:1112 New Channel bridge/1001-agent [CONNECTED]' },
    { level: 'DEBUG', message: 'switch_core_state_machine.c:455 EXEC conference(conf_1001@default)' },
    { level: 'CRIT', message: 'mod_sofia.c:1102 [SIP_FAIL] Lost connection to Twilio Gateway 54.172.60.0' },
    { level: 'ERR', message: 'switch_core_sqldb.c:442 PostgreSQL connection timed out on fs-node-01' },
  ];

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      const randomMsg = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      const newEntry: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        level: randomMsg.level as any,
        message: randomMsg.message
      };

      // Disparar Toasts para eventos críticos/errores
      if (newEntry.level === 'CRIT') {
        toast(newEntry.message, 'critical', 'SIP STACK FAILURE', true);
      } else if (newEntry.level === 'ERR') {
        toast(newEntry.message, 'error', 'FS CORE ERROR');
      }

      setLogs(prev => [...prev, newEntry].slice(-100));
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, toast]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'LUA': return 'text-purple-400 font-bold';
      case 'DEBUG': return 'text-slate-500';
      case 'NOTICE': return 'text-emerald-400';
      case 'WARNING': return 'text-amber-400';
      case 'ERR': return 'text-rose-500';
      case 'CRIT': return 'text-white bg-rose-600 px-1 rounded font-black';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass rounded-[48px] border border-slate-700/50 overflow-hidden bg-black/40 shadow-2xl">
      <div className="px-10 py-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Terminal size={18} className="text-blue-400" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Neural Dialer CLI</span>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setIsPaused(!isPaused)} className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all">
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>
          <button onClick={() => setLogs([])} className="p-2.5 bg-slate-800 hover:bg-rose-500/10 border border-slate-700 text-slate-400 hover:text-rose-500 rounded-xl">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 font-mono text-[12px] leading-relaxed space-y-1 bg-[#020617]/50 scrollbar-hide">
        {logs.map((log, i) => (
          <div key={i} className="flex space-x-6 group hover:bg-white/5 px-2 py-0.5 rounded transition-colors animate-in slide-in-from-left-2">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={`shrink-0 w-20 text-center font-black tracking-tighter ${getLevelColor(log.level)}`}>[{log.level}]</span>
            <span className="text-slate-300">{log.message}</span>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center space-x-4 bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 focus-within:border-blue-500 transition-all">
          <span className="text-emerald-500 font-black font-mono">fs_cli&gt;</span>
          <input 
            type="text" 
            placeholder=" reloadxml | show calls | conference list ..." 
            className="flex-1 bg-transparent text-sm font-mono text-white outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default FreeswitchCLI;
