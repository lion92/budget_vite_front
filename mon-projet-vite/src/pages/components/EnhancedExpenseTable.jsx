// EnhancedExpenseTable.jsx - Tableau des dépenses avec pagination et recherche avancée
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Edit3, Check, X, Download, FileText, Trash2, DollarSign, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useBudgetStore from '../../useBudgetStore.js';
import useAdvancedSearch from '../../hooks/useAdvancedSearch.js';
import usePagination from '../../hooks/usePagination.js';
import AdvancedSearch from './AdvancedSearch.jsx';
import lien from './lien';
import './css/enhanced-expense-table.css';

const EnhancedExpenseTable = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('table'); // 'table' ou 'cards'
    const [selectedExpenses, setSelectedExpenses] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [editData, setEditData] = useState({
        montant: "",
        description: "",
        categorie: "",
        dateTransaction: "",
    });

    // Store Zustand
    const updateDepense = useBudgetStore((state) => state.updateDepense);
    const deleteDepense = useBudgetStore((state) => state.deleteDepense);
    const categories = useBudgetStore((state) => state.categories);
    const fetchCategories = useBudgetStore((state) => state.fetchCategories);

    // Enrichissement des données avec les informations de catégorie
    const enrichedExpenses = useMemo(() => {
        return expenses.map(expense => {
            const category = categories.find(c => c.id === expense.categorie || c.categorie === expense.categorie);
            return {
                ...expense,
                categoryName: category?.categorie || expense.categorie,
                categoryColor: category?.color || '#667eea'
            };
        });
    }, [expenses, categories]);

    // Configuration de la recherche
    const searchFields = useMemo(() => ['description', 'categorie', 'montant'], []);
    const {
        filteredData,
        searchStats,
        activeFilters,
        setSearchTerm,
        updateFilter,
        clearAllFilters
    } = useAdvancedSearch({
        data: enrichedExpenses,
        searchFields
    });

    // Configuration de la pagination
    const {
        items: paginatedExpenses,
        totalPages,
        currentPage,
        pageSize,
        totalItems,
        startIndex,
        endIndex,
        hasNextPage,
        hasPreviousPage,
        nextPage,
        previousPage,
        goToPage,
        changePageSize
    } = usePagination({
        data: filteredData,
        initialPageSize: 20
    });

    // Récupération des dépenses
    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        const idUser = parseInt(localStorage.getItem("utilisateur"));
        if (isNaN(idUser)) {
            console.error("ID utilisateur invalide");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${lien.url}action/byuser/${idUser}`);
            const data = await response.json();
            setExpenses(data);
        } catch (err) {
            console.error("Erreur récupération dépenses :", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            await fetchCategories();
            await fetchExpenses();
        };
        init();
    }, []);

    // Fonction de filtrage personnalisée
    const handleAdvancedFilter = useCallback((filters) => {
        const processedFilters = {};

        // Traitement des catégories
        if (filters.categories && filters.categories.length > 0) {
            processedFilters.categorie = filters.categories;
        }

        // Traitement des dates
        if (filters.dateRange && (filters.dateRange.from || filters.dateRange.to)) {
            processedFilters.dateTransaction = filters.dateRange;
        }

        // Traitement des montants
        if (filters.amountRange && (filters.amountRange.min !== '' || filters.amountRange.max !== '')) {
            processedFilters.montant = {
                min: filters.amountRange.min !== '' ? parseFloat(filters.amountRange.min) : undefined,
                max: filters.amountRange.max !== '' ? parseFloat(filters.amountRange.max) : undefined
            };
        }

        // Traitement de la description
        if (filters.description) {
            processedFilters.description = filters.description;
        }

        // Appliquer tous les filtres
        Object.entries(processedFilters).forEach(([key, value]) => {
            updateFilter(key, value);
        });
    }, [updateFilter]);

    // Formatage des montants et dates
    const formatCurrency = useCallback((amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
        }).format(Number(amount));
    }, []);

    const formatDate = useCallback((dateString) => {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    }, []);

    // Gestion de l'édition
    const handleEdit = useCallback((expense) => {
        const foundCategory = categories.find(c => c.categorie === expense.categorie);
        setEditData({
            montant: expense.montant,
            description: expense.description,
            categorie: foundCategory?.id || "",
            dateTransaction: expense.dateTransaction.split("T")[0],
        });
        setEditingId(expense.id);
    }, [categories]);

    const handleEditSubmit = useCallback(async (id) => {
        const date = new Date(editData.dateTransaction);
        await updateDepense(
            {
                id,
                montant: editData.montant,
                description: editData.description,
                categorie: parseInt(editData.categorie),
                date,
            },
            (msg, type) => console.log(msg, type)
        );
        setEditingId(null);
        await fetchExpenses();
    }, [editData, updateDepense, fetchExpenses]);

    const handleEditCancel = useCallback(() => {
        setEditingId(null);
        setEditData({
            montant: "",
            description: "",
            categorie: "",
            dateTransaction: "",
        });
    }, []);

    const handleDelete = useCallback(async (id) => {
        await deleteDepense(id, (msg, type) => console.log(msg, type));
        await fetchExpenses();
        setShowDeleteConfirm(null);
    }, [deleteDepense, fetchExpenses]);

    // Sélection multiple
    const toggleSelectExpense = useCallback((id) => {
        setSelectedExpenses(prev =>
            prev.includes(id)
                ? prev.filter(expId => expId !== id)
                : [...prev, id]
        );
    }, []);

    const selectAllExpenses = useCallback(() => {
        setSelectedExpenses(paginatedExpenses.map(exp => exp.id));
    }, [paginatedExpenses]);

    const clearSelection = useCallback(() => {
        setSelectedExpenses([]);
    }, []);

    // Export
    const exportData = useCallback((format) => {
        const dataToExport = filteredData.length > 0 ? filteredData : expenses;

        if (format === 'excel') {
            const exportData = dataToExport.map(expense => ({
                ID: expense.id,
                Montant: Number(expense.montant).toFixed(2),
                Description: expense.description,
                Catégorie: expense.categoryName,
                Date: formatDate(expense.dateTransaction),
            }));

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(exportData);
            XLSX.utils.book_append_sheet(wb, ws, "Dépenses");
            XLSX.writeFile(wb, `depenses_${new Date().toISOString().split('T')[0]}.xlsx`);
        } else if (format === 'pdf') {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text("Rapport des Dépenses", 14, 22);

            const tableData = dataToExport.map(expense => [
                expense.id,
                formatCurrency(expense.montant),
                expense.description,
                expense.categoryName,
                formatDate(expense.dateTransaction),
            ]);

            doc.autoTable({
                head: [["ID", "Montant", "Description", "Catégorie", "Date"]],
                body: tableData,
                startY: 30,
            });

            doc.save(`depenses_${new Date().toISOString().split('T')[0]}.pdf`);
        }
    }, [filteredData, expenses, formatCurrency, formatDate]);

    // Calcul du total
    const totalAmount = useMemo(() => {
        return filteredData.reduce((sum, expense) => sum + Number(expense.montant), 0);
    }, [filteredData]);

    if (loading) {
        return (
            <div className="enhanced-expense-loading">
                <div className="loading-spinner"></div>
                <p>Chargement des dépenses...</p>
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="enhanced-expense-empty">
                <div className="empty-state">
                    <div className="empty-icon">💸</div>
                    <h3>Aucune dépense trouvée</h3>
                    <p>Commencez par ajouter quelques dépenses pour les voir ici.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="enhanced-expense-table">
            {/* Header avec statistiques */}
            <div className="expense-header">
                <div className="header-info">
                    <h1 className="table-title">💰 Gestion des Dépenses</h1>
                    <div className="expense-stats">
                        <div className="stat-card">
                            <div className="stat-label">Total affiché</div>
                            <div className="stat-value total">{formatCurrency(totalAmount)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Dépenses</div>
                            <div className="stat-value count">
                                {filteredData.length} / {expenses.length}
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Moyenne</div>
                            <div className="stat-value avg">
                                {filteredData.length > 0 ? formatCurrency(totalAmount / filteredData.length) : '0 €'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="header-actions">
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            Tableau
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                            onClick={() => setViewMode('cards')}
                        >
                            Cartes
                        </button>
                    </div>

                    <div className="export-actions">
                        <button onClick={() => exportData('excel')} className="export-btn excel">
                            <FileText size={16} />
                            Excel
                        </button>
                        <button onClick={() => exportData('pdf')} className="export-btn pdf">
                            <Download size={16} />
                            PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Recherche avancée */}
            <AdvancedSearch
                onSearch={setSearchTerm}
                onFilter={handleAdvancedFilter}
                categories={categories}
                searchStats={searchStats}
                activeFilters={activeFilters}
                onClearFilters={clearAllFilters}
            />

            {/* Sélection multiple */}
            {selectedExpenses.length > 0 && (
                <div className="selection-bar">
                    <div className="selection-info">
                        <span>{selectedExpenses.length} dépense(s) sélectionnée(s)</span>
                    </div>
                    <div className="selection-actions">
                        <button onClick={() => {/* Bulk edit */}} className="bulk-btn edit">
                            Modifier
                        </button>
                        <button onClick={() => {/* Bulk delete */}} className="bulk-btn delete">
                            Supprimer
                        </button>
                        <button onClick={clearSelection} className="bulk-btn clear">
                            Désélectionner
                        </button>
                    </div>
                </div>
            )}

            {/* Contenu principal */}
            <div className="expense-content">
                {viewMode === 'table' ? (
                    <div className="table-view">
                        <div className="table-container">
                            <table className="expense-table">
                                <thead>
                                    <tr>
                                        <th className="select-col">
                                            <input
                                                type="checkbox"
                                                checked={selectedExpenses.length === paginatedExpenses.length && paginatedExpenses.length > 0}
                                                onChange={selectedExpenses.length === paginatedExpenses.length ? clearSelection : selectAllExpenses}
                                            />
                                        </th>
                                        <th>ID</th>
                                        <th>Montant</th>
                                        <th>Description</th>
                                        <th>Catégorie</th>
                                        <th>Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedExpenses.map(expense => (
                                        <tr
                                            key={expense.id}
                                            className={`
                                                ${editingId === expense.id ? 'editing' : ''}
                                                ${selectedExpenses.includes(expense.id) ? 'selected' : ''}
                                            `}
                                        >
                                            <td className="select-col">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedExpenses.includes(expense.id)}
                                                    onChange={() => toggleSelectExpense(expense.id)}
                                                />
                                            </td>
                                            <td className="id-col">#{expense.id}</td>
                                            <td className="amount-col">
                                                {editingId === expense.id ? (
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={editData.montant}
                                                        onChange={(e) => setEditData({ ...editData, montant: e.target.value })}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span className="amount">{formatCurrency(expense.montant)}</span>
                                                )}
                                            </td>
                                            <td className="description-col">
                                                {editingId === expense.id ? (
                                                    <input
                                                        type="text"
                                                        value={editData.description}
                                                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span className="description" title={expense.description} style={{ color: '#7C3AED', fontWeight: '600' }}>
                                                        {expense.description}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="category-col">
                                                {editingId === expense.id ? (
                                                    <select
                                                        value={editData.categorie}
                                                        onChange={(e) => setEditData({ ...editData, categorie: e.target.value })}
                                                        className="edit-select"
                                                    >
                                                        <option value="">-- Choisir --</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.categorie}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span
                                                        className="category-badge"
                                                        style={{
                                                            backgroundColor: expense.categoryColor + '20',
                                                            color: expense.categoryColor,
                                                            borderColor: expense.categoryColor
                                                        }}
                                                    >
                                                        {expense.categoryName}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="date-col">
                                                {editingId === expense.id ? (
                                                    <input
                                                        type="date"
                                                        value={editData.dateTransaction}
                                                        onChange={(e) => setEditData({ ...editData, dateTransaction: e.target.value })}
                                                        className="edit-input"
                                                    />
                                                ) : (
                                                    <span className="date">{formatDate(expense.dateTransaction)}</span>
                                                )}
                                            </td>
                                            <td className="actions-col">
                                                {editingId === expense.id ? (
                                                    <div className="edit-actions">
                                                        <button
                                                            onClick={() => handleEditSubmit(expense.id)}
                                                            className="action-btn save"
                                                            title="Sauvegarder"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={handleEditCancel}
                                                            className="action-btn cancel"
                                                            title="Annuler"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="default-actions">
                                                        <button
                                                            onClick={() => handleEdit(expense)}
                                                            className="action-btn edit"
                                                            title="Modifier"
                                                        >
                                                            <Edit3 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => setShowDeleteConfirm(expense.id)}
                                                            className="action-btn delete"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="cards-view">
                        <div className="cards-grid">
                            {paginatedExpenses.map(expense => (
                                <div key={expense.id} className="expense-card">
                                    <div className="card-header">
                                        <div className="card-id">#{expense.id}</div>
                                        <div className="card-amount">{formatCurrency(expense.montant)}</div>
                                    </div>
                                    <div className="card-body">
                                        <div className="card-description" style={{ color: '#7C3AED', fontWeight: '600' }}>{expense.description}</div>
                                        <div className="card-category">
                                            <span
                                                className="category-badge"
                                                style={{
                                                    backgroundColor: expense.categoryColor + '20',
                                                    color: expense.categoryColor
                                                }}
                                            >
                                                {expense.categoryName}
                                            </span>
                                        </div>
                                        <div className="card-date">{formatDate(expense.dateTransaction)}</div>
                                    </div>
                                    <div className="card-actions">
                                        <button
                                            onClick={() => handleEdit(expense)}
                                            className="card-btn edit"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button
                                            onClick={() => setShowDeleteConfirm(expense.id)}
                                            className="card-btn delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="pagination-container">
                <div className="pagination-info">
                    Affichage de {startIndex} à {endIndex} sur {totalItems} résultats
                </div>

                <div className="pagination-controls">
                    <button
                        onClick={previousPage}
                        disabled={!hasPreviousPage}
                        className="pagination-btn"
                    >
                        <ChevronLeft size={16} />
                        Précédent
                    </button>

                    <div className="page-numbers">
                        {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                            const pageNum = Math.max(1, currentPage - 2) + index;
                            if (pageNum > totalPages) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => goToPage(pageNum)}
                                    className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={nextPage}
                        disabled={!hasNextPage}
                        className="pagination-btn"
                    >
                        Suivant
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="page-size-selector">
                    <label>Afficher :</label>
                    <select value={pageSize} onChange={e => changePageSize(Number(e.target.value))}>
                        {[10, 20, 50, 100].map(size => (
                            <option key={size} value={size}>{size} par page</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteConfirm && (
                <div className="modal-overlay">
                    <div className="delete-confirm-modal">
                        <h3>Confirmer la suppression</h3>
                        <p>Êtes-vous sûr de vouloir supprimer cette dépense ?</p>
                        <div className="modal-actions">
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="confirm-btn delete"
                            >
                                Supprimer
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="confirm-btn cancel"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedExpenseTable;