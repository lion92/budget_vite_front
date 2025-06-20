import React, {useEffect, useRef, useState} from "react";
import useBudgetStore from "../../useBudgetStore";
import DatePicker from "react-datepicker";
import { FilePlus } from "lucide-react";
import "./css/budget_style.css";
import { useNotify } from "./Notification";
export function Depenses() {
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
        setDepensesForm([...depensesForm, {description: "", montant: 0, categorie: "", date: new Date()}]);
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
        setDepensesForm([{description: "", montant: 0, categorie: "", date: new Date()}]);
        setShowDepenseForm(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette dépense ?")) return;
        await deleteDepense(id, notify);
    };


    return (
        <>
            <div className="toolbar">
                <button onClick={() => setShowDepenseForm(true)}><FilePlus/> Ajouter des dépenses</button>
            </div>
            {showDepenseForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form onSubmit={handleCreate} className="form-depense">
                            {depensesForm.map((dep, index) => (
                                <div key={index} className="depense-row">
                                    <input placeholder="Description" value={dep.description}
                                           onChange={(e) => updateDepenseField(index, "description", e.target.value)}/>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        placeholder="Montant (entier)"
                                        value={dep.montant}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (/^-?\d*$/.test(val)) {
                                                updateDepenseField(index, "montant", val);
                                            }
                                        }}
                                        onBlur={(e) => {
                                            const val = parseInt(e.target.value, 10);
                                            updateDepenseField(index, "montant", isNaN(val) ? 0 : val);
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

        </>
    )
}