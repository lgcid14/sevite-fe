import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { ChevronRight, CheckCircle2, Send, Loader2, Building2, Calculator, Users, Clock, FileText, Layout, ArrowRight, User, Mail, Phone } from 'lucide-react';
import Logo from '../components/Logo';

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

export default function PublicForm() {
    const API = import.meta.env.VITE_API_URL;
    const [ticketCreated, setTicketCreated] = useState(null);
    const [ticketTypes, setTicketTypes] = useState([]);
    const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm();

    useEffect(() => {
        const fetchTicketTypes = async () => {
            try {
                const res = await axios.get(`${API}/api/tickets/types`);
                setTicketTypes(res.data?.data || res.data || []);
            } catch (err) {
                console.error('Error fetching ticket types:', err);
            }
        };
        fetchTicketTypes();
    }, [API]);

    const selectedCategoryId = watch('main_category');
    const selectedCategoryObj = MAIN_CATEGORIES.find(c => c.id === selectedCategoryId);

    // Reset sub option when main category changes
    useEffect(() => {
        setValue('sub_option', '');
    }, [selectedCategoryId, setValue]);

    const onSubmit = async (data) => {
        try {
            const userStr = localStorage.getItem('servit_user');
            const userObj = userStr ? JSON.parse(userStr) : null;
            const reporter_id = userObj?.id || null;

            const payload = {
                tittle: data.title,
                category_id: null,
                category: selectedCategoryObj?.label || 'General',
                type: data.sub_option,
                ticket_type_id: data.ticket_type_id,
                details: data.details || 'Solicitud Centro de Ayuda',
                reporter_id: reporter_id,
                dynamicData: {}
            };

            const res = await axios.post(`${API}/api/tickets`, payload);
            setTicketCreated(res.data.data.display_id || res.data.data.id);
        } catch (err) {
            alert('Hubo un error al enviar tu solicitud.');
        }
    };



    if (ticketCreated) return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 font-sans" style={{ background: '#F8F8FB', fontFamily: 'Inter, sans-serif' }}>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 837" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <path d="M 1280 0 L 1280 837 L 0 837 C 50 780, 100 700, 160 600 C 230 490, 190 400, 280 310 C 390 200, 540 250, 680 180 C 820 110, 960 30, 1280 0 Z" fill="#BBB2D8" opacity="0.55" />
            </svg>
            <div className="relative z-10 bg-white/90 p-12 rounded-[2rem] shadow-premium border border-white/50 max-w-lg w-full text-center backdrop-blur-xl">
                <div className="w-20 h-20 bg-success-500/10 text-success-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-success-500/20">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Solicitud Enviada</h2>
                <p className="text-gray-500 mb-8 text-sm">Tu ticket ha sido generado correctamente. Nos pondremos en contacto a la brevedad.</p>
                <div className="bg-[#FAFAFF] border border-[#EDE9FE] p-6 rounded-2xl mb-8 shadow-inner">
                    <p className="text-[10px] text-[#A78BFA] mb-2 font-bold uppercase tracking-widest">Número de Seguimiento</p>
                    <p className="font-mono text-2xl font-bold text-[#6B38D1] tracking-tighter">{ticketCreated}</p>
                </div>
                <button onClick={() => window.location.reload()} className="w-full flex justify-center items-center py-4 rounded-xl text-white font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all" style={{ background: 'linear-gradient(135deg, #6B38D1 0%, #8B5CF6 100%)', boxShadow: '0 4px 14px rgba(107,56,209,0.35)' }}>
                    Enviar otra solicitud
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center" style={{ background: '#F8F8FB', fontFamily: 'Inter, sans-serif' }}>
            {/* ── SINGLE-TONE WAVE BACKGROUND ── */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1280 837" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                <path d="M 1280 0 L 1280 837 L 0 837 C 50 780, 100 700, 160 600 C 230 490, 190 400, 280 310 C 390 200, 540 250, 680 180 C 820 110, 960 30, 1280 0 Z" fill="#BBB2D8" opacity="0.55" />
            </svg>

            <div className="relative z-10 w-full max-w-[1300px] mx-auto flex min-h-screen px-6 lg:px-12">

                {/* ── LEFT — Form (Scrollable area) ── */}
                <div className="w-full lg:w-[50%] flex flex-col py-10 lg:pr-10 max-h-screen overflow-y-auto custom-scrollbar">

                    {/* Header */}
                    <div className="mb-8 text-center flex flex-col items-center">
                        <Logo className="w-20 h-20 mb-2" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Centro de Ayuda</h1>
                        <p className="text-gray-500 font-medium text-sm">Selecciona una categoría para comenzar tu solicitud.</p>
                    </div>

                    <div className="w-full rounded-[2rem] p-8" style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', border: '1px solid rgba(187,178,216,0.3)', boxShadow: '0 8px 40px rgba(107,56,209,0.08)' }}>
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div className="space-y-6">

                                {/* 2. Tipo de Ticket */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest px-1">Tipo de Ticket *</label>
                                    <select
                                        {...register('ticket_type_id', { required: true })}
                                        className="w-full text-sm px-5 py-3 rounded-xl outline-none transition-all font-semibold cursor-pointer"
                                        style={{ border: '1px solid #EDE9FE', background: '#FAFAFF', color: '#374151' }}
                                    >
                                        <option value="">Selecciona un tipo...</option>
                                        {ticketTypes.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.ticket_type_id && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase px-1">El tipo de ticket es obligatorio</p>}
                                </div>

                                {/* 3. Título del Ticket */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest px-1">Título del Ticket *</label>
                                    <input {...register('title', { required: true })} className="w-full text-sm px-5 py-3 rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium" style={{ border: '1px solid #EDE9FE', background: '#FAFAFF', color: '#374151' }} placeholder="Resumen de la solicitud..." onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }} />
                                    {errors.title && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase px-1">El título es obligatorio</p>}
                                </div>

                                {/* 4. Categoría Principal */}
                                <div>
                                    <label className="block text-[10px] font-bold text-[#A78BFA] mb-3 uppercase tracking-widest px-1">¿En qué te podemos ayudar? *</label>
                                    <div className="flex flex-col gap-3">
                                        {MAIN_CATEGORIES.map(cat => (
                                            <label key={cat.id} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer group ${selectedCategoryId === cat.id ? 'border-[#8B5CF6] bg-[#FAFAFF]' : 'border-[#EDE9FE] bg-white hover:border-[#8B5CF6]/50'}`}>
                                                <div className="flex items-center gap-3">
                                                    <input type="radio" value={cat.id} {...register('main_category', { required: true })} className="hidden" />
                                                    <span className={`text-sm font-semibold ${selectedCategoryId === cat.id ? 'text-[#6B38D1]' : 'text-gray-600 group-hover:text-gray-900'}`}>{cat.label}</span>
                                                </div>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategoryId === cat.id ? 'text-[#8B5CF6] translate-x-1' : 'text-gray-300'}`} />
                                            </label>
                                        ))}
                                    </div>
                                    {errors.main_category && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase px-1">Selecciona una categoría</p>}
                                </div>

                                {/* 4b. Requerimiento */}
                                {selectedCategoryId && (
                                    <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest px-1">Selecciona tu Requerimiento *</label>
                                            <select {...register('sub_option', { required: true })} className="w-full text-sm px-5 py-3 rounded-xl outline-none transition-all font-semibold select-none cursor-pointer" style={{ border: '1px solid #EDE9FE', background: '#FAFAFF', color: '#374151' }} onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}>
                                                <option value="" disabled>Selecciona una opción detallada...</option>
                                                {selectedCategoryObj?.options.map(opt => (
                                                    <option key={opt} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                            {errors.sub_option && <p className="mt-2 text-[10px] text-red-500 font-bold uppercase px-1">El requerimiento es obligatorio</p>}
                                        </div>
                                    </div>
                                )}

                                {/* 5. Descripción */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-[#A78BFA] uppercase tracking-widest px-1">Detalle del requerimiento (opcional)</label>
                                    <textarea {...register('details')} rows={3} className="w-full text-sm px-5 py-3 rounded-xl outline-none transition-all placeholder:text-gray-400 font-medium resize-none" style={{ border: '1px solid #EDE9FE', background: '#FAFAFF', color: '#374151' }} placeholder="Cualquier información adicional..." onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }} onBlur={(e) => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }} />
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" disabled={isSubmitting || !selectedCategoryId} className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 active:scale-[0.98]" style={{ background: 'linear-gradient(135deg, #6B38D1 0%, #8B5CF6 100%)', boxShadow: '0 4px 14px rgba(107,56,209,0.35)' }}>
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud Segura'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-6 text-center pb-8 lg:pb-0">
                        <p className="text-[10px] font-bold uppercase tracking-widest flex flex-col md:flex-row items-center justify-center gap-2" style={{ color: '#A78BFA' }}>
                            <span>© 2026 Servit</span>
                            <span className="hidden md:block w-1 h-1 rounded-full bg-[#A78BFA]"></span>
                            <span>Soporte Técnico Especializado</span>
                        </p>
                    </div>
                </div>

                {/* ── RIGHT — Illustration ── */}
                <div className="hidden lg:flex lg:w-[50%] items-center justify-center relative py-12">
                    {/* Sparkles */}
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                        {[
                            { top: '24%', left: '15%', size: 14 },
                            { top: '15%', left: '75%', size: 9 },
                            { top: '68%', left: '8%', size: 10 },
                            { top: '80%', left: '80%', size: 8 },
                            { top: '48%', left: '92%', size: 11 },
                            { top: '85%', left: '45%', size: 8 },
                            { top: '35%', left: '5%', size: 7 },
                        ].map((s, i) => (
                            <div key={i} className="absolute" style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0.6 }}>
                                <svg viewBox="0 0 24 24" fill="#8B5CF6">
                                    <path d="M12 2 L13.5 10 L22 12 L13.5 14 L12 22 L10.5 14 L2 12 L10.5 10 Z" />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* Image */}
                    <img src="/support-character.png" alt="Servit Support Representation" className="relative select-none drop-shadow-2xl" style={{ zIndex: 2, width: '480px', maxWidth: '90%', objectFit: 'contain', objectPosition: 'center center', mixBlendMode: 'multiply', filter: 'contrast(1.05)' }} draggable={false} />
                </div>
            </div>

            {/* Hidden custom scrollbar style for left column */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(187,178,216,0.4); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139,92,246,0.6); }
            `}} />
        </div>
    );
}
