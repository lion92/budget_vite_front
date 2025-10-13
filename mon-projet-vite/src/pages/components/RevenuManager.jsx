import React, { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import './css/revenue.css';
import useBudgetStore from "../../useBudgetStore";
import { useNotify } from "./Notification";
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiTrendingUp } from "react-icons/fi";
import { toast } from './ui/Toast';

const RevenueManager = ({ onClose }) => {
    const [revenusForm, setRevenusForm] = useState([{ description: "", amount: 0, date: new Date() }]);
    const [isRecurrent, setIsRecurrent] = useState(false);
    const [recurrenceMonths, setRecurrenceMonths] = useState(1);
    const [lastAddedRevenue, setLastAddedRevenue] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
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

        // Validation
        const hasEmptyFields = revenusForm.some(rev =>
            !rev.description.trim() || !rev.amount || parseFloat(rev.amount) <= 0
        );

        if (hasEmptyFields) {
            toast.error("Veuillez remplir tous les champs correctement");
            return;
        }

        setIsLoading(true);

        try {
            const safeRecurrence = parseInt(recurrenceMonths, 10);
            const months = (!isNaN(safeRecurrence) && safeRecurrence > 0) ? safeRecurrence : 1;

            let totalAmount = 0;
            let addedCount = 0;

            for (const rev of revenusForm) {
                const amount = parseFloat(rev.amount);
                totalAmount += amount;

                if (isRecurrent) {
                    for (let i = 0; i < months; i++) {
                        const date = new Date(rev.date);
                        date.setMonth(date.getMonth() + i);
                        await addRevenu({
                            name: rev.description,
                            amount: amount,
                            date
                        }, notify);
                        addedCount++;
                    }
                } else {
                    await addRevenu({
                        name: rev.description,
                        amount: amount,
                        date: rev.date
                    }, notify);
                    addedCount++;
                }
            }

            // Notification de succès avec détails
            if (isRecurrent) {
                toast.success(
                    `${addedCount} revenus récurrents ajoutés`,
                    {
                        description: `Total: ${totalAmount.toFixed(2)}€ sur ${months} mois`,
                        duration: 4000
                    }
                );
            } else {
                toast.success(
                    `Revenu ajouté : ${totalAmount.toFixed(2)}€`,
                    {
                        description: revenusForm[0].description,
                        duration: 4000
                    }
                );
            }

            // Stocker le dernier revenu ajouté pour l'affichage
            setLastAddedRevenue({
                description: revenusForm[0].description,
                amount: totalAmount,
                count: addedCount,
                isRecurrent: isRecurrent,
                months: isRecurrent ? months : null,
                timestamp: Date.now()
            });

            // Réinitialiser le formulaire
            setRevenusForm([{ description: "", amount: 0, date: new Date() }]);
            setIsRecurrent(false);
            setRecurrenceMonths(1);
            fetchRevenus();

            // Effacer l'affichage après 5 secondes
            setTimeout(() => {
                setLastAddedRevenue(null);
            }, 5000);

            // Ne fermer que si demandé et pas de revenus récurrents
            if (onClose && !isRecurrent) {
                setTimeout(() => onClose(), 1500);
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout du revenu:", error);
            toast.error("Erreur lors de l'ajout du revenu", {
                description: "Veuillez réessayer"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Supprimer ce revenu ?")) {
            await deleteRevenu(id, notify);
        }
    };

    return (
        <div className="revenue-manager">
            <h2>Mes Revenus</h2>

            {/* Carte du dernier revenu ajouté */}
            <AnimatePresence>
                {lastAddedRevenue && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '1rem 1.5rem',
                            borderRadius: '12px',
                            marginBottom: '1.5rem',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}
                    >
                        <FiCheckCircle size={32} style={{ flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                                {lastAddedRevenue.isRecurrent
                                    ? `${lastAddedRevenue.count} revenus récurrents ajoutés`
                                    : 'Revenu ajouté avec succès'}
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                {lastAddedRevenue.amount.toFixed(2)} €
                                {lastAddedRevenue.isRecurrent && (
                                    <span style={{ fontSize: '0.875rem', marginLeft: '0.5rem' }}>
                                        × {lastAddedRevenue.months} mois
                                    </span>
                                )}
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                                {lastAddedRevenue.description}
                            </div>
                        </div>
                        <FiTrendingUp size={28} style={{ opacity: 0.7 }} />
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="form-depense">
                {revenusForm.map((rev, index) => (
                    <div key={index} className="revenu-row">
                        <input
                            type="text"
                            placeholder="Description du revenu"
                            value={rev.description}
                            onChange={e => updateRevenuField(index, "description", e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="Montant en euros"
                            value={rev.amount}
                            onChange={e => updateRevenuField(index, "amount", e.target.value)}
                            required
                            disabled={isLoading}
                        />
                        <DatePicker
                            selected={rev.date}
                            onChange={date => updateRevenuField(index, "date", date)}
                            dateFormat="dd/MM/yyyy"
                            disabled={isLoading}
                        />
                        {revenusForm.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeLigneRevenu(index)}
                                disabled={isLoading}
                            >
                                ❌
                            </button>
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
                    <button
                        type="button"
                        onClick={addLigneRevenu}
                        disabled={isLoading}
                    >
                        + Ajouter une ligne
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            opacity: isLoading ? 0.6 : 1,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoading ? 'Enregistrement...' : 'Enregistrer les revenus'}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Fermer
                        </button>
                    )}
                </div>
            </form>

            <div style={{ marginTop: '2rem' }}>
                <h3>Revenus enregistrés</h3>
                <AnimatePresence>
                    {(revenus || []).length > 0 ? (
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
                            {(revenus || []).map((rev, index) => (
                                <motion.tr
                                    key={rev.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <td style={{ color: '#16a34a', fontWeight: '500' }}>{rev.name}</td>
                                    <td style={{ fontWeight: 'bold' }}>{parseFloat(rev.amount).toFixed(2)} €</td>
                                    <td>{new Date(rev.date).toLocaleDateString("fr-FR")}</td>
                                    <td>
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleDelete(rev.id)}
                                            disabled={isLoading}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p style={{
                            color: '#9ca3af',
                            textAlign: 'center',
                            padding: '2rem',
                            background: 'rgba(0,0,0,0.02)',
                            borderRadius: '8px'
                        }}>
                            Aucun revenu enregistré pour le moment
                        </p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RevenueManager;
