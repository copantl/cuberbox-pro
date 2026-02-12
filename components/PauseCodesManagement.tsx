
import React, { useState } from 'react';
import { 
  Coffee, Clock, Plus, Trash2, Edit2, Save, X, CheckCircle, 
  AlertCircle, DollarSign, Palette, Power,
  // Fix: Add Info icon to imports
  Info
} from 'lucide-react';
import { PauseCode } from '../types';
import { PAUSE_CODES } from '../constants';

const PauseCodesManagement: React.FC = () => {
  const [codes, setCodes] = useState<PauseCode[]>(PAUSE_CODES);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newCode, setNewCode] = useState<Partial<PauseCode>>({
    name: '',
    billable: true,
    isActive: true,
    color: '#3b82f6'
  });

  const handleToggleActive = (id: string) => {
    setCodes(codes.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este código de pausa?')) {
      setCodes(codes.filter(c => c.id !== id));
    }
  };

  const handleAdd = () => {
    if (!newCode.name) return;
    const code: PauseCode = {
      id: Math.random().toString(36).substr(2, 9),
      name: newCode.name,
      billable: newCode.billable || false,
      isActive: true,
      color: newCode.color || '#3b82f6'
    };
    setCodes([...codes, code]);
    setNewCode({ name: '', billable: true, isActive: true, color: '#3b82f6' });
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Coffee className="mr-3 text-amber-400" size={28} />
            Configuración de Pausas
          </h2>
          <p className="text-slate-400 text-sm">Define los motivos por los cuales tus agentes pueden entrar en estado de pausa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* New Code Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-2xl">
            <h3 className="text-lg font-bold mb-6 flex items-center">
              <Plus className="mr-2 text-blue-400" size={20} />
              Añadir Código
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombre del Motivo</label>
                <input 
                  type="text" 
                  placeholder="Ej: Almuerzo, Baño..."
                  value={newCode.name}
                  onChange={(e) => setNewCode({...newCode, name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all"
                />
              </div>
              
              <div className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <div className="flex items-center">
                  <DollarSign size={16} className="text-emerald-400 mr-2" />
                  <span className="text-xs font-bold text-slate-300">¿Tiempo Cobrable?</span>
                </div>
                <button 
                  onClick={() => setNewCode({...newCode, billable: !newCode.billable})}
                  className={`w-10 h-5 rounded-full relative transition-all ${newCode.billable ? 'bg-emerald-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${newCode.billable ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                  <Palette size={14} className="mr-1" /> Color Identificador
                </label>
                <div className="flex space-x-2">
                  {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'].map(c => (
                    <button 
                      key={c}
                      onClick={() => setNewCode({...newCode, color: c})}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${newCode.color === c ? 'border-white scale-110' : 'border-transparent opacity-50'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <button 
                onClick={handleAdd}
                disabled={!newCode.name}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
              >
                <Plus size={18} />
                <span>CREAR CÓDIGO</span>
              </button>
            </div>
          </div>

          <div className="p-6 glass rounded-3xl border border-blue-500/20 flex items-start space-x-4">
             <Info className="text-blue-400 shrink-0" size={20} />
             <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold tracking-wider">
               Los códigos "Cobrables" se contabilizan como tiempo productivo en los reportes de nómina y ocupación.
             </p>
          </div>
        </div>

        {/* Existing Codes Table */}
        <div className="lg:col-span-8">
           <div className="glass rounded-[40px] border border-slate-700/50 overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-slate-700/50 bg-slate-800/40">
                <h3 className="font-bold">Códigos Existentes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Motivo / Color</th>
                      <th className="px-6 py-4 text-center">Tipo</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                      <th className="px-6 py-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {codes.map((code) => (
                      <tr key={code.id} className="hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center space-x-3">
                            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: code.color }}></div>
                            <span className="font-bold text-sm text-white">{code.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${code.billable ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {code.billable ? 'Cobrable' : 'No Cobrable'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button 
                            onClick={() => handleToggleActive(code.id)}
                            className={`flex items-center justify-center space-x-2 mx-auto px-3 py-1 rounded-full border transition-all ${code.isActive ? 'border-emerald-500/30 text-emerald-400' : 'border-slate-700 text-slate-600'}`}
                          >
                             <Power size={12} />
                             <span className="text-[9px] font-bold">{code.isActive ? 'ACTIVO' : 'INACTIVO'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(code.id)}
                              className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-400 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default PauseCodesManagement;
