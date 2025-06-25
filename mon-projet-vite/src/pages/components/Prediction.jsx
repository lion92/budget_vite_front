import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import lien from "./lien";
import "jspdf-autotable";

const Prediction = () => {
    const [listDesDepense, setListDesDepense] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState({});
    const [categoryColors, setCategoryColors] = useState({});
    const [budget, setBudget] = useState(0);
    const [budgetUsed, setBudgetUsed] = useState(0);
    const [budgetRemaining, setBudgetRemaining] = useState(0);
    const [predictedExpense, setPredictedExpense] = useState(null);
    const pdfRef = useRef();

    useEffect(() => {
        const fetchAPI = async () => {
            const idUser = parseInt(localStorage.getItem("utilisateur"));
            if (isNaN(idUser)) return;

            try {
                const response = await fetch(`${lien.url}action/byuser/${idUser}`);
                const data = await response.json();
                if (data.length === 0) return;

                setListDesDepense(data);
                generateMonthlySummary(data);
                calculateBudgetAnalysis(data);
                assignCategoryColors(data);
            } catch (error) {
                console.error("Erreur lors du chargement des dépenses :", error);
            }
        };

        fetchAPI();
    }, []);

    useEffect(() => {
        if (Object.keys(monthlySummary).length > 1) {
            predictNextMonthExpense();
        }
    }, [monthlySummary]);

    const assignCategoryColors = (expenses) => {
        const colors = [
            "#6FA3EF", "#7EDABF", "#F9D56E", "#F7A1C4", "#A38DE3", "#F8A978"
        ];
        const categoryMap = {};
        let index = 0;

        [...new Set(expenses.map(exp => exp.categorie))].forEach(category => {
            categoryMap[category] = colors[index % colors.length];
            index++;
        });

        setCategoryColors(categoryMap);
    };

    const generateMonthlySummary = (expenses) => {
        const summary = {};
        expenses.forEach(({ montant, dateTransaction, categorie }) => {
            const date = new Date(dateTransaction);
            const month = date.toLocaleString("fr-FR", { month: "long", year: "numeric" });

            if (!summary[month]) {
                summary[month] = { total: 0, categories: {} };
            }
            summary[month].total += Number(montant);
            summary[month].categories[categorie] = (summary[month].categories[categorie] || 0) + Number(montant);
        });
        setMonthlySummary(summary);
    };

    const calculateBudgetAnalysis = (expenses) => {
        const totalExpenses = expenses.reduce((acc, { montant }) => acc + Number(montant), 0);
        setBudgetUsed(totalExpenses);
        setBudgetRemaining(budget - totalExpenses);
    };

    const predictNextMonthExpense = () => {
        const totals = Object.values(monthlySummary).map(m => Number(m.total));
        if (totals.length === 0) return;

        const averageExpense = totals.reduce((acc, val) => acc + val, 0) / totals.length;
        setPredictedExpense(averageExpense);
    };

    return (
        <>
            <h1 style={{ fontSize: 20, color: "blueviolet", textAlign: "center" }}>Toutes vos dépenses</h1>

            <h3 style={{ color: "red", textAlign: "center" }}>
                Prévision des dépenses pour le mois suivant: {predictedExpense !== null ? Number(predictedExpense).toFixed(2) : "-"} €
            </h3>

            <div style={{ width: "80%", margin: "auto" }}>
                <h2>Graphique des Dépenses</h2>
                <Bar data={{
                    labels: [...Object.keys(monthlySummary), "Prévision"],
                    datasets: [
                        {
                            label: "Dépenses par Mois",
                            data: [...Object.values(monthlySummary).map((m) => Number(m.total)), predictedExpense || 0],
                            backgroundColor: "blue",
                            borderWidth: 1,
                        },
                    ],
                }} />
            </div>
        </>
    );
};

export default Prediction;
