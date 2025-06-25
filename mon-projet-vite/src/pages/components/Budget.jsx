// Refactor complet du composant Budget avec formulaires dans des modales, icônes stylées, et sections repliables

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
import { FilePlus, Table, BarChartBig } from 'lucide-react';
import ImportTicket from "./ImportTicket";

export default function Budget() {
    const [depensesForm, setDepensesForm] = useState([{ description: "", montant: 0, categorie: "", date: new Date() }]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [showRevenuForm, setShowRevenuForm] = useState(false);
    const [showDepenseTable, setShowDepenseTable] = useState(true);
    const [showGraph, setShowGraph] = useState(true);
    const [filterId, setFilterId] = useState('');
    const [filterMontant, setFilterMontant] = useState('');
    const [filterDescription, setFilterDescription] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const notify = useNotify();
    const bilanRef = useRef();


    const {
        depenses,
        revenus,
        categories,
        fetchDepenses,
        fetchCategories,
        fetchRevenus,
        addDepense,
        deleteDepense
    } = useBudgetStore();

    useEffect(() => {
        fetchDepenses();
        fetchCategories();
        fetchRevenus();
    }, []);

    const updateDepenseField = (index, field, value) => {
        const updated = [...depensesForm];
        updated[index][field] = value;
        setDepensesForm(updated);
    };

    const addLigneDepense = () => {
        setDepensesForm([...depensesForm, { description: "", montant: 0, categorie: "", date: new Date() }]);
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

    return (
        <div className="budget-container">
            <h1>Gestionnaire de Budget</h1>

            <BilanFinancier/>
            <ImportTicket></ImportTicket>

            <div className="toolbar">
                <button onClick={() => setShowDepenseForm(true)}><FilePlus/> Ajouter des dépenses</button>
                <button onClick={() => setShowRevenuForm(true)}><FilePlus/> Ajouter un revenu</button>
                <button onClick={() => setShowModal(true)}><FilePlus/> Ajouter une catégorie</button>
                <button onClick={() => setShowDepenseTable(!showDepenseTable)}>
                    <Table/> {showDepenseTable ? "Cacher" : "Voir"} tableau
                </button>
                <button onClick={() => setShowGraph(!showGraph)}>
                    <BarChartBig/> {showGraph ? "Cacher" : "Voir"} graphiques
                </button>
            </div>

            {showModal && (
                <ModalCategorie
                    onClose={() => {
                        setShowModal(false);
                        fetchCategories(); // <-- Recharge les catégories dès que la modale se ferme
                    }}
                />
            )}

            {showRevenuForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <RevenueManager onClose={() => setShowRevenuForm(false)}/>
                        <button type="button" onClick={() => setShowRevenuForm(false)}>Fermer</button>
                    </div>
                </div>
            )}

            {showDepenseForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form onSubmit={handleCreate} className="form-depense">
                            {depensesForm.map((dep, index) => (
                                <div key={index} className="depense-row">
                                    <input placeholder="Description" value={dep.description}
                                           onChange={(e) => updateDepenseField(index, "description", e.target.value)}/>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="Montant (ex : 12.34)"
                                        value={dep.montant}
                                        onChange={(e) => {
                                            // Laisser vide si l'utilisateur vide le champ
                                            updateDepenseField(index, "montant", e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            let val = parseFloat(e.target.value);
                                            if (isNaN(val)) {
                                                val = 0;
                                            } else {
                                                val = parseFloat(val.toFixed(2));
                                            }
                                            updateDepenseField(index, "montant", val);
                                        }}
                                    />

                                    <select value={dep.categorie}
                                            onChange={(e) => updateDepenseField(index, "categorie", e.target.value)}>
                                        <option value="">-- Choisir catégorie --</option>
                                        {categories?.map(c => <option key={c.id} value={c.id}>{c.categorie}</option>)}
                                    </select>
                                    <DatePicker selected={dep.date}
                                                onChange={(date) => updateDepenseField(index, "date", date)}
                                                dateFormat="dd/MM/yyyy"/>
                                    {depensesForm.length > 1 &&
                                        <button type="button" onClick={() => removeLigneDepense(index)}>❌</button>}
                                </div>
                            ))}
                            <button type="button" onClick={addLigneDepense}>+ Ajouter une ligne</button>
                            <button type="submit">Enregistrer les dépenses</button>
                            <button type="button" onClick={() => setShowDepenseForm(false)}>Fermer</button>
                        </form>
                    </div>
                </div>
            )}

            <div className="select-date">
                <label>Mois :
                    <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
                        {Array.from({length: 12}).map((_, i) => (
                            <option key={i} value={i}>{new Date(0, i).toLocaleString('fr-FR', {month: 'long'})}</option>
                        ))}
                    </select>
                </label>
                <label>Année :
                    <input type="number" value={selectedYear}
                           onChange={e => setSelectedYear(parseInt(e.target.value))}/>
                </label>
            </div>

            <div className="bilan-mensuel" ref={bilanRef}>
                <h2>Bilan de {new Date(selectedYear, selectedMonth).toLocaleString('fr-FR', {
                    month: 'long',
                    year: 'numeric'
                })}</h2>
                <p><strong>Revenus :</strong> {totalRevenus.toFixed(2)} €</p>
                <p><strong>Dépenses :</strong> {totalDepenses.toFixed(2)} €</p>
                <p><strong>Solde :</strong> {solde.toFixed(2)} €</p>
                <button onClick={downloadBilanPDF}>Télécharger le bilan PDF</button>
            </div>

            <div className="cochon-epargne">
                <h4>Votre cochon-épargne</h4>
                <div
                    className="piggy-wrapper"
                    style={{
                        transform: `scale(${totalRevenus > 0 ? Math.max(solde / totalRevenus, 0.2) : 0.2})`
                    }}
                >
                    <img
                        src="/assets/pigs/pig_1.png"
                        alt="Cochon épargne"
                        className="piggy-image"
                    />
                </div>
                <p>
                    Vous avez économisé <strong>{solde.toFixed(2)} €</strong> sur un total
                    de <strong>{totalRevenus.toFixed(2)} €</strong>.
                </p>
            </div>
            <p>
                Vous avez économisé <strong>{solde.toFixed(2)} €</strong> sur un total
                de <strong>{totalRevenus.toFixed(2)} €</strong>.
            </p>


    {
        showGraph && (
            <div className="chart-section">
                <AllSpend depenses={depensesFiltres}/>
                <MonthlyReportChart/>
            </div>
        )
    }

    {
        showDepenseTable && (
            <div>
                <h2>Dépenses</h2>
                <button onClick={() => {
                    setFilterId('');
                    setFilterMontant('');
                    setFilterDescription('');
                    setFilterCategorie('');
                        setFilterDate('');
                    }}>
                        Réinitialiser les filtres
                    </button>
                    <table>
                        <thead>
                        <tr>
                            <th>
                                ID
                                <input
                                    type="text"
                                    placeholder="Filtrer"
                                    value={filterId}
                                    onChange={(e) => setFilterId(e.target.value)}
                                />
                            </th>
                            <th>
                                Montant
                                <input
                                    type="text"
                                    placeholder="Filtrer"
                                    value={filterMontant}
                                    onChange={(e) => setFilterMontant(e.target.value)}
                                />
                            </th>
                            <th>
                                Description
                                <input
                                    type="text"
                                    placeholder="Filtrer"
                                    value={filterDescription}
                                    onChange={(e) => setFilterDescription(e.target.value)}
                                />
                            </th>
                            <th>
                                Catégorie
                                <input
                                    type="text"
                                    placeholder="Filtrer"
                                    value={filterCategorie}
                                    onChange={(e) => setFilterCategorie(e.target.value)}
                                />
                            </th>
                            <th>
                                Date
                                <input
                                    type="text"
                                    placeholder="Filtrer"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {depensesFiltres
                            .filter(dep =>
                                (!filterId || String(dep.id).includes(filterId)) &&
                                (!filterMontant || String(dep.montant).includes(filterMontant)) &&
                                (!filterDescription || dep.description.toLowerCase().includes(filterDescription.toLowerCase())) &&
                                (!filterCategorie || String(dep.categorie).toLowerCase().includes(filterCategorie.toLowerCase())) &&
                                (!filterDate || new Date(dep.dateTransaction).toLocaleDateString('fr-FR').includes(filterDate))
                            )
                            .map(dep => (
                                <tr key={dep.id}>
                                    <td>{dep.id}</td>
                                    <td>{dep.montant}</td>
                                    <td>{dep.description}</td>
                                    <td>{dep.categorie}<span style={{fontSize: 32, marginBottom: 10, color: 'black'}}>
                                        <i className={dep?.iconName}></i>
                                    </span></td>

                                    <td>{new Date(dep.dateTransaction).toLocaleDateString('fr-FR')}</td>
                                    <td>
                                        <button className="btn-danger" onClick={() => handleDelete(dep.id)}>Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
