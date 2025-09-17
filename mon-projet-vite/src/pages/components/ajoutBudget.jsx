import React, { useState, useEffect, useCallback } from 'react';
import { RiPassPendingLine } from "react-icons/ri";
import { MdOutlineDescription } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { CiCalendarDate } from "react-icons/ci";
import lien from "./lien";

function AjoutBudget() {
    const [listDesDepense, setListDesDepense] = useState([]);
    const [catAll, setCatAll] = useState([]);
    const [montant, setMontant] = useState(0);
    const [actionCategorie, setActionCategorie] = useState("");
    const [actionDescription, setActionDescription] = useState("");
    const [datePick, setDatePick] = useState(new Date());
    const [messageAjout, setMessageAjout] = useState("");

    // Fonction pour ajouter une dépense
    const handleAddExpense = async (e) => {
        e.preventDefault();
        if (!montant || !actionCategorie || !actionDescription) {
            alert("Veuillez remplir tous les champs");
            return;
        }
        try {
            const str = localStorage.getItem('jwt');
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
                    montant,
                    categorie: actionCategorie,
                    description: actionDescription,
                    dateTransaction: datePick.toLocaleString("zh-CN", { timeZone: 'Europe/Paris' }),
                };
                setListDesDepense([...listDesDepense, newExpense]);
                setMessageAjout(`Ajout de ${montant}€ dans la catégorie ${actionCategorie}`);
                // Réinitialiser les champs du formulaire
                setMontant(0);
                setActionCategorie("");
                setActionDescription("");
                setDatePick(new Date());
            } else {
                setMessageAjout("Erreur lors de l'ajout de la dépense");
            }
        } catch (error) {
            console.error("Erreur lors de l'ajout de la dépense", error);
            setMessageAjout("Erreur lors de l'ajout de la dépense");
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
            <form onSubmit={handleAddExpense}>
                <div className="form-group">
                    <label>Montant</label>
                    <input
                        type="number"
                        value={montant}
                        onChange={(e) => setMontant(e.target.value)}
                        placeholder="Montant"
                        required
                    />
                    <RiPassPendingLine style={{ color: 'blueviolet' }} />
                </div>
                <div className="form-group">
                    <label>Categorie</label>
                    <select
                        value={actionCategorie}
                        onChange={(e) => setActionCategorie(e.target.value)}
                        required
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
                        placeholder="Description"
                        required
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
                    />
                    <CiCalendarDate />
                </div>
                <button type="submit">Ajouter la dépense</button>
            </form>
            <p>{messageAjout}</p>
            <div>
                <h2>Liste des dépenses</h2>
                <ul>
                    {listDesDepense.map((expense, index) => (
                        <li key={index}>
                            {expense.description} - {expense.categorie} : {expense.montant}€ le {expense.dateTransaction}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default AjoutBudget;
