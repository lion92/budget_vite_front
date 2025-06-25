import React, { useEffect, useRef, useState, useCallback } from "react";
import useBudgetStore from "../../useBudgetStore";
import DatePicker from "react-datepicker";
import { FilePlus } from "lucide-react";
import "./css/budget_style.css";
import { useNotify } from "./Notification";

export function Depenses() {
    const [depensesForm, setDepensesForm] = useState([{ description: "", montant: 0, categorie: "", date: new Date() }]);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceMonths, setRecurrenceMonths] = useState(1);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
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
    }, []);

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
            </div>

            {showDepenseForm && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <form onSubmit={handleCreate} className="form-depense">
                            {depensesForm.map((dep, index) => (
                                <div key={index} className="depense-row">
                                    <input placeholder="Description" value={dep.description}
                                           onChange={(e) => updateDepenseField(index, "description", e.target.value)} />
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
                                                dateFormat="dd/MM/yyyy" />
                                    {depensesForm.length > 1 &&
                                        <button type="button" onClick={() => removeLigneDepense(index)}>❌</button>}
                                </div>
                            ))}

                            <div className="recurrente-options">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={isRecurrent}
                                        onChange={(e) => setIsRecurrent(e.target.checked)}
                                    />
                                    Dépense récurrente
                                </label>
                                {isRecurrent && (
                                    <input
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
                                )}

                            </div>

                            <button type="button" onClick={addLigneDepense}>+ Ajouter une ligne</button>
                            <button type="submit">Enregistrer les dépenses</button>
                            <button type="button" onClick={() => setShowDepenseForm(false)}>Fermer</button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
