// useAdvancedSearch.js - Hook pour recherche et filtrage avancés
import { useState, useMemo, useCallback } from 'react';

const useAdvancedSearch = ({ data = [], searchFields = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({});
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Fonction de recherche globale
    const globalSearch = useCallback((items, term) => {
        if (!term.trim()) return items;

        const searchLower = term.toLowerCase();
        return items.filter(item => {
            return searchFields.some(field => {
                const value = getNestedValue(item, field);
                return String(value).toLowerCase().includes(searchLower);
            });
        });
    }, [searchFields]);

    // Fonction pour accéder aux propriétés imbriquées
    const getNestedValue = (obj, path) => {
        return path.split('.').reduce((current, key) => current?.[key], obj) ?? '';
    };

    // Fonction de filtrage par critères
    const applyFilters = useCallback((items, filterConfig) => {
        return items.filter(item => {
            return Object.entries(filterConfig).every(([key, filterValue]) => {
                if (!filterValue || filterValue === '' || filterValue === 'all') return true;

                const itemValue = getNestedValue(item, key);

                // Filtrage par plage de dates
                if (key.includes('date') && typeof filterValue === 'object') {
                    const itemDate = new Date(itemValue);
                    const { from, to } = filterValue;

                    if (from && itemDate < new Date(from)) return false;
                    if (to && itemDate > new Date(to)) return false;
                    return true;
                }

                // Filtrage par plage de montants
                if (key.includes('montant') && typeof filterValue === 'object') {
                    const itemAmount = parseFloat(itemValue) || 0;
                    const { min, max } = filterValue;

                    if (min !== undefined && itemAmount < min) return false;
                    if (max !== undefined && itemAmount > max) return false;
                    return true;
                }

                // Filtrage par array (catégories multiples)
                if (Array.isArray(filterValue)) {
                    return filterValue.length === 0 || filterValue.includes(itemValue);
                }

                // Filtrage par égalité exacte
                return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
            });
        });
    }, []);

    // Fonction de tri
    const applySorting = useCallback((items, config) => {
        if (!config.key) return items;

        return [...items].sort((a, b) => {
            const aValue = getNestedValue(a, config.key);
            const bValue = getNestedValue(b, config.key);

            // Tri numérique
            if (!isNaN(aValue) && !isNaN(bValue)) {
                const diff = parseFloat(aValue) - parseFloat(bValue);
                return config.direction === 'asc' ? diff : -diff;
            }

            // Tri par date
            if (config.key.includes('date')) {
                const dateA = new Date(aValue);
                const dateB = new Date(bValue);
                const diff = dateA - dateB;
                return config.direction === 'asc' ? diff : -diff;
            }

            // Tri alphabétique
            const stringA = String(aValue).toLowerCase();
            const stringB = String(bValue).toLowerCase();

            if (stringA < stringB) return config.direction === 'asc' ? -1 : 1;
            if (stringA > stringB) return config.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, []);

    // Données filtrées et triées
    const filteredData = useMemo(() => {
        let result = data;

        // 1. Recherche globale
        result = globalSearch(result, searchTerm);

        // 2. Filtres spécifiques
        result = applyFilters(result, filters);

        // 3. Tri
        result = applySorting(result, sortConfig);

        return result;
    }, [data, searchTerm, filters, sortConfig, globalSearch, applyFilters, applySorting]);

    // Actions
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const removeFilter = useCallback((key) => {
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
    }, []);

    const clearAllFilters = useCallback(() => {
        setFilters({});
        setSearchTerm('');
    }, []);

    const updateSort = useCallback((key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    }, []);

    const clearSort = useCallback(() => {
        setSortConfig({ key: null, direction: 'asc' });
    }, []);

    // Statistiques de recherche
    const searchStats = useMemo(() => {
        const originalCount = data.length;
        const filteredCount = filteredData.length;
        const isFiltered = searchTerm || Object.keys(filters).length > 0;

        return {
            originalCount,
            filteredCount,
            hiddenCount: originalCount - filteredCount,
            isFiltered,
            percentage: originalCount > 0 ? Math.round((filteredCount / originalCount) * 100) : 0
        };
    }, [data.length, filteredData.length, searchTerm, filters]);

    // Filtres actifs formatés pour l'affichage
    const activeFilters = useMemo(() => {
        const active = [];

        if (searchTerm) {
            active.push({
                key: 'search',
                label: 'Recherche',
                value: searchTerm,
                type: 'search'
            });
        }

        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'all') {
                let displayValue = value;
                let type = 'filter';

                if (typeof value === 'object') {
                    if (value.from || value.to) {
                        displayValue = `${value.from || 'début'} - ${value.to || 'fin'}`;
                        type = 'range';
                    } else if (value.min !== undefined || value.max !== undefined) {
                        displayValue = `${value.min || 0} - ${value.max || '∞'}`;
                        type = 'range';
                    }
                } else if (Array.isArray(value)) {
                    displayValue = value.join(', ');
                    type = 'multiple';
                }

                active.push({
                    key,
                    label: key.charAt(0).toUpperCase() + key.slice(1),
                    value: displayValue,
                    type
                });
            }
        });

        return active;
    }, [searchTerm, filters]);

    return {
        // Données
        filteredData,
        searchStats,
        activeFilters,

        // État
        searchTerm,
        filters,
        sortConfig,

        // Actions de recherche
        setSearchTerm,
        updateFilter,
        removeFilter,
        clearAllFilters,

        // Actions de tri
        updateSort,
        clearSort,

        // Utilitaires
        getNestedValue
    };
};

export default useAdvancedSearch;