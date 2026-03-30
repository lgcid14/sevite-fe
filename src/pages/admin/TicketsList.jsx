import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Filter, SlidersHorizontal, Plus, ArrowRight, X, ChevronLeft, ChevronRight, Edit3, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import TicketQuickViewModal from '../../components/TicketQuickViewModal';
import { TICKET_STATUS, getStatusStyle } from '../../utils/status';

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
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        main_category: '',
        sub_option: '',
        ticket_type_id: '',
        details: ''
    });
    const [ticketTypes, setTicketTypes] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingTicket, setEditingTicket] = useState(null);
    const [editFormData, setEditFormData] = useState({
        status_id: '',
        notes: ''
    });
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
    const [quickViewTicket, setQuickViewTicket] = useState(null);
    const [quickViewLoading, setQuickViewLoading] = useState(false);

    const API = import.meta.env.VITE_API_URL;

    const fetchTicketsAndConfig = useCallback(async () => {
        try {
            const ticketsRes = await axios.get(`${API}/api/tickets`);
            setTickets(ticketsRes.data.data);

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
    }, [API]);

    useEffect(() => {
        const userStr = localStorage.getItem('servit_user');
        if (userStr) setCurrentUser(JSON.parse(userStr));
        fetchTicketsAndConfig();
    }, [fetchTicketsAndConfig]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const userStr = localStorage.getItem('servit_user');
            const userObj = userStr ? JSON.parse(userStr) : null;
            const reporter_id = userObj?.id || null;

            const mainCatObj = MAIN_CATEGORIES.find(c => c.id === formData.main_category);
            const payload = {
                title: formData.title,
                category_id: null,
                category: mainCatObj ? mainCatObj.label : 'General',
                type: formData.sub_option,
                ticket_type_id: formData.ticket_type_id,
                details: formData.details,
                reporter_id: reporter_id,
                channel: 'admin'
            };

            const res = await axios.post(`${API}/api/tickets`, payload);
            if (res.data.success) {
                setIsModalOpen(false);
                setFormData({ title: '', main_category: '', sub_option: '', ticket_type_id: '', details: '' });
                fetchTicketsAndConfig(); // Refresh list
            }
        } catch (err) {
            alert('Error al crear ticket: ' + (err.response?.data?.error || err.message));
        }
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                status_id: parseInt(editFormData.status_id),
                notes: editFormData.status_id === '3' ? editFormData.notes : '',
                owner_id: currentUser?.id,
                userId: currentUser?.id
            };
            const res = await axios.patch(`${API}/api/tickets/${editingTicket.id}`, payload);
            if (res.data.success) {
                setIsEditModalOpen(false);
                setEditingTicket(null);
                fetchTicketsAndConfig();
            }
        } catch (err) {
            alert('Error al actualizar ticket: ' + (err.response?.data?.error || err.message));
        }
    };

    const openEditModal = (ticket) => {
        setEditingTicket(ticket);
        setEditFormData({
            status_id: ticket.status_id,
            notes: ticket.notes || ''
        });
        setIsEditModalOpen(true);
    };

    const handleOpenQuickView = async (ticketId) => {
        setIsQuickViewOpen(true);
        setQuickViewLoading(true);
        try {
            const res = await axios.get(`${API}/api/tickets/${ticketId}`);
            if (res.data.success) {
                setQuickViewTicket(res.data.data);
            }
        } catch (err) {
            console.error('Error fetching ticket details:', err);
        } finally {
            setQuickViewLoading(false);
        }
    };

    const renderCell = (ticket, colId) => {
        switch (colId) {
            case 'id': {
                // Use display_id (TK000XXX) if available, otherwise fallback to id
                const displayId = ticket.display_id || ticket.id.substring(0, 8).toUpperCase();
                return (
                    <button 
                        onClick={() => handleOpenQuickView(ticket.id)}
                        className="group/id block text-left w-full hover:bg-brand-primary/5 p-2 -m-2 rounded-xl transition-all"
                    >
                        <div className="font-mono text-xs font-bold text-brand-primary mb-1 group-hover/id:translate-x-1 transition-transform flex items-center gap-2">
                            #{displayId} <Eye className="w-3 h-3 opacity-0 group-hover/id:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-[10px] font-bold text-gray-400 italic flex items-center gap-1">
                            Vistazo rápido <ArrowRight className="w-2 h-2" />
                        </div>
                    </button>
                );
            }
            case 'ticket_type':
                return (
                    <div className="max-w-[150px] font-medium text-gray-500 text-[12px] line-clamp-1" title={ticket.ticket_type}>
                        {ticket.ticket_type || '-'}
                    </div>
                );
            case 'category':
                return (
                    <span className="px-3 py-1 bg-brand-light text-brand-primary text-[10px] font-bold rounded-full border border-brand-accent/30 shadow-sm">
                        {ticket.category || 'General'}
                    </span>
                );
            case 'creationDate':
                return (
                    <div className="text-gray-400 text-[11px] font-medium">
                        {ticket.creationDate || '-'}
                    </div>
                );
            case 'email':
                return (
                    <div className="text-gray-500 text-[12px] font-medium truncate max-w-[180px]" title={ticket.email}>
                        {ticket.email || '-'}
                    </div>
                );
            case 'status':
                return <StatusBadge statusId={ticket.status_id} statusName={ticket.status} />;
            case 'actions':
                return (currentUser?.roleId === 1 || currentUser?.role_id === 1 || currentUser?.roleId === '1' || currentUser?.role_id === '1' || currentUser?.role === 'agente') ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(ticket);
                        }}
                        title="Editar estado"
                        className="p-2 hover:bg-brand-primary/10 rounded-full text-brand-primary transition-colors border border-transparent hover:border-brand-primary/20"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                ) : null;
            default:
                return <span className="text-sm font-medium text-gray-500">{ticket[colId] || '-'}</span>;
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchSearch = (t.display_id && t.display_id.toLowerCase().includes(search.toLowerCase())) ||
            t.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'todos' || parseInt(t.status_id) === parseInt(statusFilter);
        return matchSearch && matchStatus;
    });

    const visibleColumns = [
        { id: 'id', title: 'Ticket' },
        { id: 'ticket_type', title: 'Tipo' },
        { id: 'category', title: 'Categoría' },
        { id: 'creationDate', title: 'Fecha de creación' },
        { id: 'email', title: 'Solicitante' },
        { id: 'status', title: 'Estado' },
        { id: 'actions', title: '' }
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
                                <option value="1">Recibidos</option>
                                <option value="2">En proceso</option>
                                <option value="3">Pendiente info</option>
                                <option value="4">Resueltos</option>
                                <option value="5">Cerrados</option>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden border border-brand-border animate-in zoom-in-95 duration-300">
                        <div className="p-5 md:p-6 border-b border-brand-border/50 flex justify-between items-center bg-brand-light/30 shrink-0">
                            <h3 className="text-xl font-bold text-brand-text">Crear nuevo ticket</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateTicket} className="p-8 md:p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1">

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
            {/* EDIT TICKET MODAL (SUPPORT ONLY) */}
            {isEditModalOpen && editingTicket && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/30 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-brand-border animate-in zoom-in-95 duration-300">
                        <div className="p-5 border-b border-brand-border/50 flex justify-between items-center bg-brand-light/30">
                            <div>
                                <h3 className="text-lg font-bold text-brand-text">Actualizar Ticket</h3>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">#{editingTicket.display_id}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateTicket} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Nuevo Estado</label>
                                <select
                                    required
                                    value={editFormData.status_id}
                                    onChange={(e) => setEditFormData({ ...editFormData, status_id: e.target.value })}
                                    className="w-full px-6 py-3 rounded-full border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium bg-white"
                                >
                                    {Object.values(TICKET_STATUS).map(s => (
                                        <option key={s.id} value={s.id}>{s.label.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>

                            {editFormData.status_id === '3' && (
                                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Observaciones *</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={editFormData.notes}
                                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                        className="w-full px-5 py-3 rounded-xl border border-brand-border focus:ring-4 focus:ring-brand-primary/10 transition-all text-sm font-medium"
                                        placeholder="Ingrese el motivo o información faltante..."
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-4">
                                <button type="submit" className="flex-1 py-3.5 brand-gradient text-white font-bold text-xs rounded-full shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest">
                                    Guardar Cambios
                                </button>
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3.5 bg-brand-light text-brand-primary font-bold text-xs rounded-full border border-brand-accent/20 hover:bg-brand-accent/10 transition-all uppercase tracking-widest">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            <TicketQuickViewModal 
                isOpen={isQuickViewOpen}
                onClose={() => setIsQuickViewOpen(false)}
                ticket={quickViewTicket}
                loading={quickViewLoading}
            />
        </div>
    );
}

function StatusBadge({ statusId, statusName }) {
    const currentStyle = getStatusStyle(statusId, statusName);
    return (
        <span className={`px-4 py-1.5 text-[10px] font-bold rounded-full border ${currentStyle} shadow-sm lowercase`}>
            {statusName || TICKET_STATUS[statusId]?.label || '-'}
        </span>
    );
}
