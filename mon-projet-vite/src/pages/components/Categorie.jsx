import React, { useCallback, useEffect, useState } from "react";
import lien from "./lien";
import ItemCategorie from "./ItemCategorie.jsx";
import { useNotify } from "./Notification";
import "./css/categorie.css";

const iconOptions = [
    { label: "🍽️ Nourriture", value: "fa-solid fa-utensils" },
    { label: "🚗 Transport", value: "fa-solid fa-car" },
    { label: "🏠 Logement", value: "fa-solid fa-house" },
    { label: "❤️ Santé", value: "fa-solid fa-heart" },
    { label: "🛒 Courses", value: "fa-solid fa-cart-shopping" },
    { label: "🎓 Éducation", value: "fa-solid fa-graduation-cap" },
    { label: "🎬 Loisirs", value: "fa-solid fa-film" },
    { label: "👕 Vêtements", value: "fa-solid fa-shirt" },
    { label: "⚡ Énergie", value: "fa-solid fa-bolt" },
    { label: "💧 Eau", value: "fa-solid fa-droplet" },
    { label: "📱 Téléphone", value: "fa-solid fa-mobile-screen" },
    { label: "🌐 Internet", value: "fa-solid fa-globe" },
    { label: "🎁 Cadeaux", value: "fa-solid fa-gift" },
    { label: "🎄 Fêtes", value: "fa-solid fa-tree" },
    { label: "🏋️ Sport", value: "fa-solid fa-dumbbell" },
    { label: "🛠️ Réparations", value: "fa-solid fa-screwdriver-wrench" },
    { label: "🍼 Enfants", value: "fa-solid fa-baby" },
    { label: "🎵 Musique", value: "fa-solid fa-music" },
    { label: "✈️ Voyage", value: "fa-solid fa-plane" },
    { label: "🐶 Animaux", value: "fa-solid fa-dog" },
    { label: "📚 Livres", value: "fa-solid fa-book" },
    { label: "🧼 Hygiène", value: "fa-solid fa-soap" },
    { label: "📺 Abonnements", value: "fa-solid fa-tv" },
    { label: "🏦 Banque", value: "fa-solid fa-building-columns" },
    { label: "📅 Impôts", value: "fa-solid fa-calendar-days" },
    { label: "🚿 Entretien", value: "fa-solid fa-broom" },
    { label: "🖥️ Électronique", value: "fa-solid fa-computer" },
    { label: "🎮 Jeux", value: "fa-solid fa-gamepad" },
    { label: "👩‍⚕️ Médical", value: "fa-solid fa-stethoscope" },
    { label: "🍷 Sorties", value: "fa-solid fa-wine-glass" },
];

