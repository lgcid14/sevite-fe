import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff } from 'lucide-react';

export default function MetricBuilder() {
    const API = import.meta.env.VITE_API_URL;
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('${API}/api/config/metrics')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.data.cards) {
                    setCards(data.data.cards);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await fetch('${API}/api/config/metrics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cards })
            });
            alert('Configuración de métricas guardada (Backend).');
        } catch (err) {
            alert('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    const toggleVisibility = (id) => {
        setCards(cards.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
    };

    const updateTitle = (id, newTitle) => {
        setCards(cards.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando métricas...</div>;

    return (
        <div className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <div>
                    <h3 className="text-sm font-semibold text-gray-800">Configuración Central de Métricas</h3>
                    <p className="text-xs text-gray-500 mt-1">Activa o renombra las tarjetas (KPIs) globales del Centro de Control.</p>
                </div>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-primary text-white hover:bg-brand-secondary transition-colors disabled:opacity-50">
                    <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Aplicar Globalmente'}
                </button>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map(card => (
                    <div key={card.id} className={`p-5 rounded-xl border ${card.visible ? 'border-brand-primary bg-brand-light shadow-sm' : 'border-gray-200 bg-gray-50 opacity-60'} transition-all`}>
                        <div className="flex justify-between items-start mb-4">
                            <input
                                type="text"
                                value={card.title}
                                onChange={(e) => updateTitle(card.id, e.target.value)}
                                className="font-semibold text-gray-900 bg-transparent border-b border-transparent focus:border-brand-primary focus:outline-none focus:ring-0 w-full mr-4 px-1"
                            />
                            <button onClick={() => toggleVisibility(card.id)} className={`p-1.5 rounded-lg transition-colors ${card.visible ? 'text-brand-primary bg-white shadow-sm' : 'text-gray-400 bg-gray-200 hover:text-gray-600'}`}>
                                {card.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 mb-1">Valor de demostración actual:</div>
                        <div className="text-xl font-bold font-mono text-gray-800">{card.value} <span className="text-sm font-normal text-green-600 ml-1">{card.trend}</span></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
