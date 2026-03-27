import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, SlidersHorizontal, Plus, ArrowRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MAIN_CATEGORIES = [
    {
        id: 'soporte_app',
        label: 'Soporte App',
        options: [
            'No puedo descargar un documento',
            'No llega mi contraseña',
            'No puedo registrar mis preferencias',
            'No puedo cargar archivos'
        ]
    },
    {
        id: 'remuneraciones',
        label: 'Remuneraciones y asistencia',
        options: [
            'No puedo enrolarme en el reloj control',
            'No registre mi asistencia',
            'Quiero modificar información de mi registro en la App',
            'Tuve problemas al registrar una de mis marcas',
            'Necesito ayuda con mi proceso de registro',
            'Necesito detallar mi pregunta'
        ]
    },
    {
        id: 'cliente_empresa',
        label: 'Atención cliente empresa',
        options: [
            'Cambio de secuencial tarjeta POS',
            'Solicitud de tarjeta POS',
            'Error al operar tarjeta POS',
            'Informar asistencia de un Flexit',
            'Inscribir a flexit a capacitación'
        ]
    }
];

export default function TicketsList() {
    const [tickets, setTickets] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal Form State
    const [formData, setFormData] = useState({
        rut: '',
        correo: '',
        title: '',
        main_category: '',
        sub_option: '',
        ticket_type_id: '',
        details: ''
    });
    const [ticketTypes, setTicketTypes] = useState([]);

    useEffect(() => {
        fetchTicketsAndConfig();
    }, []);

    const API = import.meta.env.VITE_API_URL;

    const fetchTicketsAndConfig = async () => {
        try {
            const ticketsRes = await axios.get(`${API}/api/tickets`);
            setTickets(ticketsRes.data.data);

            // Also try to get categories for the modal, but don't blow up if it fails
            try {
                const configRes = await axios.get(`${API}/api/config/categories`);
                if (configRes.data.success) setConfig(configRes.data.data);
            } catch (e) {
                console.warn('Could not load categories:', e.message);
            }

            try {
                const typesRes = await axios.get(`${API}/api/tickets/types`);
                setTicketTypes(typesRes.data?.data || typesRes.data || []);
            } catch (e) {
                console.warn('Could not load ticket types:', e.message);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const mainCatObj = MAIN_CATEGORIES.find(c => c.id === formData.main_category);
            const payload = {
                rut: formData.rut,
                correo: formData.correo,
                title: formData.title,
                category_id: null,
                category: mainCatObj ? mainCatObj.label : 'General',
                type: formData.sub_option,
                ticket_type_id: formData.ticket_type_id,
                details: formData.details,
                channel: 'admin'
            };

            const res = await axios.post(`${API}/api/tickets`, payload);
            if (res.data.success) {
                setIsModalOpen(false);
                setFormData({ rut: '', correo: '', title: '', main_category: '', sub_option: '', ticket_type_id: '', details: '' });
                fetchTicketsAndConfig(); // Refresh list
            }
        } catch (err) {
            alert('Error al crear ticket: ' + (err.response?.data?.error || err.message));
        }
    };

    const renderCell = (ticket, colId) => {
        switch (colId) {
            case 'id':
                // Use display_id (TK000XXX) if available, otherwise fallback to id
                const displayId = ticket.display_id || ticket.id.substring(0, 8).toUpperCase();
                return (
                    <Link to={`/admin/tickets/${ticket.id}`} className="group/id block">
                        <div className="font-mono text-xs font-bold text-brand-primary mb-1 group-hover/id:translate-x-1 transition-transform flex items-center gap-2">
                            #{displayId} <ArrowRight className="w-3 h-3 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 italic">Detalles</div>
                    </Link>
                );
            case 'rut':
                return (
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full brand-gradient flex items-center justify-center font-bold text-white text-[10px] shadow-sm border border-white/20 uppercase">
                            {ticket.rut.substring(0, 2)}
                        </div>
                        <div>
                            <div className="font-bold text-brand-text text-sm tracking-tight">{ticket.rut}</div>
                            <div className="text-[10px] text-gray-400 font-medium">{ticket.email || 'Sin registro'}</div>
                        </div>
                    </div>
                );
            case 'type':
                return (
                    <div className="max-w-[280px] font-medium text-gray-500 text-[12px] line-clamp-1" title={ticket.type}>
                        {ticket.type}
                    </div>
                );
            case 'status':
                return <StatusBadge status={ticket.status} />;
            case 'createdAt':
                return (
                    <div className="text-gray-400 text-[11px] font-medium">
                        {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                );
            case 'category':
                return (
                    <span className="px-3 py-1 bg-brand-light text-brand-primary text-[10px] font-bold rounded-full border border-brand-accent/30 shadow-sm">
                        {ticket.category || 'General'}
                    </span>
                );
            default:
                return <span className="text-sm font-medium text-gray-500">{ticket[colId] || '-'}</span>;
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchSearch = t.rut.toLowerCase().includes(search.toLowerCase()) ||
            (t.display_id && t.display_id.toLowerCase().includes(search.toLowerCase())) ||
            t.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'todos' || t.status.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    const visibleColumns = [
        { id: 'id', title: 'Ticket' },
        { id: 'rut', title: 'Usuario' },
        { id: 'category', title: 'Categoría' },
        { id: 'type', title: 'Servicio' },
        { id: 'status', title: 'Estado' }
    ];

    if (loading) return (
        <div className="bg-white rounded-[3rem] shadow-premium h-96 flex items-center justify-center">
            <div className="animate-pulse text-brand-primary font-bold text-sm">Cargando gestión...</div>
        </div>
    );

    return (
        <div className="space-y-5 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-brand-text tracking-tight">Tickets</h2>
                    <p className="text-gray-400 text-sm font-medium">Bandeja de gestión de solicitudes.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-3 brand-gradient text-white font-bold text-sm rounded-full shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> Crear ticket
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-premium border border-brand-border overflow-hidden">
                <div className="p-5 md:p-6 border-b border-brand-border/50 bg-brand-light/30 flex flex-col lg:flex-row gap-4 lg:gap-6 items-center justify-between">
                    <div className="relative w-full lg:w-[400px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-primary opacity-40" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-12 pr-6 py-3.5 text-sm border-brand-border rounded-full focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary bg-white shadow-sm transition-all font-medium placeholder:text-gray-300"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="flex items-center gap-4 bg-white border border-brand-border rounded-full px-6 py-3 shadow-sm text-sm w-full lg:w-auto">
                            <Filter className="w-4 h-4 text-brand-primary opacity-50" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none text-gray-600 focus:ring-0 cursor-pointer font-bold text-[12px] flex-1"
                            >
                                <option value="todos">Todos</option>
                                <option value="recibido">Recibidos</option>
                                <option value="pendiente">Pendientes</option>
                                <option value="resuelto">Resueltos</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#fbfcff] text-gray-500 font-extrabold border-b border-brand-border/50 text-[11px]">
                            <tr>
                                {visibleColumns.map(col => (
                                    <th key={col.id} className="px-6 py-4 sticky top-0">{col.title}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/30">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={visibleColumns.length} className="px-10 py-32 text-center text-gray-300">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Search className="w-12 h-12" />
                                            <span className="text-sm font-bold italic">Sin resultados</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTickets.map((ticket) => (
                                <tr key={ticket.id} className="hover:bg-brand-light/40 transition-all duration-150 group cursor-default">
                                    {visibleColumns.map(col => (
                                        <td key={col.id} className="px-6 py-4 border-b border-gray-50/50">
                                            {renderCell(ticket, col.id)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-5 md:p-6 border-t border-brand-border/50 bg-white flex justify-between items-center text-[11px] font-bold text-gray-500">
                    <div>Total solicitudes: <span className="text-brand-primary">{filteredTickets.length}</span></div>
                    <div className="flex bg-white border border-brand-border rounded-lg overflow-hidden shadow-sm">
                        <button className="px-3 py-1.5 disabled:opacity-30 hover:bg-brand-neutral transition-colors border-r border-brand-border group">
                            <ChevronLeft className="w-4 h-4 text-gray-500 group-hover:text-brand-primary" />
                        </button>
                        <button className="px-3 py-1.5 disabled:opacity-30 hover:bg-brand-neutral transition-colors group">
                            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-brand-primary" />
                        </button>
                    </div>
                </div>
            </div>

            {/* CREATE TICKET MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/30 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-brand-border animate-in zoom-in-95 duration-300">
                        <div className="p-5 md:p-6 border-b border-brand-border/50 flex justify-between items-center bg-brand-light/30">
                            <h3 className="text-xl font-bold text-brand-text">Crear nuevo ticket</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-10 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 px-2">RUT</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.rut}
                                        onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                                        className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                                        placeholder="12.345.678-9"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 px-2">Correo</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.correo}
                                        onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                        className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                                        placeholder="usuario@servit.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Tipo de Ticket *</label>
                                <select
                                    required
                                    value={formData.ticket_type_id}
                                    onChange={(e) => setFormData({ ...formData, ticket_type_id: e.target.value })}
                                    className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium bg-white"
                                >
                                    <option value="" disabled>Selecciona un tipo...</option>
                                    {ticketTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Título de Ticket *</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                                    placeholder="Resumen del requerimiento..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Categoría Principal</label>
                                    <select
                                        required
                                        value={formData.main_category}
                                        onChange={(e) => {
                                            setFormData({ ...formData, main_category: e.target.value, sub_option: '' });
                                        }}
                                        className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium bg-white"
                                    >
                                        <option value="" disabled>Selecciona una opción...</option>
                                        {MAIN_CATEGORIES.map(c => (
                                            <option key={c.id} value={c.id}>{c.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Requerimiento</label>
                                    <select
                                        required
                                        disabled={!formData.main_category}
                                        value={formData.sub_option}
                                        onChange={(e) => setFormData({ ...formData, sub_option: e.target.value })}
                                        className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium bg-white disabled:opacity-50"
                                    >
                                        <option value="" disabled>Selecciona un requerimiento...</option>
                                        {formData.main_category && MAIN_CATEGORIES.find(c => c.id === formData.main_category)?.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Detalle</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.details}
                                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                    className="w-full px-5 py-3 rounded-xl border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                                    placeholder="Describe el requerimiento..."
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="submit" className="flex-1 py-4 brand-gradient text-white font-bold text-sm rounded-full shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                                    Generar Ticket
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-brand-light text-brand-primary font-bold text-sm rounded-full border border-brand-accent/20 hover:bg-brand-accent/10 transition-all">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    const styles = {
        recibido: 'bg-warning-500/10 text-warning-500 border-warning-500/20',
        pendiente: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
        resueltos: 'bg-success-500/10 text-success-500 border-success-500/20',
        resuelto: 'bg-success-500/10 text-success-500 border-success-500/20',
        default: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    };
    const currentStyle = styles[status?.toLowerCase()] || styles.default;
    return (
        <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full border ${currentStyle} shadow-sm lowercase`}>
            {status}
        </span>
    );
}
