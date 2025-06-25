import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import lien from './lien';

const MonthlyExpensesByCategory = () => {
    const [listDesDepense, setListDesDepense] = useState([]);
    const [monthlySummary, setMonthlySummary] = useState({});
    const [categoryColors, setCategoryColors] = useState({});
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [months, setMonths] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAPI = async () => {
            setIsLoading(true);
            const idUser = parseInt(localStorage.getItem("utilisateur"));
            if (isNaN(idUser)) {
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`${lien.url}action/byuser/${idUser}`);
                const data = await response.json();

                if (data.length === 0) {
                    setIsLoading(false);
                    return;
                }

                setListDesDepense(data);
                generateMonthlySummary(data);
                assignCategoryColors(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Erreur lors du chargement des dépenses :", error);
                setIsLoading(false);
            }
        };

        fetchAPI();
    }, []);

    useEffect(() => {
        if (Object.keys(monthlySummary).length > 0) {
            const categories = new Set();
            Object.values(monthlySummary).forEach(({ categories: monthCategories }) => {
                Object.keys(monthCategories).forEach(category => categories.add(category));
            });

            const allCats = Array.from(categories);
            setAllCategories(allCats);
            setSelectedCategories(allCats);
            prepareChartData(allCats);
            setMonths(Object.keys(monthlySummary));
        }
    }, [monthlySummary]);

    useEffect(() => {
        if (selectedCategories.length > 0 && Object.keys(monthlySummary).length > 0) {
            prepareChartData(selectedCategories);
        }
    }, [selectedCategories]);

    const assignCategoryColors = (expenses) => {
        const colors = ["#6FA3EF", "#7EDABF", "#F9D56E", "#F7A1C4", "#A38DE3", "#F8A978"];
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
            const montantNumber = Number(montant);
            const date = new Date(dateTransaction);
            const month = date.toLocaleString("fr-FR", { month: "long", year: "numeric" });

            if (!summary[month]) {
                summary[month] = { total: 0, categories: {} };
            }

            summary[month].total += montantNumber;
            summary[month].categories[categorie] = (summary[month].categories[categorie] || 0) + montantNumber;
        });
        setMonthlySummary(summary);
    };

    const prepareChartData = (categories) => {
        const data = Object.entries(monthlySummary).map(([month, { categories: monthCategories }]) => {
            const monthData = { month };
            categories.forEach(category => {
                const amount = Number(monthCategories[category] || 0);
                monthData[category] = amount;
            });
            return monthData;
        });

        setChartData(data);
    };

    const handleCategoryToggle = (category) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(cat => cat !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const handleSelectAllCategories = () => {
        setSelectedCategories([...allCategories]);
    };

    const handleDeselectAllCategories = () => {
        setSelectedCategories([]);
    };

    return (
        <div style={{ padding: "16px", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: 18, color: "blueviolet", textAlign: "center", marginBottom: "16px" }}>Dépenses mensuelles par catégorie</h2>

            {isLoading ? (
                <div style={{ textAlign: "center", padding: "20px" }}>Chargement des données...</div>
            ) : (
                <>
                    <div style={{ marginBottom: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                            <h3 style={{ fontWeight: "600" }}>Filtrer par catégorie</h3>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={handleSelectAllCategories}
                                    style={{
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                        backgroundColor: "blueviolet",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Tout sélectionner
                                </button>
                                <button
                                    onClick={handleDeselectAllCategories}
                                    style={{
                                        padding: "4px 8px",
                                        fontSize: "12px",
                                        backgroundColor: "#6B7280",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer"
                                    }}
                                >
                                    Tout désélectionner
                                </button>
                            </div>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {allCategories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategoryToggle(category)}
                                    style={{
                                        padding: "4px 12px",
                                        borderRadius: "9999px",
                                        fontSize: "14px",
                                        border: "none",
                                        cursor: "pointer",
                                        backgroundColor: selectedCategories.includes(category)
                                            ? categoryColors[category] || "#6FA3EF"
                                            : '#e2e8f0',
                                        color: selectedCategories.includes(category)
                                            ? '#ffffff'
                                            : '#4a5568'
                                    }}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ height: "400px", marginBottom: "16px" }}>
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} />
                                    <YAxis />
                                    <Tooltip formatter={(value) => `${Number(value).toFixed(2)} €`} />
                                    <Legend />
                                    {selectedCategories.map(category => (
                                        <Bar
                                            key={category}
                                            dataKey={category}
                                            name={category}
                                            stackId="a"
                                            fill={categoryColors[category] || "#6FA3EF"}
                                        />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                                Aucune donnée à afficher
                            </div>
                        )}
                    </div>

                    <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
                        <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>Légende des couleurs</h3>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                            {allCategories.map(category => (
                                <div
                                    key={category}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "4px 8px",
                                        backgroundColor: selectedCategories.includes(category) ? "#F9FAFB" : "#F3F4F6",
                                        borderRadius: "4px"
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "16px",
                                            height: "16px",
                                            borderRadius: "4px",
                                            backgroundColor: categoryColors[category] || "#6FA3EF",
                                            marginRight: "8px"
                                        }}
                                    ></div>
                                    <span>{category}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {months.length > 0 && (
                        <div style={{ marginTop: "16px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "16px" }}>
                            <h3 style={{ fontWeight: "600", marginBottom: "8px" }}>Résumé par mois</h3>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                                {months.map(month => {
                                    const { total, categories: monthCategories } = monthlySummary[month];
                                    return (
                                        <div key={month} style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px" }}>
                                            <h4 style={{ marginBottom: "8px", color: "black" }}>{month}</h4>
                                            <p style={{ fontWeight: "bold", marginBottom: "8px" }}>Total: {Number(total).toFixed(2)} €</p>
                                            <ul style={{ listStyleType: "none", padding: 0, margin: 0 }}>
                                                {Object.entries(monthCategories)
                                                    .filter(([category]) => selectedCategories.includes(category))
                                                    .map(([category, amount]) => (
                                                        <li key={category} style={{ marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                                                            <span style={{ display: "flex", alignItems: "center" }}>
                                                                <div
                                                                    style={{
                                                                        width: "10px",
                                                                        height: "10px",
                                                                        borderRadius: "50%",
                                                                        backgroundColor: categoryColors[category] || "#6FA3EF",
                                                                        marginRight: "6px"
                                                                    }}
                                                                ></div>
                                                                {category}
                                                            </span>
                                                            <span>{Number(amount).toFixed(2)} €</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MonthlyExpensesByCategory;
