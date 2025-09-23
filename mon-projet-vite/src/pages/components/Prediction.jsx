import React, { useEffect, useRef, useState } from "react";
import { Bar } from "react-chartjs-2";
import Chart from 'chart.js/auto';

const Prediction = () => {
    const [listDesDepense, setListDesDepense] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState({});
    const [categoryColors, setCategoryColors] = useState({});
    const [budget, setBudget] = useState(0);
    const [budgetUsed, setBudgetUsed] = useState(0);
    const [budgetRemaining, setBudgetRemaining] = useState(0);
    const [predictedExpense, setPredictedExpense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const pdfRef = useRef();

    useEffect(() => {
        const fetchAPI = async () => {
            // Mock user ID since localStorage is not available
            const idUser = 1; // parseInt(localStorage.getItem("utilisateur"));
            if (isNaN(idUser)) {
                setError("ID utilisateur invalide");
                setLoading(false);
                return;
            }

            try {
                // Mock data since external API is not available
                const mockData = [
                    { montant: 150, dateTransaction: "2024-01-15", categorie: "Alimentation" },
                    { montant: 80, dateTransaction: "2024-01-20", categorie: "Transport" },
                    { montant: 200, dateTransaction: "2024-02-10", categorie: "Alimentation" },
                    { montant: 120, dateTransaction: "2024-02-25", categorie: "Loisirs" },
                    { montant: 90, dateTransaction: "2024-03-05", categorie: "Transport" },
                    { montant: 250, dateTransaction: "2024-03-12", categorie: "Alimentation" },
                ];

                if (mockData.length === 0) {
                    setLoading(false);
                    return;
                }

                setListDesDepense(mockData);
                generateMonthlySummary(mockData);
                calculateBudgetAnalysis(mockData);
                assignCategoryColors(mockData);
                setLoading(false);
            } catch (error) {
                console.error("Erreur lors du chargement des dépenses :", error);
                setError("Erreur lors du chargement des données");
                setLoading(false);
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

    if (loading) {
        return (
            <div style={{ textAlign: "center", padding: "2rem" }}>
                <p>Chargement des données...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: "center", padding: "2rem", color: "red" }}>
                <p>Erreur: {error}</p>
            </div>
        );
    }

    const chartData = {
        labels: [...Object.keys(monthlySummary), "Prévision"],
        datasets: [
            {
                label: "Dépenses par Mois",
                data: [...Object.values(monthlySummary).map((m) => Number(m.total)), predictedExpense || 0],
                backgroundColor: [
                    ...Object.keys(monthlySummary).map(() => "#3B82F6"),
                    "#EF4444" // Different color for prediction
                ],
                borderColor: [
                    ...Object.keys(monthlySummary).map(() => "#1E40AF"),
                    "#DC2626"
                ],
                borderWidth: 1,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Évolution des Dépenses Mensuelles',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Montant (€)'
                }
            }
        }
    };

    return (
        <div style={{ padding: "1rem" }}>
            <h1 style={{ fontSize: 20, color: "blueviolet", textAlign: "center" }}>
                Toutes vos dépenses
            </h1>

            <h3 style={{ color: "red", textAlign: "center" }}>
                Prévision des dépenses pour le mois suivant: {" "}
                {predictedExpense !== null ? Number(predictedExpense).toFixed(2) : "-"} €
            </h3>

            {/* Budget Summary */}
            <div style={{
                width: "80%",
                margin: "2rem auto",
                padding: "1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "#f9fafb"
            }}>
                <h3>Résumé Budgétaire</h3>
                <p>Budget utilisé: {budgetUsed.toFixed(2)} €</p>
                <p>Budget restant: {budgetRemaining.toFixed(2)} €</p>
                <p>Nombre de transactions: {listDesDepense.length}</p>
            </div>

            {/* Chart */}
            <div style={{ width: "80%", margin: "2rem auto" }}>
                <h2>Graphique des Dépenses</h2>
                <Bar data={chartData} options={chartOptions} />
            </div>

            {/* Monthly Details */}
            <div style={{ width: "80%", margin: "2rem auto" }}>
                <h3>Détail par Mois</h3>
                {Object.entries(monthlySummary).map(([month, data]) => (
                    <div key={month} style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px"
                    }}>
                        <h4>{month}: {data.total.toFixed(2)} €</h4>
                        <div style={{ marginLeft: "1rem" }}>
                            {Object.entries(data.categories).map(([category, amount]) => (
                                <p key={category} style={{
                                    color: categoryColors[category] || "#000",
                                    fontWeight: "bold"
                                }}>
                                    {category}: {amount.toFixed(2)} €
                                </p>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Prediction;