import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function CategoryModal({ isOpen, onClose }) {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3001/api/config/categories');
            if (res.data.success) {
                setCategories(res.data.data.sort((a, b) => a.order - b.order));
            }
        } catch (err) {
            setError('Error al cargar categorías');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        const trimmed = newCategory.trim();
        if (!trimmed) {
            setError('El nombre no puede estar vacío');
            return;
        }
        if (categories.some(c => c.label.toLowerCase() === trimmed.toLowerCase())) {
            setError('Esta categoría ya existe');
            return;
        }

        const nextOrder = categories.length > 0 ? Math.max(...categories.map(c => c.order)) + 1 : 0;
        const newItem = {
            id: Date.now(), // Temp ID
            label: trimmed,
            active: true,
            order: nextOrder
        };

        setCategories([...categories, newItem]);
        setNewCategory('');
        setError('');
    };

    const handleRemoveCategory = (id) => {
        setCategories(categories.filter(c => c.id !== id));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        try {
            await axios.post('http://localhost:3001/api/config/categories', categories);
            setSuccess('Categorías actualizadas correctamente');
            setTimeout(() => {
                setSuccess('');
                onClose();
            }, 1500);
        } catch (err) {
            setError('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden border border-brand-border/50 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 bg-brand-light flex items-center justify-between border-b border-brand-border/50">
                    <div>
                        <h3 className="text-xl font-black text-brand-text tracking-tighter">Administrar Categorías</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Configura los motivos de contacto</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all text-gray-400 hover:text-brand-text">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {/* Add Category Section */}
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <input 
                                type="text"
                                value={newCategory}
                                onChange={(e) => {
                                    setNewCategory(e.target.value);
                                    if (error) setError('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                                placeholder="Ej: Detalle de pago..."
                                className="w-full bg-brand-neutral/30 border-brand-border rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300 focus:ring-4 focus:ring-brand-primary/10 transition-all outline-none"
                            />
                        </div>
                        <button 
                            onClick={handleAddCategory}
                            className="bg-brand-primary text-white p-4 rounded-2xl hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>

                    {error && (
                        <div className="bg-danger-50 text-danger-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-danger-100 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-success-50 text-success-600 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-success-100">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}

                    {/* List Section */}
                    <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-10 text-gray-300 text-[10px] font-black uppercase tracking-widest">
                                No hay categorías ingresadas
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {categories.map((cat, idx) => (
                                    <div 
                                        key={cat.id} 
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-brand-border/50 hover:bg-white transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 flex items-center justify-center bg-white rounded-lg text-[10px] font-black text-gray-400 border border-gray-100">{idx + 1}</span>
                                            <span className="text-sm font-bold text-gray-700">{cat.label}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveCategory(cat.id)}
                                            className="p-2 text-gray-300 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
}
