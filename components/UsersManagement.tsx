
import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Plus, UserPlus, Filter, MoreVertical, Shield, Mail, Phone, 
  Trash2, Edit2, X, Save, ShieldCheck, User as UserIcon, Lock, 
  CheckCircle, AlertCircle, RefreshCw, Send, Key, Eye, EyeOff, Sparkles,
  Hash, Users, Layers, FileDown, Upload, Fingerprint
} from 'lucide-react';
import { User, UserRole, UserGroup } from '../types';
import { MOCK_USERS_LIST, MOCK_USER_GROUPS, MOCK_USER } from '../constants';
import { useToast } from '../ToastContext';
import MFAConfigurator from './MFAConfigurator';
import AccessControl from './AccessControl';

const UsersManagement: React.FC<{ currentUser?: User }> = ({ currentUser = MOCK_USER }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS_LIST);
  const [activeTab, setActiveTab] = useState<'ALL' | UserRole>('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<(Partial<User> & { password?: string, confirmPassword?: string, notifyOnSave?: boolean }) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPorting, setIsPorting] = useState(false);
  const [showPass, setShowPass] = useState(false);
  
  // MFA States
  const [mfaUser, setMfaUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesTab = activeTab === 'ALL' || user.role === activeTab;
      const matchesSearch = 
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.extension.includes(searchTerm);
      return matchesTab && matchesSearch;
    });
  }, [users, activeTab, searchTerm]);

  // Validación de seguridad adicional al cargar
  if (currentUser.userLevel < 9) {
     return <AccessControl userLevel={currentUser.userLevel} minLevel={9}>Restringido</AccessControl>;
  }

  const handleExportUsers = async () => {
    setIsPorting(true);
    toast('Generando backup de perfiles...', 'info', 'User Portability');
    await new Promise(r => setTimeout(r, 1200));
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(users, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "cuberbox_users_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setIsPorting(false);
    toast('Backup de usuarios descargado.', 'success');
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportUsers = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsPorting(true);
    toast('Validando estructura de datos...', 'info');
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (Array.isArray(json)) {
          await new Promise(r => setTimeout(r, 1500));
          setUsers([...json, ...users]);
          toast(`${json.length} usuarios enrolados masivamente.`, 'success');
        } else {
          throw new Error("Formato inválido");
        }
      } catch (err) {
        toast('Error: El archivo no cumple el esquema CUBERBOX.', 'error');
      } finally {
        setIsPorting(false);
      }
    };
    reader.readAsText(file);
  };

  const generateSecurePassword = () => {
    const charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";
    let retVal = "";
    for (let i = 0; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    if (editingUser) {
      setEditingUser({ ...editingUser, password: retVal, confirmPassword: retVal });
      setShowPass(true);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser({ ...user, password: '', confirmPassword: '', notifyOnSave: false });
    } else {
      setEditingUser({
        id: Math.random().toString(36).substr(2, 9),
        username: '',
        fullName: '',
        email: '',
        extension: '',
        role: UserRole.AGENT,
        userLevel: 1,
        groupId: '',
        status: 'offline',
        mfaEnabled: false,
        password: '',
        confirmPassword: '',
        notifyOnSave: true,
        authMethod: 'LOCAL'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingUser?.fullName || !editingUser?.email) {
      toast('Nombre y Email son obligatorios.', 'error');
      return;
    }
    
    if (editingUser.password && editingUser.password !== editingUser.confirmPassword) {
      toast('Las contraseñas no coinciden.', 'error');
      return;
    }

    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { password, confirmPassword, notifyOnSave, ...userData } = editingUser;
    const isExisting = users.find(u => u.id === editingUser.id);
    
    if (isExisting) {
      setUsers(users.map(u => u.id === editingUser.id ? userData as User : u));
      toast('Perfil de usuario actualizado correctamente.', 'success');
    } else {
      setUsers([userData as User, ...users]);
      toast('Nuevo usuario creado y enrolado en el sistema.', 'success');
    }

    setIsSaving(false);
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Atención: ¿Deseas eliminar permanentemente a este usuario?')) {
      setUsers(users.filter(u => u.id !== id));
      toast('Usuario eliminado de la base de datos.', 'warning');
    }
  };

  const handleMFAComplete = (secret: string) => {
    if (!mfaUser) return;
    setUsers(users.map(u => u.id === mfaUser.id ? { ...u, mfaEnabled: true, mfaSecret: secret } : u));
    setMfaUser(null);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      
      {mfaUser && (
        <MFAConfigurator 
          user={mfaUser} 
          onClose={() => setMfaUser(null)} 
          onComplete={handleMFAComplete}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Gestión de Usuarios</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Configuración de fuerza de trabajo y control de accesos individuales.</p>
        </div>
        <div className="flex items-center space-x-4">
          <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportUsers} />
          <div className="flex bg-slate-900 border-2 border-slate-800 p-1 rounded-2xl shadow-inner">
             <button 
              onClick={handleImportClick}
              disabled={isPorting}
              className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              title="Importar JSON"
             >
                <Upload size={20} />
             </button>
             <button 
              onClick={handleExportUsers}
              disabled={isPorting}
              className="p-3 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5"
              title="Exportar JSON"
             >
                <FileDown size={20} />
             </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border-2 border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs text-white outline-none focus:border-blue-500 transition-all w-72 shadow-inner"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
          >
            <UserPlus size={20} />
            <span className="font-black text-xs uppercase tracking-widest">Crear Usuario</span>
          </button>
        </div>
      </div>

      <div className="flex space-x-4 border-b border-slate-800/50 overflow-x-auto scrollbar-hide pb-px">
        {(['ALL', UserRole.AGENT, UserRole.MANAGER, UserRole.ADMIN] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-4 ${
              activeTab === tab 
                ? 'border-blue-500 text-blue-400' 
                : 'border-transparent text-slate-600 hover:text-slate-300'
            }`}
          >
            {tab === 'ALL' ? 'Todos' : tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredUsers.map((user) => {
          const group = MOCK_USER_GROUPS.find(g => g.id === user.groupId);
          return (
            <div key={user.id} className="glass p-8 rounded-[40px] border border-slate-700/40 hover:border-blue-500/40 transition-all group relative overflow-hidden flex flex-col shadow-xl">
              <div className="flex justify-between items-start mb-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-[24px] bg-slate-800 flex items-center justify-center text-2xl font-black text-blue-400 border border-slate-700 shadow-inner group-hover:scale-105 transition-all duration-500">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0f172a] shadow-2xl ${
                    user.status === 'online' ? 'bg-emerald-500' : user.status === 'oncall' ? 'bg-blue-500 animate-pulse' : user.status === 'paused' ? 'bg-amber-500' : 'bg-slate-700'
                  }`}></div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => setMfaUser(user)} 
                      className={`p-3 rounded-[18px] border border-slate-700 shadow-lg transition-all ${user.mfaEnabled ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30' : 'bg-slate-900/80 hover:bg-emerald-600 text-slate-400 hover:text-white'}`}
                      title="Configurar 2FA"
                    >
                      <Fingerprint size={16} />
                    </button>
                    <button onClick={() => handleOpenModal(user)} className="p-3 bg-slate-900/80 hover:bg-blue-600 text-blue-400 hover:text-white rounded-[18px] border border-slate-700 shadow-lg"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(user.id)} className="p-3 bg-slate-900/80 hover:bg-rose-600 text-rose-400 hover:text-white rounded-[18px] border border-slate-700 shadow-lg"><Trash2 size={16} /></button>
                  </div>
                  <div className="bg-slate-950 px-3 py-1 rounded-full border border-slate-800 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                    LVL {user.userLevel}
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <h3 className="font-black text-xl text-white tracking-tighter uppercase">{user.fullName}</h3>
                <div className="flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">
                  <Shield size={12} className="mr-2 text-blue-500" />
                  {user.role} <span className="mx-3 text-slate-800">•</span> <Hash size={12} className="mr-2" /> EXT. {user.extension}
                </div>
                {group && (
                  <div className="flex items-center text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-3">
                    <Users size={10} className="mr-2" /> {group.name}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-8 border-t border-slate-800/50 mt-auto">
                <div className="flex items-center text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-bold">
                  <Mail size={16} className="mr-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center text-xs text-slate-400 group-hover:text-slate-200 transition-colors font-mono">
                  <UserIcon size={16} className="mr-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  <span>@{user.username}</span>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {[1,2,3,4,5,6,7,8,9].map(level => (
                    <div key={level} className={`w-2 h-2 rounded-full transition-colors ${user.userLevel >= level ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-slate-800'}`}></div>
                  ))}
                </div>
                {user.mfaEnabled && (
                  <div className="flex items-center text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                     <ShieldCheck size={10} className="mr-1" /> Secure
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-4xl glass rounded-[64px] border border-slate-700/50 shadow-[0_0_150px_rgba(0,0,0,0.7)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shadow-lg">
               <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 rounded-[24px] bg-blue-600/10 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                     <UserIcon size={32} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Ficha de Perfil</h3>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mt-2">Personalización estructural y herencia de grupo</p>
                  </div>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-4 bg-slate-800 hover:bg-rose-500/10 rounded-[20px] text-slate-400 hover:text-rose-500 transition-all border border-slate-700 shadow-xl">
                 <X size={24} />
               </button>
            </div>

            <div className="p-12 overflow-y-auto space-y-12 scrollbar-hide">
               <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Configuración Core</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <input type="text" value={editingUser.fullName} onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 transition-all shadow-inner font-bold" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Grupo (Perfil Maestro)</label>
                        <div className="relative">
                          <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                          <select 
                            value={editingUser.groupId}
                            onChange={(e) => {
                              const selectedGrp = MOCK_USER_GROUPS.find(g => g.id === e.target.value);
                              setEditingUser({
                                ...editingUser, 
                                groupId: e.target.value, 
                                userLevel: selectedGrp?.accessLevel || editingUser.userLevel
                              });
                              toast(`El usuario ahora heredará el Nivel ${selectedGrp?.accessLevel}`, 'info');
                            }}
                            className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl pl-16 pr-6 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer"
                          >
                            <option value="">Seleccionar Grupo...</option>
                            {MOCK_USER_GROUPS.map(grp => <option key={grp.id} value={grp.id}>{grp.name} (Lvl {grp.accessLevel})</option>)}
                          </select>
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest ml-1">El nivel de acceso se sincronizará con el grupo elegido.</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Rol de Sistema</label>
                        <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value as UserRole})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-6 py-5 text-sm text-white font-bold outline-none focus:border-blue-500 appearance-none shadow-inner cursor-pointer">
                          {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Extensión SIP</label>
                        <input type="text" value={editingUser.extension} onChange={(e) => setEditingUser({...editingUser, extension: e.target.value})} className="w-full bg-slate-950 border-2 border-slate-800 rounded-3xl px-8 py-5 text-sm text-white font-mono outline-none focus:border-blue-500 shadow-inner" />
                      </div>
                      <div className="space-y-3">
                         <div className="flex justify-between items-center ml-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nivel de Acceso Manual</label>
                            <span className="text-xs font-black text-blue-400">LVL {editingUser.userLevel}</span>
                         </div>
                         <input 
                            type="range" min="1" max="9" step="1"
                            value={editingUser.userLevel}
                            onChange={(e) => setEditingUser({...editingUser, userLevel: parseInt(e.target.value)})}
                            className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500 mt-4" 
                         />
                      </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] border-b-2 border-slate-800 pb-4">Seguridad de Cuenta</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
                        <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                          <input type={showPass ? 'text' : 'password'} value={editingUser.password} onChange={(e) => setEditingUser({...editingUser, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl pl-16 pr-16 py-5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="••••••••" />
                          <button onClick={() => setShowPass(!showPass)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-400">{showPass ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center ml-1">
                           <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verificación</label>
                           <button onClick={generateSecurePassword} className="text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:underline flex items-center"><Sparkles size={14} className="mr-1.5" /> Generar</button>
                        </div>
                        <input type={showPass ? 'text' : 'password'} value={editingUser.confirmPassword} onChange={(e) => setEditingUser({...editingUser, confirmPassword: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-3xl px-6 py-5 text-sm text-white outline-none focus:border-blue-500 transition-all shadow-inner" placeholder="••••••••" />
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="p-8 bg-slate-900/60 rounded-[32px] border-2 border-slate-800 flex items-center justify-between group hover:border-blue-500/30 transition-all shadow-inner">
                        <div className="flex items-center space-x-5">
                           <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400"><ShieldCheck size={24} /></div>
                           <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-widest">MFA Requerido</h4>
                              <p className="text-[10px] text-slate-500 font-black uppercase mt-1">Obligar token al login</p>
                           </div>
                        </div>
                        <button onClick={() => setEditingUser({...editingUser, mfaEnabled: !editingUser.mfaEnabled})} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${editingUser.mfaEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 ${editingUser.mfaEnabled ? 'right-1' : 'left-1'}`}></div></button>
                     </div>

                     <div className="p-8 bg-slate-900/60 rounded-[32px] border-2 border-slate-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all shadow-inner">
                        <div className="flex items-center space-x-5">
                           <div className="p-3 rounded-2xl bg-emerald-600/10 text-emerald-400"><Mail size={24} /></div>
                           <div>
                              <h4 className="text-xs font-black text-white uppercase tracking-widest">Notificar al Email</h4>
                              <p className="text-[10px] text-slate-500 font-black uppercase mt-1">Envío de credenciales</p>
                           </div>
                        </div>
                        <button onClick={() => setEditingUser({...editingUser, notifyOnSave: !editingUser.notifyOnSave})} className={`w-14 h-7 rounded-full relative transition-all duration-500 ${editingUser.notifyOnSave ? 'bg-emerald-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-500 ${editingUser.notifyOnSave ? 'right-1' : 'left-1'}`}></div></button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-10 bg-slate-900/60 border-t border-slate-800 flex justify-end">
               <button onClick={handleSave} disabled={isSaving} className="flex items-center space-x-4 bg-blue-600 hover:bg-blue-500 text-white px-12 py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl active:scale-95 disabled:opacity-50">
                 {isSaving ? <RefreshCw className="animate-spin" size={22} /> : <Save size={22} />}
                 <span>{isSaving ? 'Sincronizando...' : 'Sellar Perfil'}</span>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
