import { useState, useEffect } from 'react';
import { Mail, LayoutPanelTop, TableProperties, Settings as SettingsIcon, LayoutTemplate, Palette, Users as UsersIcon } from 'lucide-react';
import FormBuilder from '../../components/FormBuilder';
import MetricBuilder from '../../components/MetricBuilder';
import EmailBuilder from '../../components/EmailBuilder';
import TicketViewBuilder from '../../components/TicketViewBuilder';
import Users from './Users'; // Changed path slightly as Users is in the same folder

const ProfilesView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <h3 className="text-xl font-black text-brand-text tracking-tighter flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-brand-primary" /> Perfiles de Acceso (RBAC)
        </h3>
        <p className="text-sm text-gray-500 font-medium mb-8">Administra los niveles de acceso y visibilidad para los distintos usuarios del Centro de Ayuda.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Admin Profile */}
            <div className="bg-white rounded-3xl p-8 border-2 border-brand-primary/20 shadow-xl shadow-brand-primary/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150"></div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-brand-primary rounded-2xl text-white shadow-md">
                            <SettingsIcon className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full">Nivel 1</span>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Administrador</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-8 flex-grow">
                        Acceso total a la plataforma. Puede gestionar tickets, ver reportes analíticos, modificar la configuración del sistema y administrar otros usuarios.
                    </p>
                    <div className="space-y-3 mt-auto">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Módulos Visibles</div>
                        {['Monitoreo de tickets', 'Tickets', 'Evaluación de servicio', 'Reportes', 'Configuración'].map(mod => (
                            <div key={mod} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span> {mod}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Agente Profile */}
            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative overflow-hidden group hover:border-brand-secondary/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 group-hover:bg-brand-secondary/5"></div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-4 bg-gray-100 text-gray-500 rounded-2xl group-hover:bg-brand-secondary/10 group-hover:text-brand-secondary transition-colors">
                            <UsersIcon className="w-6 h-6" />
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-full">Nivel 2</span>
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Agente de Soporte</h4>
                    <p className="text-xs text-gray-500 leading-relaxed mb-8 flex-grow">
                        Perfil operativo enfocado en la resolución. Acceso restringido para proteger la configuración del sistema y métricas gerenciales.
                    </p>
                    <div className="space-y-3 mt-auto">
                        <div className="text-[11px] font-black text-gray-400 mb-2 border-b border-gray-100 pb-2">Módulos Visibles</div>
                        {['Monitoreo de tickets', 'Tickets'].map(mod => (
                            <div key={mod} className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-success-500"></span> {mod}
                            </div>
                        ))}
                        {['Evaluación de servicio', 'Reportes', 'Configuración'].map(mod => (
                            <div key={mod} className="flex items-center gap-2 text-sm font-medium text-gray-400 line-through opacity-70">
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span> {mod}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default function Settings() {
    const [activeTab, setActiveTab] = useState('forms');

    const tabs = [
        { id: 'forms', label: 'Edición de formulario', icon: TableProperties, color: 'text-indigo-500' },
        { id: 'metrics', label: 'Indicadores del Dashboard', icon: LayoutPanelTop, color: 'text-emerald-500' },
        { id: 'email', label: 'Diseño de Comunicaciones', icon: Mail, color: 'text-brand-primary' },
        { id: 'tickets', label: 'Personalización de Vistas', icon: LayoutTemplate, color: 'text-amber-500' },
        { id: 'users', label: 'Usuarios', icon: UsersIcon, color: 'text-purple-500' },
        { id: 'profiles', label: 'Perfiles', icon: UsersIcon, color: 'text-pink-500' }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-light/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                            <SettingsIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-brand-text tracking-tighter">Panel de Gestión de Configuración</h2>
                            <p className="text-gray-500 text-sm font-medium">Configura categorías, campos dinámicos y comunicaciones del sistema.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white px-2 py-1 rounded-2xl border border-brand-border shadow-sm inline-flex gap-1 mb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 py-3 px-6 rounded-xl font-black text-[11px] transition-all ${activeTab === tab.id
                            ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'text-white' : tab.color}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="transition-all duration-500">
                {activeTab === 'forms' && <FormBuilder />}
                {activeTab === 'metrics' && <MetricBuilder />}
                {activeTab === 'email' && <EmailBuilder />}
                {activeTab === 'tickets' && <TicketViewBuilder />}
                {activeTab === 'users' && <div className="mt-4"><Users /></div>}
                {activeTab === 'profiles' && <ProfilesView />}
            </div>
        </div>
    );
}


