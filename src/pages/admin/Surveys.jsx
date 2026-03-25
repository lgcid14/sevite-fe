import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Download, Calendar, MessageSquareHeart } from 'lucide-react';

export default function Surveys() {
    const API = import.meta.env.VITE_API_URL;
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        try {
            const res = await axios.get(`${API}/api/surveys/metrics`);
            setMetrics(res.data.data);
        } catch (err) {
            console.error('Error fetching metrics', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="bg-white rounded-xl shadow-sm border border-brand-border h-64 flex items-center justify-center">
            <div className="animate-pulse text-brand-primary">Cargando métricas de feedback...</div>
        </div>
    );
    if (!metrics) return <div className="p-8 text-center text-gray-500">Error cargando datos.</div>;

    // Data for NPS distribution chart
    const chartData = [
        { name: 'Promotores', value: metrics.responses.filter(r => r.score >= 9).length, fill: '#10b981' }, // emerald-500
        { name: 'Pasivos', value: metrics.responses.filter(r => r.score >= 7 && r.score <= 8).length, fill: '#f59e0b' }, // amber-500
        { name: 'Detractores', value: metrics.responses.filter(r => r.score <= 6).length, fill: '#ef4444' }, // red-500
    ];

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-brand-text">Monitoreo feedback de usuarios</h2>
                    <p className="text-gray-500 text-sm">Monitoreo de NPS y retroalimentación basado en encuestas de resolución de tickets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-brand-border rounded-lg px-3 py-1.5 shadow-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">Últimos 30 días</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white font-medium rounded-lg text-sm hover:bg-brand-secondary transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-premium flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-success-500/50"></div>
                    <p className="text-[11px] font-bold text-gray-400 mb-2">NPS</p>
                    <p className={`text-5xl font-bold ${metrics.nps >= 50 ? 'text-success-500' : metrics.nps > 0 ? 'text-brand-primary' : 'text-danger-500'}`}>
                        {metrics.nps}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-premium flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 w-full h-1 bg-brand-primary/50"></div>
                    <p className="text-[11px] font-bold text-gray-400 mb-2">Satisfacción (CSAT)</p>
                    <p className="text-5xl font-bold text-brand-text">{metrics.csat}<span className="text-2xl text-gray-300">%</span></p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-premium flex flex-col justify-center items-center text-center">
                    <p className="text-[11px] font-bold text-gray-400 mb-2">Encuestas Enviadas</p>
                    <p className="text-4xl font-bold text-brand-text">{metrics.totalSent}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-premium flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Encuestas Recibidas</p>
                    <p className="text-4xl font-bold text-brand-text">{metrics.totalReceived}</p>
                </div>
            </div>

            {/* Chart & Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-brand-border shadow-sm lg:col-span-1">
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageSquareHeart className="w-5 h-5 text-brand-primary" /> Distribución NPS
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <RechartsTooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-brand-border shadow-sm lg:col-span-2 overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <h3 className="font-semibold text-gray-900">Feedback Reciente</h3>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-brand-neutral text-brand-text font-semibold border-b border-brand-border text-xs tracking-wide">
                                <tr>
                                    <th className="px-6 py-4">Fecha</th>
                                    <th className="px-6 py-4 text-center">Score</th>
                                    <th className="px-6 py-4">Comentario</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.responses.length === 0 ? (
                                    <tr><td colSpan="3" className="px-6 py-12 text-center text-gray-500">No hay respuestas registradas.</td></tr>
                                ) : metrics.responses.slice(0, 5).map(resp => (
                                    <tr key={resp.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-medium">
                                            {new Date(resp.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${resp.score >= 9 ? 'bg-green-100 text-green-700 border border-green-200' :
                                                resp.score >= 7 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                                    'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                {resp.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 leading-relaxed italic">
                                            "{resp.feedback || <span className="text-gray-400 font-normal">Sin comentario adicional.</span>}"
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
