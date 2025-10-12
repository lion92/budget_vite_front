import React, { useEffect, useRef, useState, useCallback } from "react";
import useBudgetStore from "../../useBudgetStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FilePlus } from "lucide-react";
import "./css/budget_style.css";
import "./css/depense-modal.css";
import { useNotify } from "./Notification";

export function Depenses() {
    const [depensesForm, setDepensesForm] = useState([{ description: "", montant: 0, categorie: "", date: new Date() }]);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceMonths, setRecurrenceMonths] = useState(1);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const notify = useNotify();
    const bilanRef = useRef();

    // Gérer le scroll du body quand le modal est ouvert
    useEffect(() => {
        if (showDepenseForm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [showDepenseForm]);

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
            </div>

            {showDepenseForm && (
                <div className="depense-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowDepenseForm(false)} style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                    overflow: 'hidden'
                }}>
                    <div className="depense-modal" style={{
                        maxHeight: '80vh',
                        width: '100%',
                        maxWidth: '1200px',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                        overflow: 'hidden'
                    }}>
                        <div className="depense-modal-header" style={{
                            flexShrink: 0,
                            padding: '20px 30px',
                            borderBottom: '2px solid #e2e8f0',
                            background: '#f7fafc',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <h3 style={{margin: 0, fontSize: '1.5rem', fontWeight: 600, color: '#2d3748'}}>💰 Ajouter des dépenses</h3>
                            <button type="button" className="depense-modal-close" onClick={() => setShowDepenseForm(false)} style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer',
                                color: '#718096',
                                padding: '5px 10px'
                            }}>✕</button>
                        </div>

                        <div className="depense-modal-body" style={{
                            flex: 1,
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            padding: '30px',
                            backgroundColor: '#ffffff',
                            minHeight: 0
                        }}>
                            <form onSubmit={handleCreate} className="depense-form">
                                <div className="depense-list">
                                    {depensesForm.map((dep, index) => (
                                        <div key={index} className="depense-item">
                                            <div className="depense-item-header">
                                                <span className="depense-item-number">Dépense #{index + 1}</span>
                                                {depensesForm.length > 1 && (
                                                    <button
                                                        type="button"
                                                        className="depense-item-remove"
                                                        onClick={() => removeLigneDepense(index)}
                                                        title="Supprimer cette ligne"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>

                                            <div className="depense-fields">
                                                <div className="depense-field">
                                                    <label>Description</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Description de la dépense"
                                                        value={dep.description}
                                                        onChange={(e) => updateDepenseField(index, "description", e.target.value)}
                                                    />
                                                </div>

                                                <div className="depense-field">
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

                                                <div className="depense-field">
                                                    <label>Catégorie</label>
                                                    <select
                                                        value={dep.categorie}
                                                        onChange={(e) => updateDepenseField(index, "categorie", e.target.value)}
                                                    >
                                                        <option value="">-- Choisir une catégorie --</option>
                                                        {categories?.map(c => <option key={c.id} value={c.id}>{c.categorie}</option>)}
                                                    </select>
                                                </div>

                                                <div className="depense-field">
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

                                <div className="depense-recurrent">
                                    <div className="depense-recurrent-check">
                                        <input
                                            type="checkbox"
                                            id="recurrent-checkbox"
                                            checked={isRecurrent}
                                            onChange={(e) => setIsRecurrent(e.target.checked)}
                                        />
                                        <label htmlFor="recurrent-checkbox">🔄 Dépense récurrente</label>
                                    </div>

                                    {isRecurrent && (
                                        <div className="depense-recurrent-config">
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

                                <div className="depense-actions">
                                    <button type="button" className="depense-btn depense-btn-add" onClick={addLigneDepense}>
                                        ➕ Ajouter une ligne
                                    </button>
                                    <button type="submit" className="depense-btn depense-btn-save">
                                        💾 Enregistrer les dépenses
                                    </button>
                                    <button type="button" className="depense-btn depense-btn-cancel" onClick={() => setShowDepenseForm(false)}>
                                        ❌ Annuler
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}
