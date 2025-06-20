
import React, { useEffect, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js'; // ✅ pour chart.js@2

import '../components/css/MonthlyReportChart.css';
import useBudgetStore from "../../useBudgetStore";

const MonthlyReportChart = () => {
    const { revenus, depenses, fetchRevenus, fetchDepenses } = useBudgetStore();

    useEffect(() => {
        fetchRevenus();
        fetchDepenses();
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

    return (
        <div className="monthly-report">
            <h2>Bilan mensuel global (Graphique)</h2>
            <Bar
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        yAxes: [
                            {
                                ticks: {
                                    beginAtZero: true,
                                },
                            },
                        ],
                    },
                }}
                height={400}
            />
        </div>
    );
};

export default MonthlyReportChart;
