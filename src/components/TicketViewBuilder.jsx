import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, GripVertical, Type, LayoutTemplate } from 'lucide-react';
import axios from 'axios';

export default function TicketViewBuilder() {
    const API = import.meta.env.VITE_API_URL;
    const [config, setConfig] = useState({ columns: [], detailLayout: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        axios.get(`${API}/api/config/ticket-view`)
            .then(res => {
                if (res.data.success && res.data.data) {
                    setConfig({
                        columns: res.data.data.columns || [],
                        detailLayout: res.data.data.detailLayout || []
                    });
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error loading ticket view config", err);
                setError("Error al conectar con el servidor.");
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`${API}/api/config/ticket-view`, config);
            alert('Configuración de vista de tickets guardada.');
        } catch (err) {
            alert('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    const toggleColumnVisibility = (id) => {
        setConfig({
            ...config,
            columns: config.columns.map(c => c.id === id ? { ...c, visible: !c.visible } : c)
        });
    };

    const updateColumnTitle = (id, newTitle) => {
        setConfig({
            ...config,
            columns: config.columns.map(c => c.id === id ? { ...c, title: newTitle } : c)
        });
    };

    const toggleSectionVisibility = (id) => {
        setConfig({
            ...config,
            detailLayout: config.detailLayout.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
        });
    };

    const updateSectionTitle = (id, newTitle) => {
        setConfig({
            ...config,
            detailLayout: config.detailLayout.map(s => s.id === id ? { ...s, title: newTitle } : s)
        });
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración de vista...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Table Columns Config */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-light rounded-lg text-brand-primary">
                            <LayoutPanelTop className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Columnas de la Lista de Tickets</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5 text-brand-secondary">Personaliza la tabla principal de gestión</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {config.columns.map((col) => (
                        <div key={col.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${col.visible ? 'bg-white border-brand-border hover:border-brand-primary' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                            <div className="flex items-center gap-3 flex-1 mr-4">
                                <GripVertical className="w-4 h-4 text-gray-300" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Type className="w-3 h-3 text-brand-primary" />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Etiqueta ID: {col.id}</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={col.title}
                                        onChange={(e) => updateColumnTitle(col.id, e.target.value)}
                                        className="w-full text-xs font-bold text-gray-800 bg-transparent border-b border-dashed border-gray-200 focus:border-brand-primary focus:outline-none focus:ring-0 px-0"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => toggleColumnVisibility(col.id)}
                                className={`p-2 rounded-lg transition-all ${col.visible ? 'bg-brand-light text-brand-primary' : 'bg-gray-200 text-gray-500'}`}
                            >
                                {col.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail View Layout Config */}
            <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-light rounded-lg text-brand-primary">
                            <LayoutTemplate className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Secciones del Detalle de Ticket</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5 text-brand-secondary">Gestiona la visibilidad de los bloques informativos</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-3">
                    {config.detailLayout.map((section) => (
                        <div key={section.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${section.visible ? 'bg-white border-brand-border' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs">
                                    {section.order}
                                </div>
                                <div className="flex-1 max-w-xs">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                                        className="w-full text-sm font-black text-gray-800 bg-transparent border-0 focus:ring-0 p-0 hover:text-brand-primary transition-colors"
                                    />
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">ID: {section.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleSectionVisibility(section.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${section.visible ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}
                            >
                                {section.visible ? <><Eye className="w-3 h-3" /> Visible</> : <><EyeOff className="w-3 h-3" /> Oculto</>}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Save */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-3 bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    <Save className="w-5 h-5" /> {saving ? 'GURDANDO...' : 'GUARDAR CONFIGURACIÓN DE VISTAS'}
                </button>
            </div>
        </div>
    );
}

const LayoutPanelTop = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
);
