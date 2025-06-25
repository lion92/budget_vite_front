// AllSpend.jsx avec Zustand
import React, {useEffect, useRef, useState} from "react";
import {Bar} from "react-chartjs-2";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import MonthlyExpensesByCategory from './MonthlyExpensesByCategoryIntegration.jsx';
import useBudgetStore from "../../useBudgetStore";

const AllSpend = () => {
    const pdfRef = useRef();
    const [budget, setBudget] = useState(0);
    const [budgetUsed, setBudgetUsed] = useState(0);
    const [budgetRemaining, setBudgetRemaining] = useState(0);

    const {
        depenses,
        monthlySummary,
        categoryColors,
        fetchDepenses,
        generateMonthlySummary,
        assignCategoryColors
    } = useBudgetStore();

    useEffect(() => {
        const init = async () => {
            await fetchDepenses();
            generateMonthlySummary();
            assignCategoryColors();
        };
        init();
    }, [fetchDepenses, generateMonthlySummary, assignCategoryColors]);

    useEffect(() => {
        const total = depenses.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);
        setBudgetUsed(total);
        setBudgetRemaining(budget - total);
    }, [depenses, budget]);


    const chartData = {
        labels: Object.keys(monthlySummary),
        datasets: [
            {
                label: "Dépenses par Mois",
                data: Object.values(monthlySummary).map((m) => m.total),
                backgroundColor: "blue",
                borderWidth: 1,
            },
        ],
    };


    return (
        <>
            <h1 style={{fontSize: 20, color: "blueviolet", textAlign: "center"}}>
                Toutes vos dépenses
            </h1>
            <div ref={pdfRef} style={{padding: "10px"}}>
                <h2 style={{color: "black"}}>Bilan Mensuel</h2>
                <div className="container">
                    {Object.entries(monthlySummary || {}).map(([month, {total, categories}]) => (
                        <div key={month} style={{marginBottom: "20px", padding: "10px", border: "1px solid black"}}>
                            <h3 style={{color: "black"}}>
                                {month} - Dépense Totale: {total.toFixed(2)} €
                            </h3>
                            <ul>
                                {Object.entries(categories || {}).map(([category, amount]) => (
                                    <li key={category} style={{color: categoryColors[category] || "black"}}>
                                        {category}: {amount.toFixed(2)} €
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{width: "80%", margin: "auto"}}>
                    <h2>Graphique des Dépenses</h2>
                    <Bar data={chartData}/>
                </div>

                <MonthlyExpensesByCategory
                    monthlySummary={monthlySummary}
                    categoryColors={categoryColors}
                />
            </div>
        </>
    );
};

export default AllSpend;
