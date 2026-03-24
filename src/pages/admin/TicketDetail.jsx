import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Clock, User, Mail, FileText, CheckCircle2,
    MessageSquare, History, Sparkles, Search, Lightbulb,
    Send, Info, AlertCircle, Check
} from 'lucide-react';

export default function TicketDetail() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [history, setHistory] = useState([]);
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState(null);
    const [showAiPanel, setShowAiPanel] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [ticketRes, historyRes, configRes] = await Promise.all([
                    axios.get(`http://localhost:3001/api/tickets/${id}`),
                    axios.get(`http://localhost:3001/api/tickets/${id}/history`),
                    axios.get(`http://localhost:3001/api/config/ticket-view`)
                ]);
                setTicket(ticketRes.data.data);
                setHistory(historyRes.data.data || []);
                if (configRes.data.success) setConfig(configRes.data.data);
            } catch (err) {
                console.error("Failed to load ticket details", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const isSectionVisible = (secId) => {
        if (!config || !config.detailLayout) return true;
        return config.detailLayout.find(s => s.id === secId)?.visible !== false;
    };

    const getSectionTitle = (secId, fallback) => {
        if (!config || !config.detailLayout) return fallback;
        return config.detailLayout.find(s => s.id === secId)?.title || fallback;
    };

    const handleStatusChange = async (newStatus) => {
        try {
            await axios.patch(`http://localhost:3001/api/tickets/${id}/status`, { status: newStatus });
            setTicket({ ...ticket, status: newStatus });
            const historyRes = await axios.get(`http://localhost:3001/api/tickets/${id}/history`);
            setHistory(historyRes.data.data || []);
        } catch (err) {
            alert('Error actualizando estado.');
        }
    };

    const refreshTicket = async () => {
        const [ticketRes, historyRes] = await Promise.all([
            axios.get(`http://localhost:3001/api/tickets/${id}`),
            axios.get(`http://localhost:3001/api/tickets/${id}/history`)
        ]);
        setTicket(ticketRes.data.data);
        setHistory(historyRes.data.data || []);
    };

    const handleSendReply = async () => {
        if (!replyText.trim()) return;
        setSendingReply(true);
        try {
            await axios.post(`http://localhost:3001/api/tickets/${id}/reply`, {
                message: replyText,
                userId: 'admin'
            });
            setReplyText('');
            await refreshTicket();
        } catch (err) {
            alert('Error al enviar respuesta.');
        } finally {
            setSendingReply(false);
        }
    };

    const generateAiSuggestion = async () => {
        setAiLoading(true);
        setShowAiPanel(true);
        try {
            const res = await axios.post(`http://localhost:3001/api/tickets/${id}/ai-suggest`);
            if (res.data.success) {
                setAiSuggestion(res.data.data);
            } else {
                setAiSuggestion({
                    content: res.data.data?.content || 'Error procesando sugerencia.',
                    internetSearch: res.data.data?.internetSearch || 'Intenta de nuevo.'
                });
            }
        } catch (error) {
            setAiSuggestion({
                content: 'No se pudo conectar con el servidor de IA (Keta).',
                internetSearch: 'Revisa si el backend de Node y n8n están corriendo.'
            });
        } finally {
            setAiLoading(false);
        }
    };

    const applyAiSuggestion = () => {
        if (aiSuggestion) {
            setReplyText(prev => prev + (prev ? '\n\n' : '') + aiSuggestion.content);
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'recibido': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'pendiente': return 'bg-brand-neutral text-brand-text border-brand-border';
            case 'resuelto': return 'bg-success-100 text-success-700 border-success-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-brand-border h-64 flex items-center justify-center">
            <div className="animate-pulse text-brand-primary font-black tracking-widest uppercase text-xs">Cargando expediente...</div>
        </div>
    );

    if (!ticket) return <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">Ticket no encontrado.</div>;

    const sections = config?.detailLayout?.sort((a, b) => a.order - b.order) || [
        { id: 'header', visible: true, title: 'Encabezado' },
        { id: 'sheet_table', visible: true, title: 'Datos de Gestión' },
        { id: 'original_details', visible: true, title: 'Requerimiento' },
        { id: 'timeline', visible: true, title: 'Historial' }
    ];

    return (
        <div className="space-y-5 max-w-7xl mx-auto px-4 pb-12 animate-in fade-in duration-700">
            {/* Header Section (Special Case, but respects Visibility) */}
            {isSectionVisible('header') && (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/tickets" className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-500 transition-all border border-transparent hover:border-gray-200">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tighter">#{ticket.display_id || ticket.id.substring(0, 8).toUpperCase()}</h2>
                                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${getStatusStyles(ticket.status)} shadow-sm`}>
                                    {ticket.status}
                                </span>
                                <div className="h-6 w-px bg-gray-100 mx-1 hidden md:block"></div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 bg-brand-light text-brand-primary text-[9px] font-black uppercase rounded-md border border-brand-border/50">RUT: {ticket.rut}</span>
                                    <span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-black uppercase rounded-md border border-amber-100">Prioridad: Alta</span>
                                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black uppercase rounded-md border border-blue-100">Canal: Web Portal</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(ticket.created_at).toLocaleDateString()}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 underline decoration-brand-primary/30"><Mail className="w-3 h-3 text-brand-primary" /> {ticket.correo || ticket.email}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={generateAiSuggestion}
                            className="flex items-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Sparkles className="w-4 h-4" /> Asistente IA
                        </button>
                        <div className="h-10 w-px bg-gray-100 mx-1 hidden md:block"></div>
                        <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="bg-gray-50 border border-gray-100 text-gray-700 text-[10px] font-black uppercase tracking-widest rounded-2xl px-4 py-3 focus:ring-4 focus:ring-brand-primary/5 focus:outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={ticket.status?.toLowerCase() === 'resuelto'}
                        >
                            <option value="Recibido">RECIBIDO</option>
                            <option value="Pendiente">PENDIENTE</option>
                            <option value="Resuelto">RESUELTO</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Main Layout: 2/3 (Left) and 1/3 (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

                {/* Left Column (2/3 width) */}
                <div className="lg:col-span-8 space-y-5 order-2 lg:order-1">

                    {/* 1. Reply Box (The main action area) */}
                    {ticket.status?.toLowerCase() !== 'resuelto' ? (
                        <div className="bg-white rounded-[2.5rem] border-4 border-brand-primary/10 shadow-2xl shadow-brand-primary/5 overflow-hidden focus-within:ring-8 focus-within:ring-brand-primary/5 transition-all animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-5 bg-brand-primary flex items-center justify-between">
                                <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    <Send className="w-4 h-4" /> Enviar Respuesta Oficial
                                </span>
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                    <span className="text-[10px] text-brand-light font-bold">Modo Gestión Activo</span>
                                </div>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={8}
                                    className="w-full p-6 text-sm font-medium border-0 focus:ring-0 resize-none bg-white text-gray-800 placeholder:text-gray-300 rounded-3xl"
                                    placeholder="Escribe aquí tu respuesta detallada para el usuario..."
                                />
                            </div>
                            <div className="p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><AlertCircle className="w-5 h-5" /></button>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Shift + Enter para saltos de línea</div>
                                </div>
                                <button
                                    onClick={handleSendReply}
                                    disabled={sendingReply || !replyText.trim()}
                                    className="flex items-center gap-3 bg-brand-primary text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-brand-secondary transition-all disabled:opacity-30 transform active:scale-95 shadow-lg shadow-brand-primary/20"
                                >
                                    {sendingReply ? 'ENVIANDO...' : 'ENVIAR RESPUESTA'} <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-success-50 rounded-[2.5rem] border border-success-100 p-8 text-center flex flex-col items-center justify-center animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
                            <CheckCircle2 className="w-12 h-12 text-success-500 mb-4" />
                            <h3 className="text-xl font-black text-success-800 tracking-tight mb-2">Ticket Resuelto</h3>
                            <p className="text-sm font-medium text-success-600 max-w-md">
                                Este caso ha sido cerrado permanentemente y el usuario ha sido notificado automático por correo. No es posible añadir más respuestas.
                            </p>
                        </div>
                    )}


                    {/* 2. Conversation Thread (Replies from DB) */}
                    {ticket.replies && ticket.replies.length > 0 && (
                        <div className="bg-white rounded-[2rem] border border-brand-border shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                                <div className="p-2 bg-brand-light rounded-xl text-brand-primary">
                                    <MessageSquare className="w-4 h-4" />
                                </div>
                                <h3 className="text-xs font-black text-gray-800 tracking-tight">Hilo de respuestas ({ticket.replies.length})</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {ticket.replies.map((reply) => (
                                    <div key={reply.id} className="flex flex-col gap-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black text-brand-primary uppercase tracking-widest">
                                                {reply.agent || 'Agente'}
                                            </span>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase">
                                                {new Date(reply.created_at).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' })}
                                            </span>
                                        </div>
                                        <div className="bg-brand-light/40 border border-brand-border/40 rounded-2xl rounded-tl-sm p-4 text-sm text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                                            {reply.message}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* 3. Sheets Data Table (sheet_table) */}
                    {isSectionVisible('sheet_table') && (
                        <div className="bg-white rounded-[2rem] border border-brand-border shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-700">
                            <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-light rounded-xl text-brand-primary"><Search className="w-4 h-4" /></div>
                                    <h3 className="text-xs font-black text-gray-800 uppercase tracking-[0.2em]">{getSectionTitle('sheet_table', 'Tabla de Datos Sheets')}</h3>
                                </div>
                                <div className="flex items-center gap-1.5 bg-success-100 text-success-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ring-4 ring-success-50">
                                    <div className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"></div>
                                    Google Sheets Live
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-brand-light/10">
                                            {/* Common Fields */}
                                            {['Empresa', 'Tienda', 'Cód. Oferta', 'Cargo', 'Inicio', 'H. Inicio'].map(h => (
                                                <th key={h} className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50 whitespace-nowrap">{h}</th>
                                            ))}
                                            {/* Conditional Fields from form */}
                                            {ticket.sheetData?.motivo && ticket.sheetData.motivo !== '---' && <th className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50">Motivo</th>}
                                            {ticket.sheetData?.justificacion && ticket.sheetData.justificacion !== '---' && <th className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50">Justificación</th>}
                                            {ticket.sheetData?.datoOriginal && ticket.sheetData.datoOriginal !== '---' && <th className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50">Dato Actual</th>}
                                            {ticket.sheetData?.nuevoDato && ticket.sheetData.nuevoDato !== '---' && <th className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50">Nuevo Dato</th>}
                                            {ticket.sheetData?.tipoDoc && ticket.sheetData.tipoDoc !== '---' && <th className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50">Tipo Doc</th>}
                                            <th className="px-6 py-4 text-[9px] font-black text-brand-primary uppercase tracking-widest border-b border-brand-border/50">Evaluación</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="hover:bg-brand-light/5 transition-colors">
                                            <td className="px-6 py-5 text-xs font-bold text-gray-900 border-b border-gray-50">{ticket.sheetData?.empresa || '---'}</td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-600 border-b border-gray-50">{ticket.sheetData?.tienda || '---'}</td>
                                            <td className="px-6 py-5 text-xs font-mono font-bold text-brand-secondary border-b border-gray-50">{ticket.sheetData?.codigo_oferta || ticket.sheetData?.codigoOferta || '---'}</td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-600 border-b border-gray-50">{ticket.sheetData?.cargo || '---'}</td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-500 border-b border-gray-50">{ticket.sheetData?.fechaInicio || ticket.sheetData?.fecha || '---'}</td>
                                            <td className="px-6 py-5 text-xs font-medium text-gray-600 border-b border-gray-50">{ticket.sheetData?.horaInicio || '---'}</td>

                                            {/* Data for Conditional Fields */}
                                            {ticket.sheetData?.motivo && ticket.sheetData.motivo !== '---' && <td className="px-6 py-5 text-xs font-medium text-brand-primary border-b border-gray-50">{ticket.sheetData.motivo}</td>}
                                            {ticket.sheetData?.justificacion && ticket.sheetData.justificacion !== '---' && <td className="px-6 py-5 text-xs font-medium text-brand-primary border-b border-gray-50">{ticket.sheetData.justificacion}</td>}
                                            {ticket.sheetData?.datoOriginal && ticket.sheetData.datoOriginal !== '---' && <td className="px-6 py-5 text-xs font-medium text-brand-primary border-b border-gray-50">{ticket.sheetData.datoOriginal}</td>}
                                            {ticket.sheetData?.nuevoDato && ticket.sheetData.nuevoDato !== '---' && <td className="px-6 py-5 text-xs font-medium text-brand-primary border-b border-gray-50">{ticket.sheetData.nuevoDato}</td>}
                                            {ticket.sheetData?.tipoDoc && ticket.sheetData.tipoDoc !== '---' && <td className="px-6 py-5 text-xs font-medium text-brand-primary border-b border-gray-50">{ticket.sheetData.tipoDoc}</td>}

                                            <td className="px-6 py-5 border-b border-gray-50">
                                                <span className="px-2 py-1 bg-success-50 text-success-700 text-[10px] font-black rounded uppercase">
                                                    {ticket.sheetData?.evaluacion || 'Pendiente'}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (1/3 width) */}
                <div className="lg:col-span-4 space-y-5 order-1 lg:order-2">


                    {/* AI Assistant (Keep it prominent if active) */}
                    {showAiPanel && (
                        <div className="bg-gradient-to-br from-indigo-900 to-brand-primary rounded-[2rem] p-6 text-white shadow-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <Sparkles className="w-24 h-24" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-indigo-300" /> Agente IA
                                    </h3>
                                    <button onClick={() => setShowAiPanel(false)} className="text-indigo-200 hover:text-white transition-colors">×</button>
                                </div>
                                {aiLoading ? (
                                    <div className="space-y-4 py-6">
                                        <div className="h-2 bg-white/20 rounded-full w-full animate-pulse"></div>
                                        <div className="h-2 bg-white/20 rounded-full w-3/4 animate-pulse"></div>
                                        <div className="flex justify-center mt-6">
                                            <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                            <h4 className="text-[9px] font-black uppercase text-indigo-300 mb-2.5 flex items-center gap-1.5">
                                                <Search className="w-3 h-3" /> Fuentes Externas
                                            </h4>
                                            <p className="text-[11px] text-indigo-100 italic leading-relaxed">"{aiSuggestion?.internetSearch}"</p>
                                        </div>
                                        <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                                            <h4 className="text-[9px] font-black uppercase text-indigo-300 mb-2.5 flex items-center gap-1.5">
                                                <Lightbulb className="w-3 h-3" /> Sugerencia
                                            </h4>
                                            <p className="text-xs font-bold leading-relaxed">{aiSuggestion?.content}</p>
                                            <button
                                                onClick={applyAiSuggestion}
                                                className="mt-4 w-full bg-white text-brand-primary py-3 rounded-xl font-black text-[10px] uppercase hover:bg-brand-light transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-3 h-3" /> Aplicar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Message Details & Dynamic Details (Unified) */}
                    {(isSectionVisible('original_details') || (ticket.payload && Object.keys(ticket.payload).length > 0)) && (
                        <div className="bg-white rounded-[2rem] border border-brand-border shadow-sm p-6 animate-in slide-in-from-bottom-4 duration-600">
                            <h4 className="text-[11px] font-black text-gray-500 mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-brand-secondary" /> {getSectionTitle('original_details', 'Detalle del requerimiento')}
                            </h4>
                            
                            <div className="bg-brand-neutral/30 p-6 rounded-[2rem] border border-brand-border/40 relative mb-4">
                                <p className="text-sm text-gray-800 leading-relaxed font-semibold text-center italic">"{ticket.details || 'Sin descripción adicional'}"</p>
                            </div>

                            {ticket.payload && Object.keys(ticket.payload).length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-brand-primary mb-3 flex items-center gap-2 border-t border-gray-100 pt-4">
                                        <Sparkles className="w-3 h-3 text-brand-primary" /> Atributos de {ticket.type}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-3 bg-brand-light/20 p-5 rounded-[1.5rem] border border-brand-border/30">
                                        {Object.entries(ticket.payload).map(([key, value]) => (
                                            <div key={key} className="space-y-1">
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none">{key}</p>
                                                <p className="text-sm font-bold text-gray-800 break-all">{value || '---'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* 5. Reminder card */}
                    <div className="bg-brand-neutral/30 rounded-[2rem] p-6 border-2 border-dashed border-brand-border/60 flex flex-col items-center text-center">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-brand-border mb-3">
                            <AlertCircle className="w-8 h-8 text-brand-secondary" />
                        </div>
                        <h4 className="text-[11px] font-black text-brand-text mb-2">Recordatorio importante</h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed font-bold italic mb-4">"Solo marca como RESUELTO cuando el caso esté cerrado definitivamente."</p>
                        <div className="w-full bg-white/80 rounded-xl p-3 border border-white text-[9px] font-black text-gray-400 shadow-sm">
                            Este cambio activará la encuesta NPS automática.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

const TableProperties = ({ className }) => <LayoutPanelTop className={className} />;
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

