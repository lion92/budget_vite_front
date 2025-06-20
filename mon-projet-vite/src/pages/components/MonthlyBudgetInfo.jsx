import React from "react";
import useBudgetStore from "../../useBudgetStore";

const MonthlyBudgetInfo = () => {
    const monthlySummary = useBudgetStore((state) => state.monthlySummary);

    return (
        <div style={{ padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
            <h2>💰 Dépenses Mensuelles</h2>
            <ul>
                {Object.entries(monthlySummary).map(([month, { total }]) => (
                    <li key={month} style={{ fontSize: "16px", fontWeight: "bold" }}>
                        {month} : {total.toFixed(2)} €
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MonthlyBudgetInfo;
