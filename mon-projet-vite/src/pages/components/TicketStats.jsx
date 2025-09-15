import { useEffect, useState } from 'react';
import { useTicketStore, useTicketActions } from '../../useTicketStore';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const TicketStats = () => {
    const { allTickets, ticketStats } = useTicketStore();
    const { getTicketStats } = useTicketActions();
    const [timeRange, setTimeRange] = useState('6months'); // 1month, 3months, 6months, 1year, all

    useEffect(() => {
        getTicketStats();
    }, []);

    const formatCurrency = (amount) => {
        if (!amount) return '0,00€';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const filterTicketsByTimeRange = (tickets, range) => {
        const now = new Date();
        const rangeStart = new Date();

        switch (range) {
            case '1month':
                rangeStart.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                rangeStart.setMonth(now.getMonth() - 3);
                break;
            case '6months':
                rangeStart.setMonth(now.getMonth() - 6);
                break;
            case '1year':
                rangeStart.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return tickets;
        }

        return tickets.filter(ticket => new Date(ticket.dateAjout) >= rangeStart);
    };

    const filteredTickets = filterTicketsByTimeRange(allTickets, timeRange);

    // Statistiques de base
    const totalTickets = filteredTickets.length;
    const ticketsWithAmount = filteredTickets.filter(t => t.totalExtrait && t.totalExtrait > 0);
    const totalAmount = ticketsWithAmount.reduce((sum, t) => sum + t.totalExtrait, 0);
    const averageAmount = ticketsWithAmount.length > 0 ? totalAmount / ticketsWithAmount.length : 0;

    // Données par mois pour le graphique en ligne
    const getMonthlyData = () => {
        const monthlyStats = {};

        filteredTickets.forEach(ticket => {
            const date = new Date(ticket.dateAjout);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { count: 0, amount: 0 };
            }

            monthlyStats[monthKey].count++;
            if (ticket.totalExtrait) {
                monthlyStats[monthKey].amount += ticket.totalExtrait;
            }
        });

        const months = Object.keys(monthlyStats).sort();
        return {
            labels: months.map(month => {
                const [year, monthNum] = month.split('-');
                return new Date(year, monthNum - 1).toLocaleDateString('fr-FR', {
                    month: 'short',
                    year: 'numeric'
                });
            }),
            counts: months.map(month => monthlyStats[month].count),
            amounts: months.map(month => monthlyStats[month].amount),
        };
    };

    // Top magasins
    const getTopMerchants = () => {
        const merchantStats = {};

        filteredTickets.forEach(ticket => {
            if (ticket.commercant && ticket.totalExtrait) {
                if (!merchantStats[ticket.commercant]) {
                    merchantStats[ticket.commercant] = { count: 0, amount: 0 };
                }
                merchantStats[ticket.commercant].count++;
                merchantStats[ticket.commercant].amount += ticket.totalExtrait;
            }
        });

        return Object.entries(merchantStats)
            .map(([merchant, stats]) => ({ merchant, ...stats }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 10);
    };

    // Répartition par tranches de montant
    const getAmountRanges = () => {
        const ranges = {
            '0-10': { label: '0€ - 10€', count: 0 },
            '10-25': { label: '10€ - 25€', count: 0 },
            '25-50': { label: '25€ - 50€', count: 0 },
            '50-100': { label: '50€ - 100€', count: 0 },
            '100-200': { label: '100€ - 200€', count: 0 },
            '200+': { label: '200€+', count: 0 },
        };

        ticketsWithAmount.forEach(ticket => {
            const amount = ticket.totalExtrait;
            if (amount <= 10) ranges['0-10'].count++;
            else if (amount <= 25) ranges['10-25'].count++;
            else if (amount <= 50) ranges['25-50'].count++;
            else if (amount <= 100) ranges['50-100'].count++;
            else if (amount <= 200) ranges['100-200'].count++;
            else ranges['200+'].count++;
        });

        return Object.values(ranges);
    };

    const monthlyData = getMonthlyData();
    const topMerchants = getTopMerchants();
    const amountRanges = getAmountRanges();

    // Configuration des graphiques
    const lineChartData = {
        labels: monthlyData.labels,
        datasets: [
            {
                label: 'Nombre de tickets',
                data: monthlyData.counts,
                borderColor: 'rgb(52, 152, 219)',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Montant total (€)',
                data: monthlyData.amounts,
                borderColor: 'rgb(39, 174, 96)',
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                tension: 0.4,
                yAxisID: 'y1',
            },
        ],
    };

    const lineChartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Évolution des tickets par mois',
            },
        },
        scales: {
            x: {
                display: true,
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Nombre de tickets',
                },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Montant (€)',
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    const merchantChartData = {
        labels: topMerchants.map(m => m.merchant),
        datasets: [
            {
                label: 'Montant total (€)',
                data: topMerchants.map(m => m.amount),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                    'rgba(52, 73, 94, 0.8)',
                    'rgba(26, 188, 156, 0.8)',
                    'rgba(189, 195, 199, 0.8)',
                    'rgba(243, 156, 18, 0.8)',
                ],
            },
        ],
    };

    const merchantChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Top 10 des magasins par montant',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return formatCurrency(value);
                    },
                },
            },
        },
    };

    const doughnutChartData = {
        labels: amountRanges.map(r => r.label),
        datasets: [
            {
                label: 'Répartition',
                data: amountRanges.map(r => r.count),
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(39, 174, 96, 0.8)',
                    'rgba(241, 196, 15, 0.8)',
                    'rgba(231, 76, 60, 0.8)',
                    'rgba(155, 89, 182, 0.8)',
                    'rgba(230, 126, 34, 0.8)',
                ],
                borderWidth: 2,
                borderColor: '#fff',
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Répartition par tranche de montant',
            },
        },
    };

    if (totalTickets === 0) {
        return (
            <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📊</div>
                <h3 style={styles.emptyTitle}>Aucune donnée statistique</h3>
                <p style={styles.emptyMessage}>
                    Analysez quelques tickets pour voir apparaître les statistiques.
                </p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📊 Statistiques des Tickets</h2>

                {/* Sélecteur de période */}
                <div style={styles.timeRangeSelector}>
                    <label style={styles.timeLabel}>Période :</label>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={styles.timeSelect}
                    >
                        <option value="1month">1 mois</option>
                        <option value="3months">3 mois</option>
                        <option value="6months">6 mois</option>
                        <option value="1year">1 an</option>
                        <option value="all">Tout</option>
                    </select>
                </div>
            </div>

            {/* Cartes de statistiques */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>🧾</div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{totalTickets}</div>
                        <div style={styles.statLabel}>Tickets total</div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statIcon}>✅</div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{ticketsWithAmount.length}</div>
                        <div style={styles.statLabel}>Avec montant</div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statIcon}>💰</div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{formatCurrency(totalAmount)}</div>
                        <div style={styles.statLabel}>Total</div>
                    </div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📊</div>
                    <div style={styles.statContent}>
                        <div style={styles.statValue}>{formatCurrency(averageAmount)}</div>
                        <div style={styles.statLabel}>Moyenne</div>
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div style={styles.chartsGrid}>
                {/* Évolution temporelle */}
                <div style={styles.chartContainer}>
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>

                {/* Top magasins */}
                {topMerchants.length > 0 && (
                    <div style={styles.chartContainer}>
                        <Bar data={merchantChartData} options={merchantChartOptions} />
                    </div>
                )}

                {/* Répartition par montant */}
                {ticketsWithAmount.length > 0 && (
                    <div style={styles.chartContainer}>
                        <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                    </div>
                )}
            </div>

            {/* Tableau des top magasins */}
            {topMerchants.length > 0 && (
                <div style={styles.merchantsTable}>
                    <h3 style={styles.tableTitle}>🏪 Détail des magasins</h3>
                    <div style={styles.table}>
                        <div style={styles.tableHeader}>
                            <div style={styles.tableHeaderCell}>Rang</div>
                            <div style={styles.tableHeaderCell}>Magasin</div>
                            <div style={styles.tableHeaderCell}>Tickets</div>
                            <div style={styles.tableHeaderCell}>Montant total</div>
                            <div style={styles.tableHeaderCell}>Panier moyen</div>
                        </div>
                        {topMerchants.map((merchant, index) => (
                            <div key={merchant.merchant} style={styles.tableRow}>
                                <div style={styles.tableCell}>
                                    <div style={styles.rank}>{index + 1}</div>
                                </div>
                                <div style={styles.tableCell}>{merchant.merchant}</div>
                                <div style={styles.tableCell}>{merchant.count}</div>
                                <div style={styles.tableCell}>{formatCurrency(merchant.amount)}</div>
                                <div style={styles.tableCell}>
                                    {formatCurrency(merchant.amount / merchant.count)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        backgroundColor: '#f8f9fa',
        minHeight: '100vh',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    title: {
        fontSize: '1.8rem',
        fontWeight: '600',
        color: '#2c3e50',
        margin: 0,
    },
    timeRangeSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    timeLabel: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#6c757d',
    },
    timeSelect: {
        padding: '0.5rem 1rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '0.9rem',
        backgroundColor: '#ffffff',
        cursor: 'pointer',
    },

    // État vide
    emptyState: {
        textAlign: 'center',
        padding: '4rem 2rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        margin: '2rem auto',
        maxWidth: '500px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: '1.5rem',
        color: '#5d6d7e',
        marginBottom: '0.5rem',
    },
    emptyMessage: {
        fontSize: '1rem',
        color: '#7f8c8d',
        lineHeight: 1.5,
    },

    // Statistiques
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        transition: 'transform 0.3s ease',
    },
    statIcon: {
        fontSize: '2rem',
        marginRight: '1rem',
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: '0.2rem',
    },
    statLabel: {
        fontSize: '0.9rem',
        color: '#6c757d',
        fontWeight: '500',
    },

    // Graphiques
    chartsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '2rem',
        marginBottom: '2rem',
    },
    chartContainer: {
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    },

    // Tableau
    merchantsTable: {
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    tableTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#2c3e50',
        margin: 0,
        padding: '1.5rem',
        borderBottom: '1px solid #e9ecef',
    },
    table: {
        display: 'table',
        width: '100%',
    },
    tableHeader: {
        display: 'table-row',
        backgroundColor: '#f8f9fa',
        fontWeight: '600',
        color: '#495057',
    },
    tableHeaderCell: {
        display: 'table-cell',
        padding: '1rem 1.5rem',
        borderBottom: '2px solid #dee2e6',
        textAlign: 'left',
    },
    tableRow: {
        display: 'table-row',
        transition: 'background-color 0.2s ease',
    },
    tableCell: {
        display: 'table-cell',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #dee2e6',
        verticalAlign: 'middle',
    },
    rank: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#3498db',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        fontWeight: '600',
    },
};

// Styles responsifs
if (typeof document !== 'undefined' && !document.querySelector('#ticket-stats-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'ticket-stats-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
    .stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 25px rgba(0,0,0,0.15) !important;
    }

    .table-row:hover {
        background-color: #f8f9fa;
    }

    @media (max-width: 1200px) {
        .charts-grid {
            grid-template-columns: 1fr !important;
        }
    }

    @media (max-width: 768px) {
        .stats-grid {
            grid-template-columns: 1fr 1fr !important;
        }

        .header {
            flex-direction: column !important;
            gap: 1rem !important;
            align-items: flex-start !important;
        }

        .table-cell {
            padding: 0.8rem 1rem !important;
            font-size: 0.9rem !important;
        }
    }

    @media (max-width: 480px) {
        .stats-grid {
            grid-template-columns: 1fr !important;
        }

        .container {
            padding: 1rem !important;
        }
    }
    `;
    document.head.appendChild(styleSheet);
}

export default TicketStats;