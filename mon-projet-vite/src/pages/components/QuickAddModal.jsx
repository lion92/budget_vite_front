import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { BiX, BiCategory } from 'react-icons/bi';
import { MdOutlineDescription, MdAttachMoney, MdTrendingUp } from 'react-icons/md';
import { CiCalendarDate } from 'react-icons/ci';
import { toast } from './ui/Toast';
import lien from "./lien";
import useBudgetStore from "../../useBudgetStore";
import { useNotify } from "./Notification";
import './css/QuickAddModal.css';

const QuickAddModal = ({ isOpen, onClose, type = 'expense' }) => {
    const [montant, setMontant] = useState('');
    const [description, setDescription] = useState('');
    const [categorie, setCategorie] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { addRevenu } = useBudgetStore();
    const notify = useNotify();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && type === 'expense') {
            fetchCategories();
        }
    }, [isOpen, type]);

    const fetchCategories = async () => {
        try {
            const idUser = parseInt(localStorage.getItem("utilisateur") || "0");
            const response = await fetch(`${lien.url}categorie/byuser/${idUser}`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Erreur lors du chargement des catégories", error);
        }
    };

    const resetForm = useCallback(() => {
        setMontant('');
        setDescription('');
        setCategorie('');
        setDate(new Date().toISOString().split('T')[0]);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!montant || !description || (type === 'expense' && !categorie)) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }

        if (parseFloat(montant) <= 0) {
            toast.error("Le montant doit être supérieur à 0");
            return;
        }

        setIsLoading(true);

        try {
            if (type === 'expense') {
                // Ajouter une dépense
                const str = localStorage.getItem('jwt');
                const categorieObj = categories.find(cat => cat.id === parseInt(categorie));
                const categorieNom = categorieObj ? categorieObj.categorie : '';

                const response = await fetch(`${lien.url}action`, {
                    method: "POST",
                    body: JSON.stringify({
                        montant: parseFloat(montant),
                        categorie: parseInt(categorie),
                        description,
                        user: parseInt(localStorage.getItem("utilisateur") || "0"),
                        dateTransaction: new Date(date).toLocaleString("zh-CN", { timeZone: 'Europe/Paris' }),
                        jwt: str,
                    }),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.ok) {
                    toast.success(
                        `Dépense ajoutée : ${parseFloat(montant).toFixed(2)}€`,
                        {
                            description: `${description} - ${categorieNom}`,
                            duration: 4000
                        }
                    );
                    resetForm();
                    setTimeout(() => onClose(), 1000);
                } else {
                    toast.error("Erreur lors de l'ajout de la dépense");
                }
            } else {
                // Ajouter un revenu
                await addRevenu({
                    name: description,
                    amount: parseFloat(montant),
                    date: new Date(date)
                }, notify);

                toast.success(
                    `Revenu ajouté : ${parseFloat(montant).toFixed(2)}€`,
                    {
                        description,
                        duration: 4000
                    }
                );
                resetForm();
                setTimeout(() => onClose(), 1000);
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Erreur de connexion", {
                description: "Impossible de contacter le serveur"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="quick-modal-overlay portal-modal-overlay" onClick={handleClose}>
            <div className="quick-modal portal-modal-content" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="quick-modal-header">
                            <div className="quick-modal-title">
                                {type === 'expense' ? (
                                    <>
                                        <MdAttachMoney size={28} style={{ color: '#ef4444' }} />
                                        <h2>Ajouter une dépense</h2>
                                    </>
                                ) : (
                                    <>
                                        <MdTrendingUp size={28} style={{ color: '#10b981' }} />
                                        <h2>Ajouter un revenu</h2>
                                    </>
                                )}
                            </div>
                            <button
                                className="quick-modal-close"
                                onClick={handleClose}
                                disabled={isLoading}
                                aria-label="Fermer"
                            >
                                <BiX size={24} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="quick-modal-form">
                            <div className="quick-modal-field">
                                <label htmlFor="montant">
                                    <MdAttachMoney size={20} />
                                    Montant (€)
                                </label>
                                <input
                                    id="montant"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={montant}
                                    onChange={(e) => setMontant(e.target.value)}
                                    placeholder="0.00"
                                    required
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            <div className="quick-modal-field">
                                <label htmlFor="description">
                                    <MdOutlineDescription size={20} />
                                    Description
                                </label>
                                <input
                                    id="description"
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder={type === 'expense' ? "Ex: Courses alimentaires" : "Ex: Salaire mensuel"}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {type === 'expense' && (
                                <div className="quick-modal-field">
                                    <label htmlFor="categorie">
                                        <BiCategory size={20} />
                                        Catégorie
                                    </label>
                                    <select
                                        id="categorie"
                                        value={categorie}
                                        onChange={(e) => setCategorie(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    >
                                        <option value="">Sélectionnez une catégorie</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.categorie}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="quick-modal-field">
                                <label htmlFor="date">
                                    <CiCalendarDate size={20} />
                                    Date
                                </label>
                                <input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            {/* Actions */}
                            <div className="quick-modal-actions">
                                <button
                                    type="button"
                                    className="quick-modal-btn quick-modal-btn-cancel"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className={`quick-modal-btn quick-modal-btn-submit ${
                                        type === 'expense' ? 'expense' : 'revenue'
                                    }`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Ajout...' : type === 'expense' ? 'Ajouter la dépense' : 'Ajouter le revenu'}
                                </button>
                            </div>
                        </form>
                    </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default QuickAddModal;
