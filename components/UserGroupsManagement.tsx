
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Plus, ShieldCheck, Info, Save, Trash2, Edit2, X, RefreshCw,
  Zap, Headphones, BarChart3, Database, Radio, GitMerge, Bot, Shield, Cpu, Target,
  Smartphone, Users, UserPlus, UserMinus, Search, ChevronRight, Fingerprint,
  Lock, Key, Activity, Award, Star, UserCheck, Layers, Mic
} from 'lucide-react';
import { UserGroup, User, UserRole } from '../types';
import { MOCK_USER_GROUPS, MOCK_USERS_LIST } from '../constants';
import { useToast } from '../ToastContext';

const UserGroupsManagement: React.FC = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<UserGroup[]>(MOCK_USER_GROUPS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS_LIST);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERMISSIONS' | 'MEMBERS'>('PERMISSIONS');
  const [editingGroup, setEditingGroup] = useState<Partial<UserGroup> & { memberIds?: string[] } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleOpenModal = (group?: UserGroup) => {
    setActiveTab('PERMISSIONS');
    if (group) {
      const memberIds = users.filter(u => u.groupId === group.id).map(u => u.id);
      setEditingGroup({ ...group, memberIds });
    } else {
      setEditingGroup({
        id: `g_${Math.random().toString(36).substr(2, 5)}`,
        name: '',
        description: '',
        accessLevel: 1,
        permissions: {
          canRecord: true,
          canManualDial: false,
          canExportReports: false,
          canDeleteLeads: false,
          canChangeCampaign: false,
          canViewAgentStats: true,
          canBargeCalls: false,
          canManageDNC: false,
          canUseAICopilot: true,
          canModifyWorkflows: false
        },
        memberIds: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingGroup?.name) {
      toast('El nombre del grupo es mandatorio.', 'error');
      return;
    }
    setIsSaving(true);
    
    // Simulación de propagación al clúster FreeSwitch y Postgres
    await new Promise(resolve => setTimeout(resolve, 1800));

    const finalGroup = {
      id: editingGroup.id,
      name: editingGroup.name,
      description: editingGroup.description,
      accessLevel: editingGroup.accessLevel,
      permissions: editingGroup.permissions,
      memberIds: editingGroup.memberIds
    } as UserGroup;

    // Actualizar estados
    setGroups(prev => {
      const exists = prev.find(g => g.id === finalGroup.id);
      return exists ? prev.map(g => g.id === finalGroup.id ? finalGroup : g) : [...prev, finalGroup];
    });

    const updatedUsers = users.map(u => {
      if (editingGroup.memberIds?.includes(u.id)) {
        return { ...u, groupId: finalGroup.id, userLevel: finalGroup.accessLevel };
      } else if (u.groupId === finalGroup.id) {
        return { ...u, groupId: undefined };
      }
      return u;
    });
    setUsers(updatedUsers);

    setIsSaving(false);
    setIsModalOpen(false);
    setEditingGroup(null);
    toast(`Clúster sincronizado. Grupo "${finalGroup.name}" actualizado.`, 'success', 'Infrastructure Sync');
  };

  const togglePermission = (key: keyof UserGroup['permissions']) => {
    if (!editingGroup?.permissions) return;
    setEditingGroup({
      ...editingGroup,
      permissions: { ...editingGroup.permissions, [key]: !editingGroup.permissions[key] }
    });
  };

  const toggleMember = (userId: string) => {
    if (!editingGroup) return;
    const currentMembers = editingGroup.memberIds || [];
    const isMember = currentMembers.includes(userId);
    
    setEditingGroup({
      ...editingGroup,
      memberIds: isMember 
        ? currentMembers.filter(id => id !== userId) 
        : [...currentMembers, userId]
    });
  };

  const PermissionToggle = ({ label, value, icon: Icon, onToggle }: { label: string, value: boolean, icon: any, onToggle: () => void }) => (
    <div className="flex items-center justify-between p-5 rounded-[28px] bg-slate-900 border border-slate-800 hover:border-blue-500/30 transition-all group">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-2xl transition-all ${value ? 'bg-blue-600/10 text-blue-400' : 'bg-slate-950 text-slate-700'}`}>
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-200">{label}</span>
      </div>
      <button 
        onClick={onToggle}
        className={`w-14 h-7 rounded-full relative transition-all duration-500 ${value ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-slate-800'}`}
      >
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-md ${value ? 'right-1' : 'left-1'}`}></div>
      </button>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Layers className="mr-4 text-blue-500" size={36} />
            Gestión de Grupos de Perfiles
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configuración centralizada de autoridad para la fuerza de ventas.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 group"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform" />
          <span>Nuevo Grupo de Red</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {groups.map((group) => {
          const groupMembersCount = users.filter(u => u.groupId === group.id).length;
          return (
            <div key={group.id} className="glass p-10 rounded-[56px] border border-slate-700/50 flex flex-col h-full hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-10 opacity-5 text-blue-400 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <Shield size={200} />
              </div>
              
              <div className="flex justify-between items-start mb-10 relative z-10">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-[28px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">{group.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                       <span className="bg-blue-600 text-white px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Lvl {group.accessLevel}</span>
                       <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic">Production Profile</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button onClick={() => handleOpenModal(group)} className="p-3 bg-slate-900 border border-slate-800 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-xl"><Edit2 size={18} /></button>
                  <button onClick={() => setGroups(groups.filter(g => g.id !== group.id))} className="p-3 bg-slate-900 border border-slate-800 hover:bg-rose-600 hover:text-white rounded-2xl transition-all shadow-xl"><Trash2 size={18} /></button>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed mb-8 relative z-10 min-h-[40px]">
                {group.description || 'Sin descripción técnica registrada.'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10 relative z-10">
                <div className="p-5 bg-slate-950/60 rounded-[32px] border border-slate-800 space-y-1">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Membresía</p>
                   <div className="flex items-center space-x-3">
                      <Users size={16} className="text-blue-500" />
                      <span className="text-2xl font-black text-white font-mono">{groupMembersCount}</span>
                   </div>
                </div>
                <div className="p-5 bg-slate-950/60 rounded-[32px] border border-slate-800 space-y-1">
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Privilegios</p>
                   <div className="flex items-center space-x-3">
                      <Zap size={16} className="text-emerald-500" />
                      <span className="text-2xl font-black text-white font-mono">
                        {Object.values(group.permissions).filter(v => v).length}
                      </span>
                   </div>
                </div>
              </div>

              <div className="mt-auto pt-8 border-t border-slate-800/50 flex items-center justify-between relative z-10">
                 <div className="flex -space-x-3">
                    {users.filter(u => u.groupId === group.id).slice(0, 4).map(u => (
                      <div key={u.id} className="w-10 h-10 rounded-full border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px] font-black text-blue-400 shadow-xl overflow-hidden" title={u.fullName}>
                        {u.fullName.charAt(0)}
                      </div>
                    ))}
                    {groupMembersCount > 4 && (
                      <div className="w-10 h-10 rounded-full border-4 border-[#0f172a] bg-blue-600 flex items-center justify-center text-[10px] font-black text-white shadow-xl">
                        +{groupMembersCount - 4}
                      </div>
                    )}
                 </div>
                 <button onClick={() => handleOpenModal(group)} className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-[0.2em] flex items-center group/btn">
                   Ver Detalles <ChevronRight size={14} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && editingGroup && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl glass rounded-[64px] border border-slate-700/50 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
             
             {isSaving && (
               <div className="absolute inset-0 z-[160] bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center space-y-6 text-center p-10">
                  <RefreshCw className="text-blue-500 animate-spin" size={48} />
                  <h3 className="text-2xl font-black text-white uppercase tracking-[0.3em]">Propagando Cambios al Clúster...</h3>
               </div>
             )}

             <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg shrink-0">
                <div className="flex items-center space-x-6">
                   <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                      <Award size={32} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Editor de Perfil Grupal</h3>
                      <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1 italic">Enterprise Governance v3.1</p>
                   </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl">
                  <X size={24} />
                </button>
             </div>

             <div className="bg-slate-900/40 px-10 pt-4 flex space-x-10 border-b border-slate-800 shrink-0">
                {[
                  { id: 'PERMISSIONS', label: 'Estructura de Autoridad', icon: ShieldAlert },
                  { id: 'MEMBERS', label: 'Vincular Usuarios', icon: Users }
                ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-3 pb-5 text-[11px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-600 hover:text-slate-400'}`}
                  >
                    <tab.icon size={16} />
                    <span>{tab.label}</span>
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
                {activeTab === 'PERMISSIONS' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex items-center">
                           <Fingerprint size={14} className="mr-2" /> Identidad Operativa
                        </h4>
                        <div className="space-y-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre del Grupo</label>
                              <input 
                                type="text" 
                                value={editingGroup.name} 
                                onChange={e => setEditingGroup({...editingGroup, name: e.target.value})} 
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 shadow-inner" 
                                placeholder="Ej: Elite Closing Team" 
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Descripción Técnica</label>
                              <textarea 
                                value={editingGroup.description} 
                                onChange={e => setEditingGroup({...editingGroup, description: e.target.value})} 
                                className="w-full bg-slate-950 border-2 border-slate-800 rounded-[28px] px-8 py-5 text-sm text-slate-300 h-28 resize-none outline-none focus:border-blue-500 shadow-inner leading-relaxed" 
                                placeholder="Define el propósito de este grupo..." 
                              />
                           </div>
                           <div className="p-8 bg-slate-900 border-2 border-slate-800 rounded-[40px] space-y-6 shadow-inner relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-8 opacity-5 text-blue-400 pointer-events-none"><Shield size={120} /></div>
                              <div className="flex justify-between items-center relative z-10">
                                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Peso de Autoridad Master</label>
                                 <span className="text-2xl font-black text-blue-400 font-mono">LVL {editingGroup.accessLevel}</span>
                              </div>
                              <input 
                                type="range" min="1" max="9" step="1"
                                value={editingGroup.accessLevel}
                                onChange={(e) => setEditingGroup({...editingGroup, accessLevel: parseInt(e.target.value)})}
                                className="w-full h-2 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-blue-500 relative z-10" 
                              />
                              <div className="flex justify-between text-[8px] font-black text-slate-700 uppercase tracking-widest relative z-10">
                                 <span>Agente Base</span>
                                 <span>Administración Root</span>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4 flex items-center">
                           <Zap size={14} className="mr-2" /> Matriz de Habilidades
                        </h4>
                        <div className="space-y-3 pr-2 overflow-y-auto max-h-[550px] scrollbar-hide">
                           <PermissionToggle icon={Mic} label="Grabar interacciones" value={editingGroup.permissions?.canRecord || false} onToggle={() => togglePermission('canRecord')} />
                           <PermissionToggle icon={Smartphone} label="Habilitar Marcación Manual" value={editingGroup.permissions?.canManualDial || false} onToggle={() => togglePermission('canManualDial')} />
                           <PermissionToggle icon={BarChart3} label="Exportar Reportes CDR" value={editingGroup.permissions?.canExportReports || false} onToggle={() => togglePermission('canExportReports')} />
                           <PermissionToggle icon={Trash2} label="Purga Forense de Leads" value={editingGroup.permissions?.canDeleteLeads || false} onToggle={() => togglePermission('canDeleteLeads')} />
                           <PermissionToggle icon={Radio} label="Gestionar Campañas" value={editingGroup.permissions?.canChangeCampaign || false} onToggle={() => togglePermission('canChangeCampaign')} />
                           <PermissionToggle icon={Headphones} label="Escucha Silenciosa (Barge)" value={editingGroup.permissions?.canBargeCalls || false} onToggle={() => togglePermission('canBargeCalls')} />
                           <PermissionToggle icon={Shield} label="Modificar DNC Blacklist" value={editingGroup.permissions?.canManageDNC || false} onToggle={() => togglePermission('canManageDNC')} />
                           <PermissionToggle icon={Bot} label="Acceso a IA Neural" value={editingGroup.permissions?.canUseAICopilot || false} onToggle={() => togglePermission('canUseAICopilot')} />
                           <PermissionToggle icon={GitMerge} label="Modificar Workflows" value={editingGroup.permissions?.canModifyWorkflows || false} onToggle={() => togglePermission('canModifyWorkflows')} />
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                     <div className="flex items-center justify-between px-2">
                        <div className="flex-1">
                           <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Usuarios Disponibles en el Nodo</h4>
                           <p className="text-[10px] text-slate-500 font-bold uppercase mt-2">Los usuarios marcados heredarán el perfil de este grupo automáticamente.</p>
                        </div>
                        <div className="relative w-72 ml-10">
                           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                           <input 
                             type="text" 
                             placeholder="Filtrar por nombre..." 
                             value={searchTerm}
                             onChange={e => setSearchTerm(e.target.value)}
                             className="w-full bg-slate-950 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3 text-[10px] text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner"
                           />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase())).map(u => {
                          const isMember = editingGroup.memberIds?.includes(u.id);
                          return (
                            <div 
                              key={u.id}
                              onClick={() => toggleMember(u.id)}
                              className={`p-6 rounded-[32px] border-2 cursor-pointer transition-all flex items-center justify-between group ${isMember ? 'bg-blue-600/10 border-blue-500 shadow-lg' : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'}`}
                            >
                               <div className="flex items-center space-x-5">
                                  <div className={`w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center font-black text-blue-400 border border-slate-700 shadow-inner group-hover:scale-110 transition-transform`}>
                                     {u.fullName.charAt(0)}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-white uppercase tracking-tight">{u.fullName}</p>
                                     <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Ext: {u.extension} • Lvl: {u.userLevel}</p>
                                  </div>
                               </div>
                               <div className={`p-3 rounded-xl transition-all ${isMember ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-950 text-slate-800'}`}>
                                  {isMember ? <UserCheck size={18} /> : <UserPlus size={18} />}
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </div>
                )}
             </div>

             <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end items-center space-x-6 shadow-2xl">
                <div className="flex items-center space-x-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-60">
                   <ShieldCheck size={16} className="text-emerald-500" />
                   <span>Cifrado SHA-256 Sincronizado</span>
                </div>
                <button 
                  onClick={handleSave} 
                  disabled={isSaving} 
                  className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-14 py-6 rounded-[32px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50 group"
                >
                   {isSaving ? <RefreshCw className="animate-spin" size={22} /> : <Save size={22} className="group-hover:scale-110 transition-transform" />}
                   <span>{isSaving ? 'Propagando...' : 'Sellar y Aplicar'}</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserGroupsManagement;
