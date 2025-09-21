import React, { useEffect, useRef, useState } from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './css/budget_style.css';
import './css/new-expense-table.css';
import { useNotify } from "./Notification";
import AllSpend from "././AllSpend.jsx";
import useBudgetStore from "../../useBudgetStore";
import ModalCategorie from "./ModalCategorie";
import RevenueManager from "./RevenuManager";
import MonthlyReportChart from "./MonthlyReportChart";
import BilanFinancier from "./BilanFinancier";
import ImportTicket from "./ImportTicket";
import {
    FilePlus, Table, BarChartBig, Download, Filter, RefreshCw,
    TrendingUp, TrendingDown, Wallet, Calendar, X, Plus, Trash2, Edit,
    Eye, EyeOff, Settings, PiggyBank, Target, AlertCircle, ChevronDown,
    ChevronUp, Layers, Check, Save
} from 'lucide-react';

export default function Budget() {
    // États du composant
    const [depensesForm, setDepensesForm] = useState([{
        description: "",
        montant: 0,
        categorie: "",
        date: new Date()
    }]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // États des modales
    const [showModal, setShowModal] = useState(false);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [showRevenuForm, setShowRevenuForm] = useState(false);

    // États d'affichage - NOUVEAU SYSTÈME D'ONGLETS
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, expenses, analytics, tools, history
    const [showFilters, setShowFilters] = useState(false);

    // États pour la modification
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        montant: "",
        description: "",
        categorie: "",
        dateTransaction: "",
    });

    // États pour l'historique des budgets
    const [showBudgetHistory, setShowBudgetHistory] = useState(false);
    const [budgetSearchTerm, setBudgetSearchTerm] = useState('');
    const [budgetSearchYear, setBudgetSearchYear] = useState('');

    // Nouveaux états pour la pagination/limitation
    const [maxDepensesDisplay, setMaxDepensesDisplay] = useState(50);
    const [showAllDepenses, setShowAllDepenses] = useState(false);

    // États de filtrage
    const [filterId, setFilterId] = useState('');
    const [filterMontant, setFilterMontant] = useState('');
    const [filterDescription, setFilterDescription] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const notify = useNotify();
    const bilanRef = useRef();

    const {
        depenses, revenus, categories,
        fetchDepenses, fetchCategories, fetchRevenus,
        addDepense, deleteDepense, updateDepense
    } = useBudgetStore();

    useEffect(() => {
        fetchDepenses();
        fetchCategories();
        fetchRevenus();
    }, []);

    // Réinitialiser l'affichage quand on change de mois/année
    useEffect(() => {
        setShowAllDepenses(false);
        setFilterId('');
        setFilterMontant('');
        setFilterDescription('');
        setFilterCategorie('');
        setFilterDate('');
    }, [selectedMonth, selectedYear]);

    // Fonctions utilitaires
    const updateDepenseField = (index, field, value) => {
        const updated = [...depensesForm];
        updated[index][field] = value;
        setDepensesForm(updated);
    };

    const addLigneDepense = () => {
        setDepensesForm([...depensesForm, {
            description: "",
            montant: 0,
            categorie: "",
            date: new Date()
        }]);
    };

    const removeLigneDepense = (index) => {
        const updated = depensesForm.filter((_, i) => i !== index);
        setDepensesForm(updated);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        for (const dep of depensesForm) {
            await addDepense(dep, notify);
        }
        setDepensesForm([{ description: "", montant: 0, categorie: "", date: new Date() }]);
        setShowDepenseForm(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette dépense ?")) return;
        await deleteDepense(id, notify);
    };

    const handleEdit = (expense) => {
        const foundCategory = categories.find(c => c.id === expense.categorie || c.categorie === expense.categorie);
        setEditData({
            montant: expense.montant,
            description: expense.description,
            categorie: foundCategory?.id || expense.categorie || "",
            dateTransaction: expense.dateTransaction.split("T")[0],
        });
        setEditingId(expense.id);
    };

    const handleEditSubmit = async (id) => {
        const date = new Date(editData.dateTransaction);
        await updateDepense(
            {
                id,
                montant: editData.montant,
                description: editData.description,
                categorie: parseInt(editData.categorie),
                date,
            },
            notify
        );
        setEditingId(null);
        await fetchDepenses();
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditData({
            montant: "",
            description: "",
            categorie: "",
            dateTransaction: "",
        });
    };

    // Calculs financiers
    const revenusFiltres = (revenus || []).filter(r => {
        const d = new Date(r.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    const depensesFiltres = (depenses || []).filter(d => {
        const dDate = new Date(d.dateTransaction);
        return dDate.getMonth() === selectedMonth && dDate.getFullYear() === selectedYear;
    });

    const totalRevenus = revenusFiltres.reduce((acc, val) => acc + parseFloat(val.amount || 0), 0);
    const totalDepenses = depensesFiltres.reduce((acc, val) => acc + parseFloat(val.montant || 0), 0);
    const solde = totalRevenus - totalDepenses;
    const tauxEpargne = totalRevenus > 0 ? (solde / totalRevenus) * 100 : 0;

    const getSoldeStatus = () => {
        if (solde > totalRevenus * 0.2) return 'excellent';
        if (solde > 0) return 'good';
        if (solde > -totalRevenus * 0.1) return 'warning';
        return 'danger';
    };

    const getFinancialAdvice = () => {
        if (tauxEpargne >= 20) return {
            icon: <Target className="advice-icon success" />,
            text: "Excellent ! Vous épargnez plus de 20% de vos revenus.",
            type: "success"
        };
        if (tauxEpargne >= 10) return {
            icon: <PiggyBank className="advice-icon good" />,
            text: "Bon rythme d'épargne. Essayez d'atteindre 20%.",
            type: "good"
        };
        if (tauxEpargne > 0) return {
            icon: <AlertCircle className="advice-icon warning" />,
            text: "Épargne faible. Réduisez vos dépenses non essentielles.",
            type: "warning"
        };
        return {
            icon: <AlertCircle className="advice-icon danger" />,
            text: "Attention ! Vous dépensez plus que vos revenus.",
            type: "danger"
        };
    };

    const downloadBilanPDF = () => {
        const input = bilanRef.current;
        if (!input) return;
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`bilan-budget-${selectedMonth + 1}-${selectedYear}.pdf`);
        });
    };

    const clearFilters = () => {
        setFilterId('');
        setFilterMontant('');
        setFilterDescription('');
        setFilterCategorie('');
        setFilterDate('');
        setShowAllDepenses(false);
    };

    // Filtrage intelligent des dépenses avec limitation
    const filteredDepenses = depensesFiltres.filter(dep =>
        (!filterId || String(dep.id).includes(filterId)) &&
        (!filterMontant || String(dep.montant).includes(filterMontant)) &&
        (!filterDescription || dep.description.toLowerCase().includes(filterDescription.toLowerCase())) &&
        (!filterCategorie || String(dep.categorie).toLowerCase().includes(filterCategorie.toLowerCase())) &&
        (!filterDate || new Date(dep.dateTransaction).toLocaleDateString('fr-FR').includes(filterDate))
    );

    // Tri par date décroissante et limitation d'affichage
    const sortedFilteredDepenses = filteredDepenses
        .sort((a, b) => new Date(b.dateTransaction) - new Date(a.dateTransaction));

    const displayedDepenses = showAllDepenses
        ? sortedFilteredDepenses
        : sortedFilteredDepenses.slice(0, maxDepensesDisplay);

    const hasMoreDepenses = !showAllDepenses && sortedFilteredDepenses.length > maxDepensesDisplay;

    const advice = getFinancialAdvice();

    // Génération de l'historique des budgets
    const generateBudgetHistory = () => {
        const history = [];
        const currentDate = new Date();

        // Générer les 24 derniers mois (2 ans)
        for (let i = 0; i < 24; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();

            // Filtrer les données pour ce mois
            const monthRevenus = (revenus || []).filter(r => {
                const d = new Date(r.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });

            const monthDepenses = (depenses || []).filter(d => {
                const dDate = new Date(d.dateTransaction);
                return dDate.getMonth() === month && dDate.getFullYear() === year;
            });

            const totalRevenusMois = monthRevenus.reduce((acc, val) => acc + parseFloat(val.amount || 0), 0);
            const totalDepensesMois = monthDepenses.reduce((acc, val) => acc + parseFloat(val.montant || 0), 0);
            const soldeMois = totalRevenusMois - totalDepensesMois;

            history.push({
                month,
                year,
                monthName: date.toLocaleString('fr-FR', { month: 'long' }),
                totalRevenus: totalRevenusMois,
                totalDepenses: totalDepensesMois,
                solde: soldeMois,
                isCurrentMonth: month === selectedMonth && year === selectedYear,
                depensesCount: monthDepenses.length,
                revenusCount: monthRevenus.length
            });
        }

        return history;
    };

    const budgetHistory = generateBudgetHistory();

    // Filtrer l'historique selon la recherche
    const filteredBudgetHistory = budgetHistory.filter(budget => {
        const matchesSearchTerm = budgetSearchTerm === '' ||
            budget.monthName.toLowerCase().includes(budgetSearchTerm.toLowerCase());
        const matchesYear = budgetSearchYear === '' ||
            budget.year.toString() === budgetSearchYear;
        return matchesSearchTerm && matchesYear;
    });

    // Les 6 derniers budgets (excluant le mois courant)
    const recentBudgets = budgetHistory.filter(b => !b.isCurrentMonth).slice(0, 6);

    return (
        <div className="budget-container">
            {/* === 1. HEADER PRINCIPAL === */}
            <header className="budget-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <Wallet className="title-icon" />
                        Gestionnaire de Budget
                    </h1>
                    <p className="page-subtitle">
                        Prenez le contrôle de vos finances personnelles
                    </p>
                </div>
            </header>

            {/* === 2. NAVIGATION ET PÉRIODE === */}
            <section className="control-section">
                <div className="date-selector-card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <Calendar size={20} />
                            Période de consultation
                        </h3>
                    </div>
                    <div className="date-controls">
                        <div className="input-group">
                            <label>Mois</label>
                            <select
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                                className="modern-select"
                            >
                                {Array.from({length: 12}).map((_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(0, i).toLocaleString('fr-FR', {month: 'long'})}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="input-group">
                            <label>Année</label>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={e => setSelectedYear(parseInt(e.target.value))}
                                className="modern-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="modern-navigation-container">
                    <nav className="modern-nav">
                        <div className="nav-menu">
                            <button
                                className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                                onClick={() => setActiveTab('dashboard')}
                                title="Tableau de bord - Vue d'ensemble financière"
                            >
                                <div className="nav-icon">
                                    <Wallet size={22} />
                                </div>
                            </button>

                            <button
                                className={`nav-item ${activeTab === 'expenses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('expenses')}
                                title="Dépenses - Gestion détaillée"
                            >
                                <div className="nav-icon">
                                    <Table size={22} />
                                </div>
                            </button>

                            <button
                                className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setActiveTab('analytics')}
                                title="Analyses - Graphiques & rapports"
                            >
                                <div className="nav-icon">
                                    <BarChartBig size={22} />
                                </div>
                            </button>

                            <button
                                className={`nav-item ${activeTab === 'tools' ? 'active' : ''}`}
                                onClick={() => setActiveTab('tools')}
                                title="Outils - Import & export"
                            >
                                <div className="nav-icon">
                                    <FilePlus size={22} />
                                </div>
                            </button>

                            <button
                                className={`nav-item ${activeTab === 'history' ? 'active' : ''}`}
                                onClick={() => setActiveTab('history')}
                                title="Historique - Archives & tendances"
                            >
                                <div className="nav-icon">
                                    <Calendar size={22} />
                                </div>
                            </button>
                        </div>
                    </nav></div>

                    {/* Actions rapides - Réorganisées */}
                    <div className="quick-actions">
                        <div className="primary-actions">
                            <button
                                className="btn btn-primary btn-lg"
                                onClick={() => setShowDepenseForm(true)}
                                title="Ajouter une ou plusieurs dépenses"
                            >
                                <Plus size={20} />
                            </button>
                            <button
                                className="btn btn-success btn-lg"
                                onClick={() => setShowRevenuForm(true)}
                                title="Ajouter un nouveau revenu"
                            >
                                <TrendingUp size={20} />
                            </button>
                        </div>
                        <div className="secondary-actions">
                            <button
                                className="btn btn-outline btn-compact"
                                onClick={() => setShowModal(true)}
                                title="Gérer les catégories de dépenses"
                            >
                                <Settings size={18} />
                            </button>
                        </div>
                    </div>
            </section>

            {/* === CONTENU DES ONGLETS === */}
            <div className="tab-content">
                {/* ONGLET 1: TABLEAU DE BORD */}
                {activeTab === 'dashboard' && (
                    <div className="tab-panel">
                        {/* Bilan financier principal */}
                        <section className="dashboard-section">
                            <div className={`bilan-card ${getSoldeStatus()}`} ref={bilanRef}>
                                <div className="bilan-header">
                                    <h2 className="bilan-title">
                                        Bilan de {new Date(selectedYear, selectedMonth).toLocaleString('fr-FR', {
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                    </h2>
                                    <button
                                        className="btn btn-outline"
                                        onClick={downloadBilanPDF}
                                        title="Télécharger PDF"
                                    >
                                        <Download size={18} />
                                    </button>
                                </div>

                                <div className="bilan-grid">
                                    <div className="stat-card revenue">
                                        <div className="stat-icon">
                                            <TrendingUp />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Revenus</span>
                                            <span className="stat-value">{totalRevenus.toFixed(2)} €</span>
                                        </div>
                                    </div>

                                    <div className="stat-card expense">
                                        <div className="stat-icon">
                                            <TrendingDown />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Dépenses</span>
                                            <span className="stat-value">{totalDepenses.toFixed(2)} €</span>
                                        </div>
                                    </div>

                                    <div className={`stat-card balance ${getSoldeStatus()}`}>
                                        <div className="stat-icon">
                                            <Wallet />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Solde</span>
                                            <span className="stat-value">{solde.toFixed(2)} €</span>
                                        </div>
                                    </div>

                                    <div className="stat-card savings">
                                        <div className="stat-icon">
                                            <PiggyBank />
                                        </div>
                                        <div className="stat-content">
                                            <span className="stat-label">Taux d'épargne</span>
                                            <span className="stat-value">{tauxEpargne.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Conseil financier */}
                                <div className={`financial-advice ${advice.type}`}>
                                    {advice.icon}
                                    <span>{advice.text}</span>
                                </div>

                                {/* Cochon épargne amélioré */}
                                <div className="piggy-section">
                                    <div className="piggy-container">
                                        <div
                                            className="piggy-wrapper"
                                            style={{
                                                transform: `scale(${totalRevenus > 0 ? Math.max(Math.min(solde / totalRevenus, 1.2), 0.3) : 0.3})`
                                            }}
                                        >
                                            <img
                                                src="/assets/pigs/pig_1.png"
                                                alt="Cochon épargne"
                                                className="piggy-image"
                                            />
                                        </div>
                                        <div className="piggy-stats">
                                            <p className="piggy-text">
                                                Vous avez économisé <strong>{solde.toFixed(2)} €</strong>
                                            </p>
                                            <p className="piggy-percentage">
                                                {tauxEpargne.toFixed(1)}% de vos revenus
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ONGLET 2: DÉPENSES DÉTAILLÉES */}
                {activeTab === 'expenses' && (
                    <div className="tab-panel">
                        <section className="data-section">
                            <div className="table-section">
                                <div className="table-header">
                                    <div>
                                        <h2 className="section-title">
                                            <Table size={24} />
                                            Dépenses du mois ({displayedDepenses.length} sur {sortedFilteredDepenses.length})
                                        </h2>
                                        <p className="section-subtitle">
                                            Affichage des dépenses les plus récentes du mois sélectionné
                                        </p>
                                    </div>
                                    <div className="table-actions">
                                        <button
                                            className={`btn btn-outline ${showFilters ? 'active' : ''}`}
                                            onClick={() => setShowFilters(!showFilters)}
                                            title="Filtres"
                                        >
                                            <Filter size={18} />
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            onClick={clearFilters}
                                            title="Réinitialiser"
                                        >
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Options d'affichage */}
                                <div className="display-controls">
                                    <div className="control-group">
                                        <label>Nombre d'éléments :</label>
                                        <select
                                            value={maxDepensesDisplay}
                                            onChange={(e) => {
                                                setMaxDepensesDisplay(parseInt(e.target.value));
                                                setShowAllDepenses(false);
                                            }}
                                            className="control-select"
                                        >
                                            <option value={25}>25 dépenses</option>
                                            <option value={50}>50 dépenses</option>
                                            <option value={100}>100 dépenses</option>
                                            <option value={1000}>1000 dépenses</option>
                                        </select>
                                    </div>
                                    <div className="display-info">
                                        <span className="info-text">
                                            {showAllDepenses
                                                ? `Affichage de toutes les ${displayedDepenses.length} dépenses`
                                                : `Affichage de ${displayedDepenses.length} sur ${sortedFilteredDepenses.length} dépenses`
                                            }
                                        </span>
                                    </div>
                                    {hasMoreDepenses && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setShowAllDepenses(true)}
                                            title={`Voir toutes (${sortedFilteredDepenses.length})`}
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    )}
                                    {showAllDepenses && (
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            onClick={() => setShowAllDepenses(false)}
                                            title="Voir moins"
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                    )}
                                </div>

                                {showFilters && (
                                    <div className="filters-panel">
                                        <div className="filters-grid">
                                            <div className="filter-item">
                                                <label>ID</label>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrer par ID"
                                                    value={filterId}
                                                    onChange={(e) => setFilterId(e.target.value)}
                                                    className="filter-input"
                                                />
                                            </div>
                                            <div className="filter-item">
                                                <label>Montant</label>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrer par montant"
                                                    value={filterMontant}
                                                    onChange={(e) => setFilterMontant(e.target.value)}
                                                    className="filter-input"
                                                />
                                            </div>
                                            <div className="filter-item">
                                                <label>Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrer par description"
                                                    value={filterDescription}
                                                    onChange={(e) => setFilterDescription(e.target.value)}
                                                    className="filter-input"
                                                />
                                            </div>
                                            <div className="filter-item">
                                                <label>Catégorie</label>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrer par catégorie"
                                                    value={filterCategorie}
                                                    onChange={(e) => setFilterCategorie(e.target.value)}
                                                    className="filter-input"
                                                />
                                            </div>
                                            <div className="filter-item">
                                                <label>Date</label>
                                                <input
                                                    type="text"
                                                    placeholder="Filtrer par date"
                                                    value={filterDate}
                                                    onChange={(e) => setFilterDate(e.target.value)}
                                                    className="filter-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="new-expense-table-container">
                                    {/* Nouveau tableau moderne avec design ultra clean */}
                                    <div className="table-wrapper">
                                        <div className="table-scroll">
                                            <table className="expense-data-table">
                                                <thead className="table-head">
                                                    <tr>
                                                        <th className="th-id">
                                                            <div className="th-content">
                                                                <span>ID</span>
                                                            </div>
                                                        </th>
                                                        <th className="th-amount">
                                                            <div className="th-content">
                                                                <span>Montant</span>
                                                            </div>
                                                        </th>
                                                        <th className="th-description">
                                                            <div className="th-content">
                                                                <span>Description</span>
                                                            </div>
                                                        </th>
                                                        <th className="th-category">
                                                            <div className="th-content">
                                                                <span>Catégorie</span>
                                                            </div>
                                                        </th>
                                                        <th className="th-date">
                                                            <div className="th-content">
                                                                <span>Date</span>
                                                            </div>
                                                        </th>
                                                        <th className="th-actions">
                                                            <div className="th-content">
                                                                <span>Actions</span>
                                                            </div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="table-body">
                                                    {displayedDepenses.map((dep, index) => (
                                                        <tr
                                                            key={dep.id}
                                                            className={`table-row ${editingId === dep.id ? 'row-editing' : ''} ${index % 2 === 0 ? 'row-even' : 'row-odd'}`}
                                                        >
                                                            <td className="td-id">
                                                                <div className="cell-content">
                                                                    <div className="id-badge">#{dep.id}</div>
                                                                </div>
                                                            </td>
                                                            <td className="td-amount">
                                                                <div className="cell-content">
                                                                    {editingId === dep.id ? (
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            value={editData.montant}
                                                                            onChange={(e) => setEditData({ ...editData, montant: e.target.value })}
                                                                            className="amount-edit-input"
                                                                        />
                                                                    ) : (
                                                                        <div className={`amount-display ${Number(dep.montant) >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                                                                            <span className="amount-value">{Number(dep.montant).toFixed(2)} €</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="td-description">
                                                                <div className="cell-content">
                                                                    {editingId === dep.id ? (
                                                                        <input
                                                                            type="text"
                                                                            value={editData.description}
                                                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                                            className="description-edit-input"
                                                                        />
                                                                    ) : (
                                                                        <div className="description-display">
                                                                            <span className="description-text">{dep.description || 'Sans description'}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="td-category">
                                                                <div className="cell-content">
                                                                    {editingId === dep.id ? (
                                                                        <select
                                                                            value={editData.categorie}
                                                                            onChange={(e) => setEditData({ ...editData, categorie: e.target.value })}
                                                                            className="category-edit-select"
                                                                        >
                                                                            <option value="">-- Choisir --</option>
                                                                            {categories.map((cat) => (
                                                                                <option key={cat.id} value={cat.id}>
                                                                                    {cat.categorie}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    ) : (
                                                                        <div className="category-display">
                                                                            <div className="category-pill">
                                                                                {dep?.iconName && <i className={dep.iconName}></i>}
                                                                                <span>{dep.categorie || 'Non classé'}</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="td-date">
                                                                <div className="cell-content">
                                                                    {editingId === dep.id ? (
                                                                        <input
                                                                            type="date"
                                                                            value={editData.dateTransaction}
                                                                            onChange={(e) => setEditData({ ...editData, dateTransaction: e.target.value })}
                                                                            className="date-edit-input"
                                                                        />
                                                                    ) : (
                                                                        <div className="date-display">
                                                                            <span className="date-value">
                                                                                {new Date(dep.dateTransaction).toLocaleDateString('fr-FR')}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="td-actions">
                                                                <div className="cell-content">
                                                                    <div className="action-buttons-container">
                                                                        {editingId === dep.id ? (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => handleEditSubmit(dep.id)}
                                                                                    className="action-button save-button"
                                                                                    title="Sauvegarder"
                                                                                >
                                                                                    <Check size={16} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={handleEditCancel}
                                                                                    className="action-button cancel-button"
                                                                                    title="Annuler"
                                                                                >
                                                                                    <X size={16} />
                                                                                </button>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <button
                                                                                    className="action-button edit-button"
                                                                                    onClick={() => handleEdit(dep)}
                                                                                    title="Modifier cette dépense"
                                                                                >
                                                                                    <Edit size={16} />
                                                                                </button>
                                                                                <button
                                                                                    className="action-button delete-button"
                                                                                    onClick={() => handleDelete(dep.id)}
                                                                                    title="Supprimer cette dépense"
                                                                                >
                                                                                    <Trash2 size={16} />
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Version mobile cards redesignées */}
                                    <div className="mobile-expense-grid">
                                        {displayedDepenses.map((dep, index) => (
                                            <div
                                                key={dep.id}
                                                className={`expense-mobile-card ${editingId === dep.id ? 'card-editing' : ''}`}
                                            >
                                                <div className="card-header-section">
                                                    <div className="card-id-badge">#{dep.id}</div>
                                                    <div className={`card-amount ${Number(dep.montant) >= 0 ? 'amount-positive' : 'amount-negative'}`}>
                                                        {editingId === dep.id ? (
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editData.montant}
                                                                onChange={(e) => setEditData({ ...editData, montant: e.target.value })}
                                                                className="mobile-amount-edit"
                                                            />
                                                        ) : (
                                                            <span>{Number(dep.montant).toFixed(2)} €</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="card-content-section">
                                                    <div className="card-field">
                                                        <label>Description</label>
                                                        <div className="field-value">
                                                            {editingId === dep.id ? (
                                                                <input
                                                                    type="text"
                                                                    value={editData.description}
                                                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                                                    className="mobile-text-edit"
                                                                />
                                                            ) : (
                                                                <span>{dep.description || 'Sans description'}</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="card-field">
                                                        <label>Catégorie</label>
                                                        <div className="field-value">
                                                            {editingId === dep.id ? (
                                                                <select
                                                                    value={editData.categorie}
                                                                    onChange={(e) => setEditData({ ...editData, categorie: e.target.value })}
                                                                    className="mobile-select-edit"
                                                                >
                                                                    <option value="">-- Choisir --</option>
                                                                    {categories.map((cat) => (
                                                                        <option key={cat.id} value={cat.id}>
                                                                            {cat.categorie}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <div className="mobile-category-pill">
                                                                    {dep?.iconName && <i className={dep.iconName}></i>}
                                                                    <span>{dep.categorie || 'Non classé'}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="card-field">
                                                        <label>Date</label>
                                                        <div className="field-value">
                                                            {editingId === dep.id ? (
                                                                <input
                                                                    type="date"
                                                                    value={editData.dateTransaction}
                                                                    onChange={(e) => setEditData({ ...editData, dateTransaction: e.target.value })}
                                                                    className="mobile-date-edit"
                                                                />
                                                            ) : (
                                                                <span>{new Date(dep.dateTransaction).toLocaleDateString('fr-FR')}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-actions-section">
                                                    {editingId === dep.id ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleEditSubmit(dep.id)}
                                                                className="mobile-action-btn save-btn"
                                                                title="Sauver"
                                                            >
                                                                <Check size={16} />
                                                            </button>
                                                            <button
                                                                onClick={handleEditCancel}
                                                                className="mobile-action-btn cancel-btn"
                                                                title="Annuler"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                className="mobile-action-btn edit-btn"
                                                                onClick={() => handleEdit(dep)}
                                                                title="Modifier"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button
                                                                className="mobile-action-btn delete-btn"
                                                                onClick={() => handleDelete(dep.id)}
                                                                title="Supprimer"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {displayedDepenses.length === 0 && (
                                        <div className="empty-state-new">
                                            <div className="empty-icon">
                                                <Layers size={64} />
                                            </div>
                                            <h3>Aucune dépense trouvée</h3>
                                            <p>Aucune dépense ne correspond à vos critères de filtrage pour ce mois.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ONGLET 3: ANALYSES & GRAPHIQUES */}
                {activeTab === 'analytics' && (
                    <div className="tab-panel">
                        <section className="analytics-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <BarChartBig size={24} />
                                    Analyses & Graphiques
                                </h2>
                                <p className="section-subtitle">
                                    Visualisations détaillées de vos finances
                                </p>
                            </div>

                            {/* Évolution mensuelle */}
                            <div className="chart-card featured-chart">
                                <h3 className="chart-title">
                                    <TrendingUp size={20} />
                                    Évolution mensuelle
                                </h3>
                                <MonthlyReportChart />
                            </div>

                            {/* Répartition par catégorie */}
                            <div className="chart-grid">
                                <div className="chart-card">
                                    <h3 className="chart-title">Répartition par catégorie</h3>
                                    <AllSpend depenses={depensesFiltres} />
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ONGLET 4: OUTILS & IMPORT */}
                {activeTab === 'tools' && (
                    <div className="tab-panel">
                        <section className="tools-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <FilePlus size={24} />
                                    Outils & Import
                                </h2>
                                <p className="section-subtitle">
                                    Importez et gérez vos données financières
                                </p>
                            </div>
                            <div className="tools-grid">
                                <BilanFinancier />
                                <ImportTicket />
                            </div>
                        </section>
                    </div>
                )}

                {/* ONGLET 5: HISTORIQUE DES BUDGETS */}
                {activeTab === 'history' && (
                    <div className="tab-panel">
                        <section className="history-section">
                            <div className="section-header">
                                <h2 className="section-title">
                                    <Calendar size={24} />
                                    Historique des budgets
                                </h2>
                                <p className="section-subtitle">
                                    Consultez vos budgets précédents et naviguez dans l'historique
                                </p>
                            </div>

                            {/* 6 derniers budgets */}
                            <div className="recent-budgets-section">
                                <div className="subsection-header">
                                    <h3 className="subsection-title">
                                        <Eye size={20} />
                                        6 derniers budgets
                                    </h3>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => setShowBudgetHistory(!showBudgetHistory)}
                                    >
                                        {showBudgetHistory ? (
                                            <>
                                                <EyeOff size={18} />
                                                Masquer la recherche
                                            </>
                                        ) : (
                                            <>
                                                <Eye size={18} />
                                                Rechercher d'autres budgets
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="budgets-grid">
                                    {recentBudgets.map((budget, index) => (
                                        <div
                                            key={`${budget.year}-${budget.month}`}
                                            className={`budget-card ${budget.solde < 0 ? 'negative' : 'positive'} ${budget.isCurrentMonth ? 'current' : ''}`}
                                            onClick={() => {
                                                setSelectedMonth(budget.month);
                                                setSelectedYear(budget.year);
                                                setActiveTab('dashboard');
                                            }}
                                        >
                                            <div className="budget-card-header">
                                                <h4 className="budget-month">
                                                    {budget.monthName} {budget.year}
                                                </h4>
                                                <div className="budget-stats-mini">
                                                    <span className="stat-mini">{budget.depensesCount} dépenses</span>
                                                    <span className="stat-mini">{budget.revenusCount} revenus</span>
                                                </div>
                                            </div>

                                            <div className="budget-amounts">
                                                <div className="amount-row revenue">
                                                    <span className="amount-label">Revenus</span>
                                                    <span className="amount-value">+{budget.totalRevenus.toFixed(2)}€</span>
                                                </div>
                                                <div className="amount-row expense">
                                                    <span className="amount-label">Dépenses</span>
                                                    <span className="amount-value">-{budget.totalDepenses.toFixed(2)}€</span>
                                                </div>
                                                <div className={`amount-row balance ${budget.solde >= 0 ? 'positive' : 'negative'}`}>
                                                    <span className="amount-label">Solde</span>
                                                    <span className="amount-value">{budget.solde.toFixed(2)}€</span>
                                                </div>
                                            </div>

                                            <div className="budget-card-footer">
                                                <button className="view-budget-btn" title="Consulter">
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recherche dans l'historique */}
                            {showBudgetHistory && (
                                <div className="budget-search-section">
                                    <div className="search-header">
                                        <h3 className="subsection-title">
                                            <Filter size={20} />
                                            Rechercher dans l'historique
                                        </h3>
                                    </div>

                                    <div className="search-controls">
                                        <div className="search-filters">
                                            <div className="filter-group">
                                                <label>Rechercher par mois</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: janvier, février..."
                                                    value={budgetSearchTerm}
                                                    onChange={(e) => setBudgetSearchTerm(e.target.value)}
                                                    className="search-input"
                                                />
                                            </div>
                                            <div className="filter-group">
                                                <label>Année</label>
                                                <select
                                                    value={budgetSearchYear}
                                                    onChange={(e) => setBudgetSearchYear(e.target.value)}
                                                    className="search-select"
                                                >
                                                    <option value="">Toutes les années</option>
                                                    {[...new Set(budgetHistory.map(b => b.year))].sort((a, b) => b - a).map(year => (
                                                        <option key={year} value={year}>{year}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button
                                                className="btn btn-outline"
                                                onClick={() => {
                                                    setBudgetSearchTerm('');
                                                    setBudgetSearchYear('');
                                                }}
                                                title="Réinitialiser"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="search-results">
                                        <div className="results-header">
                                            <h4>Résultats ({filteredBudgetHistory.length})</h4>
                                        </div>
                                        <div className="results-table-container">
                                            <table className="budgets-table">
                                                <thead>
                                                    <tr>
                                                        <th>Période</th>
                                                        <th>Revenus</th>
                                                        <th>Dépenses</th>
                                                        <th>Solde</th>
                                                        <th>Opérations</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredBudgetHistory.map((budget) => (
                                                        <tr key={`${budget.year}-${budget.month}`} className={budget.isCurrentMonth ? 'current-row' : ''}>
                                                            <td>
                                                                <div className="period-cell">
                                                                    <span className="month-name">{budget.monthName}</span>
                                                                    <span className="year">{budget.year}</span>
                                                                    {budget.isCurrentMonth && <span className="current-badge">Actuel</span>}
                                                                </div>
                                                            </td>
                                                            <td className="amount revenue">+{budget.totalRevenus.toFixed(2)}€</td>
                                                            <td className="amount expense">-{budget.totalDepenses.toFixed(2)}€</td>
                                                            <td className={`amount balance ${budget.solde >= 0 ? 'positive' : 'negative'}`}>
                                                                {budget.solde.toFixed(2)}€
                                                            </td>
                                                            <td>
                                                                <div className="operations-cell">
                                                                    <span className="op-count revenue-count">{budget.revenusCount} revenus</span>
                                                                    <span className="op-count expense-count">{budget.depensesCount} dépenses</span>
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-primary btn-sm"
                                                                    onClick={() => {
                                                                        setSelectedMonth(budget.month);
                                                                        setSelectedYear(budget.year);
                                                                        setActiveTab('dashboard');
                                                                    }}
                                                                    title="Consulter"
                                                                >
                                                                    <Eye size={14} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {filteredBudgetHistory.length === 0 && (
                                            <div className="empty-state">
                                                <Calendar size={48} />
                                                <h3>Aucun budget trouvé</h3>
                                                <p>Aucun budget ne correspond à vos critères de recherche.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {/* === MODALES === */}
            {showModal && (
                <ModalCategorie
                    onClose={() => {
                        setShowModal(false);
                        fetchCategories();
                    }}
                />
            )}

            {showRevenuForm && (
                <div className="modal-overlay">
                    <div className="modal-content revenue-form-modal">
                        <div className="modal-header">
                            <h3>Ajouter un revenu</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowRevenuForm(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <RevenueManager onClose={() => setShowRevenuForm(false)} />
                        </div>
                    </div>
                </div>
            )}

            {showDepenseForm && (
                <div className="modal-overlay">
                    <div className="modal-content expense-form-modal">
                        <div className="modal-header">
                            <h3>Ajouter des dépenses</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowDepenseForm(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreate} className="expense-form">
                            <div className="form-rows">
                                {depensesForm.map((dep, index) => (
                                    <div key={index} className="expense-row">
                                        <div className="row-header">
                                            <span className="row-number">Dépense #{index + 1}</span>
                                            {depensesForm.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeLigneDepense(index)}
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="form-grid">
                                            <div className="input-group">
                                                <label>Description</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: Courses alimentaires"
                                                    value={dep.description}
                                                    onChange={(e) => updateDepenseField(index, "description", e.target.value)}
                                                    className="modern-input"
                                                />
                                            </div>

                                            <div className="input-group">
                                                <label>Montant (€)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="0.00"
                                                    value={dep.montant}
                                                    onChange={(e) => updateDepenseField(index, "montant", e.target.value)}
                                                    onBlur={(e) => {
                                                        let val = parseFloat(e.target.value);
                                                        if (isNaN(val)) val = 0;
                                                        else val = parseFloat(val.toFixed(2));
                                                        updateDepenseField(index, "montant", val);
                                                    }}
                                                    className="modern-input"
                                                />
                                            </div>

                                            <div className="input-group">
                                                <label>Catégorie</label>
                                                <select
                                                    value={dep.categorie}
                                                    onChange={(e) => updateDepenseField(index, "categorie", e.target.value)}
                                                    className="modern-select"
                                                >
                                                    <option value="">-- Choisir une catégorie --</option>
                                                    {categories?.map(c => (
                                                        <option key={c.id} value={c.id}>{c.categorie}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="input-group">
                                                <label>Date</label>
                                                <DatePicker
                                                    selected={dep.date}
                                                    onChange={(date) => updateDepenseField(index, "date", date)}
                                                    dateFormat="dd/MM/yyyy"
                                                    className="modern-input"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={addLigneDepense}
                                    title="Ajouter une ligne"
                                >
                                    <Plus size={18} />
                                </button>
                                <div className="action-buttons">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDepenseForm(false)}
                                        title="Annuler"
                                    >
                                        <X size={18} />
                                    </button>
                                    <button type="submit" className="btn btn-primary" title="Enregistrer les dépenses">
                                        <Save size={18} />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}