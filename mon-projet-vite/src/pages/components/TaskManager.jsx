import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useNotify } from "./Notification";
import lien from './lien';
import './css/design-system.css';

// Styles intégrés pour la responsivité
const styles = `
  .desktop-view {
    display: block;
  }

  .mobile-view {
    display: none;
  }

  @media (max-width: 768px) {
    .desktop-view {
      display: none !important;
    }

    .mobile-view {
      display: block !important;
    }

    .form-container {
      padding: 8px !important;
      margin: 0 !important;
    }

    .form-wrapper {
      max-width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .filters-grid {
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
    }

    .filter-group {
      width: 100% !important;
    }

    .stats-section {
      flex-direction: column !important;
      gap: 8px !important;
      text-align: center !important;
    }

    .button-group {
      flex-direction: column !important;
      gap: 12px !important;
    }

    .btn {
      width: 100% !important;
      padding: 14px 20px !important;
      font-size: 1.1rem !important;
      min-height: 48px !important;
    }

    .table-container {
      padding: 8px !important;
      margin: 0 !important;
    }

    .table-wrapper {
      padding: 0 !important;
      box-shadow: none !important;
    }

    .table-header {
      padding: 12px 8px !important;
      text-align: center !important;
    }

    .table-title {
      font-size: 1.4rem !important;
      margin-bottom: 8px !important;
    }

    .mobile-task-card {
      background: white !important;
      border-radius: 12px !important;
      padding: 16px !important;
      margin-bottom: 12px !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
      border: 1px solid #e5e7eb !important;
    }

    .mobile-task-card.editing {
      border: 2px solid #8b5cf6 !important;
      background: rgba(139, 92, 246, 0.02) !important;
    }

    .mobile-task-header {
      margin-bottom: 12px !important;
      padding-bottom: 12px !important;
      border-bottom: 1px solid #f3f4f6 !important;
    }

    .mobile-task-title {
      margin: 0 0 8px 0 !important;
      font-size: 1.1rem !important;
      font-weight: 700 !important;
      line-height: 1.4 !important;
      color: #1f2937 !important;
    }

    .mobile-task-title.editing {
      color: #8b5cf6 !important;
    }

    .mobile-task-date {
      margin: 0 !important;
      font-size: 0.85rem !important;
      color: #6b7280 !important;
      font-weight: 500 !important;
    }

    .mobile-task-description {
      margin-bottom: 16px !important;
    }

    .mobile-task-description p {
      margin: 0 !important;
      font-size: 0.95rem !important;
      color: #4b5563 !important;
      line-height: 1.6 !important;
    }

    .mobile-task-actions {
      display: flex !important;
      gap: 10px !important;
      margin-top: 16px !important;
    }

    .mobile-action-btn {
      flex: 1 !important;
      padding: 12px 16px !important;
      border: none !important;
      border-radius: 8px !important;
      font-size: 0.95rem !important;
      font-weight: 600 !important;
      cursor: pointer !important;
      min-height: 44px !important;
      transition: transform 0.1s ease !important;
    }

    .mobile-action-btn:active {
      transform: scale(0.98) !important;
    }

    .mobile-edit-btn {
      background: #3b82f6 !important;
      color: white !important;
    }

    .mobile-edit-btn:hover {
      background: #2563eb !important;
    }

    .mobile-delete-btn {
      background: #ef4444 !important;
      color: white !important;
    }

    .mobile-delete-btn:hover {
      background: #dc2626 !important;
    }
  }

  @media (max-width: 480px) {
    .form-container {
      padding: 4px !important;
    }

    .mobile-task-card {
      padding: 12px !important;
      margin-bottom: 8px !important;
    }

    .mobile-task-title {
      font-size: 1rem !important;
    }

    .mobile-task-date {
      font-size: 0.8rem !important;
    }

    .mobile-task-description p {
      font-size: 0.9rem !important;
    }

    .mobile-action-btn {
      font-size: 0.9rem !important;
      padding: 10px 12px !important;
    }
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default function TaskManager() {
    // États principaux
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [allTasks, setAllTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // États pour les filtres
    const [filters, setFilters] = useState({
        searchTerm: "",
        sortBy: "date",
        sortOrder: "desc",
        dateFilter: "all"
    });

    const notify = useNotify();

    // Utilitaires d'authentification
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('jwt');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }, []);

    const getUserId = useCallback(() => {
        return parseInt(localStorage.getItem("utilisateur") || "1", 10);
    }, []);

    // API calls refactorisées
    const fetchTasks = useCallback(async () => {
        setIsLoading(true);
        try {
            const userId = getUserId();
            const response = await fetch(`${lien.url}todos/byuser/${userId}`, {
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setAllTasks(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches:', error);
            notify("Erreur lors du chargement des tâches", 'error');
        } finally {
            setIsLoading(false);
        }
    }, [getUserId, getAuthHeaders, notify]);

    const createTask = useCallback(async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            notify("Le titre est requis", 'error');
            return;
        }

        try {
            const response = await fetch(`${lien.url}todos`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    user: getUserId()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            notify("Tâche créée avec succès", 'success');
            resetForm();
            await fetchTasks();
        } catch (error) {
            console.error('Erreur lors de la création:', error);
            notify("Erreur lors de la création de la tâche", 'error');
        }
    }, [title, description, getAuthHeaders, getUserId, notify, fetchTasks]);

    const updateTask = useCallback(async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            notify("Le titre est requis", 'error');
            return;
        }

        try {
            const response = await fetch(`${lien.url}todos/${editingId}`, {
                method: "PUT",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    user: getUserId()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            notify("Tâche mise à jour avec succès", 'success');
            resetForm();
            await fetchTasks();
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            notify("Erreur lors de la mise à jour de la tâche", 'error');
        }
    }, [editingId, title, description, getAuthHeaders, getUserId, notify, fetchTasks]);

    const deleteTask = useCallback(async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
            return;
        }

        try {
            const response = await fetch(`${lien.url}todos/${id}`, {
                method: "DELETE",
                headers: getAuthHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            notify("Tâche supprimée avec succès", 'success');
            await fetchTasks();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            notify("Erreur lors de la suppression de la tâche", 'error');
        }
    }, [getAuthHeaders, notify, fetchTasks]);

    // Gestion du formulaire
    const resetForm = useCallback(() => {
        setTitle("");
        setDescription("");
        setEditingId(null);
    }, []);

    const handleEdit = useCallback((task) => {
        setTitle(task.title);
        setDescription(task.description || "");
        setEditingId(task.id);
    }, []);

    // Filtrage et tri optimisés avec useMemo
    const filteredTasks = useMemo(() => {
        let filtered = [...allTasks];

        // Filtre de recherche
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(task =>
                task.title?.toLowerCase().includes(searchLower) ||
                task.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filtre par date
        if (filters.dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(task => {
                const taskDate = new Date(task.createdAt);

                switch (filters.dateFilter) {
                    case "today":
                        return taskDate >= today;
                    case "week":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return taskDate >= weekAgo;
                    case "month":
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return taskDate >= monthAgo;
                    default:
                        return true;
                }
            });
        }

        // Tri
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (filters.sortBy) {
                case "title":
                    comparison = (a.title || "").localeCompare(b.title || "");
                    break;
                case "description":
                    comparison = (a.description || "").localeCompare(b.description || "");
                    break;
                case "date":
                default:
                    comparison = new Date(a.createdAt) - new Date(b.createdAt);
                    break;
            }

            return filters.sortOrder === "desc" ? -comparison : comparison;
        });

        return filtered;
    }, [allTasks, filters]);

    // Mise à jour de tasks quand filteredTasks change
    useEffect(() => {
        setTasks(filteredTasks);
    }, [filteredTasks]);

    // Gestion des filtres
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            searchTerm: "",
            sortBy: "date",
            sortOrder: "desc",
            dateFilter: "all"
        });
    }, []);

    const handleSort = useCallback((column) => {
        if (filters.sortBy === column) {
            updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            updateFilter('sortBy', column);
            updateFilter('sortOrder', 'asc');
        }
    }, [filters.sortBy, filters.sortOrder, updateFilter]);

    // Utilitaires d'affichage
    const formatDate = useCallback((dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }, []);

    const truncateText = useCallback((text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }, []);

    // Effets
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    return (
        <div className="form-container">
            <div className="form-wrapper">
                {/* Section du formulaire */}
                <div className="form-content">
                    <div className="id-display">
                        <label className="id-label">
                            {editingId ? `Modification ID: ${editingId}` : 'Nouvelle tâche'}
                        </label>
                    </div>

                    <form onSubmit={editingId ? updateTask : createTask}>
                        <div className="form-inputs">
                            <div className="input-group">
                                <label className="input-label">Titre *</label>
                                <input
                                    className="input-field title-input"
                                    placeholder="Entrez le titre de votre tâche"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Description</label>
                                <textarea
                                    className="textarea-field description-input"
                                    placeholder="Décrivez votre tâche en détail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4"
                                />
                            </div>

                            <div className="button-group">
                                <button
                                    type="submit"
                                    className={`btn ${editingId ? 'btn-update' : 'btn-create'}`}
                                >
                                    {editingId ? '✏️ Modifier' : '➕ Créer'}
                                </button>
                                {editingId && (
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={resetForm}
                                    >
                                        ❌ Annuler
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Section des filtres */}
                <div className="filters-section">
                    <div className="filters-header">
                        <h3 className="filters-title">
                            <span className="filter-icon">🔍</span>
                            Filtres & Recherche
                        </h3>
                        <button
                            className="reset-filters-btn"
                            onClick={resetFilters}
                            title="Réinitialiser tous les filtres"
                        >
                            ↻ Reset
                        </button>
                    </div>

                    <div className="filters-grid">
                        <div className="filter-group search-group">
                            <label className="filter-label">Rechercher</label>
                            <div className="search-input-wrapper">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Rechercher dans les titres et descriptions..."
                                    value={filters.searchTerm}
                                    onChange={(e) => updateFilter('searchTerm', e.target.value)}
                                />
                                <span className="search-icon">🔍</span>
                            </div>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Trier par</label>
                            <select
                                className="filter-select"
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value)}
                            >
                                <option value="date">Date de création</option>
                                <option value="title">Titre (A-Z)</option>
                                <option value="description">Description (A-Z)</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Ordre</label>
                            <select
                                className="filter-select"
                                value={filters.sortOrder}
                                onChange={(e) => updateFilter('sortOrder', e.target.value)}
                            >
                                <option value="desc">Décroissant</option>
                                <option value="asc">Croissant</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label className="filter-label">Période</label>
                            <select
                                className="filter-select"
                                value={filters.dateFilter}
                                onChange={(e) => updateFilter('dateFilter', e.target.value)}
                            >
                                <option value="all">Toutes les dates</option>
                                <option value="today">Aujourd'hui</option>
                                <option value="week">Cette semaine</option>
                                <option value="month">Ce mois</option>
                            </select>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="stats-section">
                        <div className="stats-item">
                            <span className="stats-number">{tasks.length}</span>
                            <span className="stats-label">Tâches affichées</span>
                        </div>
                        <div className="stats-item">
                            <span className="stats-number">{allTasks.length}</span>
                            <span className="stats-label">Total</span>
                        </div>
                        {filters.searchTerm && (
                            <div className="stats-item search-stats">
                                <span className="stats-label">
                                    Résultats pour "{filters.searchTerm}"
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tableau des tâches */}
                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">⏳</div>
                        <h2 className="loading-text">Chargement des tâches...</h2>
                    </div>
                ) : (
                    <div className="table-container">
                        <div className="table-wrapper">
                            <div className="table-header">
                                <h2 className="table-title">
                                    <span className="table-icon">📋</span>
                                    Mes Tâches ({tasks.length})
                                </h2>
                                <div className="table-header-actions">
                                    <span className="table-info">
                                        {tasks.length} tâche{tasks.length !== 1 ? 's' : ''} affichée{tasks.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                            </div>

{tasks.length > 0 ? (
                                <>
                                    {/* Version Desktop */}
                                    <div className="desktop-view">
                                        <table className="modern-table">
                                            <thead>
                                                <tr>
                                                    <th
                                                        className="sortable"
                                                        onClick={() => handleSort('title')}
                                                        title="Trier par titre"
                                                    >
                                                        Titre
                                                        {filters.sortBy === 'title' && (
                                                            <span style={{marginLeft: '8px', fontSize: '12px'}}>
                                                                {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </th>
                                                    <th
                                                        className="sortable"
                                                        onClick={() => handleSort('description')}
                                                        title="Trier par description"
                                                    >
                                                        Description
                                                        {filters.sortBy === 'description' && (
                                                            <span style={{marginLeft: '8px', fontSize: '12px'}}>
                                                                {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </th>
                                                    <th
                                                        className="sortable"
                                                        onClick={() => handleSort('date')}
                                                        title="Trier par date"
                                                    >
                                                        Date de création
                                                        {filters.sortBy === 'date' && (
                                                            <span style={{marginLeft: '8px', fontSize: '12px'}}>
                                                                {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tasks.map((task) => (
                                                    <tr
                                                        key={task.id}
                                                        className={editingId === task.id ? 'editing-row' : ''}
                                                        style={{
                                                            backgroundColor: editingId === task.id ? 'rgba(102, 126, 234, 0.1)' : 'transparent'
                                                        }}
                                                    >
                                                        <td data-label="Titre">
                                                            <div style={{
                                                                fontWeight: '700',
                                                                fontSize: '1.1rem',
                                                                color: editingId === task.id ? '#8b5cf6' : '#1f2937',
                                                                lineHeight: '1.5',
                                                                padding: '8px 0'
                                                            }}>
                                                                {task.title || 'Sans titre'}
                                                            </div>
                                                        </td>
                                                        <td data-label="Description">
                                                            <div style={{
                                                                color: '#4b5563',
                                                                lineHeight: '1.6',
                                                                fontSize: '0.95rem',
                                                                fontWeight: '400',
                                                                padding: '8px 0',
                                                                maxWidth: '300px',
                                                                wordWrap: 'break-word'
                                                            }}>
                                                                {task.description ?
                                                                    truncateText(task.description, 150) :
                                                                    <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                                                        Aucune description
                                                                    </span>
                                                                }
                                                            </div>
                                                        </td>
                                                        <td data-label="Date" style={{
                                                            fontSize: '0.9rem',
                                                            fontWeight: '500',
                                                            color: '#6b7280',
                                                            padding: '8px 0'
                                                        }}>
                                                            {formatDate(task.createdAt)}
                                                        </td>
                                                        <td data-label="Actions" className="table-actions">
                                                            <div style={{
                                                                display: 'flex',
                                                                gap: '8px',
                                                                padding: '8px 0'
                                                            }}>
                                                                <button
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#3b82f6',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.85rem',
                                                                        cursor: 'pointer',
                                                                        fontWeight: '500'
                                                                    }}
                                                                    onClick={() => handleEdit(task)}
                                                                    title="Modifier cette tâche"
                                                                >
                                                                    Modifier
                                                                </button>
                                                                <button
                                                                    style={{
                                                                        padding: '6px 12px',
                                                                        backgroundColor: '#ef4444',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '6px',
                                                                        fontSize: '0.85rem',
                                                                        cursor: 'pointer',
                                                                        fontWeight: '500'
                                                                    }}
                                                                    onClick={() => deleteTask(task.id)}
                                                                    title="Supprimer cette tâche"
                                                                >
                                                                    Supprimer
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Version Mobile - Cards */}
                                    <div className="mobile-view">
                                        {tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className={`mobile-task-card ${editingId === task.id ? 'editing' : ''}`}
                                            >
                                                <div className="mobile-task-header">
                                                    <h3 className={`mobile-task-title ${editingId === task.id ? 'editing' : ''}`}>
                                                        {task.title || 'Sans titre'}
                                                    </h3>
                                                    <p className="mobile-task-date">
                                                        📅 {formatDate(task.createdAt)}
                                                    </p>
                                                </div>

                                                {task.description && (
                                                    <div className="mobile-task-description">
                                                        <p>
                                                            {task.description}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mobile-task-actions">
                                                    <button
                                                        className="mobile-action-btn mobile-edit-btn"
                                                        onClick={() => handleEdit(task)}
                                                        aria-label="Modifier cette tâche"
                                                    >
                                                        ✏️ Modifier
                                                    </button>
                                                    <button
                                                        className="mobile-action-btn mobile-delete-btn"
                                                        onClick={() => deleteTask(task.id)}
                                                        aria-label="Supprimer cette tâche"
                                                    >
                                                        🗑️ Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="table-empty">
                                    <div className="empty-state">
                                        <div className="empty-icon">📝</div>
                                        <h3>
                                            {filters.searchTerm || filters.dateFilter !== 'all'
                                                ? 'Aucune tâche trouvée'
                                                : 'Aucune tâche créée'
                                            }
                                        </h3>
                                        <p>
                                            {filters.searchTerm || filters.dateFilter !== 'all'
                                                ? 'Aucune tâche ne correspond à vos critères de recherche'
                                                : 'Commencez par créer votre première tâche'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="table-pagination">
                                <div className="pagination-info">
                                    {tasks.length > 0 ? (
                                        <>
                                            Affichage de {tasks.length} tâche{tasks.length !== 1 ? 's' : ''}
                                            {allTasks.length !== tasks.length && (
                                                <span style={{fontStyle: 'italic', marginLeft: '10px'}}>
                                                    (sur {allTasks.length} au total)
                                                </span>
                                            )}
                                            {filters.searchTerm && (
                                                <span style={{fontStyle: 'italic', marginLeft: '10px'}}>
                                                    - filtré pour "{filters.searchTerm}"
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        'Aucune tâche à afficher'
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}