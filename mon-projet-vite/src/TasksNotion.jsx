import React, { useState, useEffect } from 'react';

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

    const statusOptions = ['Not started','A faire', 'En cours', 'fini'];

    return (
        <div style={{ padding: '2rem', fontFamily: 'Arial', maxWidth: '900px', margin: 'auto' }}>
            <h1>📋 Tâches Notion</h1>

            <div style={{ marginBottom: '1rem' }}>
                <input
                    type="text"
                    placeholder="Nouvelle tâche"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    style={{ padding: '0.5rem', width: '60%', marginRight: '1rem' }}
                />
                <button onClick={addTask} style={{ padding: '0.5rem 1rem' }}>Ajouter</button>
            </div>

            {loading ? (
                <p>Chargement...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                    <tr style={{ background: '#f2f2f2' }}>
                        <th style={thStyle}>Tâche</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Lien</th>
                        <th style={thStyle}>Statut</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tasks.map((task) => (
                        <tr key={task.id}>
                            <td style={tdStyle}>{task.title}</td>
                            <td style={tdStyle}>{task.date ? new Date(task.date).toLocaleDateString() : '—'}</td>
                            <td style={tdStyle}>
                                <a href={task.url} target="_blank" rel="noopener noreferrer">Voir</a>
                            </td>
                            <td style={tdStyle}>
                                <select
                                    value={task.status}
                                    onChange={(e) => updateStatus(task.id, e.target.value)}
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </td>
                            <td style={tdStyle}>
                                <button onClick={() => deleteTask(task.id)} style={{ color: 'red' }}>
                                    Supprimer
                                </button>
                            </td>
                        </tr>
                    ))}
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>Aucune tâche</td>
                        </tr>
                    )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const thStyle = { padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #ccc' };
const tdStyle = { padding: '0.75rem', borderBottom: '1px solid #eee' };

export default TasksNotion;
