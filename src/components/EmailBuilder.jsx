import React, { useRef, useState, useEffect } from 'react';
import EmailEditor from 'react-email-editor';
import { Mail, Save, Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function EmailBuilder() {
    const emailEditorRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    
    const [templates, setTemplates] = useState([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState('new');
    
    // Form state for current template
    const [templateName, setTemplateName] = useState('Plantilla Nueva');
    const [assignedWorkflows, setAssignedWorkflows] = useState([]);
    const [isEditingName, setIsEditingName] = useState(false);

    const workflows = [
        { id: 'ticket_received', name: 'Contacto desde Formulario Público (Ticket Creado)' },
        { id: 'ticket_update', name: 'Contacto hacia el Cliente (Respuesta de Agente / Actualización)' },
        { id: 'ticket_resolved_status', name: 'Cierre de Ticket (Resolución / Encuesta)' }
    ];

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:3001/api/config/email-template');
            if (res.data.success) {
                setTemplates(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching templates", err);
        } finally {
            setLoading(false);
        }
    };

    const loadTemplateToEditor = (template) => {
        if (!template) {
            setTemplateName('Plantilla Nueva');
            setAssignedWorkflows([]);
            if (emailEditorRef.current?.editor) {
                emailEditorRef.current.editor.loadBlank({ backgroundColor: '#F4F4F4' });
            }
            return;
        }

        setTemplateName(template.name || 'Plantilla Nueva');
        setAssignedWorkflows(template.assigned_workflows || []);
        if (emailEditorRef.current?.editor && template.design_json) {
            emailEditorRef.current.editor.loadDesign(template.design_json);
        }
    };

    const handleSelectTemplate = (e) => {
        const id = e.target.value;
        setSelectedTemplateId(id);
        setIsEditingName(false);
        if (id === 'new') {
            loadTemplateToEditor(null);
        } else {
            const tmpl = templates.find(t => t.id.toString() === id);
            loadTemplateToEditor(tmpl);
        }
    };

    const handleCreateNew = () => {
        setSelectedTemplateId('new');
        loadTemplateToEditor(null);
        setIsEditingName(true);
    };

    const toggleWorkflow = (workflowId) => {
        setAssignedWorkflows(prev => 
            prev.includes(workflowId) 
                ? prev.filter(w => w !== workflowId)
                : [...prev, workflowId]
        );
    };

    const onLoad = () => {
        // Init editor state
        if (selectedTemplateId !== 'new') {
            const tmpl = templates.find(t => t.id.toString() === selectedTemplateId);
            loadTemplateToEditor(tmpl);
        }
    };

    const handleDelete = async () => {
        if (selectedTemplateId === 'new') return;
        if (!window.confirm("¿Seguro que deseas eliminar esta plantilla?")) return;
        
        try {
            await axios.delete(`http://localhost:3001/api/config/email-template/${selectedTemplateId}`);
            alert("Plantilla eliminada.");
            setSelectedTemplateId('new');
            loadTemplateToEditor(null);
            fetchTemplates();
        } catch (err) {
            alert("Error al eliminar la plantilla.");
        }
    };

    const handleSave = () => {
        if (!emailEditorRef.current?.editor) return;
        setSaving(true);
        
        emailEditorRef.current.editor.exportHtml(async (data) => {
            const { design, html } = data;
            
            try {
                const payload = {
                    name: templateName,
                    assigned_workflows: assignedWorkflows,
                    design_json: design,
                    html_content: html
                };
                
                if (selectedTemplateId !== 'new') {
                    payload.id = selectedTemplateId;
                }

                await axios.post('http://localhost:3001/api/config/email-template', payload);
                alert(`Plantilla guardada exitosamente.`);
                await fetchTemplates(); // Refresh lists
                
                // If it was new, select the new one (we don't strictly have the ID from response in this minimal impl, 
                // but we can just fetch templates, the list will update. For simplicity, just refetch).
            } catch (err) {
                alert('Error al guardar la plantilla.');
            } finally {
                setSaving(false);
            }
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
            {/* Header / Controls */}
            <div className="bg-white p-6 rounded-[2rem] border border-brand-border shadow-sm flex flex-col gap-6">
                
                {/* Top Row: Dropdown, Actions */}
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/10 rounded-2xl text-brand-primary">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-brand-text tracking-tight">Diseño de Comunicaciones</h3>
                            <p className="text-sm text-gray-500 font-medium">Gestiona y asigna diseños de plantillas</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Layers className="w-4 h-4 text-gray-400" />
                            </div>
                            <select
                                value={selectedTemplateId}
                                onChange={handleSelectTemplate}
                                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-brand-primary focus:border-brand-primary block w-full pl-10 p-2.5 font-semibold appearance-none cursor-pointer"
                            >
                                <option value="new">-- Crear Nueva Plantilla --</option>
                                {templates.map(tmpl => (
                                    <option key={tmpl.id} value={tmpl.id}>{tmpl.name}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="p-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                            title="Nueva plantilla"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Sub Row: Name Editor and Workflow assignments */}
                <div className="flex flex-col lg:flex-row gap-8 pt-4 border-t border-gray-100">
                    {/* Left: Name and Basic info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 px-1">
                                Nombre de la Plantilla
                            </label>
                            <div className="flex items-center gap-2">
                                {isEditingName ? (
                                    <input 
                                        type="text" 
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        onBlur={() => setIsEditingName(false)}
                                        autoFocus
                                        className="flex-1 text-sm px-4 py-2.5 rounded-xl border border-brand-primary outline-none focus:ring-2 focus:ring-brand-primary/20 bg-white"
                                    />
                                ) : (
                                    <div 
                                        onClick={() => setIsEditingName(true)}
                                        className="flex-1 flex items-center justify-between text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 group transition-colors"
                                    >
                                        <span className="font-semibold text-gray-700">{templateName}</span>
                                        <Edit2 className="w-4 h-4 text-gray-400 group-hover:text-brand-primary transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <button
                                onClick={handleSave}
                                disabled={saving || loading}
                                className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-secondary transition-all disabled:opacity-50 shadow-md shadow-brand-primary/20"
                            >
                                {saving ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Guardar Cambios
                            </button>
                            {selectedTemplateId !== 'new' && (
                                <button
                                    onClick={handleDelete}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors shrink-0"
                                    title="Eliminar plantilla"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Right: Triggers/Workflows checkboxes */}
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">
                            ¿Dónde se usará esta plantilla? (Flujos asignados)
                        </label>
                        <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {workflows.map(wf => {
                                const isChecked = assignedWorkflows.includes(wf.id);
                                return (
                                    <label key={wf.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors cursor-pointer group">
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-brand-primary border-brand-primary' : 'bg-white border-gray-300 group-hover:border-brand-primary'}`}>
                                            {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isChecked}
                                            onChange={() => toggleWorkflow(wf.id)}
                                        />
                                        <span className={`text-sm font-medium ${isChecked ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {wf.name}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* Email Editor Canvas */}
            <div className="bg-white rounded-[2rem] border border-brand-border shadow-xl overflow-hidden min-h-[700px] flex flex-col">
                {/* Banner hint for the user */}
                <div className="bg-blue-50 border-b border-blue-100 p-3 text-center">
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">TIP:</span>
                    <span className="text-sm text-blue-800 ml-2">Utiliza la etiqueta <strong>{"{{cuerpo_correo}}"}</strong> en tus textos para inyectar automáticamente la respuesta configurada para el usuario.</span>
                </div>

                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onLoad}
                    minHeight="700px"
                    options={{
                        locale: 'es-ES',
                        customCSS: [
                            `.blockbuilder-preferences { display: none !important; }` // Hides premium unlayer ads if any
                        ],
                        features: {
                            textEditor: {
                                spellChecker: true
                            }
                        },
                        mergeTags: {
                            cuerpo_correo: {
                                name: "Cuerpo Dinámico del Mensaje",
                                value: "{{cuerpo_correo}}"
                            },
                        }
                    }}
                />
            </div>
        </div>
    );
}
