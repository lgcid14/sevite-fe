import { X, ExternalLink, FileText, Layout, User, Calendar, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TICKET_STATUS, getStatusStyle } from '../utils/status';

export default function TicketQuickViewModal({ isOpen, onClose, ticket, loading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-dark/40 backdrop-blur-md animate-in fade-in duration-300">
            <div className={`bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-brand-border/50 animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]`}>
                
                {/* Header */}
                <div className="p-6 md:p-8 border-b border-brand-border/30 flex justify-between items-start bg-brand-light/20 shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h3 className="text-2xl font-black text-brand-text tracking-tight">Vistazo Rápido</h3>
                            <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase rounded-full border border-brand-primary/20">
                                #{ticket?.display_id || 'TK-XXXX'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Información general del requerimiento</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-3 hover:bg-white rounded-2xl transition-all shadow-sm hover:shadow-md group active:scale-95"
                    >
                        <X className="w-5 h-5 text-gray-400 group-hover:text-brand-primary transition-colors" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar space-y-8">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4">
                            <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
                            <p className="text-brand-primary font-black text-[10px] uppercase tracking-widest animate-pulse">Cargando detalles...</p>
                        </div>
                    ) : ticket ? (
                        <>
                            {/* Title & Status */}
                            <div className="space-y-4">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h4 className="text-xl font-bold text-gray-900 leading-tight flex-1">
                                        {ticket.title || 'Sin Título'}
                                    </h4>
                                    <div className="shrink-0">
                                        <span className={`px-4 py-1.5 text-[10px] font-black rounded-full border ${getStatusStyle(ticket.status_id, ticket.status)} shadow-sm uppercase tracking-wider`}>
                                            {ticket.status || 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                                <div className="h-1 w-20 brand-gradient rounded-full"></div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-brand-light/10 p-6 rounded-[2rem] border border-brand-border/30">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Tag className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Categoría</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{ticket.category || 'General'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Layout className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Tipo</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">{ticket.ticket_type || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <User className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Solicitante</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800 truncate" title={ticket.email}>{ticket.email || '---'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                                        <Calendar className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase tracking-widest">Fecha Creación</span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-800">
                                        {ticket.created_at ? new Date(ticket.created_at).toLocaleDateString('es-CL', { 
                                            day: '2-digit', 
                                            month: 'long', 
                                            year: 'numeric' 
                                        }) : '---'}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-brand-secondary/10 rounded-lg text-brand-secondary">
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Descripción del Caso</h5>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-brand-border/40 shadow-inner relative group min-h-[120px]">
                                    <p className="text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                        {ticket.details || 'No se proporcionó una descripción detallada para este ticket.'}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="py-20 text-center text-gray-400 font-bold italic">
                            No se pudo cargar la información del ticket.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 md:p-8 bg-gray-50 border-t border-brand-border/30 flex flex-col md:flex-row gap-4 shrink-0">
                    <Link 
                        to={`/admin/tickets/${ticket?.id}`}
                        onClick={onClose}
                        className="flex-1 flex items-center justify-center gap-3 py-4 brand-gradient text-white font-black text-sm rounded-2xl shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest"
                    >
                        Ver Expediente Completo <ExternalLink className="w-4 h-4" />
                    </Link>
                    <button 
                        onClick={onClose}
                        className="px-8 py-4 bg-white text-gray-500 font-black text-sm rounded-2xl border border-brand-border hover:bg-gray-50 transition-all uppercase tracking-widest"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
