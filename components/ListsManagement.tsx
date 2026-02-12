import React, { useState, useRef } from 'react';
import { 
  Database, Upload, Trash2, PieChart, FileSpreadsheet, 
  AlertCircle, CheckCircle, Edit2, X, Save, RefreshCw,
  Search, Filter, ChevronRight, Activity, Layers,
  CheckCircle2, XCircle, MoreVertical, Clock, AlertTriangle,
  FileDown, Share2
} from 'lucide-react';
import { useToast } from '../ToastContext';

const ListsManagement: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [lists, setLists] = useState([
    { id: '1001', name: 'Real Estate Florida - Nov', count: 4500, active: true, campaign: 'Florida_Sales', lastCall: '2024-11-21 14:05' },
    { id: '1002', name: 'Health Leads Cold', count: 12000, active: true, campaign: 'Insurance_Out', lastCall: '2024-11-21 12:30' },
    { id: '1003', name: 'Follow up Q3', count: 850, active: false, campaign: 'None', lastCall: '2024-10-15 09:00' },
    { id: '1004', name: 'Master Leads 2024', count: 50000, active: true, campaign: 'Global_Retargeting', lastCall: 'Hace 5 min' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleExportList = async (list: any) => {
    setIsExporting(true);
    toast(`Generando CSV para "${list.name}"...`, 'info', 'Export Engine');
    
    // Simulación de generación de archivo
    await new Promise(r => setTimeout(r, 1500));
    
    const csvContent = "data:text/csv;charset=utf-8,ID,Phone,Name,Status\n1,+13055550122,John Wick,NEW\n2,+12125559844,Maria G,NEW";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${list.name.replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setIsExporting(false);
    toast('Exportación completada exitosamente.', 'success');
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta lista y todos sus leads asociados? Esta acción borrará permanentemente los registros del motor de marcado.')) {
      setLists(lists.filter(l => l.id !== id));
      toast('Lista eliminada del servidor.', 'warning');
    }
  };

  const handleEdit = (list: any) => {
    setEditingList({ ...list });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setLists(lists.map(l => l.id === editingList.id ? editingList : l));
    setIsSaving(false);
    setIsModalOpen(false);
    toast('Configuración de lista actualizada.', 'success');
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const newList = {
        id: (Math.floor(Math.random() * 9000) + 1000).toString(),
        name: file.name.replace('.csv', ''),
        count: Math.floor(Math.random() * 5000) + 500,
        active: true,
        campaign: 'Nueva_Campaña',
        lastCall: 'Recién cargada'
      };
      setLists([newList, ...lists]);
      setIsUploading(false);
      toast(`Importación exitosa: ${newList.count} leads inyectados.`, 'success', 'Data Sync');
    }
  };

  const filteredLists = lists.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.id.includes(searchTerm)
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Layers className="mr-4 text-blue-400" size={32} />
            Data Ingestion & Lists
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Gestión de inventario de prospectos y control de inyección al hopper.</p>
        </div>
        <div className="flex items-center space-x-4">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
             <input 
              type="text" 
              placeholder="Buscar por nombre o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all w-72 shadow-inner"
             />
          </div>
          <button 
            onClick={handleFileButtonClick}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 group font-black text-xs uppercase tracking-widest"
          >
            <Upload size={20} className="group-hover:-translate-y-0.5 transition-transform" />
            <span>Importar CSV</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div 
            className={`h-full glass border-2 border-dashed rounded-[48px] flex flex-col items-center justify-center p-12 transition-all relative overflow-hidden ${
              dragActive ? 'border-blue-500 bg-blue-500/10 scale-[1.02]' : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
          >
            {isUploading && (
              <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center space-y-6">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
                    <RefreshCw size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400 animate-pulse" />
                 </div>
                 <p className="text-xs font-black text-white uppercase tracking-[0.3em]">Procesando registros...</p>
              </div>
            )}

            <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleFileChange} />

            <div className="w-24 h-24 rounded-[32px] bg-blue-600/10 flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20 shadow-inner group-hover:scale-110 transition-transform">
              <FileSpreadsheet size={48} />
            </div>
            <h3 className="text-xl font-black mb-3 text-center text-white uppercase tracking-tight">Carga Maestra de Leads</h3>
            <p className="text-[10px] text-slate-500 text-center mb-10 leading-relaxed font-black uppercase tracking-widest max-w-[200px]">
              Arrastra tu archivo CSV optimizado para Vicidial Pro. <br/>Límite: 500k registros.
            </p>
            <button 
              onClick={handleFileButtonClick}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-10 py-4 rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] border-2 border-slate-800 transition-all shadow-xl active:scale-95"
            >
              Explorar Storage
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="glass rounded-[48px] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col">
             <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center">
               <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400">
                    <Database size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white uppercase tracking-tight">Inventario de Listas</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Sincronización en tiempo real con el Dialer</p>
                  </div>
               </div>
               <div className="flex items-center space-x-2 bg-slate-950 px-4 py-2 rounded-full border border-slate-800 shadow-inner">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Live Engine</span>
               </div>
             </div>

             <div className="divide-y divide-slate-800/40">
               {filteredLists.map(list => (
                 <div key={list.id} className="p-8 flex items-center justify-between hover:bg-blue-600/5 transition-all group relative overflow-hidden">
                   {list.active && (
                     <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_#10b981]"></div>
                   )}
                   
                   <div className="flex items-center space-x-8 z-10">
                     <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center border-2 transition-all group-hover:scale-105 duration-500 ${
                       list.active 
                         ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/5' 
                         : 'bg-slate-900 border-slate-800 text-slate-600 grayscale'
                     }`}>
                       {list.active ? <Activity size={32} /> : <XCircle size={32} />}
                     </div>
                     
                     <div className="space-y-1">
                       <div className="flex items-center space-x-3">
                         <h4 className={`font-black text-lg uppercase tracking-tight transition-colors ${list.active ? 'text-white' : 'text-slate-500'}`}>
                           {list.name}
                         </h4>
                         {list.active && (
                           <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase border border-emerald-500/20 animate-pulse">
                             Live
                           </span>
                         )}
                       </div>
                       <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span className="text-blue-500">ID: {list.id}</span>
                          <span className="mx-3 opacity-30">|</span>
                          <span>Campaña: <span className={list.campaign !== 'None' ? 'text-slate-300' : 'text-rose-500/60'}>{list.campaign}</span></span>
                          <span className="mx-3 opacity-30">|</span>
                          <span className="flex items-center">
                            <Clock size={10} className="mr-1.5" /> {list.lastCall}
                          </span>
                       </div>
                     </div>
                   </div>

                   <div className="flex items-center space-x-6 z-10">
                     <div className="text-right mr-6">
                       <div className={`font-black text-2xl tracking-tighter ${list.active ? 'text-white' : 'text-slate-600'}`}>
                         {list.count.toLocaleString()}
                       </div>
                       <div className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Registros</div>
                     </div>
                     
                     <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <button 
                          onClick={() => handleExportList(list)}
                          disabled={isExporting}
                          className="p-4 bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:border-emerald-500 text-slate-400 hover:text-white rounded-[20px] transition-all shadow-xl active:scale-90"
                          title="Exportar a CSV"
                        >
                          {isExporting ? <RefreshCw className="animate-spin" size={20} /> : <FileDown size={20} />}
                        </button>
                        <button 
                          onClick={() => handleEdit(list)}
                          className="p-4 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:border-blue-500 text-slate-400 hover:text-white rounded-[20px] transition-all shadow-xl active:scale-90"
                          title="Configuración"
                        >
                          <Edit2 size={20} />
                        </button>
                        <button 
                          onClick={() => handleDelete(list.id)}
                          className="p-4 bg-slate-900 border border-slate-800 hover:bg-rose-600 hover:border-rose-500 text-slate-400 hover:text-white rounded-[20px] transition-all shadow-xl active:scale-90"
                          title="Eliminar Lista"
                        >
                          <Trash2 size={20} />
                        </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="p-8 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                 Mostrando {filteredLists.length} bases de datos de un total de {lists.length} registradas.
               </p>
               <div className="flex space-x-2">
                  <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"><ChevronRight size={18} className="rotate-180" /></button>
                  <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all"><ChevronRight size={18} /></button>
               </div>
             </div>
          </div>

          <div className="p-10 glass rounded-[48px] border border-amber-500/20 bg-amber-500/5 flex items-center space-x-8 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 text-amber-500 pointer-events-none group-hover:scale-110 transition-transform">
              <AlertTriangle size={120} />
            </div>
            <div className="w-20 h-20 rounded-[28px] bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20 shadow-lg">
              <AlertCircle size={40} />
            </div>
            <div className="flex-1">
              <h4 className="font-black text-xl text-white uppercase tracking-tight">Protocolo de Limpieza</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium uppercase tracking-wider">
                Utiliza el motor de limpieza para eliminar duplicados entre listas o cruzar datos con el <span className="text-amber-400 font-black">Global DNC Registry</span>.
              </p>
            </div>
            <button className="bg-slate-950 text-amber-500 px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] border-2 border-amber-500/20 hover:bg-amber-500 hover:text-black transition-all shadow-xl z-10 active:scale-95">
              Deep Clean Sync
            </button>
          </div>
        </div>
      </div>

      {isModalOpen && editingList && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
               <div className="flex items-center space-x-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                     <Edit2 size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Propiedades de la Lista</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Configuración del Dialer Context</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl">
                 <X size={24} />
               </button>
            </div>
            <div className="p-12 space-y-10">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Nombre Descriptivo</label>
                 <input 
                   type="text" 
                   value={editingList.name}
                   onChange={(e) => setEditingList({...editingList, name: e.target.value})}
                   className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
                 />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Campaña Asignada</label>
                    <input 
                      type="text" 
                      value={editingList.campaign}
                      onChange={(e) => setEditingList({...editingList, campaign: e.target.value})}
                      className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-mono outline-none focus:border-blue-500 transition-all shadow-inner"
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-2">Estado Inyección</label>
                    <div className="flex bg-slate-950 p-2 rounded-[28px] border-2 border-slate-800 shadow-inner">
                       <button 
                        onClick={() => setEditingList({...editingList, active: true})}
                        className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${editingList.active ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}
                       >
                         Activa
                       </button>
                       <button 
                        onClick={() => setEditingList({...editingList, active: false})}
                        className={`flex-1 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${!editingList.active ? 'bg-rose-600 text-white shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}
                       >
                         Inactiva
                       </button>
                    </div>
                  </div>
               </div>
            </div>
            <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end">
               <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group"
               >
                 {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                 <span>{isSaving ? 'Sincronizando' : 'Guardar y Aplicar'}</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListsManagement;