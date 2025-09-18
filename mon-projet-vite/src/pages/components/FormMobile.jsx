import React, {useCallback, useEffect, useState} from "react";
import Item from "./Item.jsx";
import lien from './lien'
import {Link} from "react-router-dom";
import {useNotify} from "./Notification";
import './css/design-system.css'

export default function FormMobile(props) {
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
        notify("Tâche supprimée avec succès", 'success')
        await fetchAPI();
    });

    // Insert tâche
    let fetchCreer = useCallback(async (e) => {
        let userid = "" + localStorage.getItem("utilisateur");
        let userid2 = parseInt(userid)
        let str = "" + localStorage.getItem('jwt')
        e.preventDefault();

        if (!titre.trim()) {
            notify("Le titre est obligatoire", 'error');
            return;
        }

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
        notify("Nouvelle tâche créée avec succès !", 'success')
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
        notify("Tâche mise à jour avec succès", 'success')
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
        if (a.length <= 500) { // Limitation à 500 caractères
            console.log(a);
            setDescription(a)
        }
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
        // Scroll vers le formulaire
        document.querySelector('.form-content')?.scrollIntoView({
            behavior: 'smooth'
        });
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
        <div className="form-container mobile-container">
            <div className="form-wrapper mobile-flex mobile-flex-col" style={{ gap: '1.5rem' }}>
                {/* Formulaire de création/modification */}
                <div className="form-content mobile-card">
                    <div className="id-display">
                        <label className="id-label mobile-card-header" style={{
                            background: idVal !== -1 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #10b981, #059669)',
                            color: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            margin: '0 0 1.5rem 0',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}>
                            {idVal !== -1 ? '✏️ Modification de la Tâche' : '➕ Créer une Nouvelle Tâche'}
                            {idVal !== -1 && <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.875rem' }}>ID: {idVal}</span>}
                        </label>
                    </div>

                    <div className="form-inputs mobile-form" style={{ gap: '1.5rem' }}>
                        <div className="input-group mobile-form-group">
                            <label className="input-label mobile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                📝 Titre de la Tâche
                                <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>
                            </label>
                            <input
                                className="input-field mobile-form-input title-input"
                                placeholder="Ex: Terminer le rapport mensuel, Appeler le client..."
                                value={titre}
                                onChange={(e) => Valuechange(e)}
                                style={{
                                    fontSize: '16px',
                                    padding: '1rem 1.25rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease',
                                    background: 'white',
                                    width: '100%'
                                }}
                                required
                            />
                        </div>

                        <div className="input-group mobile-form-group">
                            <label className="input-label mobile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                📄 Description Détaillée
                                <span style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '400' }}>(optionnel)</span>
                            </label>
                            <textarea
                                className="textarea-field mobile-form-input description-input"
                                placeholder="Décrivez votre tâche en détail : objectifs, étapes, échéances, ressources nécessaires..."
                                value={valueInputDescription}
                                onChange={(e) => valueChangeDescription(e)}
                                rows="4"
                                style={{
                                    fontSize: '16px',
                                    padding: '1rem 1.25rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    transition: 'all 0.3s ease',
                                    background: 'white',
                                    resize: 'vertical',
                                    minHeight: '120px',
                                    lineHeight: '1.5',
                                    width: '100%'
                                }}
                            />
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', textAlign: 'right' }}>
                                {valueInputDescription.length}/500 caractères
                            </div>
                        </div>

                        <div className="button-group mobile-flex mobile-flex-col" style={{ gap: '1rem', marginTop: '2rem' }}>
                            {idVal !== -1 ? (
                                <button
                                    className="btn btn-update mobile-btn mobile-btn-primary"
                                    onClick={modifier}
                                    style={{
                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                        color: 'white',
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%'
                                    }}
                                >
                                    ✏️ Mettre à Jour la Tâche
                                </button>
                            ) : (
                                <button
                                    className="btn btn-create mobile-btn mobile-btn-primary"
                                    onClick={fetchCreer}
                                    disabled={!titre.trim()}
                                    style={{
                                        background: titre.trim() ? 'linear-gradient(135deg, #10b981, #059669)' : '#d1d5db',
                                        color: 'white',
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: titre.trim() ? 'pointer' : 'not-allowed',
                                        transition: 'all 0.3s ease',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%'
                                    }}
                                >
                                    ✅ Créer la Tâche
                                </button>
                            )}
                            {idVal !== -1 && (
                                <button
                                    className="btn btn-cancel mobile-btn mobile-btn-secondary"
                                    onClick={() => {
                                        setValue("");
                                        setDescription("");
                                        setId(-1);
                                        setEditingItem(null);
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                        color: 'white',
                                        padding: '1rem 2rem',
                                        borderRadius: '12px',
                                        border: 'none',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        minHeight: '48px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        width: '100%'
                                    }}
                                >
                                    ❌ Annuler les Modifications
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section des filtres */}
                <div className="filters-section mobile-card">
                    <div className="filters-header mobile-card-header">
                        <h3 className="filters-title mobile-card-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>
                            <span className="filter-icon mobile-card-icon" style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>🔍</span>
                            Recherche & Filtres Avancés
                        </h3>
                        <div className="mobile-flex mobile-flex-col" style={{ gap: '0.5rem', alignItems: 'flex-end' }}>
                            <button
                                className="reset-filters-btn mobile-btn mobile-btn-small"
                                onClick={resetFilters}
                                title="Réinitialiser tous les filtres"
                                style={{
                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1rem',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    minHeight: '36px',
                                    width: '100%'
                                }}
                            >
                                ↻ Réinitialiser
                            </button>
                        </div>
                    </div>

                    <div className="filters-grid mobile-grid mobile-grid-1" style={{ gap: '1rem' }}>
                        {/* Barre de recherche */}
                        <div className="filter-group search-group mobile-form-group">
                            <label className="filter-label mobile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                🔎 Recherche Intelligente
                            </label>
                            <div className="search-input-wrapper" style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="search-input mobile-form-input"
                                    placeholder="Tapez pour rechercher dans les titres et descriptions..."
                                    value={filters.searchTerm}
                                    onChange={(e) => updateFilter('searchTerm', e.target.value)}
                                    style={{
                                        fontSize: '16px',
                                        padding: '1rem 3rem 1rem 1.25rem',
                                        border: '2px solid #e5e7eb',
                                        borderRadius: '12px',
                                        background: 'white',
                                        transition: 'all 0.3s ease',
                                        width: '100%'
                                    }}
                                />
                                <span className="search-icon" style={{
                                    position: 'absolute',
                                    right: '1rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    fontSize: '1.25rem',
                                    color: '#6b7280'
                                }}>🔍</span>
                            </div>
                            {filters.searchTerm && (
                                <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    ✅ Recherche active : "{filters.searchTerm}"
                                </div>
                            )}
                        </div>

                        {/* Tri */}
                        <div className="filter-group mobile-form-group">
                            <label className="filter-label mobile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                📊 Trier par
                            </label>
                            <select
                                className="filter-select mobile-form-select"
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value)}
                                style={{
                                    fontSize: '16px',
                                    padding: '1rem 1.25rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <option value="date">📅 Date de création</option>
                                <option value="title">🔤 Titre (A-Z)</option>
                                <option value="description">📝 Description (A-Z)</option>
                            </select>
                        </div>

                        {/* Ordre de tri */}
                        <div className="filter-group mobile-form-group">
                            <label className="filter-label mobile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                🔄 Ordre de Tri
                            </label>
                            <select
                                className="filter-select mobile-form-select"
                                value={filters.sortOrder}
                                onChange={(e) => updateFilter('sortOrder', e.target.value)}
                                style={{
                                    fontSize: '16px',
                                    padding: '1rem 1.25rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <option value="desc">⬇️ Plus récent au plus ancien</option>
                                <option value="asc">⬆️ Plus ancien au plus récent</option>
                            </select>
                        </div>

                        {/* Filtre par date */}
                        <div className="filter-group mobile-form-group">
                            <label className="filter-label mobile-form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                🗓️ Filtrer par Période
                            </label>
                            <select
                                className="filter-select mobile-form-select"
                                value={filters.dateFilter}
                                onChange={(e) => updateFilter('dateFilter', e.target.value)}
                                style={{
                                    fontSize: '16px',
                                    padding: '1rem 1.25rem',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    background: 'white',
                                    cursor: 'pointer',
                                    width: '100%'
                                }}
                            >
                                <option value="all">📅 Toutes les périodes</option>
                                <option value="today">🌅 Créées aujourd'hui</option>
                                <option value="week">📆 Cette semaine</option>
                                <option value="month">🗓️ Ce mois-ci</option>
                            </select>
                        </div>
                    </div>

                    {/* Statistiques */}
                    <div className="stats-section mobile-grid mobile-grid-2" style={{
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(59, 130, 246, 0.1))',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        marginTop: '1rem',
                        gap: '1rem'
                    }}>
                        <div className="stats-item mobile-card" style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <span className="stats-number" style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981', display: 'block' }}>{listItem.length}</span>
                            <span className="stats-label" style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>📋 Tâches Affichées</span>
                        </div>
                        <div className="stats-item mobile-card" style={{ textAlign: 'center', padding: '1rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <span className="stats-number" style={{ fontSize: '2rem', fontWeight: '800', color: '#8b5cf6', display: 'block' }}>{allItems.length}</span>
                            <span className="stats-label" style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: '600' }}>🗂️ Total Global</span>
                        </div>
                        {filters.searchTerm && (
                            <div className="stats-item search-stats mobile-card" style={{ textAlign: 'center', padding: '1rem', background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '8px', color: 'white', gridColumn: '1 / -1' }}>
                                <span className="stats-label" style={{ fontSize: '0.875rem', fontWeight: '600', display: 'block' }}>
                                    🔍 Recherche Active
                                </span>
                                <span style={{ fontSize: '0.8rem', opacity: '0.9', fontStyle: 'italic' }}>
                                    "{filters.searchTerm}"
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Liste des tâches */}
                {!load ? (
                    <div className="table-container mobile-card">
                        <div className="table-wrapper">
                            <div className="table-header mobile-card-header">
                                <h2 className="table-title mobile-card-title" style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className="table-icon" style={{ fontSize: '1.75rem' }}>📋</span>
                                    Gestionnaire de Tâches
                                    <span style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '600' }}>
                                        {listItem.length}
                                    </span>
                                </h2>
                                <div className="table-header-actions mobile-text-center">
                                    <span className="table-info" style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500' }}>
                                        {listItem.length === 0 ? 'Aucune tâche' :
                                            `${listItem.length} tâche${listItem.length !== 1 ? 's' : ''} ${listItem.length !== 1 ? 'affichées' : 'affichée'}`
                                        }
                                        {allItems.length !== listItem.length && (
                                            <span style={{ color: '#8b5cf6', marginLeft: '0.5rem' }}>
                                                (sur {allItems.length} total)
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>

                            {listItem.length > 0 ? (
                                <div className="mobile-table-cards">
                                    {listItem.map((item, index) => (
                                        <div
                                            key={item.id || index}
                                            className="mobile-card mobile-table-card"
                                            style={{
                                                border: editingItem === item.id ? '2px solid #8b5cf6' : '1px solid #e5e7eb',
                                                background: editingItem === item.id ? 'rgba(139, 92, 246, 0.05)' : 'white',
                                                margin: '1rem 0'
                                            }}
                                        >
                                            <div className="mobile-table-card-header">
                                                <h3 className="mobile-table-card-title" style={{
                                                    margin: 0,
                                                    color: '#1a202c',
                                                    fontSize: '1.4rem',
                                                    fontWeight: '800',
                                                    lineHeight: '1.3',
                                                    marginBottom: '0.75rem',
                                                    letterSpacing: '-0.025em'
                                                }}>
                                                    📝 {item.title || 'Sans titre'}
                                                </h3>
                                                {editingItem === item.id && (
                                                    <span style={{
                                                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                        color: 'white',
                                                        padding: '0.25rem 0.75rem',
                                                        borderRadius: '20px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}>
                                                        ✏️ En Modification
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mobile-table-card-content">
                                                <div className="mobile-table-card-row">
                                                    <div style={{ width: '100%' }}>
                                                        <span className="mobile-table-card-label" style={{
                                                            fontSize: '1rem',
                                                            fontWeight: '700',
                                                            color: '#4b5563',
                                                            display: 'block',
                                                            marginBottom: '0.5rem'
                                                        }}>📄 Description:</span>
                                                        <div className="mobile-table-card-value" style={{
                                                            fontSize: '1.1rem',
                                                            fontWeight: '500',
                                                            color: item.description ? '#1f2937' : '#9ca3af',
                                                            fontStyle: item.description ? 'normal' : 'italic',
                                                            lineHeight: '1.6',
                                                            wordWrap: 'break-word',
                                                            background: item.description ? '#f9fafb' : '#f3f4f6',
                                                            padding: '0.75rem',
                                                            borderRadius: '8px',
                                                            border: '1px solid #e5e7eb',
                                                            minHeight: '2.5rem',
                                                            display: 'flex',
                                                            alignItems: 'center'
                                                        }}>
                                                            {item.description || '💭 Aucune description fournie pour cette tâche'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mobile-table-card-row">
                                                    <span className="mobile-table-card-label" style={{
                                                        fontSize: '1rem',
                                                        fontWeight: '700',
                                                        color: '#4b5563',
                                                        minWidth: '120px'
                                                    }}>📅 Créée le:</span>
                                                    <span className="mobile-table-card-value" style={{
                                                        color: '#8b5cf6',
                                                        fontWeight: '700',
                                                        fontSize: '1.05rem',
                                                        background: 'rgba(139, 92, 246, 0.1)',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '6px',
                                                        marginLeft: '0.5rem'
                                                    }}>
                                                        {formatDate(item.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="mobile-table-card-row" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #f3f4f6', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="mobile-btn mobile-btn-primary"
                                                        style={{
                                                            flex: 1,
                                                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        ✏️ Modifier
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item)}
                                                        className="mobile-btn mobile-btn-secondary"
                                                        style={{
                                                            flex: 1,
                                                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '0.75rem',
                                                            fontSize: '0.875rem',
                                                            fontWeight: '600',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        🗑️ Supprimer
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="table-empty mobile-card" style={{
                                    textAlign: 'center',
                                    padding: '3rem 2rem',
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(59, 130, 246, 0.05))',
                                    borderRadius: '12px',
                                    border: '2px dashed #d1d5db'
                                }}>
                                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                                        {filters.searchTerm || filters.dateFilter !== 'all' ? '🔍' : '📝'}
                                    </div>
                                    <h3 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '600' }}>
                                        {filters.searchTerm || filters.dateFilter !== 'all'
                                            ? 'Aucun Résultat Trouvé'
                                            : 'Aucune Tâche Créée'
                                        }
                                    </h3>
                                    <p style={{ color: '#6b7280', margin: 0, fontSize: '1rem', lineHeight: '1.5' }}>
                                        {filters.searchTerm || filters.dateFilter !== 'all'
                                            ? 'Essayez de modifier vos critères de recherche ou de réinitialiser les filtres'
                                            : 'Commencez par créer votre première tâche en utilisant le formulaire ci-dessus'
                                        }
                                    </p>
                                    {(filters.searchTerm || filters.dateFilter !== 'all') && (
                                        <button
                                            onClick={resetFilters}
                                            className="mobile-btn mobile-btn-primary"
                                            style={{
                                                marginTop: '1rem',
                                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '8px',
                                                padding: '0.75rem 1.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            🔄 Réinitialiser les Filtres
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="loading-container mobile-card" style={{
                        textAlign: 'center',
                        padding: '3rem',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'pulse 2s infinite' }}>
                            ⏳
                        </div>
                        <h1 className="loading-text" style={{
                            fontSize: '1.5rem',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            Chargement de vos tâches...
                        </h1>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                            Veuillez patienter un instant
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}