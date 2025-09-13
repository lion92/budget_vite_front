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

export function Categorie({ activeView = 'manage' }) {
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
    const [currentView, setCurrentView] = useState(activeView);
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

    const renderCreateView = () => (
        <div className="modal-section">
            <div className="section-header">
                <h3 className="section-title">Nouvelle Catégorie</h3>
                <p className="section-description">Créez une nouvelle catégorie pour organiser vos dépenses</p>
            </div>

            <form className="categorie-form modal-form" onSubmit={fetchCreate}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Couleur</label>
                        <input
                            type="color"
                            value={colorCategorie}
                            onChange={(e) => setColorCategorie(e.target.value)}
                            className="color-input"
                        />
                    </div>

                    <div className="form-group flex-2">
                        <label className="form-label">Nom de la catégorie</label>
                        <input
                            type="text"
                            placeholder="Ex: Alimentation, Transport..."
                            value={categorie}
                            onChange={(e) => setCategorie(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Année</label>
                        <input
                            type="number"
                            placeholder="2024"
                            value={annee}
                            onChange={(e) => setAnnee(e.target.value)}
                            min="2020"
                            max="2030"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Mois</label>
                        <select value={month} onChange={(e) => setMonth(e.target.value)}>
                            <option value="">Sélectionner...</option>
                            {["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"].map((mois) => (
                                <option key={mois} value={mois}>{mois}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Budget initial (€)</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={budgetDebutMois}
                            onChange={(e) => setBudgetDebutMois(e.target.value)}
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group flex-2">
                        <label className="form-label">Icône</label>
                        <select value={iconName} onChange={(e) => setIconName(e.target.value)}>
                            <option value="">Choisir une icône...</option>
                            {iconOptions.map((icon) => (
                                <option key={icon.value} value={icon.value}>{icon.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="form-buttons">
                    <button type="button" className="btn-secondary" onClick={fetchUpdate} disabled={idVal === -1}>
                        {idVal === -1 ? 'Sélectionner pour modifier' : 'Mettre à jour'}
                    </button>
                    <button type="submit" className="btn-primary">
                        Créer la catégorie
                    </button>
                </div>
            </form>
        </div>
    );

    const renderManageView = () => (
        <div className="modal-section">
            <div className="section-header">
                <h3 className="section-title">Mes Catégories</h3>
                <p className="section-description">Gérez vos catégories existantes</p>
            </div>

            <div className="search-section">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="categorie-grid">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((item) => (
                        <div key={item.id} className="categorie-card modern-card">
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
                    ))
                ) : (
                    <div className="empty-state">
                        <div className="empty-icon">📁</div>
                        <h4>Aucune catégorie trouvée</h4>
                        <p>Essayez de modifier votre recherche ou créez une nouvelle catégorie.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="categorie-modal-wrapper">
            <div className="tab-navigation">
                <button
                    className={`tab-button ${currentView === 'manage' ? 'active' : ''}`}
                    onClick={() => setCurrentView('manage')}
                >
                    📋 Mes Catégories
                </button>
                <button
                    className={`tab-button ${currentView === 'create' ? 'active' : ''}`}
                    onClick={() => setCurrentView('create')}
                >
                    ➕ Nouvelle Catégorie
                </button>
            </div>
            {currentView === 'create' ? renderCreateView() : renderManageView()}
        </div>
    );
}
