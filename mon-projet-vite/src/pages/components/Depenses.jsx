import React, { useEffect, useRef, useState, useCallback } from "react";
import useBudgetStore from "../../useBudgetStore";
import DatePicker from "react-datepicker";
import { FilePlus, Upload, Table } from "lucide-react";
import "./css/budget_style.css";
import { useNotify } from "./Notification";
import { ImportData } from "./ImportData";
import ExpenseTable from "./ExpenseTable";
import EnhancedExpenseTable from "./EnhancedExpenseTable";

export function Depenses() {
    const [depensesForm, setDepensesForm] = useState([{ description: "", montant: 0, categorie: "", date: new Date() }]);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceMonths, setRecurrenceMonths] = useState(1);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showExpenseTable, setShowExpenseTable] = useState(false);
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
        const fetchAllData = async () => {
            await fetchDepenses();
            await fetchCategories();
            await fetchRevenus();
        };
        fetchAllData();
    }, [fetchDepenses, fetchCategories, fetchRevenus]);

    const updateDepenseField = useCallback((index, field, value) => {
        setDepensesForm(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    }, []);

    const addLigneDepense = useCallback(() => {
        setDepensesForm(prev => [...prev, { description: "", montant: 0, categorie: "", date: new Date() }]);
    }, []);

    const removeLigneDepense = useCallback((index) => {
        setDepensesForm(prev => prev.filter((_, i) => i !== index));
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();

        for (const dep of depensesForm) {
            if (isRecurrent) {
                for (let i = 0; i < recurrenceMonths; i++) {
                    const date = new Date(dep.date);
                    date.setMonth(date.getMonth() + i);
                    await addDepense({
                        ...dep,
                        date
                    }, notify);
                }
            } else {
                await addDepense(dep, notify);
            }
        }

        setDepensesForm([{ description: "", montant: 0, categorie: "", date: new Date() }]);
        setIsRecurrent(false);
        setRecurrenceMonths(1);
        setShowDepenseForm(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette dépense ?")) return;
        await deleteDepense(id, notify);
    };

    return (
        <>
            <div className="toolbar">
                <button onClick={() => setShowDepenseForm(true)}>
                    <FilePlus /> Ajouter des dépenses
                </button>
                <button onClick={() => setShowImportModal(true)} className="btn-import">
                    <Upload /> Importer des données
                </button>
            </div>

            {showDepenseForm && (
                <div className="modal-overlay">
                    <div className="modal-content expense-form-modal">
                        <div className="modal-header">
                            <h3>💰 Ajouter des dépenses</h3>
                            <button type="button" className="close-btn" onClick={() => setShowDepenseForm(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleCreate} className="expense-form">
                                <div className="form-rows">
                                    {depensesForm.map((dep, index) => (
                                        <div key={index} className="expense-row">
                                            <div className="row-header">
                                                <span className="row-number">Dépense #{index + 1}</span>
                                                {depensesForm.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="btn-danger btn-sm"
                                                        onClick={() => removeLigneDepense(index)}
                                                        title="Supprimer cette ligne"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                            <div className="form-grid">
                                                <div className="input-group">
                                                    <label>Description</label>
                                                    <input
                                                        placeholder="Description de la dépense"
                                                        value={dep.description}
                                                        onChange={(e) => updateDepenseField(index, "description", e.target.value)}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Montant (€)</label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        placeholder="0.00"
                                                        value={dep.montant}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (/^\d*(\.\d{0,2})?$/.test(val)) {
                                                                updateDepenseField(index, "montant", val);
                                                            }
                                                        }}
                                                        onBlur={(e) => {
                                                            const val = parseFloat(e.target.value);
                                                            updateDepenseField(index, "montant", isNaN(val) ? "0.00" : val.toFixed(2));
                                                        }}
                                                    />
                                                </div>
                                                <div className="input-group">
                                                    <label>Catégorie</label>
                                                    <select
                                                        value={dep.categorie}
                                                        onChange={(e) => updateDepenseField(index, "categorie", e.target.value)}
                                                    >
                                                        <option value="">-- Choisir une catégorie --</option>
                                                        {categories?.map(c => <option key={c.id} value={c.id}>{c.categorie}</option>)}
                                                    </select>
                                                </div>
                                                <div className="input-group">
                                                    <label>Date</label>
                                                    <DatePicker
                                                        selected={dep.date}
                                                        onChange={(date) => updateDepenseField(index, "date", date)}
                                                        dateFormat="dd/MM/yyyy"
                                                        placeholderText="Sélectionner une date"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="recurrente-options">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isRecurrent}
                                            onChange={(e) => setIsRecurrent(e.target.checked)}
                                        />
                                        <span>Dépense récurrente</span>
                                    </label>
                                    {isRecurrent && (
                                        <div className="recurrence-config">
                                            <label htmlFor="recurrence-months">Nombre de mois :</label>
                                            <input
                                                id="recurrence-months"
                                                type="number"
                                                min="1"
                                                max="24"
                                                value={recurrenceMonths}
                                                onChange={(e) => {
                                                    const val = parseInt(e.target.value, 10);
                                                    setRecurrenceMonths((!isNaN(val) && val > 0) ? val : 1);
                                                }}
                                                placeholder="Nombre de mois"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    <div className="action-buttons">
                                        <button type="button" className="btn-success" onClick={addLigneDepense}>
                                            ➕ Ajouter une ligne
                                        </button>
                                        <button type="submit" className="btn-primary btn-lg">
                                            💾 Enregistrer les dépenses
                                        </button>
                                        <button type="button" className="btn-secondary" onClick={() => setShowDepenseForm(false)}>
                                            ❌ Annuler
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && (
                <ImportData onClose={() => setShowImportModal(false)} />
            )}

            {showExpenseTable && (
                <div className="modal-overlay">
                    <div className="modal-content expense-table-modal enhanced-modal">
                        <div className="modal-header">
                            <h2>Gestion avancée des dépenses</h2>
                            <button onClick={() => setShowExpenseTable(false)} className="close-btn">
                                ✕
                            </button>
                        </div>
                        <div className="expense-table-wrapper">
                            <EnhancedExpenseTable />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
