import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Trash2, Play, Pause, Database, ChevronRight, X, Cpu, AlertCircle } from 'lucide-react';
import { useToast } from '../ToastContext';

interface LogEntry {
  timestamp: string;
  level: 'DEBUG' | 'VERBOSE' | 'NOTICE' | 'WARNING' | 'ERROR' | 'AMI' | 'PJSIP';
  message: string;
}

const AsteriskCLI: React.FC = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mockMessages = [
    { level: 'PJSIP', message: 'pjsip_endpoint.c: Incoming INVITE from carrier_quantica' },
    { level: 'AMI', message: 'Manager received action: Originate (Channel: PJSIP/1001)' },
    { level: 'NOTICE', message: 'loader.c: Asterisk 21.0.0-LTS Configuration Reloaded' },
    { level: 'VERBOSE', message: 'Executing [86001001@default:1] ConfBridge("agent_1001")' },
    { level: 'DEBUG', message: 'res_pjsip_session.c: Handling RTP session timer for channel 0x23a1' },
    { level: 'PJSIP', message: 'Endpoint 1001 is now reachable (Latency: 12.5ms)' },
    { level: 'ERROR', message: 'res_pjsip_outbound_registration.c: 401 Unauthorized for quantica_trunk' },
    { level: 'WARNING', message: 'chan_pjsip.c: Unable to create channel of type PJSIP (Cause 17)' },
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

      if (newEntry.level === 'ERROR') {
        toast(newEntry.message, 'error', 'ASTERISK CRITICAL');
      }

      setLogs(prev => [...prev, newEntry].slice(-100));
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, toast]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'PJSIP': return 'text-orange-400 font-bold';
      case 'AMI': return 'text-cyan-400';
      case 'NOTICE': return 'text-emerald-400';
      case 'WARNING': return 'text-amber-400';
      case 'ERROR': return 'text-rose-500 font-black';
      case 'VERBOSE': return 'text-slate-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="flex flex-col h-[700px] glass rounded-[48px] border border-slate-700/50 overflow-hidden bg-black/40 shadow-2xl">
      <div className="px-10 py-6 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Terminal size={18} className="text-orange-500" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Asterisk v21 CLI Console</span>
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
        <div className="flex items-center space-x-4 bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 focus-within:border-orange-500 transition-all">
          <span className="text-orange-500 font-black font-mono">asterisk*CLI></span>
          <input 
            type="text" 
            placeholder=" pjsip show endpoints | core reload | manager show connected ..." 
            className="flex-1 bg-transparent text-sm font-mono text-white outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default AsteriskCLI;