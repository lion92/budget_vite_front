import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EnhancedExpenseTable from "./EnhancedExpenseTable";

const AllSpendFilters = () => {
    const [searchParams] = useSearchParams();
    const [initialMonthFilter, setInitialMonthFilter] = useState(null);

    useEffect(() => {
        const monthParam = searchParams.get('month');
        if (monthParam) {
            const decodedMonth = decodeURIComponent(monthParam);
            setInitialMonthFilter(decodedMonth);
        }
    }, [searchParams]);

    return <EnhancedExpenseTable initialMonthFilter={initialMonthFilter} />;
};

export default AllSpendFilters;
