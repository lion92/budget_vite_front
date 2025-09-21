import React, {useCallback, useEffect, useState} from "react";
import Item from "./Item.jsx";
import lien from './lien'
import {Link} from "react-router-dom";
import {useNotify} from "./Notification";
import './css/form.css'
export default function Form(props) {
    let [titre, setValue] = useState("");
    let [valueInputTitre, setTitre] = useState("");
    let [valueInputDescription, setDescription] = useState("");
    let [idVal, setId] = useState(-1);
    let [listItem, setText] = useState([]);
    let [allItems, setAllItems] = useState([]); // Garder tous les items pour le filtrage

    const [load, setLoad] = useState(false);
    const notify = useNotify();

    // États pour les filtres
    const [filters, setFilters] = useState({
        searchTerm: "",
        sortBy: "date", // date, title, description
        sortOrder: "desc", // asc, desc
        dateFilter: "all", // all, today, week, month
        showCompleted: true,
        showIncomplete: true
    });

    // États pour le tableau
    const [selectedItems, setSelectedItems] = useState([]);
    const [editingItem, setEditingItem] = useState(null);

    let attendre = () => {
        setLoad(true);
        setTimeout(() => {
            setLoad(false);
        }, 500);
        console.log(load);
    };

    useEffect(() => {
        attendre();
    }, []);

    // Rechercher
    let recherche = async (e) => {
        e.preventDefault();
        if (titre === "") {
            console.log("test0");
            await fetchAPI();
        } else {
            let f = await fetchAPI();
            await console.log(f);
            await titre;
            let tab = await f.filter((elemt) =>
                elemt.title === titre
                || elemt.description === valueInputDescription
            );
            await setText(tab);
            await console.log("bb");
        }
    };

    // Fetch API
    const fetchAPI = useCallback(async () => {
        let idUser = parseInt("" + localStorage.getItem("utilisateur"))
        let str = "" + localStorage.getItem('jwt')
        const response = await fetch(lien.url + "todos/byuser/" + idUser ,{headers:{Authorization: `Bearer ${str}`}});
        const resbis = await response.json();
        setAllItems(resbis); // Sauvegarder tous les items
        applyFilters(resbis); // Appliquer les filtres
        return resbis;
    }, []);

    // Fonction pour appliquer les filtres
    const applyFilters = useCallback((items = allItems) => {
        let filtered = [...items];

        // Filtre de recherche
        if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchLower) ||
                item.description?.toLowerCase().includes(searchLower)
            );
        }

        // Filtre par date
        if (filters.dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter(item => {
                const itemDate = new Date(item.createdAt);

                switch (filters.dateFilter) {
                    case "today":
                        return itemDate >= today;
                    case "week":
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return itemDate >= weekAgo;
                    case "month":
                        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return itemDate >= monthAgo;
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

        setText(filtered);
    }, [filters, allItems]);

    // Effet pour appliquer les filtres quand ils changent
    useEffect(() => {
        if (allItems.length > 0) {
            applyFilters();
        }
    }, [filters, applyFilters]);

    // Fonction pour mettre à jour les filtres
    const updateFilter = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Fonction pour réinitialiser les filtres
    const resetFilters = () => {
        setFilters({
            searchTerm: "",
            sortBy: "date",
            sortOrder: "desc",
            dateFilter: "all",
            showCompleted: true,
            showIncomplete: true
        });
    };

    // Remonter au parent
    let idchange = (data) => {
        setId(data);
    };

    // Change color
    let changeColor = (data) => {
        // Logique de changement de couleur
    };

    // Appel API au début
    useEffect(() => {
        fetchAPI();
    }, []);

    // Supprimer des tâches
    let del = (e, data) => {
        e.preventDefault();
        fetchdelete(data);
    };

    // Remonter le texte
    let textebis = (data) => {
        setValue(data);
    };

    // Remonter la description
    let textebisDesc = (data) => {
        setDescription(data);
    };

    // Appel delete
    let fetchdelete = useCallback(async (data) => {
        let idTodo = parseInt(data, 10)
        let str = "" + localStorage.getItem('jwt')
        const response = await fetch(
            lien.url + "todos/" + idTodo,
            {
                method: "DELETE",
                body: JSON.stringify({
                    jwt: str
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const resbis = await response;
        notify("Todo supprimé", 'success')
        await fetchAPI();
    });

    // Insert tâche
    let fetchCreer = useCallback(async (e) => {
        let userid = "" + localStorage.getItem("utilisateur");
        let userid2 = parseInt(userid)
        let str = "" + localStorage.getItem('jwt')
        e.preventDefault();
        const response = await fetch(
            lien.url + "todos",
            {
                method: "POST",
                body: JSON.stringify({
                    title: titre,
                    description: valueInputDescription,
                    user: userid2,
                    jwt: str
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const resbis = await response;
        notify("Todo créé", 'success')
        setValue(""); // Vider le formulaire après création
        setDescription("");
        await fetchAPI();
    });

    // Update
    let fetchAPIupdate = useCallback(async () => {
        let userid = "" + localStorage.getItem("utilisateur");
        let str = "" + localStorage.getItem('jwt')
        await console.log(userid);
        let id = parseInt(userid);
        const response = await fetch(
            lien.url + "todos/" + idVal,
            {
                method: "PUT",
                body: JSON.stringify({
                    title: titre,
                    description: valueInputDescription,
                    user: id,
                    jwt: str
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const resbis = await response;
        notify("Todo mis à jour", 'success')
        await fetchAPI();
    });

    // Input change value - SANS LIMITES
    let Valuechange = (e) => {
        let a = e.target.value;
        console.log(a);
        setValue(a);
        return a;
    };

    // Input change description - SANS LIMITES
    let valueChangeDescription = (e) => {
        let a = e.target.value;
        console.log(a);
        setDescription(a)
        return a;
    };

    // Modifier
    let modifier = (e) => {
        e.preventDefault();
        fetchAPIupdate();
        setValue("");
        setTitre("");
        setDescription("");
        setId(-1);
    };

    // Fonctions pour le tableau
    const handleEdit = (item) => {
        setValue(item.title);
        setDescription(item.description);
        setId(item.id);
        setEditingItem(item.id);
    };

    const handleDelete = (item) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${item.title}" ?`)) {
            fetchdelete(item.id);
        }
    };

    const handleSort = (column) => {
        if (filters.sortBy === column) {
            updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            updateFilter('sortBy', column);
            updateFilter('sortOrder', 'asc');
        }
    };

    const formatDate = (dateString) => {
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
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    return (
        <div className="form-container">
            <div className="form-wrapper">
                {/* Section formulaire améliorée */}
                <div className="form-content">
                    <div className="form-header">
                        <h2 className="form-title">
                            <span className="form-icon">{idVal !== -1 ? '✏️' : '📝'}</span>
                            {idVal !== -1 ? 'Modifier la tâche' : 'Créer une nouvelle tâche'}
                        </h2>
                        {idVal !== -1 && (
                            <div className="editing-badge">
                                <span className="editing-text">ID: {idVal}</span>
                            </div>
                        )}
                    </div>

                    <form className="task-form" onSubmit={(e) => {
                        e.preventDefault();
                        idVal !== -1 ? modifier(e) : fetchCreer(e);
                    }}>
                        <div className="form-grid">
                            <div className="input-section">
                                <label className="input-label" htmlFor="task-title">
                                    <span className="label-icon">📋</span>
                                    Titre de la tâche
                                    <span className="required-asterisk">*</span>
                                </label>
                                <input
                                    id="task-title"
                                    className="input-field title-input"
                                    placeholder="Ex: Finaliser le rapport mensuel"
                                    value={titre}
                                    onChange={(e) => Valuechange(e)}
                                    required
                                    autoComplete="off"
                                    maxLength={100}
                                />
                                <div className="input-hint">
                                    {titre.length}/100 caractères
                                </div>
                            </div>

                            <div className="input-section">
                                <label className="input-label" htmlFor="task-description">
                                    <span className="label-icon">📄</span>
                                    Description détaillée
                                </label>
                                <textarea
                                    id="task-description"
                                    className="textarea-field description-input"
                                    placeholder="Décrivez votre tâche en détail : objectifs, étapes, ressources nécessaires..."
                                    value={valueInputDescription}
                                    onChange={(e) => valueChangeDescription(e)}
                                    rows="4"
                                    maxLength={500}
                                />
                                <div className="input-hint">
                                    {valueInputDescription.length}/500 caractères
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <div className="primary-actions">
                                <button
                                    type="submit"
                                    className={`btn ${idVal !== -1 ? 'btn-update' : 'btn-create'}`}
                                    disabled={!titre.trim()}
                                >
                                    <span className="btn-icon">{idVal !== -1 ? '💾' : '➕'}</span>
                                    <span className="btn-text">{idVal !== -1 ? 'Sauvegarder' : 'Créer la tâche'}</span>
                                </button>
                            </div>

                            {idVal !== -1 && (
                                <div className="secondary-actions">
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={() => {
                                            setValue("");
                                            setDescription("");
                                            setId(-1);
                                            setEditingItem(null);
                                        }}
                                    >
                                        <span className="btn-icon">↩️</span>
                                        <span className="btn-text">Annuler</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Section des filtres améliorée */}
                <div className="filters-section">
                    <div className="filters-header">
                        <div className="filters-title-group">
                            <h3 className="filters-title">
                                <span className="filter-icon">🔍</span>
                                Recherche et filtres
                            </h3>
                            <p className="filters-subtitle">Trouvez rapidement vos tâches</p>
                        </div>
                        <button
                            className="reset-filters-btn"
                            onClick={resetFilters}
                            title="Réinitialiser tous les filtres"
                            disabled={!filters.searchTerm && filters.sortBy === 'date' && filters.sortOrder === 'desc' && filters.dateFilter === 'all'}
                        >
                            <span className="reset-icon">↻</span>
                            <span className="reset-text">Reset</span>
                        </button>
                    </div>

                    {/* Barre de recherche mise en avant */}
                    <div className="search-section">
                        <div className="search-input-wrapper">
                            <span className="search-icon-left">🔍</span>
                            <input
                                type="text"
                                className="search-input-main"
                                placeholder="Rechercher une tâche par titre ou description..."
                                value={filters.searchTerm}
                                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                                autoComplete="off"
                            />
                            {filters.searchTerm && (
                                <button
                                    className="search-clear-btn"
                                    onClick={() => updateFilter('searchTerm', '')}
                                    title="Effacer la recherche"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filtres avancés dans un accordéon */}
                    <details className="advanced-filters" open>
                        <summary className="filters-toggle">
                            <span className="toggle-icon">⚙️</span>
                            <span className="toggle-text">Options de tri</span>
                            <span className="toggle-arrow">▼</span>
                        </summary>

                        <div className="filters-grid">
                            <div className="filter-group">
                                <label className="filter-label" htmlFor="sort-by">
                                    <span className="label-icon">📊</span>
                                    Trier par
                                </label>
                                <select
                                    id="sort-by"
                                    className="filter-select"
                                    value={filters.sortBy}
                                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                                >
                                    <option value="date">📅 Date de création</option>
                                    <option value="title">🔤 Titre alphabétique</option>
                                    <option value="description">📝 Description alphabétique</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label" htmlFor="sort-order">
                                    <span className="label-icon">🔄</span>
                                    Ordre
                                </label>
                                <select
                                    id="sort-order"
                                    className="filter-select"
                                    value={filters.sortOrder}
                                    onChange={(e) => updateFilter('sortOrder', e.target.value)}
                                >
                                    <option value="desc">⬇️ Plus récent en premier</option>
                                    <option value="asc">⬆️ Plus ancien en premier</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label className="filter-label" htmlFor="date-filter">
                                    <span className="label-icon">📆</span>
                                    Période
                                </label>
                                <select
                                    id="date-filter"
                                    className="filter-select"
                                    value={filters.dateFilter}
                                    onChange={(e) => updateFilter('dateFilter', e.target.value)}
                                >
                                    <option value="all">🌐 Toutes les périodes</option>
                                    <option value="today">📅 Aujourd'hui</option>
                                    <option value="week">📊 Cette semaine</option>
                                    <option value="month">📈 Ce mois</option>
                                </select>
                            </div>
                        </div>
                    </details>

                    {/* Statistiques améliorées */}
                    <div className="stats-dashboard">
                        <div className="stats-grid">
                            <div className="stats-card primary">
                                <div className="stats-icon">📊</div>
                                <div className="stats-content">
                                    <div className="stats-number">{listItem.length}</div>
                                    <div className="stats-label">Affichées</div>
                                </div>
                            </div>
                            <div className="stats-card secondary">
                                <div className="stats-icon">📚</div>
                                <div className="stats-content">
                                    <div className="stats-number">{allItems.length}</div>
                                    <div className="stats-label">Au total</div>
                                </div>
                            </div>
                            {filters.searchTerm && (
                                <div className="stats-card search">
                                    <div className="stats-icon">🔍</div>
                                    <div className="stats-content">
                                        <div className="stats-search-term">"{filters.searchTerm}"</div>
                                        <div className="stats-label">Recherche active</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SECTION DES TÂCHES AMÉLIORÉE */}
                {!load ? (
                    <div className="tasks-container">
                        <div className="tasks-wrapper">
                            <div className="tasks-header">
                                <div className="header-content">
                                    <h2 className="tasks-title">
                                        <span className="tasks-icon">📋</span>
                                        <span className="title-text">Mes Tâches</span>
                                        <span className="tasks-count">({listItem.length})</span>
                                    </h2>
                                    <p className="tasks-subtitle">
                                        {listItem.length === 0
                                            ? 'Aucune tâche pour le moment'
                                            : `${listItem.length} tâche${listItem.length !== 1 ? 's' : ''} ${listItem.length !== allItems.length ? 'filtrée' + (listItem.length !== 1 ? 's' : '') : ''}`
                                        }
                                    </p>
                                </div>
                                <div className="header-actions">
                                    {listItem.length > 0 && (
                                        <button
                                            className="view-toggle-btn"
                                            onClick={() => {
                                                // Fonctionnalité future : basculer entre vue tableau et carte
                                            }}
                                            title="Changer la vue (bientôt disponible)"
                                        >
                                            <span className="view-icon">⊞</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {listItem.length > 0 ? (
                                <div className="tasks-grid">
                                    {/* Vue tableau pour desktop */}
                                    <div className="table-view">
                                        <table className="modern-table">
                                            <thead>
                                            <tr>
                                                <th
                                                    className="sortable"
                                                    onClick={() => handleSort('title')}
                                                    title="Trier par titre"
                                                >
                                                    <span className="th-content">
                                                        <span className="th-icon">📝</span>
                                                        <span className="th-text">Titre</span>
                                                        {filters.sortBy === 'title' && (
                                                            <span className="sort-indicator">
                                                                {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>
                                                <th
                                                    className="sortable"
                                                    onClick={() => handleSort('description')}
                                                    title="Trier par description"
                                                >
                                                    <span className="th-content">
                                                        <span className="th-icon">📄</span>
                                                        <span className="th-text">Description</span>
                                                        {filters.sortBy === 'description' && (
                                                            <span className="sort-indicator">
                                                                {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>
                                                <th
                                                    className="sortable"
                                                    onClick={() => handleSort('date')}
                                                    title="Trier par date"
                                                >
                                                    <span className="th-content">
                                                        <span className="th-icon">📅</span>
                                                        <span className="th-text">Date</span>
                                                        {filters.sortBy === 'date' && (
                                                            <span className="sort-indicator">
                                                                {filters.sortOrder === 'asc' ? '↑' : '↓'}
                                                            </span>
                                                        )}
                                                    </span>
                                                </th>
                                                <th className="actions-column">
                                                    <span className="th-content">
                                                        <span className="th-icon">⚙️</span>
                                                        <span className="th-text">Actions</span>
                                                    </span>
                                                </th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {listItem.map((item, index) => (
                                                <tr
                                                    key={item.id || index}
                                                    className={`task-row ${editingItem === item.id ? 'editing-row' : ''}`}
                                                >
                                                    <td data-label="Titre" className="title-cell">
                                                        <div className="task-title">
                                                            <span className="task-emoji">📝</span>
                                                            <span className="title-text">{item.title || 'Sans titre'}</span>
                                                            {editingItem === item.id && (
                                                                <span className="editing-indicator">✏️</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td data-label="Description" className="description-cell">
                                                        <div className="task-description" title={item.description}>
                                                            {item.description ? (
                                                                <>
                                                                    <span className="desc-icon">📄</span>
                                                                    <span className="desc-text">{truncateText(item.description, 80)}</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <span className="desc-icon">💭</span>
                                                                    <span className="desc-placeholder">Aucune description</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td data-label="Date" className="date-cell">
                                                        <div className="task-date">
                                                            <span className="date-icon">🕒</span>
                                                            <span className="date-text">{formatDate(item.createdAt)}</span>
                                                        </div>
                                                    </td>
                                                    <td data-label="Actions" className="actions-cell">
                                                        <div className="task-actions">
                                                            <button
                                                                className="action-btn edit-btn"
                                                                onClick={() => handleEdit(item)}
                                                                title="Modifier cette tâche"
                                                            >
                                                                <span className="btn-icon">✏️</span>
                                                                <span className="btn-text">Modifier</span>
                                                            </button>
                                                            <button
                                                                className="action-btn delete-btn"
                                                                onClick={() => handleDelete(item)}
                                                                title="Supprimer cette tâche"
                                                            >
                                                                <span className="btn-icon">🗑️</span>
                                                                <span className="btn-text">Supprimer</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state">
                                    <div className="empty-icon">📝</div>
                                    <h3 className="empty-title">
                                        {filters.searchTerm || filters.dateFilter !== 'all'
                                            ? 'Aucun résultat trouvé'
                                            : 'Aucune tâche créée'
                                        }
                                    </h3>
                                    <p className="empty-message">
                                        {filters.searchTerm || filters.dateFilter !== 'all'
                                            ? 'Essayez de modifier vos critères de recherche'
                                            : 'Commencez par créer votre première tâche ci-dessus'
                                        }
                                    </p>
                                    {(filters.searchTerm || filters.dateFilter !== 'all') && (
                                        <button className="empty-action-btn" onClick={resetFilters}>
                                            <span className="btn-icon">🔄</span>
                                            <span className="btn-text">Réinitialiser les filtres</span>
                                        </button>
                                    )}
                                </div>
                            )}

                            {listItem.length > 0 && (
                                <div className="tasks-footer">
                                    <div className="footer-info">
                                        <div className="results-summary">
                                            <span className="summary-icon">📊</span>
                                            <span className="summary-text">
                                                {listItem.length} tâche{listItem.length !== 1 ? 's' : ''} affichée{listItem.length !== 1 ? 's' : ''}
                                                {allItems.length !== listItem.length && (
                                                    <span className="total-count"> sur {allItems.length} au total</span>
                                                )}
                                            </span>
                                        </div>
                                        {filters.searchTerm && (
                                            <div className="filter-info">
                                                <span className="filter-icon">🔍</span>
                                                <span className="filter-text">Filtré pour "{filters.searchTerm}"</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="footer-actions">
                                        <button className="footer-btn" disabled title="Pagination disponible prochainement">
                                            <span className="btn-icon">📄</span>
                                            <span className="btn-text">Page 1/1</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="loading-container">
                        <h1 className="loading-text">Chargement...</h1>
                    </div>
                )}
            </div>
        </div>
    );
}