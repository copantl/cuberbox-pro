import React, { useState, useMemo } from 'react';
import { 
  Music, Search, Plus, Play, Pause, Trash2, Edit2, X, Save, 
  RefreshCw, Volume2, Clock, Database, ChevronRight, Filter,
  ShieldCheck, ShieldAlert, Download, MoreVertical, Sliders,
  Headphones, Info, CheckCircle2, AlertTriangle, Zap, Mic
} from 'lucide-react';
import { AudioAsset, User } from '../types';
import { MOCK_AUDIO_ASSETS, MOCK_CAMPAIGNS, MOCK_USER } from '../constants';
import { useToast } from '../ToastContext';

interface AudioLibraryProps {
  user?: User;
}

const AudioLibrary: React.FC<AudioLibraryProps> = ({ user = MOCK_USER }) => {
  const { toast } = useToast();
  const [audios, setAudios] = useState<AudioAsset[]>(MOCK_AUDIO_ASSETS);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<Partial<AudioAsset> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Audio Player State
  const [activeAudio, setActiveAudio] = useState<AudioAsset | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const filteredAudios = useMemo(() => {
    return audios.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = categoryFilter === "ALL" || a.category === categoryFilter;
      return matchSearch && matchCat;
    });
  }, [audios, searchTerm, categoryFilter]);

  const handleOpenModal = (audio?: AudioAsset) => {
    if (audio) {
      setEditingAudio({ ...audio });
    } else {
      setEditingAudio({
        id: `aud_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        campaignId: MOCK_CAMPAIGNS[0].id,
        category: 'IVR_PROMPT',
        minAccessLevel: 1,
        format: 'WAV',
        size: '0.0 MB',
        duration: '0:00',
        createdAt: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingAudio?.name) {
      toast('El nombre del activo es obligatorio.', 'error');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    
    const isExisting = audios.find(a => a.id === editingAudio.id);
    const finalAudio = editingAudio as AudioAsset;

    if (isExisting) {
      setAudios(audios.map(a => a.id === finalAudio.id ? finalAudio : a));
      toast('Activo de voz actualizado.', 'success');
    } else {
      setAudios([...audios, finalAudio]);
      toast('Nuevo audio cargado en el switch.', 'success');
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const audio = audios.find(a => a.id === id);
    if (user.userLevel < (audio?.minAccessLevel || 0)) {
      toast('No tienes nivel de autoridad suficiente para eliminar este recurso.', 'error');
      return;
    }
    if (confirm('¿Eliminar permanentemente este audio de los servidores SIP?')) {
      setAudios(audios.filter(a => a.id !== id));
      toast('Recurso liberado.', 'warning');
    }
  };

  const togglePlayback = (audio: AudioAsset) => {
    if (user.userLevel < audio.minAccessLevel) {
       toast('Acceso restringido: Se requiere Nivel ' + audio.minAccessLevel, 'error', 'Seguridad de Activos');
       return;
    }
    if (activeAudio?.id === audio.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudio(audio);
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Volume2 className="mr-4 text-blue-400" size={36} />
            Sonic Vault & Voice Library
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Gestión de activos de audio, prompts y grabaciones con control de acceso.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Buscar audio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all w-72 shadow-inner font-bold"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 group"
          >
            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
            <span>Subir Audio</span>
          </button>
        </div>
      </div>

      {/* Categorías & Filtros */}
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-4">
         <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            {[
              { id: 'ALL', label: 'Todos' },
              { id: 'IVR_PROMPT', label: 'Prompts IVR' },
              { id: 'CAMPAIGN_AD', label: 'Cuñas Campaña' },
              { id: 'AGENT_RECORDING', label: 'Grabaciones' },
              { id: 'VOICEMAIL_DROP', label: 'Voicemail Drops' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === cat.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-900 text-slate-500 hover:text-slate-300'}`}
              >
                {cat.label}
              </button>
            ))}
         </div>
         <div className="flex items-center text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <Zap size={14} className="mr-2 text-amber-500" />
            Sincronización SIP: Nominal
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredAudios.map((audio) => {
          const isRestricted = user.userLevel < audio.minAccessLevel;
          const campaign = MOCK_CAMPAIGNS.find(c => c.id === audio.campaignId);
          
          return (
            <div key={audio.id} className={`glass p-8 rounded-[40px] border border-slate-700/50 flex flex-col h-full hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group ${isRestricted ? 'opacity-70 grayscale' : ''}`}>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                 <div className={`p-4 rounded-2xl bg-slate-950 border border-slate-800 text-blue-400 group-hover:scale-110 transition-transform`}>
                    <Mic size={24} />
                 </div>
                 <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                       <button onClick={() => handleOpenModal(audio)} className="p-2 bg-slate-900 border border-slate-800 hover:bg-blue-600 text-white rounded-lg transition-all"><Edit2 size={14} /></button>
                       <button onClick={() => handleDelete(audio.id)} className="p-2 bg-slate-900 border border-slate-800 hover:bg-rose-600 text-white rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                    <div className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${isRestricted ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                       LVL {audio.minAccessLevel}+
                    </div>
                 </div>
              </div>

              <div className="space-y-1 mb-8 relative z-10">
                 <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">{audio.name}</h3>
                 <div className="flex items-center text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                    <Database size={12} className="mr-2" /> {campaign?.name || 'Sistema Global'}
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                 <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Duración</p>
                    <p className="text-sm font-black text-white font-mono">{audio.duration}</p>
                 </div>
                 <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-1">
                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Formato</p>
                    <p className="text-sm font-black text-blue-400 font-mono">{audio.format}</p>
                 </div>
              </div>

              <button 
                onClick={() => togglePlayback(audio)}
                className={`mt-auto w-full py-4 rounded-[24px] flex items-center justify-center space-x-3 transition-all font-black text-[10px] uppercase tracking-[0.2em] shadow-xl ${
                  activeAudio?.id === audio.id && isPlaying 
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30 animate-pulse' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                }`}
              >
                 {activeAudio?.id === audio.id && isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                 <span>{activeAudio?.id === audio.id && isPlaying ? 'Pausar Escucha' : 'Reproducir'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Master Player */}
      {activeAudio && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl z-[150] px-6 animate-in slide-in-from-bottom-10 duration-500">
           <div className="glass p-8 rounded-[48px] border-2 border-blue-500/30 shadow-[0_0_100px_rgba(59,130,246,0.2)] bg-[#020617]/95 flex items-center space-x-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-500/5 animate-pulse"></div>
              
              <div className="flex items-center space-x-6 relative z-10">
                 <div className="w-16 h-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-white shadow-2xl">
                    <Headphones size={32} />
                 </div>
                 <div className="min-w-0">
                    <h4 className="text-white font-black uppercase text-lg truncate tracking-tighter">{activeAudio.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{activeAudio.category} • {activeAudio.format}</p>
                 </div>
              </div>

              <div className="flex-1 flex items-center space-x-8 relative z-10 px-4">
                 <button onClick={() => setIsPlaying(!isPlaying)} className="p-5 rounded-[24px] bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 transition-all active:scale-90">
                    {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                 </button>
                 
                 <div className="flex-1 space-y-3">
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner cursor-pointer relative group/bar">
                       <div className="h-full bg-blue-500 shadow-[0_0_15px_#3b82f6] transition-all" style={{ width: isPlaying ? '65%' : '0%' }}></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono font-black text-slate-600 tracking-tighter">
                       <span>{isPlaying ? '0:08' : '0:00'}</span>
                       <span className="text-slate-400">{activeAudio.duration}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center space-x-6 relative z-10 border-l border-slate-800/50 pl-10">
                 <div className="flex flex-col items-center space-y-1">
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Speed</span>
                    <select 
                      value={playbackSpeed} 
                      onChange={e => setPlaybackSpeed(parseFloat(e.target.value))}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[10px] font-black text-blue-400 outline-none cursor-pointer"
                    >
                       <option value="0.5">0.5x</option>
                       <option value="1">1.0x</option>
                       <option value="1.5">1.5x</option>
                       <option value="2">2.0x</option>
                    </select>
                 </div>
                 <button onClick={() => toast('Descarga de activo iniciada.', 'info')} className="p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-white border border-slate-800 transition-all shadow-lg active:scale-95">
                    <Download size={20} />
                 </button>
                 <button onClick={() => setActiveAudio(null)} className="p-4 rounded-2xl bg-slate-900 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 border border-slate-800 transition-all shadow-lg active:scale-95">
                    <X size={20} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Modal CRUD Audio */}
      {isModalOpen && editingAudio && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Music size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Audio Ingestion</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Carga de activos para el motor FreeSwitch</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700">
                  <X size={24} />
                </button>
             </div>

             <div className="p-12 overflow-y-auto space-y-12 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Detalles del Activo</h4>
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Descriptivo (Slug)</label>
                            <input type="text" value={editingAudio.name} onChange={e => setEditingAudio({...editingAudio, name: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" placeholder="Ej: intro_ventas_florida_v2" />
                         </div>
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Categoría</label>
                               <select value={editingAudio.category} onChange={e => setEditingAudio({...editingAudio, category: e.target.value as any})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 py-5 text-xs text-white font-bold outline-none focus:border-blue-500 appearance-none">
                                  <option value="IVR_PROMPT">IVR PROMPT</option>
                                  <option value="CAMPAIGN_AD">CAMPAIGN AD</option>
                                  <option value="AGENT_RECORDING">RECORDING</option>
                                  <option value="VOICEMAIL_DROP">VM DROP</option>
                               </select>
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Campaña Vinculada</label>
                               <select value={editingAudio.campaignId} onChange={e => setEditingAudio({...editingAudio, campaignId: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 py-5 text-xs text-white font-bold outline-none focus:border-blue-500 appearance-none">
                                  {MOCK_CAMPAIGNS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                               </select>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Seguridad & Red</h4>
                      <div className="space-y-8">
                         <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] space-y-6 shadow-inner">
                            <div className="flex justify-between items-center">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel Mínimo de Autoridad</label>
                               <span className="text-xl font-black text-emerald-400 font-mono">LVL {editingAudio.minAccessLevel}</span>
                            </div>
                            <input 
                              type="range" min="1" max="9" step="1"
                              value={editingAudio.minAccessLevel}
                              onChange={(e) => setEditingAudio({...editingAudio, minAccessLevel: parseInt(e.target.value)})}
                              className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                            />
                            <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-widest">
                               <span>Público Operativo</span>
                               <span>Solo Administradores Root</span>
                            </div>
                         </div>

                         <div className="border-4 border-dashed border-slate-800 rounded-[40px] p-12 flex flex-col items-center justify-center text-center space-y-4 group hover:border-blue-500/40 transition-all cursor-pointer bg-slate-950/20">
                            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-700 group-hover:scale-110 group-hover:text-blue-500 transition-all">
                               <Download size={32} />
                            </div>
                            <div>
                               <p className="text-[10px] font-black text-white uppercase tracking-widest">Sincronizar Archivo</p>
                               <p className="text-[8px] text-slate-600 font-bold uppercase mt-1">WAV (8khz/16-bit Mono) Recomendado</p>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-6 shadow-2xl">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                   <ShieldCheck size={16} />
                   <span>Codificación SIP Sincronizada</span>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group">
                   {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSaving ? 'Guardando' : 'Sellar Activo'}</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioLibrary;