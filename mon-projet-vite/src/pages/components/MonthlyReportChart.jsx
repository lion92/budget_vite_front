
import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js'; // ✅ pour chart.js@2

import '../components/css/MonthlyReportChart.css';
import useBudgetStore from "../../useBudgetStore";

const MonthlyReportChart = () => {
    const { revenus, depenses, fetchRevenus, fetchDepenses } = useBudgetStore();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        fetchRevenus();
        fetchDepenses();

        // Détection du mode sombre
        const checkDarkMode = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const bodyClass = document.body.className;
            setIsDarkMode(theme === 'dark' || bodyClass.includes('dark-mode'));
        };

        checkDarkMode();

        // Observer les changements de thème
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    const chartData = useMemo(() => {
        const grouped = {};

        (revenus || []).forEach(r => {
            const d = new Date(r.date); // ✅ r.date et pas dateTransaction
            const key = `${d.getFullYear()}-${d.getMonth()}`;

            if (!grouped[key]) {
                grouped[key] = { revenus: 0, depenses: 0 };
            }

            grouped[key].revenus += parseFloat(r.amount || 0); // ✅ r.amount et pas r.montant
        });


        (depenses || []).forEach(d => {
            const dt = new Date(d.dateTransaction);
            const key = `${dt.getFullYear()}-${dt.getMonth()}`;
            if (!grouped[key]) grouped[key] = { revenus: 0, depenses: 0 };
            grouped[key].depenses += parseFloat(d.montant || 0);
        });

        const sortedEntries = Object.entries(grouped).sort(([a], [b]) => new Date(a) - new Date(b));

        const labels = sortedEntries.map(([key]) => {
            const [year, month] = key.split('-');
            return new Date(year, month).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        });

        const revenusData = sortedEntries.map(([, val]) => val.revenus);

        const depensesData = sortedEntries.map(([, val]) => val.depenses);
        const soldeData = sortedEntries.map(([, val]) => val.revenus - val.depenses);

        return {
            labels,
            datasets: [
                {
                    label: 'Revenus',
                    backgroundColor: '#4ade80',
                    data: revenusData,
                },
                {
                    label: 'Dépenses',
                    backgroundColor: '#f87171',
                    data: depensesData,
                },
                {
                    label: 'Solde',
                    backgroundColor: '#60a5fa',
                    data: soldeData,
                },
            ],
        };
    }, [revenus, depenses]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: isDarkMode ? '#f0f6fc' : '#0f172a',
                    font: {
                        size: 14
                    }
                }
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#161b22' : '#ffffff',
                titleColor: isDarkMode ? '#f0f6fc' : '#0f172a',
                bodyColor: isDarkMode ? '#c9d1d9' : '#334155',
                borderColor: isDarkMode ? '#30363d' : '#cbd5e1',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDarkMode ? '#30363d' : '#e2e8f0'
                },
                ticks: {
                    color: isDarkMode ? '#c9d1d9' : '#334155'
                }
            },
            x: {
                grid: {
                    color: isDarkMode ? '#30363d' : '#e2e8f0'
                },
                ticks: {
                    color: isDarkMode ? '#c9d1d9' : '#334155'
                }
            }
        }
    };

    return (
        <div className="monthly-report">
            <h2>Bilan mensuel global (Graphique)</h2>
            <Bar
                data={chartData}
                options={chartOptions}
                height={400}
            />
        </div>
    );
};

export default MonthlyReportChart;
