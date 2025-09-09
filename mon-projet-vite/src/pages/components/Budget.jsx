import React, { useEffect, useRef, useState } from 'react';
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './css/budget_style.css';
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
    TrendingUp, TrendingDown, Wallet, Calendar, X, Plus, Trash2,
    Eye, EyeOff, Settings, PiggyBank, Target, AlertCircle, ChevronDown,
    ChevronUp, Layers
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

    // États d'affichage
    const [showDepenseTable, setShowDepenseTable] = useState(true);
    const [showGraph, setShowGraph] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

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
        addDepense, deleteDepense
    } = useBudgetStore();

    useEffect(() => {
        fetchDepenses();
        fetchCategories();
        fetchRevenus();
    }, []);

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

    const hasMoreDepenses = sortedFilteredDepenses.length > maxDepensesDisplay;

    const advice = getFinancialAdvice();

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

                <div className="actions-toolbar">
                    <div className="primary-actions">
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowDepenseForm(true)}
                        >
                            <Plus size={18} />
                            Ajouter des dépenses
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowRevenuForm(true)}
                        >
                            <TrendingUp size={18} />
                            Ajouter un revenu
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setShowModal(true)}
                        >
                            <Settings size={18} />
                            Gérer les catégories
                        </button>
                    </div>

                    <div className="view-toggles">
                        <button
                            className={`btn btn-toggle ${showGraph ? 'active' : ''}`}
                            onClick={() => setShowGraph(!showGraph)}
                        >
                            <BarChartBig size={18} />
                            Graphiques
                        </button>
                        <button
                            className={`btn btn-toggle ${showDepenseTable ? 'active' : ''}`}
                            onClick={() => setShowDepenseTable(!showDepenseTable)}
                        >
                            <Table size={18} />
                            Tableau
                        </button>
                    </div>
                </div>
            </section>

            {/* === 3. ÉVOLUTION MENSUELLE (DÉPLACÉE EN HAUT) === */}
            <section className="evolution-section">
                <div className="section-header">
                    <h2 className="section-title">
                        <TrendingUp size={24} />
                        Évolution mensuelle
                    </h2>
                    <p className="section-subtitle">
                        Suivez l'évolution de vos finances sur 12 mois
                    </p>
                </div>
                <div className="chart-card featured-chart">
                    <MonthlyReportChart />
                </div>
            </section>

            {/* === 4. BILAN FINANCIER PRINCIPAL === */}
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
                        >
                            <Download size={18} />
                            Télécharger PDF
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

            {/* === 5. OUTILS D'IMPORT === */}
            <section className="tools-section">
                <BilanFinancier />
                <ImportTicket />
            </section>

            {/* === 6. GRAPHIQUES DE RÉPARTITION === */}
            {showGraph && (
                <section className="analytics-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <BarChartBig size={24} />
                            Analyse des dépenses
                        </h2>
                    </div>
                    <div className="chart-grid">
                        <div className="chart-card">
                            <h3 className="chart-title">Répartition par catégorie</h3>
                            <AllSpend depenses={depensesFiltres} />
                        </div>
                    </div>
                </section>
            )}

            {/* === 7. TABLEAU DES DÉPENSES (FILTRÉES) === */}
            {showDepenseTable && (
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
                                >
                                    <Filter size={18} />
                                    Filtres
                                </button>
                                <button
                                    className="btn btn-outline"
                                    onClick={clearFilters}
                                >
                                    <RefreshCw size={18} />
                                    Réinitialiser
                                </button>
                            </div>
                        </div>

                        {/* Options d'affichage */}
                        <div className="display-controls">
                            <div className="control-group">
                                <label>Nombre d'éléments :</label>
                                <select
                                    value={maxDepensesDisplay}
                                    onChange={(e) => setMaxDepensesDisplay(parseInt(e.target.value))}
                                    className="control-select"
                                >
                                    <option value={25}>25 dépenses</option>
                                    <option value={50}>50 dépenses</option>
                                    <option value={100}>100 dépenses</option>
                                </select>
                            </div>
                            {hasMoreDepenses && !showAllDepenses && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowAllDepenses(true)}
                                >
                                    <ChevronDown size={16} />
                                    Voir toutes ({sortedFilteredDepenses.length})
                                </button>
                            )}
                            {showAllDepenses && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setShowAllDepenses(false)}
                                >
                                    <ChevronUp size={16} />
                                    Voir moins
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

                        <div className="table-container">
                            <table className="modern-table">
                                <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Montant</th>
                                    <th>Description</th>
                                    <th>Catégorie</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {displayedDepenses.map(dep => (
                                    <tr key={dep.id}>
                                        <td>
                                            <span className="table-id">#{dep.id}</span>
                                        </td>
                                        <td>
                                            <span className="amount">{dep.montant} €</span>
                                        </td>
                                        <td className="description">{dep.description}</td>
                                        <td>
                                            <div className="category-cell">
                                                {dep?.iconName && (
                                                    <i className={dep.iconName} style={{marginRight: '8px'}}></i>
                                                )}
                                                {dep.categorie}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="date">
                                                {new Date(dep.dateTransaction).toLocaleDateString('fr-FR')}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(dep.id)}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            {displayedDepenses.length === 0 && (
                                <div className="empty-state">
                                    <Layers size={48} />
                                    <h3>Aucune dépense trouvée</h3>
                                    <p>Aucune dépense ne correspond à vos critères de filtrage pour ce mois.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {/* === MODALES === */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <ModalCategorie
                            onClose={() => {
                                setShowModal(false);
                                fetchCategories();
                            }}
                        />
                    </div>
                </div>
            )}

            {showRevenuForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Ajouter un revenu</h3>
                            <button
                                className="close-btn"
                                onClick={() => setShowRevenuForm(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <RevenueManager onClose={() => setShowRevenuForm(false)} />
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
                                >
                                    <Plus size={18} />
                                    Ajouter une ligne
                                </button>
                                <div className="action-buttons">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowDepenseForm(false)}
                                    >
                                        Annuler
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Enregistrer les dépenses
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