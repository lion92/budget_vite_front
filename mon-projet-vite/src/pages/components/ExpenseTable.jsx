import React, { useMemo, useState, useEffect } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { Edit3, Check, X, Download, FileText, Trash2, DollarSign, Calendar } from 'lucide-react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import useBudgetStore from '../../useBudgetStore.js';
import lien from './lien';
import './css/expense-table.css';

const ExpenseTable = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        montant: "",
        description: "",
        categorie: "",
        dateTransaction: "",
    });

    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 20,
    });

    // Filtres de date
    const [dateRange, setDateRange] = useState({
        startDate: null,
        endDate: null,
    });

    const updateDepense = useBudgetStore((state) => state.updateDepense);
    const deleteDepense = useBudgetStore((state) => state.deleteDepense);
    const categories = useBudgetStore((state) => state.categories);
    const fetchCategories = useBudgetStore((state) => state.fetchCategories);

    // Récupération des dépenses
    const fetchExpenses = async () => {
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
    };

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
    }, []);

    // Formatage des montants
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
        }).format(Number(amount));
    };

    // Formatage des dates
    const formatDate = (dateString) => {
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(new Date(dateString));
    };

    // Gestion de l'édition
    const handleEdit = (expense) => {
        const foundCategory = categories.find(c => c.categorie === expense.categorie);
        setEditData({
            montant: expense.montant,
            description: expense.description,
            categorie: foundCategory?.id || "",
            dateTransaction: expense.dateTransaction.split("T")[0],
        });
        setEditingId(expense.id);
    };

    const handleEditSubmit = async (id) => {
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
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditData({
            montant: "",
            description: "",
            categorie: "",
            dateTransaction: "",
        });
    };

    const handleDelete = async (id, description) => {
        if (window.confirm(`Supprimer la dépense "${description}" ?`)) {
            await deleteDepense(id, (msg, type) => console.log(msg, type));
            await fetchExpenses();
        }
    };

    // Export Excel
    const exportExcel = () => {
        if (table.getFilteredRowModel().rows.length === 0) {
            alert("Aucune dépense à exporter.");
            return;
        }

        const filteredData = table.getFilteredRowModel().rows.map(row => {
            const expense = row.original;
            return {
                ID: expense.id,
                Montant: Number(expense.montant).toFixed(2),
                Description: expense.description,
                Catégorie: expense.categorie,
                Date: formatDate(expense.dateTransaction),
            };
        });

        const wb = XLSX.utils.book_new();
        const wsAll = XLSX.utils.json_to_sheet(filteredData);
        XLSX.utils.book_append_sheet(wb, wsAll, "Toutes les dépenses");

        // Onglets par catégorie
        const uniqueCategories = [...new Set(filteredData.map(item => item.Catégorie))];
        uniqueCategories.forEach((cat) => {
            const rows = filteredData.filter((row) => row.Catégorie === cat);
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, cat.substring(0, 31));
        });

        XLSX.writeFile(wb, "depenses_filtrées.xlsx");
    };

    // Export PDF
    const exportPDF = () => {
        if (table.getFilteredRowModel().rows.length === 0) {
            alert("Aucune dépense à exporter.");
            return;
        }

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Dépenses filtrées", 14, 22);

        const tableData = table.getFilteredRowModel().rows.map(row => {
            const expense = row.original;
            return [
                expense.id,
                formatCurrency(expense.montant),
                expense.description,
                expense.categorie,
                formatDate(expense.dateTransaction),
            ];
        });

        doc.autoTable({
            head: [["ID", "Montant", "Description", "Catégorie", "Date"]],
            body: tableData,
            startY: 30,
        });

        doc.save("depenses_filtrées.pdf");
    };

    // Configuration des colonnes
    const columns = useMemo(() => [
        {
            id: 'id',
            header: 'ID',
            accessorKey: 'id',
            size: 80,
            cell: ({ getValue }) => (
                <div className="expense-id">
                    #{getValue()}
                </div>
            ),
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            id: 'montant',
            header: 'Montant',
            accessorKey: 'montant',
            size: 120,
            cell: ({ getValue, row }) => {
                const expense = row.original;
                return editingId === expense.id ? (
                    <input
                        type="number"
                        step="0.01"
                        value={editData.montant}
                        onChange={(e) => setEditData({ ...editData, montant: e.target.value })}
                        className="edit-input amount-input"
                    />
                ) : (
                    <div className="amount-cell">
                        <DollarSign size={14} />
                        {formatCurrency(getValue())}
                    </div>
                );
            },
            enableSorting: true,
            enableColumnFilter: false,
        },
        {
            id: 'description',
            header: 'Description',
            accessorKey: 'description',
            size: 250,
            cell: ({ getValue, row }) => {
                const expense = row.original;
                return editingId === expense.id ? (
                    <input
                        type="text"
                        value={editData.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="edit-input"
                        placeholder="Description"
                    />
                ) : (
                    <div className="description-cell" title={getValue()} style={{ color: '#7C3AED', fontWeight: '600' }}>
                        {getValue()}
                    </div>
                );
            },
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            id: 'categorie',
            header: 'Catégorie',
            accessorKey: 'categorie',
            size: 150,
            cell: ({ getValue, row }) => {
                const expense = row.original;
                return editingId === expense.id ? (
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
                    <div className="category-cell">
                        <span className="category-icon">
                            <i className={expense.iconName}></i>
                        </span>
                        {getValue()}
                    </div>
                );
            },
            enableSorting: true,
            enableColumnFilter: true,
        },
        {
            id: 'dateTransaction',
            header: 'Date',
            accessorKey: 'dateTransaction',
            size: 130,
            cell: ({ getValue, row }) => {
                const expense = row.original;
                return editingId === expense.id ? (
                    <input
                        type="date"
                        value={editData.dateTransaction}
                        onChange={(e) => setEditData({ ...editData, dateTransaction: e.target.value })}
                        className="edit-input"
                    />
                ) : (
                    <div className="date-cell">
                        📅 {formatDate(getValue())}
                    </div>
                );
            },
            enableSorting: true,
            enableColumnFilter: true,
            filterFn: (row, columnId, filterValue) => {
                const rowDate = new Date(row.getValue(columnId));

                // Si on utilise la recherche par texte
                if (typeof filterValue === 'string') {
                    const formattedDate = formatDate(row.getValue(columnId)).toLowerCase();
                    return formattedDate.includes(filterValue.toLowerCase());
                }

                return true;
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            size: 180,
            cell: ({ row }) => {
                const expense = row.original;
                return (
                    <div className="actions-cell">
                        {editingId === expense.id ? (
                            <div className="edit-actions-group">
                                <button
                                    onClick={() => handleEditSubmit(expense.id)}
                                    className="action-btn save-btn modern-btn icon-only"
                                    title="Sauvegarder les modifications"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={handleEditCancel}
                                    className="action-btn cancel-btn modern-btn icon-only"
                                    title="Annuler les modifications"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="default-actions-group">
                                <button
                                    onClick={() => handleEdit(expense)}
                                    className="action-btn edit-btn modern-btn icon-only"
                                    title="Modifier cette dépense"
                                >
                                    <Edit3 size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(expense.id, expense.description)}
                                    className="action-btn delete-btn modern-btn icon-only"
                                    title="Supprimer cette dépense"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                );
            },
            enableSorting: false,
            enableColumnFilter: false,
        },
    ], [editingId, editData, categories]);

    // Filtre par plage de dates
    const filteredExpenses = useMemo(() => {
        if (!dateRange.startDate && !dateRange.endDate) {
            return expenses;
        }

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.dateTransaction);

            if (dateRange.startDate && dateRange.endDate) {
                const start = new Date(dateRange.startDate);
                start.setHours(0, 0, 0, 0);
                const end = new Date(dateRange.endDate);
                end.setHours(23, 59, 59, 999);
                return expenseDate >= start && expenseDate <= end;
            }

            if (dateRange.startDate) {
                const start = new Date(dateRange.startDate);
                start.setHours(0, 0, 0, 0);
                return expenseDate >= start;
            }

            if (dateRange.endDate) {
                const end = new Date(dateRange.endDate);
                end.setHours(23, 59, 59, 999);
                return expenseDate <= end;
            }

            return true;
        });
    }, [expenses, dateRange]);

    const table = useReactTable({
        data: filteredExpenses,
        columns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: false,
    });

    // Calcul du total filtré
    const filteredTotal = useMemo(() => {
        return table.getFilteredRowModel().rows.reduce((sum, row) => {
            return sum + Number(row.original.montant);
        }, 0);
    }, [table.getFilteredRowModel().rows]);

    if (loading) {
        return (
            <div className="expense-table-loading">
                <div className="loading-spinner"></div>
                <p>Chargement des dépenses...</p>
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="expense-table-empty">
                <div className="empty-state">
                    <div className="empty-icon">💸</div>
                    <h3>Aucune dépense trouvée</h3>
                    <p>Commencez par ajouter quelques dépenses pour les voir ici.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="expense-table-container">
            <div className="expense-table-header">
                <div className="header-info">
                    <h1 className="table-title">💰 Toutes vos dépenses</h1>
                    <div className="table-stats">
                        <div className="stat-item">
                            <span className="stat-label">Total des dépenses :</span>
                            <span className="stat-value total">{formatCurrency(filteredTotal)}</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Nombre de dépenses :</span>
                            <span className="stat-value count">
                                {table.getFilteredRowModel().rows.length} / {expenses.length}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="export-buttons">
                    <button onClick={exportExcel} className="export-btn excel-btn">
                        <FileText size={16} />
                        Exporter Excel
                    </button>
                    <button onClick={exportPDF} className="export-btn pdf-btn">
                        <Download size={16} />
                        Exporter PDF
                    </button>
                </div>
            </div>

            {/* Filtres de date */}
            <div className="date-filter-container" style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    flexWrap: 'wrap'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar size={20} color="white" />
                        <span style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                            Filtrer par période :
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                                Date de début
                            </label>
                            <DatePicker
                                selected={dateRange.startDate}
                                onChange={(date) => setDateRange({ ...dateRange, startDate: date })}
                                selectsStart
                                startDate={dateRange.startDate}
                                endDate={dateRange.endDate}
                                placeholderText="Sélectionner..."
                                dateFormat="dd/MM/yyyy"
                                isClearable
                                className="date-picker-input"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    background: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <label style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
                                Date de fin
                            </label>
                            <DatePicker
                                selected={dateRange.endDate}
                                onChange={(date) => setDateRange({ ...dateRange, endDate: date })}
                                selectsEnd
                                startDate={dateRange.startDate}
                                endDate={dateRange.endDate}
                                minDate={dateRange.startDate}
                                placeholderText="Sélectionner..."
                                dateFormat="dd/MM/yyyy"
                                isClearable
                                className="date-picker-input"
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    background: 'white',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        {(dateRange.startDate || dateRange.endDate) && (
                            <button
                                onClick={() => setDateRange({ startDate: null, endDate: null })}
                                style={{
                                    padding: '8px 16px',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    marginTop: 'auto',
                                    transition: 'all 0.3s ease',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.3)';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.background = 'rgba(255,255,255,0.2)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                            >
                                ✕ Réinitialiser les dates
                            </button>
                        )}
                    </div>

                    {(dateRange.startDate || dateRange.endDate) && (
                        <div style={{
                            marginLeft: 'auto',
                            padding: '8px 16px',
                            background: 'rgba(255,255,255,0.15)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: '500',
                            backdropFilter: 'blur(10px)'
                        }}>
                            📊 {filteredExpenses.length} dépense{filteredExpenses.length !== 1 ? 's' : ''} dans la période
                        </div>
                    )}
                </div>
            </div>

            <div className="table-container">
                <table className="expense-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id} style={{ width: header.getSize() }}>
                                        <div className="header-content">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={`header-button ${header.column.getCanSort() ? 'sortable' : ''}`}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    <div className="sort-indicator">
                                                        {header.column.getIsSorted() === 'asc' && '↑'}
                                                        {header.column.getIsSorted() === 'desc' && '↓'}
                                                    </div>
                                                </div>
                                            )}
                                            {header.column.getCanFilter() && (
                                                <input
                                                    type="text"
                                                    value={header.column.getFilterValue() ?? ''}
                                                    onChange={(e) => header.column.setFilterValue(e.target.value)}
                                                    placeholder={`Filtrer ${header.column.columnDef.header}...`}
                                                    className="column-filter"
                                                />
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className={editingId === row.original.id ? 'editing' : ''}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Barre de recherche globale et pagination */}
            <div className="table-footer">
                <div className="global-search">
                    <input
                        type="text"
                        placeholder="Recherche globale..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="global-search-input"
                    />
                </div>

                <div className="pagination-controls">
                    <div className="pagination-info">
                        Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                    </div>

                    <div className="pagination-buttons">
                        <button
                            onClick={() => table.setPageIndex(0)}
                            disabled={!table.getCanPreviousPage()}
                        >
                            ««
                        </button>
                        <button
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            ‹
                        </button>
                        <button
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            ›
                        </button>
                        <button
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            »»
                        </button>
                    </div>

                    <div className="page-size-selector">
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                        >
                            {[10, 20, 50, 100].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize} par page
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTable;