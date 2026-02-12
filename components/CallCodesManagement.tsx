import React, { useState, useRef } from 'react';
import { 
  Plus, CheckCircle2, XCircle, ShieldX, PhoneForwarded, Edit2, Trash2, 
  X, Save, RefreshCw, Smartphone, ListChecks, Keyboard, Palette, Info,
  CheckCircle, Zap, ShieldCheck, FileDown, Upload
} from 'lucide-react';
import { CallCode } from '../types';
import { MOCK_CALL_CODES } from '../constants';
import { useToast } from '../ToastContext';

const CallCodesManagement: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [codes, setCodes] = useState<CallCode[]>(MOCK_CALL_CODES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<Partial<CallCode> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPorting, setIsPorting] = useState(false);

  const handleExportCodes = async () => {
    setIsPorting(true);
    toast('Generando catálogo de tipificaciones...', 'info', 'Portability Hub');
    await new Promise(r => setTimeout(r, 1000));
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(codes, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cuberbox_call_codes.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setIsPorting(false);
    toast('Catálogo exportado exitosamente.', 'success');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportCodes = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsPorting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          await new Promise(r => setTimeout(r, 1200));
          setCodes([...json]); // Reemplazar o combinar según preferencia, aquí reemplazamos
          toast(`${json.length} códigos de llamada importados.`, 'success');
        }
      } catch (err) {
        toast('Error de parseo en el catálogo.', 'error');
      } finally {
        setIsPorting(false);
      }
    };
    reader.readAsText(file);
  };

  const handleOpenModal = (code?: CallCode) => {
    if (code) {
      setEditingCode({ ...code });
    } else {
      setEditingCode({
        id: `cc_${Math.random().toString(36).substr(2, 5)}`.toUpperCase(),
        name: '',
        description: '',
        isSale: false,
        isDNC: false,
        isCallback: false,
        selectable: true,
        color: 'blue',
        hotkey: '',
        category: 'HUMAN'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingCode?.name || !editingCode?.id) {
      toast('ID y Nombre son obligatorios.', 'error');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));

    const isExisting = codes.find(c => c.id === editingCode.id);
    const finalCode = editingCode as CallCode;

    if (isExisting) {
      setCodes(codes.map(c => c.id === finalCode.id ? finalCode : c));
      toast('Código de llamada actualizado.', 'success');
    } else {
      setCodes([...codes, finalCode]);
      toast('Nuevo código de llamada registrado.', 'success');
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Deseas eliminar este código? Las campañas vinculadas perderán esta opción de tipificación.')) {
      setCodes(codes.filter(c => c.id !== id));
      toast('Código eliminado del sistema.', 'warning');
    }
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
      case 'rose': return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
      case 'red': return 'bg-red-600/10 border-red-500/20 text-red-500';
      case 'amber': return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
      case 'purple': return 'bg-purple-600/10 border-purple-500/20 text-purple-400';
      case 'slate': return 'bg-slate-800 text-slate-400 border-slate-700';
      default: return 'bg-blue-600/10 border-blue-500/20 text-blue-400';
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <ListChecks className="mr-4 text-blue-400" size={36} />
            Catálogo de Tipificaciones
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configuración de resultados de llamada y comportamientos post-contacto.</p>
        </div>
        <div className="flex items-center space-x-4">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportCodes} />
          <div className="flex bg-slate-900 border-2 border-slate-800 p-1 rounded-2xl shadow-inner">
             <button 
              onClick={handleImportClick}
              disabled={isPorting}
              className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              title="Importar Catálogo"
             >
                <Upload size={20} />
             </button>
             <button 
              onClick={handleExportCodes}
              disabled={isPorting}
              className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              title="Exportar Catálogo"
             >
                <FileDown size={20} />
             </button>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 group"
          >
            <Plus size={22} className="group-hover:rotate-90 transition-transform" />
            <span>Nuevo Código</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {codes.map((code) => (
          <div key={code.id} className="glass p-8 rounded-[40px] border border-slate-700/50 flex flex-col h-full hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6 relative z-10">
               <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getColorClass(code.color)}`}>
                  {code.id}
               </div>
               <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => handleOpenModal(code)} className="p-2 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-white rounded-xl transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(code.id)} className="p-2 bg-slate-900 border border-slate-800 hover:bg-rose-600 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
               </div>
            </div>

            <div className="space-y-2 mb-8 relative z-10">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">{code.name}</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{code.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
               <div className={`flex items-center space-x-2 p-3 rounded-2xl bg-slate-950/60 border ${code.isSale ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-800 text-slate-700'}`}>
                  <Zap size={12} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Es Venta</span>
               </div>
               <div className={`flex items-center space-x-2 p-3 rounded-2xl bg-slate-950/60 border ${code.isDNC ? 'border-rose-500/30 text-rose-400' : 'border-slate-800 text-slate-700'}`}>
                  <ShieldX size={12} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Es DNC</span>
               </div>
               <div className={`flex items-center space-x-2 p-3 rounded-2xl bg-slate-950/60 border ${code.isCallback ? 'border-blue-500/30 text-blue-400' : 'border-slate-800 text-slate-700'}`}>
                  <PhoneForwarded size={12} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Es Callback</span>
               </div>
               <div className="flex items-center space-x-2 p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-500">
                  <Keyboard size={12} />
                  <span className="text-[8px] font-black uppercase tracking-tighter">Key: {code.hotkey || '-'}</span>
               </div>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-800/50 flex items-center justify-between relative z-10">
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{code.category} TARGET</span>
               {code.selectable ? (
                 <span className="text-[8px] font-black text-emerald-500 uppercase flex items-center"><CheckCircle size={10} className="mr-1" /> Agente Visible</span>
               ) : (
                 <span className="text-[8px] font-black text-slate-700 uppercase">System Only</span>
               )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Call Codes */}
      {isModalOpen && editingCode && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <ListChecks size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Configuración de Código</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Lógica de Resultado y Respuesta Sistémica</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700">
                  <X size={24} />
                </button>
             </div>

             <div className="p-12 overflow-y-auto space-y-12 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Identidad del Código</h4>
                      <div className="space-y-6">
                         <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1 space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">ID (Slug)</label>
                               <input type="text" value={editingCode.id} onChange={e => setEditingCode({...editingCode, id: e.target.value.toUpperCase()})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-4 py-4 text-xs text-white font-black uppercase outline-none focus:border-blue-500 shadow-inner" placeholder="Ej: SALE" />
                            </div>
                            <div className="col-span-2 space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Descriptivo</label>
                               <input type="text" value={editingCode.name} onChange={e => setEditingCode({...editingCode, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-4 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" placeholder="Ej: Venta Realizada" />
                            </div>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Explicación para Agente</label>
                            <textarea value={editingCode.description} onChange={e => setEditingCode({...editingCode, description: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-8 py-5 text-sm text-slate-300 h-28 resize-none outline-none focus:border-blue-500 shadow-inner" placeholder="Escribe el alcance de este código..." />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hotkey (Teclado)</label>
                               <input type="text" maxLength={1} value={editingCode.hotkey} onChange={e => setEditingCode({...editingCode, hotkey: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-4 py-4 text-center text-xl text-blue-400 font-black outline-none focus:border-blue-500 shadow-inner" placeholder="1" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
                               <select value={editingCode.category} onChange={e => setEditingCode({...editingCode, category: e.target.value as any})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-xs text-white font-bold outline-none focus:border-blue-500 appearance-none shadow-inner">
                                  <option value="HUMAN">HUMANO</option>
                                  <option value="MACHINE">MAQUINA</option>
                                  <option value="SYSTEM">SISTEMA</option>
                               </select>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Comportamiento Post-Llamada</h4>
                      <div className="space-y-4">
                         {[
                           { label: 'Contabilizar como Venta', key: 'isSale', icon: Zap },
                           { label: 'Bloquear Número (DNC)', key: 'isDNC', icon: ShieldX },
                           { label: 'Habilitar Form. Callback', key: 'isCallback', icon: PhoneForwarded },
                           { label: 'Visible en Pantalla Agente', key: 'selectable', icon: Smartphone },
                         ].map(flag => (
                           <div key={flag.key} className="flex items-center justify-between p-5 bg-slate-900 border border-slate-800 rounded-3xl group hover:border-blue-500/30 transition-all">
                              <div className="flex items-center space-x-4">
                                 <div className={`p-2.5 rounded-xl transition-all ${(editingCode as any)[flag.key] ? 'bg-blue-600/10 text-blue-400' : 'bg-slate-950 text-slate-700'}`}>
                                    <flag.icon size={18} />
                                 </div>
                                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200">{flag.label}</span>
                              </div>
                              <button 
                                onClick={() => setEditingCode({...editingCode, [flag.key]: !(editingCode as any)[flag.key]})}
                                className={`w-12 h-6 rounded-full relative transition-all duration-500 ${(editingCode as any)[flag.key] ? 'bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]' : 'bg-slate-700'}`}
                              >
                                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${(editingCode as any)[flag.key] ? 'right-1' : 'left-1'}`}></div>
                              </button>
                           </div>
                         ))}

                         <div className="p-8 bg-slate-900 border border-slate-800 rounded-[40px] shadow-inner space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Identidad de Color</label>
                            <div className="flex space-x-3">
                               {['blue', 'emerald', 'rose', 'red', 'amber', 'purple', 'slate'].map(c => (
                                  <button 
                                    key={c}
                                    onClick={() => setEditingCode({...editingCode, color: c})}
                                    className={`w-10 h-10 rounded-2xl border-4 transition-all ${editingCode.color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-30'}`}
                                    style={{ backgroundColor: c === 'emerald' ? '#10b981' : c === 'rose' ? '#f43f5e' : c === 'red' ? '#ef4444' : c === 'amber' ? '#f59e0b' : c === 'purple' ? '#8b5cf6' : c === 'slate' ? '#475569' : '#3b82f6' }}
                                  />
                               ))}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-6 shadow-2xl">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                   <ShieldCheck size={16} />
                   <span>Base de Datos de Red Sincronizada</span>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group">
                   {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSaving ? 'Guardando' : 'Sellar Código'}</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCodesManagement;