import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import Logo from '../components/Logo';

export default function Login() {
    const API = import.meta.env.VITE_API_URL;
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const json = await response.json();
            if (json.success) {
                let userObj = json.user;
                if (email.toLowerCase() === 'agente@servit.com') {
                    userObj = { ...userObj, name: 'Agente Soporte', role: 'agente' };
                } else {
                    userObj = { ...userObj, name: 'Administrador', role: 'admin' };
                }
                localStorage.setItem('servit_token', json.token);
                localStorage.setItem('servit_user', JSON.stringify(userObj));
                navigate('/admin/dashboard');
            } else {
                setError(json.error || 'Credenciales inválidas.');
            }
        } catch {
            setError('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen relative overflow-hidden flex items-center justify-center"
            style={{ background: '#F8F8FB', fontFamily: 'Inter, sans-serif' }}
        >
            {/* ── SINGLE-TONE WAVE BACKGROUND — clean, one color ── */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 1280 837"
                preserveAspectRatio="xMidYMid slice"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Single organic wave, one flat color (#BBB2D8), no layers */}
                <path
                    d="
                        M 1280 0
                        L 1280 837
                        L 0 837
                        C 50 780, 100 700, 160 600
                        C 230 490, 190 400, 280 310
                        C 390 200, 540 250, 680 180
                        C 820 110, 960 30, 1280 0
                        Z
                    "
                    fill="#BBB2D8"
                    opacity="0.55"
                />
            </svg>

            {/* ── LAYOUT — 2 columns ── */}
            <div className="relative w-full max-w-6xl mx-auto flex items-center min-h-screen px-6 lg:px-16">

                {/* ── LEFT — Login Form ── */}
                <div className="w-full lg:w-[45%] flex flex-col items-center py-12">

                    {/* Logo */}
                    <div className="mb-8 flex justify-center">
                        <Logo className="w-20 h-20" />
                    </div>

                    {/* Card */}
                    <div
                        className="w-full max-w-sm rounded-2xl p-8"
                        style={{
                            background: 'rgba(255,255,255,0.92)',
                            backdropFilter: 'blur(16px)',
                            border: '1px solid rgba(187,178,216,0.3)',
                            boxShadow: '0 8px 40px rgba(107,56,209,0.12)'
                        }}
                    >
                        {/* Heading */}
                        <div className="mb-6 text-center">
                            <h1 className="text-2xl font-bold text-gray-900">Inicia tu sesión</h1>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            {error && (
                                <div
                                    className="p-3 rounded-xl text-sm text-center"
                                    style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="w-4 h-4" style={{ color: '#A78BFA' }} />
                                </div>
                                <input
                                    type="email"
                                    id="login-email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    required
                                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl outline-none transition-all"
                                    style={{ border: '1px solid #EDE9FE', background: '#FAFAFF', color: '#374151' }}
                                    onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>

                            {/* Password */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="w-4 h-4" style={{ color: '#A78BFA' }} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="login-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    required
                                    className="w-full text-sm pl-10 pr-16 py-3 rounded-xl outline-none transition-all"
                                    style={{ border: '1px solid #EDE9FE', background: '#FAFAFF', color: '#374151' }}
                                    onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
                                    onBlur={(e) => { e.target.style.borderColor = '#EDE9FE'; e.target.style.boxShadow = 'none'; }}
                                />
                                <button
                                    type="button"
                                    tabIndex={-1}
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-semibold"
                                    style={{ color: '#8B5CF6' }}
                                >
                                    {showPassword ? 'Ocultar' : 'Mostrar'}
                                </button>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                id="login-submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60 active:scale-[0.98]"
                                style={{
                                    background: 'linear-gradient(135deg, #6B38D1 0%, #8B5CF6 100%)',
                                    boxShadow: '0 4px 14px rgba(107,56,209,0.35)'
                                }}
                            >
                                <LogIn className="w-4 h-4" />
                                {loading ? 'Ingresando...' : 'Ingresar con correo'}
                            </button>
                        </form>

                        <div className="mt-6 flex items-center justify-center gap-2">
                            <div className="h-px w-16" style={{ background: '#EDE9FE' }} />
                            <span className="text-xs font-black tracking-widest uppercase text-center" style={{ color: '#BBB2D8' }}>SERVIT</span>
                            <div className="h-px w-16" style={{ background: '#EDE9FE' }} />
                        </div>
                    </div>

                    <p className="text-center text-[10px] mt-6 font-bold uppercase tracking-widest" style={{ color: '#A78BFA' }}>
                        © 2026 Servit · Todos los derechos reservados
                    </p>
                </div>

                {/* ── RIGHT — Illustration ── */}
                <div className="hidden lg:flex lg:w-[55%] items-center justify-center relative py-12">

                    {/* Sparkles */}
                    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                        {[
                            { top: '14%', left: '12%', size: 14 },
                            { top: '18%', left: '80%', size: 9 },
                            { top: '68%', left: '8%', size: 10 },
                            { top: '75%', left: '84%', size: 8 },
                            { top: '48%', left: '92%', size: 11 },
                            { top: '85%', left: '50%', size: 8 },
                            { top: '30%', left: '5%', size: 7 },
                        ].map((s, i) => (
                            <div key={i} className="absolute" style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0.55 }}>
                                <svg viewBox="0 0 24 24" fill="#8B5CF6">
                                    <path d="M12 2 L13.5 10 L22 12 L13.5 14 L12 22 L10.5 14 L2 12 L10.5 10 Z" />
                                </svg>
                            </div>
                        ))}
                    </div>

                    {/* Illustration — Floating without circle background, blended smoothly */}
                    <div className="relative group" style={{ mixBlendMode: 'multiply' }}>
                        <img
                            src="/login-character.png"
                            alt="Servit login illustration"
                            className="relative select-none"
                            style={{
                                width: '480px',
                                maxWidth: '95%',
                                objectFit: 'contain',
                                objectPosition: 'center center',
                                filter: 'contrast(1.1) brightness(1.1)',
                                pointerEvents: 'none'
                            }}
                            draggable={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
