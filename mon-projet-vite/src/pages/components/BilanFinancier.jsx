import React, { useState, useMemo } from "react";
import useBudgetStore from "../../useBudgetStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/bilanFniancier.css";
import {
    Calendar,
    TrendingUp,
    TrendingDown,
    Wallet,
    Search,
    Filter,
    RefreshCw,
    Eye,
    EyeOff,
    BarChart3
} from 'lucide-react';

const BilanFinancier = () => {
    const { revenus, depenses } = useBudgetStore();

    // États pour la gestion de l'affichage
    const [showSearch, setShowSearch] = useState(false);
    const [searchMonth, setSearchMonth] = useState('');
    const [searchYear, setSearchYear] = useState('');
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState(new Date());

    // Génération des données mensuelles
    const generateMonthlyData = useMemo(() => {
        const monthlyData = [];
        const currentDate = new Date();

        // Générer les 18 derniers mois pour avoir plus de données de recherche
        for (let i = 0; i < 18; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            const endOfMonth = new Date(year, month + 1, 0);

            // Filtrer les revenus du mois
            const monthRevenus = (revenus || []).filter(r => {
                const d = new Date(r.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });

            // Filtrer les dépenses du mois
            const monthDepenses = (depenses || []).filter(d => {
                const dDate = new Date(d.dateTransaction);
                return dDate.getMonth() === month && dDate.getFullYear() === year;
            });

            const totalRevenus = monthRevenus.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
            const totalDepenses = monthDepenses.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);
            const solde = totalRevenus - totalDepenses;

            monthlyData.push({
                month,
                year,
                monthName: date.toLocaleString('fr-FR', { month: 'long' }),
                fullDate: date,
                totalRevenus,
                totalDepenses,
                solde,
                revenusCount: monthRevenus.length,
                depensesCount: monthDepenses.length,
                isRecent: i < 6 // Les 6 derniers mois
            });
        }

        return monthlyData;
    }, [revenus, depenses]);

    // Les 6 derniers mois
    const recentMonths = generateMonthlyData.filter(data => data.isRecent);

    // Données filtrées pour la recherche
    const filteredMonthlyData = generateMonthlyData.filter(data => {
        const matchesMonth = searchMonth === '' || data.monthName.toLowerCase().includes(searchMonth.toLowerCase());
        const matchesYear = searchYear === '' || data.year.toString() === searchYear;
        return matchesMonth && matchesYear;
    });

    // Calcul du bilan personnalisé avec dates
    const revenusFiltres = (revenus || []).filter(r => {
        const d = new Date(r.date);
        return d >= startDate && d <= endDate;
    });

    const depensesFiltres = (depenses || []).filter(d => {
        const dDate = new Date(d.dateTransaction);
        return dDate >= startDate && dDate <= endDate;
    });

    const totalRevenusPeriode = revenusFiltres.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
    const totalDepensesPeriode = depensesFiltres.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);
    const soldePeriode = totalRevenusPeriode - totalDepensesPeriode;

    const clearSearch = () => {
        setSearchMonth('');
        setSearchYear('');
    };

    const getBilanStatus = (solde) => {
        if (solde > 0) return 'positive';
        if (solde < 0) return 'negative';
        return 'neutral';
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    return (
        <div className="bilan-financier-modern">
            <div className="bilan-header">
                <h2 className="bilan-title">
                    <BarChart3 size={24} />
                    Bilan Mensuel Détaillé
                </h2>
                <p className="bilan-subtitle">
                    Analysez vos performances financières mois par mois
                </p>
            </div>

            {/* Section des 6 derniers mois */}
            <div className="recent-months-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <Calendar size={20} />
                        6 derniers mois
                    </h3>
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowSearch(!showSearch)}
                    >
                        {showSearch ? (
                            <>
                                <EyeOff size={18} />
                                Masquer la recherche
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                Rechercher d'autres mois
                            </>
                        )}
                    </button>
                </div>

                <div className="months-grid">
                    {recentMonths.map((monthData, index) => (
                        <div
                            key={`${monthData.year}-${monthData.month}`}
                            className={`month-card ${getBilanStatus(monthData.solde)}`}
                        >
                            <div className="month-header">
                                <h4 className="month-name">
                                    {monthData.monthName} {monthData.year}
                                </h4>
                                <div className="month-stats">
                                    <span className="stat-badge revenue">{monthData.revenusCount} revenus</span>
                                    <span className="stat-badge expense">{monthData.depensesCount} dépenses</span>
                                </div>
                            </div>

                            <div className="month-amounts">
                                <div className="amount-item revenue">
                                    <TrendingUp size={16} />
                                    <span className="amount-label">Revenus</span>
                                    <span className="amount-value">{formatCurrency(monthData.totalRevenus)}</span>
                                </div>
                                <div className="amount-item expense">
                                    <TrendingDown size={16} />
                                    <span className="amount-label">Dépenses</span>
                                    <span className="amount-value">{formatCurrency(monthData.totalDepenses)}</span>
                                </div>
                                <div className={`amount-item balance ${getBilanStatus(monthData.solde)}`}>
                                    <Wallet size={16} />
                                    <span className="amount-label">Solde</span>
                                    <span className="amount-value">{formatCurrency(monthData.solde)}</span>
                                </div>
                            </div>

                            <div className="month-status">
                                {monthData.solde > 0 && (
                                    <span className="status-message positive">
                                        💚 Bénéficiaire de {formatCurrency(monthData.solde)}
                                    </span>
                                )}
                                {monthData.solde < 0 && (
                                    <span className="status-message negative">
                                        ⚠️ Déficit de {formatCurrency(Math.abs(monthData.solde))}
                                    </span>
                                )}
                                {monthData.solde === 0 && (
                                    <span className="status-message neutral">
                                        ⚖️ Budget équilibré
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Section de recherche */}
            {showSearch && (
                <div className="search-section">
                    <div className="search-header">
                        <h3 className="section-title">
                            <Filter size={20} />
                            Recherche dans l'historique
                        </h3>
                    </div>

                    <div className="search-controls">
                        <div className="search-filters">
                            <div className="filter-group">
                                <label>Rechercher par mois</label>
                                <input
                                    type="text"
                                    placeholder="Ex: janvier, février..."
                                    value={searchMonth}
                                    onChange={(e) => setSearchMonth(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="filter-group">
                                <label>Année</label>
                                <select
                                    value={searchYear}
                                    onChange={(e) => setSearchYear(e.target.value)}
                                    className="search-select"
                                >
                                    <option value="">Toutes les années</option>
                                    {[...new Set(generateMonthlyData.map(d => d.year))].sort((a, b) => b - a).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                            <button
                                className="btn btn-outline"
                                onClick={clearSearch}
                            >
                                <RefreshCw size={18} />
                                Réinitialiser
                            </button>
                        </div>
                    </div>

                    <div className="search-results">
                        <div className="results-header">
                            <h4>Résultats de recherche ({filteredMonthlyData.length})</h4>
                        </div>

                        <div className="results-table">
                            <table className="monthly-table">
                                <thead>
                                    <tr>
                                        <th>Période</th>
                                        <th>Revenus</th>
                                        <th>Dépenses</th>
                                        <th>Solde</th>
                                        <th>Opérations</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMonthlyData.map((monthData) => (
                                        <tr key={`${monthData.year}-${monthData.month}`} className={getBilanStatus(monthData.solde)}>
                                            <td>
                                                <div className="period-info">
                                                    <span className="month-name">{monthData.monthName}</span>
                                                    <span className="year">{monthData.year}</span>
                                                </div>
                                            </td>
                                            <td className="amount-cell positive">{formatCurrency(monthData.totalRevenus)}</td>
                                            <td className="amount-cell negative">{formatCurrency(monthData.totalDepenses)}</td>
                                            <td className={`amount-cell balance ${getBilanStatus(monthData.solde)}`}>
                                                {formatCurrency(monthData.solde)}
                                            </td>
                                            <td>
                                                <div className="operations-info">
                                                    <span className="op-badge revenue">{monthData.revenusCount}R</span>
                                                    <span className="op-badge expense">{monthData.depensesCount}D</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`status-indicator ${getBilanStatus(monthData.solde)}`}>
                                                    {monthData.solde > 0 ? '💚' : monthData.solde < 0 ? '🔴' : '⚪'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Bilan personnalisé avec sélection de dates */}
            <div className="custom-period-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <Calendar size={20} />
                        Bilan personnalisé
                    </h3>
                </div>

                <div className="date-selectors">
                    <div className="date-group">
                        <label>Du :</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker"
                        />
                    </div>
                    <div className="date-group">
                        <label>Au :</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            dateFormat="dd/MM/yyyy"
                            className="date-picker"
                        />
                    </div>
                </div>

                <div className="custom-results">
                    <div className="custom-summary">
                        <div className="summary-item revenue">
                            <TrendingUp size={20} />
                            <div className="summary-content">
                                <span className="summary-label">Total des revenus</span>
                                <span className="summary-value">{formatCurrency(totalRevenusPeriode)}</span>
                            </div>
                        </div>
                        <div className="summary-item expense">
                            <TrendingDown size={20} />
                            <div className="summary-content">
                                <span className="summary-label">Total des dépenses</span>
                                <span className="summary-value">{formatCurrency(totalDepensesPeriode)}</span>
                            </div>
                        </div>
                        <div className={`summary-item balance ${getBilanStatus(soldePeriode)}`}>
                            <Wallet size={20} />
                            <div className="summary-content">
                                <span className="summary-label">Solde de la période</span>
                                <span className="summary-value">{formatCurrency(soldePeriode)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`period-message ${getBilanStatus(soldePeriode)}`}>
                        {soldePeriode > 0 && (
                            <span>🎉 Bravo ! Vous êtes bénéficiaire de {formatCurrency(soldePeriode)} sur cette période !</span>
                        )}
                        {soldePeriode < 0 && (
                            <span>⚠️ Attention ! Vous êtes en déficit de {formatCurrency(Math.abs(soldePeriode))} sur cette période.</span>
                        )}
                        {soldePeriode === 0 && (
                            <span>⚖️ Votre budget est parfaitement équilibré sur cette période.</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BilanFinancier;