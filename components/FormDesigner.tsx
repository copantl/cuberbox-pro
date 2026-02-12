
/**
 * @file FormDesigner.tsx
 * @description Motor de diseño de formularios dinámicos para el CRM interno.
 */

import React, { useState } from 'react';
import { 
  Plus, Save, Trash2, Edit2, GripVertical, CheckCircle2, 
  Type, Hash, Calendar, List, CheckSquare, Info, X,
  RefreshCw, Layout, Smartphone, Database, ShieldCheck,
  ChevronRight, ArrowRight, Eye, Code, Layers,
  // Added missing Sparkles icon to imports
  Sparkles
} from 'lucide-react';
import { useToast } from '../ToastContext';

interface FormField {
  id: string;
  label: string;
  db_name: string;
  type: 'TEXT' | 'NUMBER' | 'SELECT' | 'DATE' | 'CHECKBOX';
  required: boolean;
  options?: string[];
}

const FormDesigner: React.FC = () => {
  const { toast } = useToast();
  const [fields, setFields] = useState<FormField[]>([
    { id: '1', label: 'Nombre del Cliente', db_name: 'first_name', type: 'TEXT', required: true },
    { id: '2', label: 'Monto de Oferta', db_name: 'deal_value', type: 'NUMBER', required: false },
    { id: '3', label: 'Producto de Interés', db_name: 'product_id', type: 'SELECT', required: true, options: ['Seguro Global', 'Inversión Q4', 'Retiro Pro'] },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const addField = () => {
    const newField: FormField = {
      id: Math.random().toString(36).substr(2, 5),
      label: 'Nuevo Campo',
      db_name: 'campo_' + Math.random().toString(36).substr(2, 3),
      type: 'TEXT',
      required: false
    };
    setFields([...fields, newField]);
    toast('Nuevo nodo de datos añadido al formulario.', 'info');
  };

  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const handleSaveForm = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
    toast('Layout de CRM Interno actualizado en el clúster.', 'success', 'Sync Core');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center">
            <Layout className="mr-4 text-blue-400" size={32} />
            CRM Form Designer
          </h2>
          <p className="text-slate-400 text-sm font-medium mt-1">Construye la interfaz de captura que verán tus agentes en vivo.</p>
        </div>
        <div className="flex items-center space-x-4">
           <button 
             onClick={() => setPreviewMode(!previewMode)}
             className={`flex items-center space-x-3 px-6 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${previewMode ? 'bg-amber-600 border-amber-500 text-white shadow-xl' : 'glass border-slate-800 text-slate-400 hover:text-white'}`}
           >
             <Eye size={16} />
             <span>{previewMode ? 'Editar Diseño' : 'Previsualizar'}</span>
           </button>
           <button 
            onClick={handleSaveForm}
            disabled={isSaving}
            className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-[28px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
           >
             {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
             <span>{isSaving ? 'Sincronizando...' : 'Sellar Formulario'}</span>
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Panel de Herramientas / Canvas */}
        <div className="col-span-12 lg:col-span-8">
           {previewMode ? (
             <div className="glass p-12 rounded-[64px] border-4 border-amber-500/20 bg-amber-500/5 shadow-2xl space-y-10 animate-in zoom-in-95 duration-500">
                <div className="flex items-center space-x-4 mb-8">
                   <Smartphone className="text-amber-500" size={24} />
                   <h4 className="text-xl font-black text-white uppercase tracking-tighter">Vista del Agente (Preview)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {fields.map(field => (
                     <div key={field.id} className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                          {field.label} {field.required && <span className="text-rose-500">*</span>}
                        </label>
                        {field.type === 'SELECT' ? (
                          <select className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-bold appearance-none">
                             {field.options?.map((o, i) => <option key={i}>{o}</option>)}
                          </select>
                        ) : (
                          <input 
                            type={field.type === 'NUMBER' ? 'number' : 'text'} 
                            placeholder={`Ingresar ${field.label.toLowerCase()}...`}
                            className="w-full bg-slate-900 border-2 border-slate-800 rounded-3xl px-6 py-4 text-xs text-white font-bold outline-none"
                          />
                        )}
                     </div>
                   ))}
                </div>
                <div className="pt-8 border-t border-slate-800 flex justify-end">
                   <button className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest opacity-50 cursor-not-allowed">Guardar Gestión (Simulado)</button>
                </div>
             </div>
           ) : (
             <div className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="glass p-8 rounded-[40px] border border-slate-700/50 shadow-xl flex items-center gap-8 group hover:border-blue-500/30 transition-all animate-in slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-slate-600 group-hover:text-blue-500 transition-colors cursor-grab">
                      <GripVertical size={20} />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Etiqueta Visual</label>
                          <input 
                            type="text" 
                            value={field.label} 
                            onChange={e => updateField(field.id, { label: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-bold outline-none focus:border-blue-500"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Slug DB (Mapeo)</label>
                          <input 
                            type="text" 
                            value={field.db_name} 
                            onChange={e => updateField(field.id, { db_name: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-[10px] text-emerald-400 font-mono outline-none focus:border-blue-500"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Tipo de Dato</label>
                          <select 
                            value={field.type} 
                            onChange={e => updateField(field.id, { type: e.target.value as any })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-blue-400 font-bold outline-none cursor-pointer"
                          >
                            <option value="TEXT">Texto Corto</option>
                            <option value="NUMBER">Numérico / Moneda</option>
                            <option value="SELECT">Menú Desplegable</option>
                            <option value="DATE">Fecha / Calendario</option>
                            <option value="CHECKBOX">Booleano (Sí/No)</option>
                          </select>
                       </div>
                    </div>

                    <div className="flex items-center space-x-3">
                       <button 
                        onClick={() => updateField(field.id, { required: !field.required })}
                        className={`p-3 rounded-xl border transition-all ${field.required ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                        title="Obligatorio"
                       >
                         <ShieldCheck size={18} />
                       </button>
                       <button onClick={() => deleteField(field.id)} className="p-3 bg-slate-900 hover:bg-rose-600 border border-slate-800 text-slate-600 hover:text-white rounded-xl transition-all"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={addField}
                  className="w-full py-8 border-4 border-dashed border-slate-800 rounded-[48px] text-slate-600 hover:border-blue-500/40 hover:text-blue-400 transition-all flex flex-col items-center justify-center space-y-4 group bg-slate-900/10"
                >
                   <div className="p-4 bg-slate-900 rounded-full border border-slate-800 group-hover:scale-110 transition-transform">
                      <Plus size={32} />
                   </div>
                   <span className="font-black text-xs uppercase tracking-[0.3em]">Inyectar nuevo campo de captura</span>
                </button>
             </div>
           )}
        </div>

        {/* Sidebar Informativa */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
           <div className="glass p-10 rounded-[56px] border border-slate-700/50 shadow-2xl space-y-8">
              <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center">
                 <Database className="mr-3 text-emerald-400" size={24} />
                 Esquema de Datos
              </h3>
              <div className="p-6 bg-slate-950 rounded-[32px] border border-slate-800 space-y-4 shadow-inner">
                 <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">
                    Cada campo creado se sincroniza automáticamente con la tabla <code className="text-blue-400">crm_custom_leads</code>. Puedes usar estos campos en tus reportes CDR personalizados.
                 </p>
                 <div className="pt-4 border-t border-slate-900">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[9px] font-black text-slate-600 uppercase">Integridad del Modelo</span>
                       <span className="text-[9px] font-black text-emerald-500 uppercase">Verificado</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '100%' }}></div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Propiedades Globales</h4>
                 <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Guardado Automático</span>
                       <button className="w-10 h-5 bg-blue-600 rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Validación en Tiempo Real</span>
                       <button className="w-10 h-5 bg-slate-700 rounded-full relative"><div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full"></div></button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 glass rounded-[48px] border border-blue-500/20 bg-blue-600/5 space-y-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-400 group-hover:scale-110 transition-transform">
                 <Code size={100} />
              </div>
              <h4 className="font-black text-lg text-white uppercase tracking-tighter flex items-center">
                 <Sparkles className="mr-3 text-blue-400" size={20} />
                 JSON Export
              </h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase leading-relaxed tracking-wider">
                 Exporta la definición de este formulario para replicarla en otros nodos del clúster de CUBERBOX.
              </p>
              <button className="w-full py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all shadow-xl">
                 Copiar Blueprint JSON
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FormDesigner;
