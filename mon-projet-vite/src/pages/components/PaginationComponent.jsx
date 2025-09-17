// PaginationComponent.jsx - Composant de pagination réutilisable
import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import './css/pagination.css';

const PaginationComponent = ({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    onPageChange,
    onPageSizeChange,
    onGoToFirst,
    onGoToLast,
    onNext,
    onPrevious,
    pageSizeOptions = [10, 20, 50, 100],
    showPageSizeSelector = true,
    showFirstLast = true,
    showInfo = true,
    maxVisiblePages = 5,
    size = 'medium', // 'small', 'medium', 'large'
    className = ''
}) => {
    // Générer les numéros de pages visibles
    const generatePageNumbers = () => {
        const pages = [];
        const half = Math.floor(maxVisiblePages / 2);
        let start = Math.max(1, currentPage - half);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        // Ajuster le début si on est proche de la fin
        if (end - start + 1 < maxVisiblePages) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();

    if (totalPages <= 1) {
        return null; // Ne pas afficher la pagination s'il n'y a qu'une page
    }

    return (
        <div className={`pagination-component ${size} ${className}`}>
            {/* Informations sur la pagination */}
            {showInfo && (
                <div className="pagination-info">
                    <span className="pagination-text">
                        Affichage de <strong>{startIndex}</strong> à <strong>{endIndex}</strong> sur{' '}
                        <strong>{totalItems}</strong> résultat{totalItems > 1 ? 's' : ''}
                    </span>
                </div>
            )}

            {/* Contrôles de navigation */}
            <div className="pagination-controls">
                {/* Première page */}
                {showFirstLast && (
                    <button
                        onClick={onGoToFirst}
                        disabled={!hasPreviousPage}
                        className="pagination-btn first"
                        title="Première page"
                        aria-label="Aller à la première page"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                )}

                {/* Page précédente */}
                <button
                    onClick={onPrevious}
                    disabled={!hasPreviousPage}
                    className="pagination-btn prev"
                    title="Page précédente"
                    aria-label="Aller à la page précédente"
                >
                    <ChevronLeft size={16} />
                    <span className="btn-text">Précédent</span>
                </button>

                {/* Numéros de pages */}
                <div className="page-numbers">
                    {/* Ellipsis au début */}
                    {pageNumbers[0] > 1 && (
                        <>
                            <button
                                onClick={() => onPageChange(1)}
                                className="pagination-btn page-btn"
                                aria-label="Aller à la page 1"
                            >
                                1
                            </button>
                            {pageNumbers[0] > 2 && (
                                <span className="pagination-ellipsis">…</span>
                            )}
                        </>
                    )}

                    {/* Pages visibles */}
                    {pageNumbers.map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => onPageChange(pageNum)}
                            className={`pagination-btn page-btn ${
                                currentPage === pageNum ? 'active' : ''
                            }`}
                            aria-label={`Aller à la page ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                            {pageNum}
                        </button>
                    ))}

                    {/* Ellipsis à la fin */}
                    {pageNumbers[pageNumbers.length - 1] < totalPages && (
                        <>
                            {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                                <span className="pagination-ellipsis">…</span>
                            )}
                            <button
                                onClick={() => onPageChange(totalPages)}
                                className="pagination-btn page-btn"
                                aria-label={`Aller à la page ${totalPages}`}
                            >
                                {totalPages}
                            </button>
                        </>
                    )}
                </div>

                {/* Page suivante */}
                <button
                    onClick={onNext}
                    disabled={!hasNextPage}
                    className="pagination-btn next"
                    title="Page suivante"
                    aria-label="Aller à la page suivante"
                >
                    <span className="btn-text">Suivant</span>
                    <ChevronRight size={16} />
                </button>

                {/* Dernière page */}
                {showFirstLast && (
                    <button
                        onClick={onGoToLast}
                        disabled={!hasNextPage}
                        className="pagination-btn last"
                        title="Dernière page"
                        aria-label="Aller à la dernière page"
                    >
                        <ChevronsRight size={16} />
                    </button>
                )}
            </div>

            {/* Sélecteur de taille de page */}
            {showPageSizeSelector && (
                <div className="page-size-selector">
                    <label htmlFor="pageSize" className="page-size-label">
                        Afficher :
                    </label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="page-size-select"
                        aria-label="Nombre d'éléments par page"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>
                                {size} par page
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Navigation directe par numéro de page */}
            <div className="page-jump">
                <label htmlFor="pageJump" className="page-jump-label">
                    Aller à la page :
                </label>
                <input
                    id="pageJump"
                    type="number"
                    min="1"
                    max={totalPages}
                    placeholder={currentPage.toString()}
                    className="page-jump-input"
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            const page = parseInt(e.target.value);
                            if (page >= 1 && page <= totalPages) {
                                onPageChange(page);
                                e.target.value = '';
                            }
                        }
                    }}
                    aria-label="Saisir le numéro de page"
                />
            </div>
        </div>
    );
};

// Composant simplifié pour les cas basiques
export const SimplePagination = ({
    currentPage,
    totalPages,
    onPageChange,
    hasNextPage,
    hasPreviousPage
}) => (
    <div className="pagination-component simple">
        <div className="pagination-controls">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPreviousPage}
                className="pagination-btn prev"
            >
                <ChevronLeft size={16} />
                Précédent
            </button>

            <span className="page-info">
                Page {currentPage} sur {totalPages}
            </span>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage}
                className="pagination-btn next"
            >
                Suivant
                <ChevronRight size={16} />
            </button>
        </div>
    </div>
);

export default PaginationComponent;