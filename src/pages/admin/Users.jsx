import { useState, useEffect } from 'react';
import { Users as UsersIcon, Plus, Pencil, Trash2, X, Check, ShieldCheck, Headset, User } from 'lucide-react';

const API = 'http://localhost:3001/api/users';

const ROLES = [
    { value: 'admin', label: 'Administrador', color: 'bg-violet-100 text-violet-700' },
    { value: 'supervisor', label: 'Supervisor', color: 'bg-blue-100 text-blue-700' },
    { value: 'soporte', label: 'Soporte', color: 'bg-emerald-100 text-emerald-700' },
];

const roleInfo = (role) => ROLES.find(r => r.value === role) || { label: role, color: 'bg-gray-100 text-gray-600' };

const initials = (name) =>
    name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const avatarColor = (name) => {
    const colors = [
        'bg-violet-500', 'bg-blue-500', 'bg-emerald-500',
        'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'
    ];
    const idx = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[idx];
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'soporte', active: true };

export default function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null); // null = create
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null); // user id to confirm
    const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch(API);
            const json = await res.json();
            if (json.success) setUsers(json.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const openCreate = () => {
        setEditUser(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (user) => {
        setEditUser(user);
        setForm({ name: user.name, email: user.email, password: '', role: user.role, active: user.active });
        setModalOpen(true);
    };

    const closeModal = () => { setModalOpen(false); setEditUser(null); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editUser ? 'PUT' : 'POST';
            const url = editUser ? `${API}/${editUser.id}` : API;
            const body = { ...form };
            if (editUser && !body.password) delete body.password;

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const json = await res.json();

            if (json.success) {
                showToast('success', editUser ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente');
                closeModal();
                fetchUsers();
            } else {
                showToast('error', json.error || 'Error al guardar');
            }
        } catch {
            showToast('error', 'Error de conexión con el servidor');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (user) => {
        try {
            const res = await fetch(`${API}/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !user.active })
            });
            const json = await res.json();
            if (json.success) {
                fetchUsers();
                showToast('success', `Usuario ${!user.active ? 'activado' : 'desactivado'}`);
            } else {
                showToast('error', json.error);
            }
        } catch {
            showToast('error', 'Error de conexión');
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                showToast('success', 'Usuario eliminado');
                setDeleteConfirm(null);
                fetchUsers();
            } else {
                showToast('error', json.error);
                setDeleteConfirm(null);
            }
        } catch {
            showToast('error', 'Error de conexión');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-medium animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {toast.type === 'success' ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {/* Header */}
            <div className="bg-white p-8 rounded-3xl border border-brand-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-violet-50/30 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-100 rounded-2xl text-violet-600">
                            <UsersIcon className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-brand-text tracking-tighter">Gestión de Usuarios</h2>
                            <p className="text-gray-500 text-sm font-medium mt-0.5">Administra los accesos al panel de control Servit.</p>
                        </div>
                    </div>
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-secondary transition-colors shadow-md shadow-brand-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Usuario
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl border border-brand-border shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
                        <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                        Cargando usuarios...
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                        <UsersIcon className="w-10 h-10 opacity-30" />
                        <p className="text-sm">No hay usuarios registrados</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-brand-border bg-gray-50/70">
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Usuario</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rol</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Creado</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {users.map(user => {
                                const role = roleInfo(user.role);
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        {/* Avatar + name/email */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${avatarColor(user.name)}`}>
                                                    {initials(user.name)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-brand-text">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Role badge */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${role.color}`}>
                                                {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                                                {user.role === 'soporte' && <Headset className="w-3 h-3" />}
                                                {user.role === 'supervisor' && <User className="w-3 h-3" />}
                                                {role.label}
                                            </span>
                                        </td>
                                        {/* Active toggle */}
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(user)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${user.active ? 'bg-emerald-400' : 'bg-gray-300'}`}
                                                title={user.active ? 'Desactivar' : 'Activar'}
                                            >
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${user.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                            </button>
                                            <span className={`ml-2 text-xs font-medium ${user.active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {user.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        {/* Created at */}
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {deleteConfirm === user.id ? (
                                                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-1.5 text-xs">
                                                        <span className="text-red-600 font-medium">¿Eliminar?</span>
                                                        <button onClick={() => handleDelete(user.id)} className="font-bold text-red-600 hover:text-red-800">Sí</button>
                                                        <button onClick={() => setDeleteConfirm(null)} className="text-gray-500 hover:text-gray-700">No</button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => openEdit(user)}
                                                            className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-light rounded-lg transition-colors"
                                                            title="Editar"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setDeleteConfirm(user.id)}
                                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-brand-border">
                            <h3 className="text-lg font-black text-brand-text tracking-tight">
                                {editUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                            </h3>
                            <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="px-8 py-6 space-y-5">
                            {/* Name */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nombre completo</label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                    placeholder="Ej: María González"
                                    required
                                    className="w-full border border-brand-border rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors outline-none"
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Correo electrónico</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    placeholder="usuario@servit.com"
                                    required
                                    className="w-full border border-brand-border rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors outline-none"
                                />
                            </div>
                            {/* Password */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                                    Contraseña {editUser && <span className="text-gray-400 font-normal normal-case">(dejar en blanco para no cambiar)</span>}
                                </label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                    placeholder="••••••••"
                                    required={!editUser}
                                    className="w-full border border-brand-border rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors outline-none"
                                />
                            </div>
                            {/* Role */}
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Rol</label>
                                <select
                                    value={form.role}
                                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                                    className="w-full border border-brand-border rounded-xl px-4 py-2.5 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition-colors outline-none"
                                >
                                    {ROLES.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Active */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                                <span className="text-sm font-medium text-gray-700">Usuario activo</span>
                                <button
                                    type="button"
                                    onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.active ? 'bg-emerald-400' : 'bg-gray-300'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${form.active ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 border border-brand-border text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-xl hover:bg-brand-secondary transition-colors shadow-md shadow-brand-primary/20 disabled:opacity-50"
                                >
                                    {saving ? 'Guardando...' : editUser ? 'Actualizar' : 'Crear Usuario'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
