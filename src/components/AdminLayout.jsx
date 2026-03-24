import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Ticket, HeartHandshake, FileText, Settings, Users, LogOut } from 'lucide-react';

export default function AdminLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const userString = localStorage.getItem('servit_user');
    const user = userString ? JSON.parse(userString) : { name: 'Usuario', role: 'admin' };

    const navigation = [
        { name: 'Monitoreo de tickets', href: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin', 'agente'] },
        { name: 'Tickets', href: '/admin/tickets', icon: Ticket, roles: ['admin', 'agente'] },
        { name: 'Evaluación de servicio', href: '/admin/surveys', icon: HeartHandshake, roles: ['admin'] },
        { name: 'Reportes', href: '/admin/reports', icon: FileText, roles: ['admin'] },
        { name: 'Configuración', href: '/admin/settings', icon: Settings, roles: ['admin'] },
    ];

    const filteredNavigation = navigation.filter(item => item.roles.includes(user.role?.toLowerCase() || 'admin'));

    const handleLogout = () => {
        localStorage.removeItem('servit_token');
        localStorage.removeItem('servit_user');
        navigate('/login');
    };

    const initials = user.name?.split(' ').slice(0, 2).map(w => (w ? w[0] : '')).join('').toUpperCase() || '?';

    return (
        <div className="flex h-screen bg-brand-neutral overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-16 md:w-52 lg:w-64 bg-white text-brand-text flex flex-col shadow-lg relative z-10 border-r border-brand-border transition-all duration-300">
                <div className="p-4 lg:p-5 flex items-center justify-center md:justify-start border-b border-brand-border/50 h-14 lg:h-16">
                    <div className="flex items-center gap-3">
                        <img src="/logo_alt.png" alt="Servit Logo" className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg lg:rounded-xl opacity-90" />
                        <h1 className="text-lg lg:text-xl font-bold tracking-tight text-brand-primary lowercase hidden md:block">servit</h1>
                    </div>
                </div>

                <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto">
                    {filteredNavigation.map((item) => (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-2.5 rounded-xl text-[11px] font-semibold transition-all duration-200 group ${location.pathname.startsWith(item.href)
                                    ? 'bg-brand-primary/10 text-brand-primary'
                                    : 'text-gray-500 hover:bg-brand-neutral hover:text-brand-primary'
                                }`}
                            title={item.name}
                        >
                            <item.icon className={`w-5 h-5 md:w-4 md:h-4 transition-transform duration-200 ${location.pathname.startsWith(item.href) ? 'text-brand-primary' : 'text-gray-400 group-hover:text-brand-primary'}`} />
                            <span className="hidden md:inline">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* User Profile Area */}
                <div className="p-3 lg:p-4 border-t border-brand-border bg-brand-neutral/30 flex justify-center md:justify-between items-center">
                    <div className="flex items-center gap-2 lg:gap-3 hidden md:flex">
                        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full brand-gradient flex items-center justify-center font-bold text-white text-xs shadow-sm border border-white/20">
                            {initials}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-brand-text truncate max-w-[90px] lg:max-w-[110px]">{user.name}</span>
                            <span className="text-[10px] font-medium text-gray-400 capitalize">{user.role || 'Admin'}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all active:scale-90 group flex-shrink-0 mx-auto md:mx-0"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-4 h-4 group-hover:rotate-12" />
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-14 lg:h-16 bg-white/80 backdrop-blur-md border-b border-brand-border flex items-center px-4 lg:px-6 justify-between sticky top-0 z-20">
                    <h2 className="text-lg font-bold text-brand-text tracking-tight">
                        {navigation.find(n => location.pathname.startsWith(n.href))?.name || 'Administración'}
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-light rounded-full text-[10px] font-bold text-gray-500 border border-brand-border">
                            <span className="w-2 h-2 rounded-full bg-success-500 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></span>
                            Sistema Activo
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-5 lg:p-6 overflow-y-auto w-full bg-[#f4f3f7]">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-700">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
