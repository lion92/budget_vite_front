import { useEffect, useState } from 'react';
import { useTicketStore, useTicketActions, useTicketLoadingStates } from '../../useTicketStore';
import ImportTicket from './ImportTicket';
import TicketList from './TicketList';
import TicketTable from './TicketTable';
import TicketStats from './TicketStats';
import Navigation from './Navigation';

const DashTickets = () => {
    const [activeTab, setActiveTab] = useState('upload');
    const { allTickets, ticketStats } = useTicketStore();
    const { getTicketStats } = useTicketActions();
    const { loading } = useTicketLoadingStates();

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

    const getTotalAmount = () => {
        return allTickets.reduce((sum, ticket) => sum + (ticket.totalExtrait || 0), 0);
    };

    const getTicketsWithAmount = () => {
        return allTickets.filter(ticket => ticket.totalExtrait && ticket.totalExtrait > 0);
    };

    const getRecentTickets = () => {
        return allTickets.slice(0, 5);
    };

    const getTopMerchants = () => {
        const merchantTotals = {};
        allTickets.forEach(ticket => {
            if (ticket.commercant && ticket.totalExtrait) {
                merchantTotals[ticket.commercant] = (merchantTotals[ticket.commercant] || 0) + ticket.totalExtrait;
            }
        });

        return Object.entries(merchantTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([merchant, total]) => ({ merchant, total }));
    };

    const thisMonthTickets = allTickets.filter(ticket => {
        const ticketDate = new Date(ticket.dateAjout);
        const now = new Date();
        return ticketDate.getMonth() === now.getMonth() && ticketDate.getFullYear() === now.getFullYear();
    });

    return (
        <div style={styles.pageContainer}>
            <Navigation />

            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.pageTitle}>🧾 Gestion des Tickets</h1>
                    <p style={styles.pageSubtitle}>
                        Analysez vos tickets de caisse automatiquement avec l'OCR
                    </p>
                </div>

                {/* Statistiques principales */}
                {allTickets.length > 0 && (
                    <div style={styles.statsSection}>
                        <h2 style={styles.sectionTitle}>📊 Statistiques</h2>
                        <div style={styles.statsGrid}>
                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>🧾</div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>{allTickets.length}</div>
                                    <div style={styles.statLabel}>Tickets total</div>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>✅</div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>{getTicketsWithAmount().length}</div>
                                    <div style={styles.statLabel}>Avec montant</div>
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>📅</div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>{thisMonthTickets.length}</div>
                                    <div style={styles.statLabel}>Ce mois</div>
                                </div>
                            </div>

                            <div style={{...styles.statCard, ...styles.totalCard}}>
                                <div style={styles.statIcon}>💰</div>
                                <div style={styles.statContent}>
                                    <div style={styles.statValue}>{formatCurrency(getTotalAmount())}</div>
                                    <div style={styles.statLabel}>Total général</div>
                                </div>
                            </div>
                        </div>

                        {/* Top marchands */}
                        {getTopMerchants().length > 0 && (
                            <div style={styles.merchantsSection}>
                                <h3 style={styles.merchantsTitle}>🏪 Top Magasins</h3>
                                <div style={styles.merchantsList}>
                                    {getTopMerchants().map(({ merchant, total }, index) => (
                                        <div key={merchant} style={styles.merchantItem}>
                                            <div style={styles.merchantRank}>{index + 1}</div>
                                            <div style={styles.merchantName}>{merchant}</div>
                                            <div style={styles.merchantTotal}>{formatCurrency(total)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Navigation par onglets */}
                <div style={styles.tabsContainer}>
                    <div style={styles.tabs}>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'upload' ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab('upload')}
                        >
                            📤 Analyser un Ticket
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'list' ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab('list')}
                        >
                            📋 Mes Tickets ({allTickets.length})
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'table' ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab('table')}
                        >
                            📊 Tableau Avancé ({allTickets.length})
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'stats' ? styles.tabActive : {})
                            }}
                            onClick={() => setActiveTab('stats')}
                        >
                            📊 Statistiques
                        </button>
                    </div>
                </div>

                {/* Contenu des onglets */}
                <div style={styles.tabContent}>
                    {activeTab === 'upload' && (
                        <div style={styles.uploadSection}>
                            <ImportTicket />
                        </div>
                    )}

                    {activeTab === 'list' && (
                        <div style={styles.listSection}>
                            <TicketList />
                        </div>
                    )}

                    {activeTab === 'table' && (
                        <div style={styles.tableSection}>
                            <TicketTable />
                        </div>
                    )}

                    {activeTab === 'stats' && (
                        <div style={styles.statsSection}>
                            <TicketStats />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem',
    },
    header: {
        textAlign: 'center',
        marginBottom: '3rem',
        padding: '2rem',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    },
    pageTitle: {
        fontSize: '2.5rem',
        margin: '0 0 0.5rem 0',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    pageSubtitle: {
        fontSize: '1.1rem',
        color: '#6c757d',
        margin: '0',
        fontWeight: '400',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
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
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    },
    totalCard: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
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
        lineHeight: '1.2',
        marginBottom: '0.2rem',
    },
    statLabel: {
        fontSize: '0.9rem',
        opacity: 0.8,
        fontWeight: '500',
    },

    // Section marchands
    merchantsSection: {
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #e9ecef',
    },
    merchantsTitle: {
        fontSize: '1.2rem',
        fontWeight: '600',
        color: '#2c3e50',
        margin: '0 0 1rem 0',
    },
    merchantsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
    },
    merchantItem: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.8rem 1rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
    },
    merchantRank: {
        width: '30px',
        height: '30px',
        borderRadius: '50%',
        backgroundColor: '#3498db',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.8rem',
        fontWeight: '600',
        marginRight: '1rem',
    },
    merchantName: {
        flex: 1,
        fontSize: '0.95rem',
        fontWeight: '500',
        color: '#2c3e50',
    },
    merchantTotal: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#27ae60',
    },

    // Onglets
    tabsContainer: {
        marginBottom: '2rem',
    },
    tabs: {
        display: 'flex',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '0.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
        gap: '0.5rem',
    },
    tab: {
        flex: 1,
        padding: '1rem 1.5rem',
        border: 'none',
        borderRadius: '8px',
        backgroundColor: 'transparent',
        color: '#6c757d',
        fontSize: '1rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
    },
    tabActive: {
        backgroundColor: '#3498db',
        color: 'white',
        fontWeight: '600',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)',
    },

    // Contenu
    tabContent: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
    },
    uploadSection: {
        padding: '0',
    },
    listSection: {
        padding: '2rem',
    },
    tableSection: {
        padding: '2rem',
    },
    statsSection: {
        padding: '0',
    },
};

// Ajout des styles hover avec CSS
if (typeof document !== 'undefined' && !document.querySelector('#dash-tickets-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'dash-tickets-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
    .stat-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 25px rgba(0,0,0,0.15);
    }

    .tab:hover:not(.tab-active) {
        background-color: #f8f9fa;
        color: #2c3e50;
    }

    .merchant-item:hover {
        transform: translateX(5px);
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    `;
    document.head.appendChild(styleSheet);
}

export default DashTickets;