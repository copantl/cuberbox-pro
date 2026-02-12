import React, { useState } from 'react';
import { 
  Plus, ShieldCheck, Shield, Edit2, Trash2, X, Save, RefreshCw, 
  Bot, Headphones, Zap, Database, ArrowRight, UserPlus, Info,
  Trophy, Star, Key, Eye, EyeOff, Layout, ListChecks, Radio, Sliders
} from 'lucide-react';
import { UserProfile } from '../types';
import { MOCK_USER_PROFILES } from '../constants';
import { useToast } from '../ToastContext';

const UserProfilesManagement: React.FC = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>(MOCK_USER_PROFILES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Partial<UserProfile> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (profile?: UserProfile) => {
    if (profile) {
      setEditingProfile({ ...profile });
    } else {
      setEditingProfile({
        id: `prof_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        description: '',
        accessLevel: 1,
        userCount: 0,
        color: 'blue',
        permissions: {
          canBarge: false,
          canWhisper: false,
          canDeleteLeads: false,
          canExportReports: false,
          canModifyCampaigns: false,
          canUseAI: true,
          canManageDNC: false,
          canRecord: true
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingProfile?.name) {
      toast('El nombre del perfil es obligatorio.', 'error');
      return;
    }
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1000));

    const isExisting = profiles.find(p => p.id === editingProfile.id);
    const finalProfile = editingProfile as UserProfile;

    if (isExisting) {
      setProfiles(profiles.map(p => p.id === finalProfile.id ? finalProfile : p));
      toast('Perfil actualizado exitosamente.', 'success');
    } else {
      setProfiles([...profiles, finalProfile]);
      toast('Nuevo perfil creado y disponible.', 'success');
    }

    setIsSaving(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) {
      toast('Debe existir al menos un perfil en el sistema.', 'error');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este perfil? Los usuarios vinculados deberán ser reasignados.')) {
      setProfiles(profiles.filter(p => p.id !== id));
      toast('Perfil eliminado del sistema.', 'warning');
    }
  };

  const togglePermission = (key: keyof UserProfile['permissions']) => {
    if (!editingProfile?.permissions) return;
    setEditingProfile({
      ...editingProfile,
      permissions: {
        ...editingProfile.permissions,
        [key]: !editingProfile.permissions[key]
      }
    });
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'emerald': return 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400';
      case 'amber': return 'bg-amber-600/10 border-amber-500/20 text-amber-400';
      case 'rose': return 'bg-rose-600/10 border-rose-500/20 text-rose-400';
      case 'purple': return 'bg-purple-600/10 border-purple-500/20 text-purple-400';
      default: return 'bg-blue-600/10 border-blue-500/20 text-blue-400';
    }
  };

  const PermissionToggle = ({ label, value, icon: Icon, onToggle }: { label: string, value: boolean, icon: any, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-2xl group hover:border-blue-500/30 transition-all">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-xl transition-all ${value ? 'bg-blue-600/10 text-blue-400' : 'bg-slate-900 text-slate-700'}`}>
          <Icon size={16} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`w-12 h-6 rounded-full relative transition-all duration-500 ${value ? 'bg-blue-600' : 'bg-slate-700'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${value ? 'right-1' : 'left-1'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <UserPlus className="mr-4 text-blue-500" size={36} />
            Perfiles & Autoridad
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configura plantillas de capacidades operativas para tus colaboradores.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" />
          <span>Crear Perfil Master</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {profiles.map((profile) => (
          <div key={profile.id} className="glass p-10 rounded-[56px] border border-slate-700/50 flex flex-col h-full hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700`}>
              <Star size={200} />
            </div>

            <div className="flex justify-between items-start mb-8 relative z-10">
               <div className={`w-16 h-16 rounded-[28px] flex items-center justify-center border shadow-inner ${getColorClass(profile.color)}`}>
                  <ShieldCheck size={32} />
               </div>
               <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(profile)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-lg"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(profile.id)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-lg"><Trash2 size={18} /></button>
               </div>
            </div>

            <div className="space-y-2 relative z-10 mb-8">
               <h3 className="text-2xl font-black text-white uppercase tracking-tight">{profile.name}</h3>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">{profile.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
               <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-1">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Nivel de Acceso</p>
                  <div className="flex items-center space-x-2">
                     <span className="text-2xl font-black text-white font-mono">{profile.accessLevel}</span>
                     <div className="flex space-x-0.5">
                        {[...Array(9)].map((_, i) => (
                           <div key={i} className={`w-1 h-3 rounded-full ${profile.accessLevel > i ? 'bg-blue-500 shadow-[0_0_5px_#3b82f6]' : 'bg-slate-800'}`}></div>
                        ))}
                     </div>
                  </div>
               </div>
               <div className="p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-1">
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Usuarios</p>
                  <div className="flex items-baseline space-x-2">
                     <span className="text-2xl font-black text-white font-mono">{profile.userCount}</span>
                     <span className="text-[9px] text-slate-600 font-bold">Activos</span>
                  </div>
               </div>
            </div>

            <div className="mt-auto pt-8 border-t border-slate-800/50 flex flex-wrap gap-2 relative z-10">
               {profile.permissions.canBarge && <span className="text-[8px] font-black text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20 uppercase">Barge</span>}
               {profile.permissions.canUseAI && <span className="text-[8px] font-black text-purple-400 bg-purple-500/10 px-2 py-1 rounded-lg border border-purple-500/20 uppercase">Neural IA</span>}
               {profile.permissions.canModifyCampaigns && <span className="text-[8px] font-black text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20 uppercase">Admin Campaigns</span>}
               <span className="text-[8px] font-black text-slate-600 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 uppercase">+{Object.values(profile.permissions).filter(v => v).length} Reglas</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal CRUD Perfiles */}
      {isModalOpen && editingProfile && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Star size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Plantilla de Perfil</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Configuración Estructural de Capacidades</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700">
                  <X size={24} />
                </button>
             </div>

             <div className="p-12 overflow-y-auto space-y-12 scrollbar-hide">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Identidad del Rol</h4>
                      <div className="space-y-6">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                            <input type="text" value={editingProfile.name} onChange={e => setEditingProfile({...editingProfile, name: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" placeholder="Ej: Elite Closing Agent" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Propósito del Perfil</label>
                            <textarea value={editingProfile.description} onChange={e => setEditingProfile({...editingProfile, description: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-slate-300 h-32 resize-none outline-none focus:border-blue-500 shadow-inner" placeholder="Describe los alcances operativos..." />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-4 p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-inner">
                               <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Access LVL</label>
                                  <span className="text-xl font-black text-blue-400 font-mono">{editingProfile.accessLevel}</span>
                               </div>
                               <input 
                                 type="range" min="1" max="9" step="1"
                                 value={editingProfile.accessLevel}
                                 onChange={(e) => setEditingProfile({...editingProfile, accessLevel: parseInt(e.target.value)})}
                                 className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                               />
                            </div>
                            <div className="space-y-4 p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] shadow-inner">
                               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Atmósfera Visual</label>
                               <div className="flex space-x-3 mt-2">
                                  {['blue', 'emerald', 'amber', 'rose', 'purple'].map(c => (
                                     <button 
                                       key={c}
                                       onClick={() => setEditingProfile({...editingProfile, color: c})}
                                       className={`w-8 h-8 rounded-full border-4 transition-all ${editingProfile.color === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                                       style={{ backgroundColor: c === 'emerald' ? '#10b981' : c === 'amber' ? '#f59e0b' : c === 'rose' ? '#ef4444' : c === 'purple' ? '#8b5cf6' : '#3b82f6' }}
                                     />
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Matriz de Habilidades SIP</h4>
                      <div className="space-y-3 pr-2 overflow-y-auto max-h-[500px] scrollbar-hide">
                         <PermissionToggle icon={Headphones} label="Monitoreo Bridge (Listen)" value={editingProfile.permissions?.canBarge || false} onToggle={() => togglePermission('canBarge')} />
                         <PermissionToggle icon={Zap} label="Susurrar al Agente (Whisper)" value={editingProfile.permissions?.canWhisper || false} onToggle={() => togglePermission('canWhisper')} />
                         <PermissionToggle icon={Trash2} label="Purga de Leads" value={editingProfile.permissions?.canDeleteLeads || false} onToggle={() => togglePermission('canDeleteLeads')} />
                         <PermissionToggle icon={Layout} label="Exportación BI / CDR" value={editingProfile.permissions?.canExportReports || false} onToggle={() => togglePermission('canExportReports')} />
                         <PermissionToggle icon={Radio} label="Arquitectura de Campañas" value={editingProfile.permissions?.canModifyCampaigns || false} onToggle={() => togglePermission('canModifyCampaigns')} />
                         <PermissionToggle icon={Bot} label="Inyección Neuronal Gemini" value={editingProfile.permissions?.canUseAI || false} onToggle={() => togglePermission('canUseAI')} />
                         <PermissionToggle icon={Shield} label="Protocolo DNC Shield" value={editingProfile.permissions?.canManageDNC || false} onToggle={() => togglePermission('canManageDNC')} />
                         <PermissionToggle icon={Sliders} label="Grabación Forzada" value={editingProfile.permissions?.canRecord || false} onToggle={() => togglePermission('canRecord')} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-6 shadow-2xl">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                   <Key size={16} />
                   <span>Cifrado de Permisos Activo</span>
                </div>
                <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group">
                   {isSaving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSaving ? 'Sincronizando' : 'Sellar Perfil Master'}</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilesManagement;