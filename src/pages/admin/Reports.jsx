import { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, Calendar, BarChart3, PieChart as PieIcon, FileText } from 'lucide-react';
import * as Recharts from 'recharts';

export default function Reports() {
    const API = import.meta.env.VITE_API_URL;
    const [dateRange, setDateRange] = useState('30');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await axios.get(`${API}/api/tickets/report?days=${dateRange}`);
                setReportData(res.data.data);
            } catch (err) {
                console.error('Error fetching reports', err);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [dateRange]);

    const handleExport = () => {
        alert('Generando exportación CSV real desde PostgreSQL...');
        window.open(`${API}/api/surveys/export`, '_blank');
    };

    if (loading) {
        return <div className="p-20 text-center text-brand-primary animate-pulse font-black uppercase text-[10px] tracking-widest">Compilando analíticas de la DB...</div>;
    }

    const totalTickets = reportData?.daily.reduce((acc, d) => acc + parseInt(d.recibidos), 0) || 0;

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-1000">

            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-brand-border flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-3 bg-brand-light/30 px-5 py-2.5 rounded-xl border border-brand-border/50">
                    <Calendar className="w-4 h-4 text-brand-primary" />
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="bg-transparent border-none text-[11px] font-black text-brand-dark focus:ring-0 cursor-pointer"
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
                <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-auto italic">Actualizado hace unos instantes</div>
            </div>

            {/* Main Report View */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-border relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
                        <BarChart3 className="w-16 h-16" />
                    </div>
                    <h3 className="text-sm font-black text-brand-dark mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 brand-gradient rounded-full"></span> Volumen histórico
                    </h3>
                    <div className="h-56 w-full">
                        <Recharts.ResponsiveContainer width="100%" height="100%">
                            <Recharts.BarChart data={reportData?.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <Recharts.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <Recharts.XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: '900' }} dy={15} />
                                <Recharts.YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: '900' }} />
                                <Recharts.Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                />
                                <Recharts.Legend iconType="circle" wrapperStyle={{ fontSize: '9px', paddingTop: '30px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                                <Recharts.Bar dataKey="recibidos" name="Recibidos" fill="#C4B5FD" radius={[6, 6, 0, 0]} />
                                <Recharts.Bar dataKey="resueltos" name="Resueltos" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                            </Recharts.BarChart>
                        </Recharts.ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-brand-border relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:scale-110 transition-transform">
                        <PieIcon className="w-16 h-16" />
                    </div>
                    <h3 className="text-sm font-black text-brand-dark mb-4 border-b border-brand-border pb-3 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-success-500 rounded-full"></span> Mix de categorías
                    </h3>
                    <div className="flex flex-col justify-center h-56 pb-4 overflow-y-auto pr-2 custom-scrollbar">
                        <div className="space-y-6">
                            {reportData?.categories.map((cat, i) => {
                                const percentage = totalTickets > 0 ? Math.round((cat.count / totalTickets) * 100) : 0;
                                const colors = ['bg-brand-primary', 'bg-brand-secondary', 'bg-brand-accent', 'bg-brand-dark'];
                                return (
                                    <div key={cat.category} className="group/item">
                                        <div className="flex justify-between text-[11px] font-black text-gray-500 mb-3 uppercase tracking-tighter">
                                            <span className="group-hover/item:text-brand-primary transition-colors">{cat.category || 'General'}</span>
                                            <span className="text-brand-dark">{percentage}% <span className="opacity-30">({cat.count})</span></span>
                                        </div>
                                        <div className="w-full bg-brand-neutral rounded-full h-2.5 overflow-hidden p-0.5 border border-brand-border/30">
                                            <div className={`${colors[i % colors.length]} h-full rounded-full transition-all duration-1000 shadow-sm`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* Reports List Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-brand-border overflow-hidden mt-6">
                <div className="p-6 border-b border-brand-border/50 bg-brand-light/30 flex justify-between items-center">
                    <h3 className="text-sm font-black text-brand-dark flex items-center gap-2">
                        <FileText className="w-4 h-4 text-brand-primary" /> Reportes disponibles
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white text-gray-500 font-bold border-b border-brand-border/50 text-[11px]">
                            <tr>
                                <th className="px-6 py-4">Nombre del reporte</th>
                                <th className="px-6 py-4">Descripción</th>
                                <th className="px-6 py-4">Última actualización</th>
                                <th className="px-6 py-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/30">
                            <tr className="hover:bg-brand-light/20 transition-all duration-200 group">
                                <td className="px-6 py-5">
                                    <div className="font-bold text-brand-text text-sm tracking-tight flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-success-500/10 flex items-center justify-center text-success-500">
                                            <Download className="w-4 h-4" />
                                        </div>
                                        Consolidado de tickets
                                    </div>
                                </td>
                                <td className="px-6 py-5 text-xs text-gray-500 font-medium">
                                    Dataset completo con todos los tickets y campos dinámicos (Excel).
                                </td>
                                <td className="px-6 py-5 text-xs text-gray-400 font-medium">
                                    Automático (Real-time)
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => window.open(`${API}/api/tickets/export?days=${dateRange}`, '_blank')}
                                        className="px-6 py-2.5 bg-success-500/10 text-success-600 hover:bg-success-500 hover:text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
                                    >
                                        Descargar dataset
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
