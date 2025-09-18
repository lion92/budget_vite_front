import React, { useState, useEffect } from 'react';
import './pages/components/css/mobile-optimizations.css';

const TasksNotion = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:3005/tasks';

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setTasks(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Erreur de chargement :', error);
        }
        setLoading(false);
    };

    const addTask = async () => {
        if (!newTask.trim()) return;
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTask }),
            });
            setNewTask('');
            fetchTasks();
        } catch (error) {
            console.error('Erreur ajout tâche :', error);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            // Trouver la tâche actuelle
            const taskToUpdate = tasks.find(t => t.id === id);
            if (!taskToUpdate) return;

            // Mise à jour partielle
            await fetch(API_URL+'/'+id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...taskToUpdate,
                    status: newStatus
                }),
            });

            fetchTasks();
        } catch (error) {
            console.error('Erreur update status :', error);
        }
    };


    const deleteTask = async (id) => {
        try {
            await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            fetchTasks();
        } catch (error) {
            console.error('Erreur suppression tâche :', error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const statusOptions = ['📋 À faire', '⏳ En cours', '✅ Terminé', '⏸️ En pause'];

    const getStatusColor = (status) => {
        switch(status) {
            case '📋 À faire': return 'linear-gradient(135deg, #6b7280, #4b5563)';
            case '⏳ En cours': return 'linear-gradient(135deg, #f59e0b, #d97706)';
            case '✅ Terminé': return 'linear-gradient(135deg, #10b981, #059669)';
            case '⏸️ En pause': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
            default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
        }
    };

    const getStatusEmoji = (status) => {
        switch(status) {
            case '📋 À faire': return '📋';
            case '⏳ En cours': return '⏳';
            case '✅ Terminé': return '✅';
            case '⏸️ En pause': return '⏸️';
            default: return '📋';
        }
    };

    return (
        <div className="mobile-container" style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '900px', margin: 'auto' }}>
            <h1 className="responsive-heading" style={{ textAlign: 'center', marginBottom: '2rem', color: '#1e293b' }}>📋 Gestionnaire de Tâches</h1>

            <div className="mobile-form" style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <input
                        type="text"
                        placeholder="Décrivez votre nouvelle tâche..."
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="mobile-form-input"
                        style={{
                            flex: '1',
                            minWidth: '250px',
                            padding: '1rem',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            fontSize: '1rem'
                        }}
                    />
                    <button
                        onClick={addTask}
                        className="mobile-btn mobile-btn-primary"
                        style={{
                            padding: '1rem 2rem',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        ➕ Ajouter Tâche
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="mobile-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                    <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Chargement de vos tâches...</p>
                </div>
            ) : (
                <>
                    {/* Version Desktop */}
                    <div className="hide-mobile">
                        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
                            <thead>
                            <tr style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white' }}>
                                <th style={{...thStyle, color: 'white', fontWeight: '600'}}>📝 Tâche</th>
                                <th style={{...thStyle, color: 'white', fontWeight: '600'}}>📅 Date</th>
                                <th style={{...thStyle, color: 'white', fontWeight: '600'}}>🔗 Lien</th>
                                <th style={{...thStyle, color: 'white', fontWeight: '600'}}>⚡ Statut</th>
                                <th style={{...thStyle, color: 'white', fontWeight: '600'}}>🛠️ Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tasks.map((task) => (
                                <tr key={task.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{...tdStyle, fontWeight: '500', color: '#1e293b'}}>{task.title}</td>
                                    <td style={tdStyle}>{task.date ? new Date(task.date).toLocaleDateString('fr-FR') : '—'}</td>
                                    <td style={tdStyle}>
                                        {task.url ? (
                                            <a href={task.url} target="_blank" rel="noopener noreferrer" style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '500' }}>🔗 Voir</a>
                                        ) : (
                                            <span style={{ color: '#94a3b8' }}>—</span>
                                        )}
                                    </td>
                                    <td style={tdStyle}>
                                        <select
                                            value={task.status}
                                            onChange={(e) => updateStatus(task.id, e.target.value)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                background: 'white',
                                                fontSize: '0.9rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {statusOptions.map((opt) => (
                                                <option key={opt} value={opt}>
                                                    {opt}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="mobile-btn-small"
                                            style={{
                                                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.5rem 1rem',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem',
                                                fontWeight: '500'
                                            }}
                                        >
                                            🗑️ Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {tasks.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '1.1rem' }}>
                                        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                                        Aucune tâche pour le moment<br/>
                                        <small style={{ color: '#94a3b8' }}>Ajoutez votre première tâche ci-dessus</small>
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Version Mobile */}
                    <div className="show-mobile-only mobile-table-cards">
                        {tasks.length === 0 ? (
                            <div className="mobile-card" style={{ textAlign: 'center', padding: '3rem' }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📝</div>
                                <h3 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Aucune tâche</h3>
                                <p style={{ color: '#64748b', margin: 0 }}>Commencez par ajouter votre première tâche</p>
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="mobile-card mobile-table-card">
                                    <div className="mobile-table-card-header">
                                        <h3 className="mobile-table-card-title" style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem' }}>
                                            📝 {task.title}
                                        </h3>
                                        <span className="mobile-table-card-meta" style={{
                                            background: getStatusColor(task.status),
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.8rem',
                                            fontWeight: '600'
                                        }}>
                                            {getStatusEmoji(task.status)} {task.status}
                                        </span>
                                    </div>
                                    <div className="mobile-table-card-content">
                                        <div className="mobile-table-card-row">
                                            <span className="mobile-table-card-label">📅 Date:</span>
                                            <span className="mobile-table-card-value">
                                                {task.date ? new Date(task.date).toLocaleDateString('fr-FR') : 'Non définie'}
                                            </span>
                                        </div>
                                        <div className="mobile-table-card-row">
                                            <span className="mobile-table-card-label">🔗 Lien:</span>
                                            <span className="mobile-table-card-value">
                                                {task.url ? (
                                                    <a href={task.url} target="_blank" rel="noopener noreferrer"
                                                       style={{ color: '#8b5cf6', textDecoration: 'none', fontWeight: '600' }}>
                                                        🔗 Ouvrir
                                                    </a>
                                                ) : (
                                                    <span style={{ color: '#94a3b8' }}>Aucun lien</span>
                                                )}
                                            </span>
                                        </div>
                                        <div className="mobile-table-card-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6' }}>
                                            <select
                                                value={task.status}
                                                onChange={(e) => updateStatus(task.id, e.target.value)}
                                                className="mobile-form-select"
                                                style={{
                                                    flex: 1,
                                                    marginRight: '1rem',
                                                    padding: '0.75rem',
                                                    border: '2px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    background: 'white',
                                                    fontSize: '1rem'
                                                }}
                                            >
                                                {statusOptions.map((opt) => (
                                                    <option key={opt} value={opt}>
                                                        {getStatusEmoji(opt)} {opt}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => deleteTask(task.id)}
                                                className="mobile-btn-small"
                                                style={{
                                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    padding: '0.75rem 1rem',
                                                    fontSize: '0.9rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

const thStyle = { padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ccc' };
const tdStyle = { padding: '0.75rem', borderBottom: '1px solid #eee' };

export default TasksNotion;
