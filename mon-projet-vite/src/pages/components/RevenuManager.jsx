import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './css/revenue.css';
import useBudgetStore from "../../useBudgetStore";
import { useNotify } from "./Notification";

const RevenueManager = ({ onClose }) => {
    const [revenusForm, setRevenusForm] = useState([{ description: "", amount: 0, date: new Date() }]);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceMonths, setRecurrenceMonths] = useState(1);
    const notify = useNotify();

    const {
        revenus,
        fetchRevenus,
        addRevenu,
        deleteRevenu
    } = useBudgetStore();

    useEffect(() => {
        fetchRevenus();
    }, []);

    const updateRevenuField = (index, field, value) => {
        const updated = [...revenusForm];
        updated[index][field] = value;
        setRevenusForm(updated);
    };

    const addLigneRevenu = () => {
        setRevenusForm(prev => [...prev, { description: "", amount: 0, date: new Date() }]);
    };

    const removeLigneRevenu = (index) => {
        setRevenusForm(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const safeRecurrence = parseInt(recurrenceMonths, 10);
        const months = (!isNaN(safeRecurrence) && safeRecurrence > 0) ? safeRecurrence : 1;

        for (const rev of revenusForm) {
            if (isRecurrent) {
                for (let i = 0; i < months; i++) {
                    const date = new Date(rev.date);
                    date.setMonth(date.getMonth() + i);
                    await addRevenu({
                        name: rev.description,
                        amount: parseFloat(rev.amount),
                        date
                    }, notify);
                }
            } else {
                await addRevenu({
                    name: rev.description,
                    amount: parseFloat(rev.amount),
                    date: rev.date
                }, notify);
            }
        }

        setRevenusForm([{ description: "", amount: 0, date: new Date() }]);
        setIsRecurrent(false);
        setRecurrenceMonths(1);
        fetchRevenus();
        if (onClose) onClose();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce revenu ?")) {
            await deleteRevenu(id, notify);
        }
    };

    return (
        <div className="revenue-manager">
            <h2>Mes Revenus</h2>

            <form onSubmit={handleSubmit} className="form-depense">
                {revenusForm.map((rev, index) => (
                    <div key={index} className="revenu-row">
                        <input
                            type="text"
                            placeholder="Description"
                            value={rev.description}
                            onChange={e => updateRevenuField(index, "description", e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Montant"
                            value={rev.amount}
                            onChange={e => updateRevenuField(index, "amount", e.target.value)}
                            required
                        />
                        <DatePicker
                            selected={rev.date}
                            onChange={date => updateRevenuField(index, "date", date)}
                            dateFormat="dd/MM/yyyy"
                        />
                        {revenusForm.length > 1 && (
                            <button type="button" onClick={() => removeLigneRevenu(index)}>❌</button>
                        )}
                    </div>
                ))}

                <div className="recurrente-options">
                    <label>
                        <input
                            type="checkbox"
                            checked={isRecurrent}
                            onChange={e => setIsRecurrent(e.target.checked)}
                        />
                        Revenu récurrent
                    </label>
                    {isRecurrent && (
                        <input
                            type="number"
                            min="1"
                            max="24"
                            value={recurrenceMonths}
                            onChange={e => {
                                const val = e.target.value;
                                if (val === "") {
                                    setRecurrenceMonths("");
                                } else {
                                    const num = parseInt(val, 10);
                                    if (!isNaN(num) && num > 0) {
                                        setRecurrenceMonths(num);
                                    }
                                }
                            }}
                            placeholder="Nombre de mois"
                        />
                    )}
                </div>

                <div className="button-row">
                    <button type="button" onClick={addLigneRevenu}>+ Ajouter une ligne</button>
                    <button type="submit">Enregistrer les revenus</button>
                    {onClose && <button type="button" onClick={onClose}>Fermer</button>}
                </div>
            </form>

            <table>
                <thead>
                <tr>
                    <th>Description</th>
                    <th>Montant</th>
                    <th>Date</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {(revenus || []).map(rev => (
                    <tr key={rev.id}>
                        <td>{rev.name}</td>
                        <td>{rev.amount} €</td>
                        <td>{new Date(rev.date).toLocaleDateString("fr-FR")}</td>
                        <td>
                            <button className="btn-danger" onClick={() => handleDelete(rev.id)}>Supprimer</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default RevenueManager;
