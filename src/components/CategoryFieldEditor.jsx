import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, ArrowUp, ArrowDown, ArrowLeft } from 'lucide-react';
import axios from 'axios';

export default function CategoryFieldEditor({ category, onBack }) {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (category.id && !category.id.toString().startsWith('temp_')) {
            fetchFields();
        } else {
            setLoading(false);
        }
    }, [category]);

    const fetchFields = async () => {
        try {
            const res = await axios.get(`http://localhost:3001/api/config/categories/${category.id}/fields`);
            if (res.data.success) {
                setFields(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (category.id.toString().startsWith('temp_')) {
            alert('Primero guarda las categorías en la pantalla anterior.');
            return;
        }
        setSaving(true);
        try {
            const updated = fields.map((f, i) => ({ ...f, order: i + 1, category_id: category.id }));
            await axios.post(`http://localhost:3001/api/config/categories/${category.id}/fields`, { fields: updated });
            setFields(updated);
            alert('Campos de la categoría guardados.');
        } catch (err) {
            alert('Error al guardar campos');
        } finally {
            setSaving(false);
        }
    };

    const addField = () => {
        const newField = {
            id: `temp_f_${Date.now()}`,
            label: 'Nuevo Campo',
            type: 'text',
            required: true,
            active: true,
            order: fields.length + 1
        };
        setFields([...fields, newField]);
    };

    const removeField = (id) => {
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index, direction) => {
        if (direction === -1 && index === 0) return;
        if (direction === 1 && index === fields.length - 1) return;
        const newArr = [...fields];
        [newArr[index], newArr[index + direction]] = [newArr[index + direction], newArr[index]];
        setFields(newArr);
    };

    const updateField = (id, key, value) => {
        setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f));
    };

    if (loading) return <div className="p-8 text-center text-gray-500 animate-pulse">Cargando campos...</div>;

    return (
        <div className="bg-white rounded-[2rem] border border-brand-border shadow-premium overflow-hidden animate-in slide-in-from-right-8 duration-500">
            <div className="p-8 border-b border-brand-border/50 bg-brand-light/20 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-brand-border">
                        <ArrowLeft className="w-5 h-5 text-gray-400" />
                    </button>
                    <div>
                        <h3 className="text-sm font-bold text-brand-text uppercase tracking-widest">Campos: {category.label}</h3>
                        <p className="text-[10px] text-gray-400 font-medium">Configura qué información solicitar para esta categoría.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={addField} className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold border border-brand-border text-brand-text hover:bg-white transition-all shadow-sm">
                        <Plus className="w-4 h-4" /> Agregar campo
                    </button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-8 py-2.5 rounded-full text-xs font-bold bg-brand-primary text-white hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-lg shadow-brand-primary/20">
                        <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>

            <div className="p-8">
                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-6 p-6 border border-brand-border rounded-[2rem] bg-white hover:border-brand-primary transition-all group shadow-sm">
                            <div className="flex flex-col gap-2 text-gray-300">
                                <button onClick={() => moveField(index, -1)} disabled={index === 0} className="hover:text-brand-primary disabled:opacity-30">
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button onClick={() => moveField(index, 1)} disabled={index === fields.length - 1} className="hover:text-brand-primary disabled:opacity-30">
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 grid grid-cols-12 gap-6 items-center">
                                <div className="col-span-4">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Etiqueta de Campo</label>
                                    <input 
                                        type="text"
                                        value={field.label}
                                        onChange={(e) => updateField(field.id, 'label', e.target.value)}
                                        className="w-full text-sm border-brand-border rounded-xl bg-brand-neutral/30 focus:ring-4 focus:ring-brand-primary/10"
                                        placeholder="Ej: RUT, Teléfono..."
                                    />
                                </div>
                                
                                <div className="col-span-3">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Tipo</label>
                                    <select 
                                        value={field.type}
                                        onChange={(e) => updateField(field.id, 'type', e.target.value)}
                                        className="w-full text-sm border-brand-border rounded-xl bg-brand-neutral/30"
                                    >
                                        <option value="text">Texto</option>
                                        <option value="email">Correo</option>
                                        <option value="number">Número / Teléfono</option>
                                        <option value="date">Fecha</option>
                                        <option value="textarea">Comentarios largo</option>
                                        <option value="file">Adjuntar archivo</option>
                                        <option value="select">Lista de opciones</option>
                                    </select>
                                </div>

                                <div className="col-span-2 flex flex-col items-center pt-4">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-2">Obligatorio</label>
                                    <input 
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={(e) => updateField(field.id, 'required', e.target.checked)}
                                        className="rounded-lg text-brand-primary border-brand-border w-5 h-5 focus:ring-brand-primary/10"
                                    />
                                </div>

                                <div className="col-span-2 flex flex-col items-center pt-4">
                                    <label className="text-[9px] font-bold text-gray-400 uppercase mb-2">Activo</label>
                                    <input 
                                        type="checkbox"
                                        checked={field.active}
                                        onChange={(e) => updateField(field.id, 'active', e.target.checked)}
                                        className="rounded-lg text-brand-primary border-brand-border w-5 h-5 focus:ring-brand-primary/10"
                                    />
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <button onClick={() => removeField(field.id)} className="p-3 text-gray-300 hover:text-danger-500 hover:bg-danger-500/5 rounded-full transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {fields.length === 0 && (
                        <div className="text-center py-10 bg-brand-light/10 border-2 border-dashed border-brand-border rounded-2xl text-gray-400 text-xs">
                            Crea campos para que aparezcan al seleccionar esta categoría.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