export function Categorie() {
    const [categorieDescription, setCategorieDescription] = useState("");
    const [idVal, setId] = useState(-1);
    const [categorie, setCategorie] = useState("");
    const [categorieCard, setCategorieCard] = useState([]);
    const [colorCategorie, setColorCategorie] = useState("#000000");
    const [month, setMonth] = useState("");
    const [annee, setAnnee] = useState("");
    const [budgetDebutMois, setBudgetDebutMois] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [iconName, setIconName] = useState("");
    const notify = useNotify();

    useEffect(() => {
        fetchAPI();
    }, []);

    const fetchAPI = useCallback(async () => {
        const jwt = localStorage.getItem("jwt") || "";
        const userId = parseInt(localStorage.getItem("utilisateur") || "0", 10);

        const resCategorie = await fetch(`${lien.url}categorie/byuser/${userId}`, {
            headers: { Authorization: `Bearer ${jwt}` },
        });
        const data = await resCategorie.json();

        const resIcons = await fetch(`${lien.url}category-images`);
        const icons = await resIcons.json();

        const withIcons = data.map(cat => {
            const icon = icons.find(i => i.categorie?.id === cat.id);
            return { ...cat, iconName: icon?.iconName || "" };
        });

        setCategorieCard(withIcons);
    }, []);

    const fetchDelete = useCallback(async (id) => {
        const jwt = localStorage.getItem("jwt") || "";

        try {
            await fetch(`${lien.url}category-images/${id}`, { method: "DELETE" });

            await fetch(`${lien.url}categorie/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jwt }),
            });

            await fetchAPI();
            notify("Catégorie et icône supprimées", "info");

        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            notify("Erreur lors de la suppression", "error");
        }
    }, [fetchAPI, notify]);

    const fetchCreate = useCallback(async (e) => {
        e.preventDefault();
        const jwt = localStorage.getItem("jwt") || "";
        const userId = parseInt(localStorage.getItem("utilisateur") || "0", 10);

        try {
            const res = await fetch(`${lien.url}categorie`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categorie,
                    description: categorieDescription,
                    color: colorCategorie,
                    user: userId,
                    month,
                    annee,
                    budgetDebutMois,
                    jwt,
                }),
            });

            const created = await res.json();

            if (created?.id && iconName) {
                await fetch(`${lien.url}category-images`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        categoryId: created.id,
                        iconName,
                    }),
                });
            }

            await fetchAPI();
            notify("Catégorie créée avec succès", "success");

            setCategorie("");
            setCategorieDescription("");
            setColorCategorie("#000000");
            setMonth("");
            setAnnee("");
            setBudgetDebutMois(0);
            setIconName("");

        } catch (error) {
            console.error("Erreur lors de la création :", error);
            notify("Échec de la création de la catégorie", "error");
        }
    }, [categorie, categorieDescription, colorCategorie, month, annee, budgetDebutMois, iconName, fetchAPI, notify]);

    const fetchUpdate = useCallback(async () => {
        const jwt = localStorage.getItem("jwt") || "";

        await fetch(`${lien.url}categorie/${idVal}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                categorie,
                description: categorieDescription,
                color: colorCategorie,
                user: parseInt(localStorage.getItem("utilisateur") || "0", 10),
                month,
                annee,
                budgetDebutMois,
                jwt,
            }),
        });

        if (idVal && iconName) {
            await fetch(`${lien.url}category-images`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryId: idVal,
                    iconName,
                }),
            });
        }

        notify("Catégorie mise à jour", "success");
        await fetchAPI();
    }, [idVal, categorie, categorieDescription, colorCategorie, month, annee, budgetDebutMois, iconName, fetchAPI, notify]);

    const filteredCategories = categorieCard.filter((item) =>
        item.categorie.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="categorie-wrapper">
            <form className="categorie-form" onSubmit={fetchCreate}>
                <input type="color" value={colorCategorie} onChange={(e) => setColorCategorie(e.target.value)} />
                <input type="text" placeholder="Catégorie" value={categorie} onChange={(e) => setCategorie(e.target.value)} />
                <input type="number" placeholder="Année" value={annee} onChange={(e) => setAnnee(e.target.value)} />
                <select value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Mois</option>
                    {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map((mois) => (
                        <option key={mois} value={mois}>{mois}</option>
                    ))}
                </select>
                <input type="number" placeholder="Budget" value={budgetDebutMois} onChange={(e) => setBudgetDebutMois(e.target.value)} />
                <select value={iconName} onChange={(e) => setIconName(e.target.value)}>
                    <option value="">Icône</option>
                    {iconOptions.map((icon) => (
                        <option key={icon.value} value={icon.value}>{icon.label}</option>
                    ))}
                </select>
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <div className="form-buttons">
                    <button type="button" onClick={fetchUpdate}>Modifier</button>
                    <button type="submit">Créer</button>
                </div>
            </form>

            <div className="categorie-list">
                {filteredCategories.map((item) => (
                    <div key={item.id} className="categorie-card">
                        <ItemCategorie
                            del={() => fetchDelete(item.id)}
                            color={item.color}
                            changeColor={setColorCategorie}
                            changecategorie={setCategorie}
                            changeTitle={setCategorieDescription}
                            changeDec={setCategorieDescription}
                            idFunc={setId}
                            changeMonth={setMonth}
                            changeAnnee={setAnnee}
                            changeBudgetDebutMois={setBudgetDebutMois}
                            changeIcon={setIconName}
                            categorie={item.categorie}
                            annee={item.annee}
                            month={item.month}
                            budgetDebutMois={item.budgetDebutMois}
                            id={item.id}
                            iconName={item.iconName}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
