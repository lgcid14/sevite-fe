import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, CheckCircle2, AlertTriangle, MessageSquare, BarChart3, TrendingUp, Zap } from 'lucide-react';

export default function Dashboard() {
    const API = import.meta.env.VITE_API_URL;
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [dateRange, setDateRange] = useState('30');

    useEffect(() => {
        let isMounted = true;
        let intervalId;

        const fetchStats = async (background = false) => {
            if (!background) setLoading(true);
            else setIsRefreshing(true);

            try {
                const response = await axios.get(`${API}/api/dashboard/overview?range=${dateRange}`);
                if (response.data.success && isMounted) {
                    setStats(response.data.data);
                }
            } catch (err) {
                console.error("Failed to load real stats", err);
            } finally {
                if (isMounted) {
                    setLoading(false);
                    setIsRefreshing(false);
                }
            }
        };

        fetchStats();

        // Polling en tiempo real cada 30 segundos
        intervalId = setInterval(() => {
            fetchStats(true); // fondo (background) refresh
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [dateRange]);

    if (loading && !stats) {
        return <div className="p-8 text-center text-brand-primary animate-pulse font-black uppercase tracking-widest text-[10px]">Sincronizando con base de datos en vivo...</div>;
    }

    return (
        <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header & Global Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 lg:gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-brand-text tracking-tight flex items-center gap-3">
                        <Zap className="w-8 h-8 text-brand-primary" /> Monitoreo de tickets
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Monitoreo operativo y métricas en tiempo real.</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-3xl border border-brand-border shadow-soft">
                    <div className="flex items-center gap-2 px-4">
                        <Calendar className="w-4 h-4 text-brand-secondary" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-transparent text-[12px] font-bold text-gray-600 focus:outline-none cursor-pointer"
                        >
                            <option value="1">Hoy</option>
                            <option value="7">7 días</option>
                            <option value="15">15 días</option>
                            <option value="30">30 días</option>
                            <option value="60">60 días</option>
                            <option value="90">90 días</option>
                            <option value="180">180 días</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* KPI Row (Vibrant Gradients) */}
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6 transition-opacity duration-500 ${isRefreshing ? 'opacity-80' : 'opacity-100'}`}>
                <KpiCard title="Total Solicitudes" value={stats?.tickets?.total || 0} color="bg-brand-primary" />
                <KpiCard title="Recibidos Mismo Día" value={stats?.tickets?.receivedToday || 0} color="bg-brand-dark" />
                <KpiCard title="En Proceso" value={(stats?.tickets?.byStatus?.['En proceso'] || 0) + (stats?.tickets?.byStatus?.['Pendiente de información'] || 0)} color="bg-warning-500" />
                <KpiCard title="Resueltos / Cerrados" value={(stats?.tickets?.byStatus?.['Resuelto'] || 0) + (stats?.tickets?.byStatus?.['Cerrado'] || 0)} color="bg-success-500" />
            </div>

            {/* 3 Grandes Bloques */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Bloque Operación */}
                <div className="bg-white rounded-[2rem] shadow-premium p-6 xl:p-8 lg:col-span-1 relative overflow-hidden group border border-brand-border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[12px] font-bold text-brand-text flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-primary rounded-full"></span> Estados de Gestión
                        </h3>
                    </div>
                    <div className="space-y-6">
                        <div className={`space-y-4 transition-opacity duration-500 ${isRefreshing ? 'opacity-80' : 'opacity-100'}`}>
                            <StatRow label="Recibidos" value={stats?.tickets?.byStatus?.['Recibido'] || 0} color="bg-yellow-500" total={stats?.tickets?.total} />
                            <StatRow label="En proceso" value={stats?.tickets?.byStatus?.['En proceso'] || 0} color="bg-brand-primary" total={stats?.tickets?.total} />
                            <StatRow label="Pte. Información" value={stats?.tickets?.byStatus?.['Pendiente de información'] || 0} color="bg-indigo-500" total={stats?.tickets?.total} />
                            <StatRow label="Resueltos" value={stats?.tickets?.byStatus?.['Resuelto'] || 0} color="bg-success-500" total={stats?.tickets?.total} />
                            <StatRow label="Cerrados" value={stats?.tickets?.byStatus?.['Cerrado'] || 0} color="bg-gray-500" total={stats?.tickets?.total} />
                        </div>

                        <div className="p-5 rounded-2xl bg-brand-neutral border border-brand-border/50 flex gap-4 mt-6 shadow-inner text-left">
                            <AlertTriangle className="w-6 h-6 text-brand-primary flex-shrink-0" />
                            <div>
                                <h4 className="text-[11px] font-black text-brand-dark mb-1">Alerta operativa</h4>
                                <p className="text-[11px] text-gray-500 font-semibold">Hay {(stats?.tickets?.byStatus?.['En proceso'] || 0) + (stats?.tickets?.byStatus?.['Pendiente de información'] || 0)} casos activos que requieren atención.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Bloque Últimos Comentarios */}
                <div className={`bg-white rounded-[2rem] shadow-premium p-6 xl:p-8 lg:col-span-1 border border-brand-border relative overflow-hidden flex flex-col transition-opacity duration-500 ${isRefreshing ? 'opacity-80' : 'opacity-100'}`}>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-[12px] font-bold text-brand-text flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-brand-secondary rounded-full"></span> Feedback
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2" style={{ maxHeight: '280px' }}>
                        {!stats?.experience?.recentFeedbacks || stats.experience.recentFeedbacks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
                                <p className="text-[11px] font-semibold text-center leading-relaxed">No hay comentarios de<br />usuarios en este periodo.</p>
                            </div>
                        ) : (
                            stats.experience.recentFeedbacks.map((fb, idx) => (
                                <div key={idx} className="p-4 rounded-2xl bg-[#FAFAFF] border border-brand-border/40 transition-colors hover:border-brand-border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex gap-1 text-[10px]">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={i < Math.round(fb.score / 2) ? "text-warning-500" : "text-gray-300"}>★</span>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {new Date(fb.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <p className="text-[12px] text-gray-700 font-medium leading-relaxed italic">"{fb.feedback}"</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Bloque Experiencia */}
                <div className={`bg-white rounded-[2rem] border border-brand-border shadow-premium p-6 xl:p-8 lg:col-span-1 relative overflow-hidden group transition-all duration-500 ${isRefreshing ? 'opacity-90' : 'opacity-100'}`}>
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:rotate-12 transition-transform duration-700">
                        <MessageSquare className="w-24 h-24" />
                    </div>
                    <div className="flex justify-between items-center mb-6 relative z-10">
                        <h3 className="text-xs font-black text-gray-900 flex items-center gap-3">
                            <span className="w-1.5 h-6 bg-success-500 rounded-full"></span> Experiencia de servicio
                        </h3>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Subcards de Experiencia NPS y CSAT */}
                        <div className="grid grid-cols-2 gap-4">

                            <div className="p-5 bg-success-500/10 rounded-2xl text-center border border-success-500/10 transition-transform hover:scale-105">
                                <p className="text-[10px] text-success-500 font-extrabold uppercase mb-1 tracking-widest">NPS</p>
                                <p className="text-3xl font-black text-success-500">{stats?.experience?.nps || 0}</p>
                            </div>

                            <div className="p-5 bg-brand-primary/10 rounded-2xl text-center border border-brand-primary/10 transition-transform hover:scale-105">
                                <p className="text-[10px] text-brand-primary font-extrabold uppercase mb-1 tracking-widest">CSAT</p>
                                <p className="text-3xl font-black text-brand-primary">{stats?.experience?.csat || 0}%</p>
                            </div>

                        </div>

                        {/* Summary Texto Minimalista */}
                        <div className="p-4 bg-brand-dark/5 rounded-2xl border border-brand-border text-center">
                            <p className="text-[11px] lg:text-[12px] text-gray-600 font-semibold tracking-wide">Basado en <span className="font-extrabold text-brand-primary">{stats?.experience?.responses || 0}</span> respuestas registradas</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

function KpiCard({ title, value, trend, color }) {
    return (
        <div className={`bg-white rounded-3xl p-6 border border-brand-border shadow-premium relative overflow-hidden group transition-all duration-300 hover:shadow-xl`}>
            <h3 className="text-[11px] font-bold text-gray-400 mb-3">{title}</h3>
            <div className="flex items-end justify-between">
                <p className="text-4xl font-bold tracking-tight text-brand-text">{value}</p>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-brand-light text-brand-primary`}>
                        <TrendingUp className="w-3.5 h-3.5" /> {trend}
                    </div>
                )}
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-1.5 ${color} opacity-40`}></div>
        </div>
    );
}

function StatRow({ label, value, color, total }) {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black tracking-tight">
                <div className="flex items-center gap-3 text-gray-600">
                    <div className={`w-2.5 h-2.5 rounded-full ${color}`}></div>
                    <span>{label}</span>
                </div>
                <span className="text-brand-dark">{value} <span className="text-gray-300 ml-1 font-bold">({Math.round(percentage)}%)</span></span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
}
