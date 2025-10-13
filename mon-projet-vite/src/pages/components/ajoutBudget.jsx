import React, { useState, useEffect, useCallback } from 'react';
import { RiPassPendingLine } from "react-icons/ri";
import { MdOutlineDescription } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { CiCalendarDate } from "react-icons/ci";
import { FiCheckCircle } from "react-icons/fi";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from './ui/Toast';
import lien from "./lien";

function AjoutBudget() {
    const [listDesDepense, setListDesDepense] = useState([]);
    const [catAll, setCatAll] = useState([]);
    const [montant, setMontant] = useState(0);
    const [actionCategorie, setActionCategorie] = useState("");
    const [actionDescription, setActionDescription] = useState("");
    const [datePick, setDatePick] = useState(new Date());
    const [messageAjout, setMessageAjout] = useState("");
    const [lastAddedExpense, setLastAddedExpense] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Fonction pour ajouter une dépense
    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!montant || !actionCategorie || !actionDescription) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        if (parseFloat(montant) <= 0) {
            toast.error("Le montant doit être supérieur à 0");
            return;
        }

        setIsLoading(true);

        try {
            const str = localStorage.getItem('jwt');

            // Trouver le nom de la catégorie
            const categorieObj = catAll.find(cat => cat.id === parseInt(actionCategorie));
            const categorieNom = categorieObj ? categorieObj.categorie : actionCategorie;

            const response = await fetch(lien.url + "action", {
                method: "POST",
                body: JSON.stringify({
                    montant,
                    categorie: actionCategorie,
                    description: actionDescription,
                    user: parseInt("" + localStorage.getItem("utilisateur")),
                    dateTransaction: datePick.toLocaleString("zh-CN", { timeZone: 'Europe/Paris' }),
                    jwt: str,
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                // Mise à jour de la liste des dépenses
                const newExpense = {
                    montant: parseFloat(montant),
                    categorie: categorieNom,
                    categorieId: actionCategorie,
                    description: actionDescription,
                    dateTransaction: datePick.toLocaleString("fr-FR", {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }),
                    timestamp: Date.now()
                };

                setListDesDepense([newExpense, ...listDesDepense]);
                setLastAddedExpense(newExpense);

                // Toast de succès avec détails
                toast.success(
                    `Dépense ajoutée : ${parseFloat(montant).toFixed(2)}€`,
                    {
                        description: `${actionDescription} - ${categorieNom}`,
                        duration: 4000
                    }
                );

                setMessageAjout(`✓ Dépense de ${parseFloat(montant).toFixed(2)}€ ajoutée avec succès`);

                // Réinitialiser les champs du formulaire
                setMontant(0);
                setActionCategorie("");
                setActionDescription("");
                setDatePick(new Date());

                // Effacer la dernière dépense ajoutée après 5 secondes
                setTimeout(() => {
                    setLastAddedExpense(null);
                }, 5000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error("Erreur lors de l'ajout de la dépense", {
                    description: errorData.message || "Veuillez réessayer"
                });
                setMessageAjout("❌ Erreur lors de l'ajout de la dépense");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la dépense", error);
            toast.error("Erreur de connexion", {
                description: "Impossible de contacter le serveur"
            });
            setMessageAjout("❌ Erreur de connexion");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = useCallback(async () => {
        let idUser = parseInt("" + localStorage.getItem("utilisateur"));
        const response = await fetch(lien.url + "categorie/byuser/" + idUser);
        const resbis = await response.json();
        setCatAll(resbis);
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return (
        <div>
            <h1>Gestion du budget</h1>

            {/* Carte de la dernière dépense ajoutée */}
            <AnimatePresence>
                {lastAddedExpense && (
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
                                Dépense ajoutée avec succès
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                                {lastAddedExpense.montant.toFixed(2)} €
                            </div>
                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                                {lastAddedExpense.description} • {lastAddedExpense.categorie}
                            </div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                                {lastAddedExpense.dateTransaction}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleAddExpense}>
                <div className="form-group">
                    <label>Montant</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                        placeholder="Montant en euros"
                        required
                        disabled={isLoading}
                    />
                    <RiPassPendingLine style={{ color: 'blueviolet' }} />
                </div>
                <div className="form-group">
                    <label>Categorie</label>
                    <select
                        value={actionCategorie}
                        onChange={(e) => setActionCategorie(e.target.value)}
                        required
                        disabled={isLoading}
                    >
                        <option value="">Sélectionnez une catégorie</option>
                        {catAll.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.categorie}
                            </option>
                        ))}
                    </select>
                    <BiCategory style={{ color: 'blueviolet' }} />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input
                        type="text"
                        value={actionDescription}
                        onChange={(e) => setActionDescription(e.target.value)}
                        placeholder="Description de la dépense"
                        required
                        disabled={isLoading}
                    />
                    <MdOutlineDescription style={{ color: 'blueviolet' }} />
                </div>
                <div className="form-group">
                    <label>Date</label>
                    <input
                        type="date"
                        value={datePick.toISOString().split('T')[0]}
                        onChange={(e) => setDatePick(new Date(e.target.value))}
                        required
                        disabled={isLoading}
                    />
                    <CiCalendarDate />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        opacity: isLoading ? 0.6 : 1,
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isLoading ? 'Ajout en cours...' : 'Ajouter la dépense'}
                </button>
            </form>

            {messageAjout && (
                <p style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: messageAjout.includes('✓')
                        ? 'rgba(16, 185, 129, 0.1)'
                        : 'rgba(239, 68, 68, 0.1)',
                    color: messageAjout.includes('✓') ? '#059669' : '#dc2626',
                    border: messageAjout.includes('✓')
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    {messageAjout}
                </p>
            )}

            <div>
                <h2>Dépenses récentes</h2>
                <AnimatePresence>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {listDesDepense.slice(0, 5).map((expense, index) => (
                            <motion.li
                                key={expense.timestamp || index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.05 }}
                                style={{
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.5rem',
                                    borderRadius: '8px',
                                    background: 'rgba(124, 58, 237, 0.05)',
                                    border: '1px solid rgba(124, 58, 237, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: '0.5rem'
                                }}
                            >
                                <div style={{ flex: 1, minWidth: '200px' }}>
                                    <span style={{
                                        color: '#7C3AED',
                                        fontWeight: '600',
                                        display: 'block',
                                        marginBottom: '0.25rem'
                                    }}>
                                        {expense.description}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                        {expense.categorie}
                                    </span>
                                </div>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    flexShrink: 0
                                }}>
                                    <span style={{
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        fontSize: '1.125rem'
                                    }}>
                                        {typeof expense.montant === 'number'
                                            ? expense.montant.toFixed(2)
                                            : parseFloat(expense.montant).toFixed(2)} €
                                    </span>
                                    <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                                        {expense.dateTransaction}
                                    </span>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </AnimatePresence>
                {listDesDepense.length === 0 && (
                    <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>
                        Aucune dépense ajoutée pour le moment
                    </p>
                )}
            </div>
        </div>
    );
}

export default AjoutBudget;
