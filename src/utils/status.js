/**
 * Centralized ticket status configuration.
 * Maps status IDs to labels and consistent UI styles.
 */
export const TICKET_STATUS = {
    1: { id: 1, label: 'Recibido', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
    2: { id: 2, label: 'En proceso', color: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' },
    3: { id: 3, label: 'Pendiente de información', color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    4: { id: 4, label: 'Resuelto', color: 'bg-success-500/10 text-success-500 border-success-500/20' },
    5: { id: 5, label: 'Cerrado', color: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
};

/**
 * Returns the color style based on status ID or status name (fallback).
 */
export const getStatusStyle = (statusId, statusName) => {
    if (statusId && TICKET_STATUS[statusId]) {
        return TICKET_STATUS[statusId].color;
    }
    
    // Fallback for name-based lookup
    const name = (statusName || '').toLowerCase();
    if (name.includes('recibido')) return TICKET_STATUS[1].color;
    if (name.includes('proceso')) return TICKET_STATUS[2].color;
    if (name.includes('pendiente')) return TICKET_STATUS[3].color;
    if (name.includes('resuelto')) return TICKET_STATUS[4].color;
    if (name.includes('cerrado')) return TICKET_STATUS[5].color;
    
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
};

/**
 * Returns the human-readable label for a status ID.
 */
export const getStatusLabel = (statusId, fallbackName) => {
    return TICKET_STATUS[statusId]?.label || fallbackName || 'Cargando...';
};
