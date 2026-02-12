
import React, { useState, useEffect } from 'react';
import { Cpu, Server, Activity, Zap, RefreshCw, ShieldCheck, Database, HardDrive, Network, Phone, ShieldAlert, AlertTriangle, Layers, Timer } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '../ToastContext';
import { ClusterNode } from '../types';

const ClusterMonitor: React.FC = () => {
  const { toast } = useToast();
  const [loadData, setLoadData] = useState(Array.from({ length: 20 }, (_, i) => ({ time: i, load: Math.floor(Math.random() * 30) + 10 })));
  const [nodes, setNodes] = useState<ClusterNode[]>([
    { id: 'fs-01', name: 'Nodo FreeSwitch Master', ip: '10.0.0.10', status: 'ONLINE', cpu: 12, mem: 4.2, channels: 145, threads: 450, dbLatency: 2 },
    { id: 'fs-02', name: 'Nodo FreeSwitch Slave', ip: '10.0.0.11', status: 'ONLINE', cpu: 8, mem: 3.8, channels: 89, threads: 320, dbLatency: 3 },
    { id: 'go-01', name: 'Go Backend Core', ip: '10.0.0.100', status: 'ONLINE', cpu: 2, mem: 0.8, channels: 0, threads: 120, dbLatency: 1 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadData(prev => {
        const nextVal = Math.floor(Math.random() * 40) + 15;
        const newData = [...prev.slice(1), { time: prev[prev.length - 1].time + 1, load: nextVal }];
        return newData;
      });

      setNodes(prev => prev.map(node => ({
        ...node,
        cpu: Math.max(2, Math.min(95, node.cpu + (Math.random() > 0.5 ? 2 : -2))),
        channels: node.channels > 0 ? Math.max(0, node.channels + (Math.random() > 0.5 ? 5 : -5)) : 0,
        threads: Math.max(100, node.threads + (Math.random() > 0.5 ? 10 : -10)),
        dbLatency: Math.max(1, node.dbLatency + (Math.random() > 0.8 ? 1 : -1))
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleReboot = (name: string) => {
    toast(`Enviando señal SIGTERM a ${name}... Re-enrutando tráfico SIP.`, 'info', 'Cluster High-Availability');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center">
            <Cpu className="mr-4 text-emerald-400" size={36} />
            Cluster Intelligence
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Orquestación distribuida de nodos SIP y hilos de ejecución Go.</p>
        </div>
        <div className="flex space-x-4">
           <div className="px-6 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]"></div>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Auto-Scale: Standby</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {nodes.map(node => (
          <div key={node.id} className="glass p-8 rounded-[48px] border border-slate-700/50 shadow-2xl relative overflow-hidden group">
             <div className="flex items-center justify-between mb-8">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-blue-400 group-hover:scale-110 transition-transform">
                   {node.id.startsWith('fs') ? <Phone size={24} /> : <Cpu size={24} />}
                </div>
                <div className="flex items-center space-x-2">
                   <div className={`w-2.5 h-2.5 rounded-full ${node.status === 'ONLINE' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500'}`}></div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{node.status}</span>
                </div>
             </div>
             <h3 className="text-xl font-black text-white uppercase tracking-tight">{node.name}</h3>
             <p className="text-[10px] font-mono text-slate-600 font-bold uppercase mt-1 tracking-[0.2em]">{node.ip}</p>
             
             <div className="mt-10 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-500">
                         <Layers size={12} />
                         <span className="text-[8px] font-black uppercase">Threads</span>
                      </div>
                      <p className="text-xl font-black text-white font-mono">{node.threads}</p>
                   </div>
                   <div className="p-4 bg-slate-950 rounded-3xl border border-slate-800 space-y-1">
                      <div className="flex items-center space-x-2 text-slate-500">
                         <Timer size={12} />
                         <span className="text-[8px] font-black uppercase">DB Ping</span>
                      </div>
                      <p className="text-xl font-black text-blue-400 font-mono">{node.dbLatency}ms</p>
                   </div>
                </div>

                <div className="space-y-3">
                   <div className="flex justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">
                      <span>Consumo CPU</span>
                      <span className={node.cpu > 80 ? 'text-rose-500' : 'text-white'}>{node.cpu}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full transition-all duration-1000 ${node.cpu > 80 ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} style={{ width: `${node.cpu}%` }}></div>
                   </div>
                </div>
             </div>

             <div className="mt-10 pt-8 border-t border-slate-800 flex justify-between">
                <button onClick={() => handleReboot(node.name)} className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline active:scale-95 transition-all">Reboot Node</button>
                <button className="text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline active:scale-95 transition-all">Telemetry Logs</button>
             </div>
          </div>
        ))}
      </div>

      <div className="glass p-12 rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden bg-slate-900/40 relative">
         <div className="absolute top-0 right-0 p-12 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Activity size={250} />
         </div>
         <div className="flex items-center justify-between mb-12 relative z-10">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight flex items-center">
               <Activity className="mr-4 text-blue-500" />
               Global Cluster Load Stream
            </h3>
            <div className="flex items-center space-x-6 text-[10px] font-black uppercase tracking-widest">
               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-slate-500">Average Load</span>
               </div>
               <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-slate-500">Peak Capacity</span>
               </div>
            </div>
         </div>
         <div className="h-[400px] relative z-10">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={loadData}>
                  <defs>
                     <linearGradient id="gradLoad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'}} 
                    labelStyle={{display: 'none'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="load" 
                    stroke="#3b82f6" 
                    strokeWidth={5} 
                    fill="url(#gradLoad)" 
                    animationDuration={1500}
                    isAnimationActive={true}
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>
    </div>
  );
};

export default ClusterMonitor;
