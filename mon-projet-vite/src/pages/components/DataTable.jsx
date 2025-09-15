import React, { useMemo, useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table';
import { ChevronUp, ChevronDown, Search, X } from 'lucide-react';
import './css/data-table.css';

const DataTable = ({ data, headers, title = "Tableau de données" }) => {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const columns = useMemo(
        () =>
            headers.map((header, index) => ({
                id: header,
                header: header.charAt(0).toUpperCase() + header.slice(1),
                accessorFn: (row) => row[index] || '',
                cell: ({ getValue }) => {
                    const value = getValue();
                    // Format spécial pour les montants (si ça ressemble à un nombre)
                    if (header.toLowerCase().includes('montant') && !isNaN(parseFloat(value))) {
                        return `${parseFloat(value).toFixed(2)} €`;
                    }
                    return value;
                },
                enableSorting: true,
                enableColumnFilter: true,
            })),
        [headers]
    );

    const table = useReactTable({
        data: data || [],
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

    const clearColumnFilter = (columnId) => {
        setColumnFilters(prev => prev.filter(filter => filter.id !== columnId));
    };

    const clearAllFilters = () => {
        setColumnFilters([]);
        setGlobalFilter('');
    };

    const activeFiltersCount = columnFilters.length + (globalFilter ? 1 : 0);

    if (!data || data.length === 0) {
        return (
            <div className="data-table-empty">
                <div className="empty-state">
                    <Search size={48} />
                    <h3>Aucune donnée à afficher</h3>
                    <p>Les données apparaîtront ici une fois chargées</p>
                </div>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <div className="data-table-header">
                <div className="table-title">
                    <h3>{title}</h3>
                    <div className="table-stats">
                        {table.getPreFilteredRowModel().rows.length} entrées
                        {table.getFilteredRowModel().rows.length !== table.getPreFilteredRowModel().rows.length &&
                            ` • ${table.getFilteredRowModel().rows.length} filtrées`
                        }
                    </div>
                </div>

                <div className="table-controls">
                    {/* Recherche globale */}
                    <div className="global-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher dans toutes les colonnes..."
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="search-input"
                        />
                        {globalFilter && (
                            <button
                                onClick={() => setGlobalFilter('')}
                                className="clear-search-btn"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Clear filters */}
                    {activeFiltersCount > 0 && (
                        <button
                            onClick={clearAllFilters}
                            className="clear-filters-btn"
                        >
                            Effacer les filtres ({activeFiltersCount})
                        </button>
                    )}
                </div>
            </div>

            {/* Filtres par colonne */}
            <div className="column-filters">
                {table.getHeaderGroups().map(headerGroup => (
                    <div key={headerGroup.id} className="filters-row">
                        {headerGroup.headers.map(header => {
                            const columnFilter = columnFilters.find(f => f.id === header.id);
                            return (
                                <div key={header.id} className="column-filter">
                                    <label className="filter-label">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </label>
                                    <div className="filter-input-group">
                                        <input
                                            type="text"
                                            placeholder={`Filtrer ${header.column.columnDef.header}...`}
                                            value={columnFilter?.value || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value) {
                                                    setColumnFilters(prev => [
                                                        ...prev.filter(f => f.id !== header.id),
                                                        { id: header.id, value }
                                                    ]);
                                                } else {
                                                    clearColumnFilter(header.id);
                                                }
                                            }}
                                            className="column-filter-input"
                                        />
                                        {columnFilter && (
                                            <button
                                                onClick={() => clearColumnFilter(header.id)}
                                                className="clear-column-filter"
                                            >
                                                <X size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Tableau */}
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        <button
                                            onClick={header.column.getToggleSortingHandler()}
                                            className={`sort-header ${header.column.getCanSort() ? 'sortable' : ''}`}
                                            disabled={!header.column.getCanSort()}
                                        >
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                            <div className="sort-icons">
                                                {header.column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
                                                {header.column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
                                                {!header.column.getIsSorted() && header.column.getCanSort() && (
                                                    <div className="sort-placeholder">
                                                        <ChevronUp size={12} opacity={0.3} />
                                                        <ChevronDown size={12} opacity={0.3} />
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
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

            {/* Pagination */}
            <div className="table-pagination">
                <div className="pagination-info">
                    Page {table.getState().pagination.pageIndex + 1} sur {table.getPageCount()}
                    ({table.getFilteredRowModel().rows.length} résultats)
                </div>

                <div className="pagination-controls">
                    <button
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        className="pagination-btn"
                    >
                        ««
                    </button>
                    <button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="pagination-btn"
                    >
                        ‹
                    </button>
                    <button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="pagination-btn"
                    >
                        ›
                    </button>
                    <button
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        className="pagination-btn"
                    >
                        »»
                    </button>
                </div>

                <div className="page-size-selector">
                    <label>
                        Afficher:
                        <select
                            value={table.getState().pagination.pageSize}
                            onChange={e => table.setPageSize(Number(e.target.value))}
                            className="page-size-select"
                        >
                            {[5, 10, 20, 50, 100].map(pageSize => (
                                <option key={pageSize} value={pageSize}>
                                    {pageSize}
                                </option>
                            ))}
                        </select>
                        entrées
                    </label>
                </div>
            </div>
        </div>
    );
};

export default DataTable;