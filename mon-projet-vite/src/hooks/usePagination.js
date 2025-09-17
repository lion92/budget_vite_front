// usePagination.js - Hook réutilisable pour la pagination
import { useState, useMemo, useCallback } from 'react';

const usePagination = ({
    data = [],
    initialPageSize = 20,
    initialPageIndex = 0
}) => {
    const [pageIndex, setPageIndex] = useState(initialPageIndex);
    const [pageSize, setPageSize] = useState(initialPageSize);

    // Calculs paginés
    const paginationData = useMemo(() => {
        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = pageIndex * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const paginatedItems = data.slice(startIndex, endIndex);

        return {
            items: paginatedItems,
            totalItems,
            totalPages,
            currentPage: pageIndex + 1,
            pageSize,
            startIndex: startIndex + 1,
            endIndex,
            hasNextPage: pageIndex < totalPages - 1,
            hasPreviousPage: pageIndex > 0,
            isFirstPage: pageIndex === 0,
            isLastPage: pageIndex === totalPages - 1
        };
    }, [data, pageIndex, pageSize]);

    // Actions de navigation
    const goToPage = useCallback((page) => {
        const targetPage = Math.max(0, Math.min(page - 1, paginationData.totalPages - 1));
        setPageIndex(targetPage);
    }, [paginationData.totalPages]);

    const nextPage = useCallback(() => {
        if (paginationData.hasNextPage) {
            setPageIndex(prev => prev + 1);
        }
    }, [paginationData.hasNextPage]);

    const previousPage = useCallback(() => {
        if (paginationData.hasPreviousPage) {
            setPageIndex(prev => prev - 1);
        }
    }, [paginationData.hasPreviousPage]);

    const goToFirstPage = useCallback(() => {
        setPageIndex(0);
    }, []);

    const goToLastPage = useCallback(() => {
        setPageIndex(paginationData.totalPages - 1);
    }, [paginationData.totalPages]);

    const changePageSize = useCallback((newSize) => {
        const currentItem = pageIndex * pageSize + 1;
        const newPageIndex = Math.floor((currentItem - 1) / newSize);

        setPageSize(newSize);
        setPageIndex(Math.max(0, newPageIndex));
    }, [pageIndex, pageSize]);

    // Reset pagination when data changes significantly
    const resetPagination = useCallback(() => {
        setPageIndex(0);
    }, []);

    return {
        // Data
        ...paginationData,

        // State
        pageIndex,

        // Actions
        goToPage,
        nextPage,
        previousPage,
        goToFirstPage,
        goToLastPage,
        changePageSize,
        resetPagination,

        // Setters (for external control)
        setPageIndex,
        setPageSize
    };
};

export default usePagination;