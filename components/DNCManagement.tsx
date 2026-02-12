/**
 * @file DNCManagement.tsx
 * @description Gestión de listas de exclusión (Do Not Call) con cumplimiento federal.
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldAlert, Search, Plus, Trash2, ShieldCheck, PhoneOff, 
  RefreshCw, Download, Filter, Save, AlertCircle, FileCheck,
  Hash, User, Clock, Globe, Shield, X,
  AlertTriangle, CheckCircle2, ChevronRight, FileDown, Upload
} from 'lucide-react';
import { DNCRecord } from '../types';
import { useToast } from '../ToastContext';

const DNCManagement: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<DNCRecord[]>([
    { id: '1', phoneNumber: '+1 305-555-0199', reason: 'Solicitud Cliente', addedBy: 'Maria G.', timestamp: '2024-11-20 14:00' },
    { id: '2', phoneNumber: '+1 212-555-9822', reason: 'Registro Federal DNC', addedBy: 'System Auto-Sync', timestamp: '2024-11-21 09:12' },
    { id: '3', phoneNumber: '+1 415-555-2244', reason: 'Abogado / Legal', addedBy: 'Admin', timestamp: '2024-11-21 16:45' },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPorting, setIsPorting] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [newReason, setNewReason] = useState("Solicitud Cliente");

  const filtered = useMemo(() => 
    records.filter(r => r.phoneNumber.includes(searchTerm) || r.reason.toLowerCase().includes(searchTerm.toLowerCase()))
  , [records, searchTerm]);

  const handleExportDNC = async () => {
    setIsPorting(true);
    toast('Generando reporte DNC de cumplimiento...', 'info');
    await new Promise(r => setTimeout(r, 1200));
    
    const csvContent = "data:text/csv;charset=utf-8,Phone,Reason,Date\n" + records.map(r => `${r.phoneNumber},${r.reason},${r.timestamp}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cuberbox_dnc_registry.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsPorting(false);
    toast('Registro DNC exportado correctamente.', 'success');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportDNC = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsPorting(true);
    await new Promise(r => setTimeout(r, 2000));
    
    // Simulación de carga masiva
    const count = Math.floor(Math.random() * 50) + 10;
    toast(`Importación masiva exitosa: ${count} números bloqueados.`, 'success');
    setIsPorting(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsSyncing(false);
    toast('Sincronización federal completada. Bloqueos actualizados.', 'success', 'Cumplimiento Legal');
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber || newNumber.length < 7) {
       toast('Número inválido.', 'error');
       return;
    }
    const record: DNCRecord = {
       id: Math.random().toString(36).substr(2, 5),
       phoneNumber: newNumber,
       reason: newReason,
       addedBy: 'Admin (Manual)',
       timestamp: new Date().toISOString().replace('T', ' ').substr(0, 16)
    };
    setRecords([record, ...records]);
    setIsModalOpen(false);
    setNewNumber("");
    toast(`Número ${newNumber} bloqueado permanentemente.`, 'success');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <ShieldAlert className="mr-4 text-rose-500" size={32} />
            DNC Pro-Shield
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Cumplimiento de leyes de privacidad telefónica y exclusión activa.</p>
        </div>
        <div className="flex items-center space-x-3">
           <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleImportDNC} />
           <div className="flex bg-slate-900 border-2 border-slate-800 p-1 rounded-2xl shadow-inner mr-2">
             <button 
              onClick={handleImportClick}
              disabled={isPorting}
              className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              title="Importar CSV/TXT"
             >
                <Upload size={20} />
             </button>
             <button 
              onClick={handleExportDNC}
              disabled={isPorting}
              className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              title="Exportar Reporte"
             >
                <FileDown size={20} />
             </button>
          </div>
           <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-slate-900 border-2 border-slate-800 text-slate-300 px-6 py-3.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center shadow-xl disabled:opacity-50"
           >
             {isSyncing ? <RefreshCw className="animate-spin" size={16} /> : <Globe className="text-blue-500 mr-2" size={16} />}
             <span>Sync Registry</span>
           </button>
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-rose-600/30 flex items-center active:scale-95 group"
           >
             <Plus size={20} className="mr-3 group-hover:rotate-90 transition-transform" /> 
             Bloqueo Manual
           </button>
        </div>
      </div>

      <div className="glass rounded-[48px] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col">
         <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center space-x-5">
               <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700 shadow-inner">
                  <Filter size={24} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Capa de Exclusión Activa</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Monitoreo de colisiones en tiempo real</p>
               </div>
            </div>
            <div className="relative w-full md:w-[400px]">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
               <input 
                 type="text" 
                 placeholder="Buscar número o motivo..." 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] pl-16 pr-8 py-5 text-sm text-white font-bold outline-none focus:border-rose-500 transition-all shadow-inner"
               />
            </div>
         </div>

         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left">
               <thead className="bg-slate-950/40 text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                  <tr>
                     <th className="px-10 py-6">Número Telefónico</th>
                     <th className="px-10 py-6">Motivo</th>
                     <th className="px-10 py-6">Atribución</th>
                     <th className="px-10 py-6 text-right">Control</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                  {filtered.map(r => (
                    <tr key={r.id} className="hover:bg-rose-600/5 transition-all group">
                       <td className="px-10 py-8">
                          <span className="font-mono text-base font-black text-white tracking-tighter">{r.phoneNumber}</span>
                       </td>
                       <td className="px-10 py-8">
                          <span className="text-[10px] font-black text-rose-400 bg-rose-400/10 px-4 py-1.5 rounded-full border border-rose-500/20 uppercase">{r.reason}</span>
                       </td>
                       <td className="px-10 py-8">
                          <div className="flex flex-col">
                             <span className="text-xs font-black text-slate-300 uppercase">{r.addedBy}</span>
                             <span className="text-[10px] text-slate-600 font-bold uppercase mt-1 tracking-widest">{r.timestamp}</span>
                          </div>
                       </td>
                       <td className="px-10 py-8 text-right">
                          <button onClick={() => setRecords(records.filter(x => x.id !== r.id))} className="p-4 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-slate-500 hover:text-white rounded-[20px] transition-all opacity-0 group-hover:opacity-100 shadow-xl">
                             <Trash2 size={20} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Bloqueo de Seguridad</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all"><X size={24} /></button>
             </div>
             <form onSubmit={handleAddManual} className="p-12 space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Número Telefónico</label>
                   <input type="text" value={newNumber} onChange={e => setNewNumber(e.target.value)} placeholder="+1 000 000 000" className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-xl font-mono font-black text-white outline-none focus:border-rose-500 shadow-inner" />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Motivo</label>
                   <select value={newReason} onChange={e => setNewReason(e.target.value)} className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm font-black text-rose-400 uppercase outline-none focus:border-rose-500 appearance-none shadow-inner">
                      <option>Solicitud Cliente</option>
                      <option>Acción Legal / Abogado</option>
                      <option>Spam / Blacklist</option>
                   </select>
                </div>
                <div className="pt-6 flex justify-end">
                   <button type="submit" className="bg-rose-600 hover:bg-rose-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 flex items-center space-x-4">
                      <span>Confirmar Bloqueo</span>
                      <ShieldCheck size={20} />
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DNCManagement;