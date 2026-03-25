import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Plus, Trash2, ArrowUp, ArrowDown, Settings2,
    CheckCircle2, AlertCircle, Layout, Hash,
    Type, Mail, List, Calendar, FileText, Paperclip,
    ChevronDown
} from 'lucide-react';
import CategoryModal from './CategoryModal';

export default function FormBuilder() {
    const API = import.meta.env.VITE_API_URL;
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingFields, setLoadingFields] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [message, setMessage] = useState(null);

    const fieldTypes = [
        { value: 'text', label: 'Texto', icon: Type },
        { value: 'email', label: 'Email', icon: Mail },
        { value: 'number', label: 'Número', icon: Hash },
        { value: 'date', label: 'Fecha', icon: Calendar },
        { value: 'textarea', label: 'Área de Texto', icon: FileText },
        { value: 'select', label: 'Desplegable', icon: List },
        { value: 'file', label: 'Archivo', icon: Paperclip }
    ];

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedCategoryId) {
            fetchFields(selectedCategoryId);
        } else {
            setFields([]);
        }
    }, [selectedCategoryId]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API}/api/config/categories`);
            if (res.data.success) {
                const cats = res.data.data.sort((a, b) => a.order - b.order);
                setCategories(cats);
                if (cats.length > 0) {
                    setSelectedCategoryId(cats[0].id.toString());
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFields = async (catId) => {
        setLoadingFields(true);
        try {
            const res = await axios.get(`${API}/api/config/fields?categoryId=${catId}`);
            if (res.data.success) {
                setFields(res.data.data.sort((a, b) => a.order - b.order));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingFields(false);
        }
    };

    const handleAddField = () => {
        const nextOrder = fields.length > 0 ? Math.max(...fields.map(f => f.order)) + 1 : 0;
        setFields([...fields, {
            id: Date.now(),
            label: 'Nueva Variable',
            type: 'text',
            required: true,
            active: true,
            order: nextOrder
        }]);
    };

    const handleUpdateField = (id, key, value) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    const handleRemoveField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index, direction) => {
        const newFields = [...fields];
        const newIdx = direction === 'up' ? index - 1 : index + 1;
        if (newIdx < 0 || newIdx >= newFields.length) return;

        [newFields[index], newFields[newIdx]] = [newFields[newIdx], newFields[index]];

        // Re-assign order
        const updated = newFields.map((f, i) => ({ ...f, order: i }));
        setFields(updated);
    };

    const handleSave = async () => {
        if (!selectedCategoryId) return;
        setSaving(true);
        setMessage(null);
        try {
            await axios.post(`${API}/api/config/fields`, {
                fields,
                categoryId: selectedCategoryId
            });
            setMessage({ type: 'success', text: 'Variables guardadas correctamente' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Error al persistir cambios' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin text-brand-primary"><Settings2 className="w-8 h-8" /></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-brand-light rounded-2xl text-brand-primary">
                        <Layout className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-brand-text tracking-tighter uppercase">Variables del Formulario</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Configura campos por categoría</p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    {/* Category Selector inside Builder */}
                    <div className="relative min-w-[200px]">
                        <select
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                            className="w-full appearance-none bg-brand-neutral/20 border-brand-border rounded-2xl py-4 px-6 pr-12 text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                        >
                            <option value="">Selecciona Categoría...</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="flex items-center gap-2 bg-brand-neutral/50 text-brand-text px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-neutral transition-all border border-brand-border"
                    >
                        Gestionar Categorías
                    </button>
                    <button
                        onClick={handleAddField}
                        disabled={!selectedCategoryId}
                        className="flex items-center gap-2 bg-brand-light text-brand-primary px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary hover:text-white transition-all shadow-md shadow-brand-primary/10 disabled:opacity-30"
                    >
                        <Plus className="w-4 h-4" /> Agregar Variable
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-5 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-success-50 text-success-600 border border-success-100' : 'bg-danger-50 text-danger-600 border border-danger-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-xs font-black uppercase tracking-widest">{message.text}</span>
                </div>
            )}

            {/* Grid de Variables */}
            <div className="space-y-4">
                {!selectedCategoryId ? (
                    <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-brand-border text-center">
                        <div className="w-16 h-16 bg-brand-neutral/30 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Layout className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-bold text-brand-text mb-2">Selecciona una categoría</h4>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">Elige una categoría del menú desplegable superior para ver y editar sus variables específicas.</p>
                    </div>
                ) : loadingFields ? (
                    <div className="flex justify-center py-20">
                        <Settings2 className="w-10 h-10 text-brand-primary animate-spin" />
                    </div>
                ) : fields.length === 0 ? (
                    <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-brand-border text-center">
                        <p className="text-xs text-gray-400 mb-6">Esta categoría no tiene campos configurados aún.</p>
                        <button onClick={handleAddField} className="mx-auto flex items-center gap-2 bg-brand-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all">
                            <Plus className="w-4 h-4" /> Crear Primera Variable
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center px-8 text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">
                            <div className="flex-1">Variable / Etiqueta</div>
                            <div className="w-40 px-4 text-center">Tipo de Campo</div>
                            <div className="w-24 text-center">Oblig.</div>
                            <div className="w-24 text-center">Activo</div>
                            <div className="w-32"></div>
                        </div>

                        {fields.map((field, idx) => (
                            <div key={field.id} className="flex items-center bg-white p-4 rounded-[2rem] border border-brand-border shadow-sm hover:shadow-md transition-all group animate-in slide-in-from-right-4" style={{ animationDelay: `${idx * 50}ms` }}>
                                {/* Label e Icono */}
                                <div className="flex-1 flex items-center gap-4 px-4">
                                    <div className="w-10 h-10 flex items-center justify-center bg-brand-light/30 rounded-xl text-brand-primary">
                                        {(() => {
                                            const Icon = fieldTypes.find(t => t.value === field.type)?.icon || Type;
                                            return <Icon className="w-5 h-5" />;
                                        })()}
                                    </div>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => handleUpdateField(field.id, 'label', e.target.value)}
                                        className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-bold text-brand-text placeholder:text-gray-300"
                                        placeholder="Nombre de la variable..."
                                    />
                                </div>

                                {/* Tipo Selección */}
                                <div className="w-40 px-4">
                                    <select
                                        value={field.type}
                                        onChange={(e) => handleUpdateField(field.id, 'type', e.target.value)}
                                        className="w-full bg-brand-neutral/40 border-0 rounded-xl py-2 px-3 text-[10px] font-black uppercase tracking-tight focus:ring-0 transition-all"
                                    >
                                        {fieldTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Toggles */}
                                <div className="w-24 flex justify-center">
                                    <button
                                        onClick={() => handleUpdateField(field.id, 'required', !field.required)}
                                        className={`w-10 h-5 rounded-full relative transition-all ${field.required ? 'bg-brand-primary' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${field.required ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                <div className="w-24 flex justify-center">
                                    <button
                                        onClick={() => handleUpdateField(field.id, 'active', !field.active)}
                                        className={`w-10 h-5 rounded-full relative transition-all ${field.active ? 'bg-success-500' : 'bg-gray-200'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${field.active ? 'right-1' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Acciones */}
                                <div className="w-32 flex items-center justify-end gap-1 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => moveField(idx, 'up')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><ArrowUp className="w-4 h-4" /></button>
                                    <button onClick={() => moveField(idx, 'down')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"><ArrowDown className="w-4 h-4" /></button>
                                    <button onClick={() => handleRemoveField(field.id)} className="p-2 hover:bg-danger-50 rounded-lg text-danger-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Save Button */}
            {selectedCategoryId && fields.length > 0 && (
                <div className="flex justify-end pt-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-3 bg-brand-primary text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
                    >
                        {saving ? 'Guardando...' : 'Aplicar Cambios'}
                    </button>
                </div>
            )}

            {/* Categorías Modal */}
            <CategoryModal
                isOpen={isCategoryModalOpen}
                onClose={() => {
                    setIsCategoryModalOpen(false);
                    fetchInitialData(); // Refresh list in case categories changed
                }}
            />
        </div>
    );
}
