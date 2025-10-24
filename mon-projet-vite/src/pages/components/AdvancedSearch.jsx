// AdvancedSearch.jsx - Composant de recherche avancée pour les dépenses
import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Calendar, DollarSign, Tag, RotateCcw } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './css/advanced-search.css';

const AdvancedSearch = ({
    onSearch,
    onFilter,
    categories = [],
    searchStats,
    activeFilters,
    onClearFilters
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        categories: [],
        dateRange: { from: null, to: null },
        amountRange: { min: '', max: '' },
        description: ''
    });

    // Gestion de la recherche globale
    const handleSearchChange = useCallback((value) => {
        setSearchTerm(value);
        onSearch(value);
    }, [onSearch]);

    // Gestion des filtres
    const updateFilter = useCallback((key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    }, [filters, onFilter]);

    // Gestion des catégories multiples (utilise les noms au lieu des IDs)
    const toggleCategory = useCallback((categoryName) => {
        const currentCategories = filters.categories;
        const updatedCategories = currentCategories.includes(categoryName)
            ? currentCategories.filter(name => name !== categoryName)
            : [...currentCategories, categoryName];

        updateFilter('categories', updatedCategories);
    }, [filters.categories, updateFilter]);

    // Remise à zéro
    const handleClearAll = useCallback(() => {
        setSearchTerm('');
        setFilters({
            categories: [],
            dateRange: { from: null, to: null },
            amountRange: { min: '', max: '' },
            description: ''
        });
        onClearFilters();
    }, [onClearFilters]);

    // Gestion des plages de dates
    const handleDateRangeChange = useCallback((field, date) => {
        const newDateRange = { ...filters.dateRange, [field]: date };
        updateFilter('dateRange', newDateRange);
    }, [filters.dateRange, updateFilter]);

    // Gestion des plages de montants
    const handleAmountRangeChange = useCallback((field, value) => {
        const numValue = value === '' ? '' : parseFloat(value);
        const newAmountRange = { ...filters.amountRange, [field]: numValue };
        updateFilter('amountRange', newAmountRange);
    }, [filters.amountRange, updateFilter]);

    // Raccourcis de filtrage rapide
    const quickFilters = [
        { label: 'Cette semaine', action: () => {
            const today = new Date();
            const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
            const weekEnd = new Date(today.setDate(weekStart.getDate() + 6));
            updateFilter('dateRange', { from: weekStart, to: weekEnd });
        }},
        { label: 'Ce mois', action: () => {
            const today = new Date();
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            updateFilter('dateRange', { from: monthStart, to: monthEnd });
        }},
        { label: 'Derniers 30 jours', action: () => {
            const today = new Date();
            const monthAgo = new Date(today.setDate(today.getDate() - 30));
            updateFilter('dateRange', { from: monthAgo, to: new Date() });
        }},
        { label: '+ 100€', action: () => {
            updateFilter('amountRange', { min: 100, max: '' });
        }}
    ];

    return (
        <div className="advanced-search">
            {/* Barre de recherche principale */}
            <div className="search-main">
                <div className="search-input-wrapper">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Rechercher dans toutes les dépenses..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="search-input"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="clear-search-btn"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`filter-toggle-btn ${isExpanded ? 'active' : ''}`}
                >
                    <Filter size={20} />
                    Filtres avancés
                    {activeFilters.length > 0 && (
                        <span className="filter-count">{activeFilters.length}</span>
                    )}
                </button>
            </div>

            {/* Statistiques de recherche */}
            {searchStats && (
                <div className="search-stats">
                    <span className="stats-text">
                        {searchStats.isFiltered ? (
                            <>
                                <strong>{searchStats.filteredCount}</strong> résultat{searchStats.filteredCount !== 1 ? 's' : ''}
                                sur <strong>{searchStats.originalCount}</strong>
                                ({searchStats.percentage}%)
                            </>
                        ) : (
                            <>
                                <strong>{searchStats.originalCount}</strong> dépense{searchStats.originalCount !== 1 ? 's' : ''} au total
                            </>
                        )}
                    </span>
                </div>
            )}

            {/* Filtres actifs */}
            {activeFilters.length > 0 && (
                <div className="active-filters">
                    <div className="active-filters-list">
                        {activeFilters.map(filter => (
                            <div key={filter.key} className={`active-filter ${filter.type}`}>
                                <span className="filter-label">{filter.label}:</span>
                                <span className="filter-value">{filter.value}</span>
                                {filter.key !== 'search' && (
                                    <button
                                        onClick={() => {
                                            // Gérer différemment selon le type de filtre
                                            if (filter.key === 'categories') {
                                                updateFilter(filter.key, []);
                                            } else if (filter.key === 'dateRange') {
                                                updateFilter(filter.key, { from: null, to: null });
                                            } else if (filter.key === 'categoryName') {
                                                updateFilter(filter.key, []);
                                            } else if (filter.key === 'montant' || filter.key === 'amountRange') {
                                                updateFilter(filter.key, { min: '', max: '' });
                                            } else {
                                                updateFilter(filter.key, '');
                                            }
                                        }}
                                        className="remove-filter-btn"
                                        title="Supprimer ce filtre"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button onClick={handleClearAll} className="clear-all-btn">
                        <RotateCcw size={16} />
                        Tout effacer
                    </button>
                </div>
            )}

            {/* Panneau de filtres avancés */}
            {isExpanded && (
                <div className="advanced-filters">
                    {/* Raccourcis de filtrage */}
                    <div className="filter-section">
                        <h4>🚀 Filtres rapides</h4>
                        <div className="quick-filters">
                            {quickFilters.map((quick, index) => (
                                <button
                                    key={index}
                                    onClick={quick.action}
                                    className="quick-filter-btn"
                                >
                                    {quick.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="filters-grid">
                        {/* Filtre par catégories */}
                        <div className="filter-section">
                            <h4>
                                <Tag size={16} />
                                Catégories
                            </h4>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                maxHeight: '250px',
                                overflowY: 'auto',
                                padding: '4px'
                            }}>
                                {categories.map(category => (
                                    <label
                                        key={category.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '10px 12px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            backgroundColor: filters.categories.includes(category.categorie)
                                                ? 'rgba(102, 126, 234, 0.15)'
                                                : 'transparent',
                                            border: filters.categories.includes(category.categorie)
                                                ? '2px solid #667eea'
                                                : '2px solid transparent',
                                            transition: 'all 0.2s ease',
                                            ':hover': {
                                                backgroundColor: 'rgba(102, 126, 234, 0.08)'
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!filters.categories.includes(category.categorie)) {
                                                e.currentTarget.style.backgroundColor = 'rgba(102, 126, 234, 0.08)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!filters.categories.includes(category.categorie)) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={filters.categories.includes(category.categorie)}
                                            onChange={() => toggleCategory(category.categorie)}
                                            style={{
                                                width: '18px',
                                                height: '18px',
                                                cursor: 'pointer',
                                                accentColor: '#667eea'
                                            }}
                                        />
                                        {category.iconName && (
                                            <i
                                                className={category.iconName}
                                                style={{
                                                    color: category.color || '#667eea',
                                                    fontSize: '16px',
                                                    minWidth: '16px'
                                                }}
                                            ></i>
                                        )}
                                        <span style={{
                                            flex: 1,
                                            fontWeight: filters.categories.includes(category.categorie) ? '600' : '500',
                                            color: '#5b21b6',
                                            fontSize: '15px',
                                            lineHeight: '1.4'
                                        }}>
                                            {category.categorie}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {categories.length === 0 && (
                                <div style={{
                                    padding: '20px',
                                    textAlign: 'center',
                                    color: '#64748b',
                                    fontSize: '14px'
                                }}>
                                    Aucune catégorie disponible
                                </div>
                            )}
                        </div>

                        {/* Filtre par plage de dates */}
                        <div className="filter-section">
                            <h4>
                                <Calendar size={16} />
                                Période
                            </h4>
                            <div className="date-range-filter">
                                <div className="date-input-group">
                                    <label>Du :</label>
                                    <DatePicker
                                        selected={filters.dateRange.from}
                                        onChange={(date) => handleDateRangeChange('from', date)}
                                        selectsStart
                                        startDate={filters.dateRange.from}
                                        endDate={filters.dateRange.to}
                                        placeholderText="Date de début"
                                        dateFormat="dd/MM/yyyy"
                                        className="date-input"
                                    />
                                </div>
                                <div className="date-input-group">
                                    <label>Au :</label>
                                    <DatePicker
                                        selected={filters.dateRange.to}
                                        onChange={(date) => handleDateRangeChange('to', date)}
                                        selectsEnd
                                        startDate={filters.dateRange.from}
                                        endDate={filters.dateRange.to}
                                        minDate={filters.dateRange.from}
                                        placeholderText="Date de fin"
                                        dateFormat="dd/MM/yyyy"
                                        className="date-input"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filtre par plage de montants */}
                        <div className="filter-section">
                            <h4>
                                <DollarSign size={16} />
                                Montant
                            </h4>
                            <div className="amount-range-filter">
                                <div className="amount-input-group">
                                    <label>Min :</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={filters.amountRange.min}
                                        onChange={(e) => handleAmountRangeChange('min', e.target.value)}
                                        className="amount-input"
                                    />
                                    <span className="currency">€</span>
                                </div>
                                <div className="amount-input-group">
                                    <label>Max :</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="∞"
                                        value={filters.amountRange.max}
                                        onChange={(e) => handleAmountRangeChange('max', e.target.value)}
                                        className="amount-input"
                                    />
                                    <span className="currency">€</span>
                                </div>
                            </div>
                        </div>

                        {/* Filtre par description */}
                        <div className="filter-section">
                            <h4>💬 Description</h4>
                            <input
                                type="text"
                                placeholder="Rechercher dans les descriptions..."
                                value={filters.description}
                                onChange={(e) => updateFilter('description', e.target.value)}
                                className="description-filter-input"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="filter-actions">
                        <button onClick={handleClearAll} className="clear-filters-btn">
                            <RotateCcw size={16} />
                            Réinitialiser tous les filtres
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedSearch;