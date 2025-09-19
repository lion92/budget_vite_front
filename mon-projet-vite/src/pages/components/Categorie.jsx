import React, { useCallback, useEffect, useState } from "react";
import lien from "./lien";
import ItemCategorie from "./ItemCategorie.jsx";
import CategoryAnalytics from "./CategoryAnalytics.jsx";
import { useNotify } from "./Notification";
import "./css/categorie.css";

const iconOptions = [
    // Alimentation & Boissons
    { label: "🍽️ Nourriture", value: "fa-solid fa-utensils" },
    { label: "🛒 Courses", value: "fa-solid fa-cart-shopping" },
    { label: "🍷 Sorties", value: "fa-solid fa-wine-glass" },
    { label: "☕ Café/Thé", value: "fa-solid fa-mug-saucer" },
    { label: "🍕 Fast Food", value: "fa-solid fa-pizza-slice" },
    { label: "🥖 Boulangerie", value: "fa-solid fa-bread-slice" },
    { label: "🍎 Fruits/Légumes", value: "fa-solid fa-apple-whole" },
    { label: "🥩 Viande/Poisson", value: "fa-solid fa-fish" },

    // Transport & Automobile
    { label: "🚗 Transport", value: "fa-solid fa-car" },
    { label: "⛽ Carburant", value: "fa-solid fa-gas-pump" },
    { label: "🚌 Transport Public", value: "fa-solid fa-bus" },
    { label: "🚕 Taxi/VTC", value: "fa-solid fa-taxi" },
    { label: "🚲 Vélo", value: "fa-solid fa-bicycle" },
    { label: "🛞 Entretien Auto", value: "fa-solid fa-tire" },
    { label: "🅿️ Parking", value: "fa-solid fa-square-parking" },
    { label: "✈️ Voyage", value: "fa-solid fa-plane" },

    // Logement & Maison
    { label: "🏠 Logement", value: "fa-solid fa-house" },
    { label: "🔧 Réparations", value: "fa-solid fa-screwdriver-wrench" },
    { label: "🚿 Entretien", value: "fa-solid fa-broom" },
    { label: "🪴 Jardinage", value: "fa-solid fa-seedling" },
    { label: "🏗️ Travaux", value: "fa-solid fa-hammer" },
    { label: "🪑 Mobilier", value: "fa-solid fa-chair" },
    { label: "🧹 Ménage", value: "fa-solid fa-broom" },
    { label: "🔒 Sécurité", value: "fa-solid fa-shield-halved" },

    // Services & Utilities
    { label: "⚡ Énergie", value: "fa-solid fa-bolt" },
    { label: "💧 Eau", value: "fa-solid fa-droplet" },
    { label: "📱 Téléphone", value: "fa-solid fa-mobile-screen" },
    { label: "🌐 Internet", value: "fa-solid fa-globe" },
    { label: "📺 Abonnements", value: "fa-solid fa-tv" },
    { label: "📡 Streaming", value: "fa-solid fa-satellite-dish" },
    { label: "📮 Poste", value: "fa-solid fa-envelope" },
    { label: "♻️ Déchets", value: "fa-solid fa-recycle" },

    // Santé & Bien-être
    { label: "❤️ Santé", value: "fa-solid fa-heart" },
    { label: "👩‍⚕️ Médical", value: "fa-solid fa-stethoscope" },
    { label: "💊 Pharmacie", value: "fa-solid fa-pills" },
    { label: "🦷 Dentiste", value: "fa-solid fa-tooth" },
    { label: "👓 Optique", value: "fa-solid fa-glasses" },
    { label: "🧘 Bien-être", value: "fa-solid fa-spa" },
    { label: "💆 Massage", value: "fa-solid fa-hand-sparkles" },
    { label: "🧼 Hygiène", value: "fa-solid fa-soap" },

    // Mode & Beauté
    { label: "👕 Vêtements", value: "fa-solid fa-shirt" },
    { label: "👠 Chaussures", value: "fa-solid fa-shoe-prints" },
    { label: "💄 Cosmétiques", value: "fa-solid fa-wand-magic-sparkles" },
    { label: "💇 Coiffeur", value: "fa-solid fa-scissors" },
    { label: "👜 Accessoires", value: "fa-solid fa-bag-shopping" },
    { label: "💍 Bijoux", value: "fa-solid fa-gem" },

    // Éducation & Culture
    { label: "🎓 Éducation", value: "fa-solid fa-graduation-cap" },
    { label: "📚 Livres", value: "fa-solid fa-book" },
    { label: "📝 Fournitures", value: "fa-solid fa-pen" },
    { label: "💻 Formation", value: "fa-solid fa-laptop" },
    { label: "🎨 Arts", value: "fa-solid fa-palette" },
    { label: "🎭 Culture", value: "fa-solid fa-masks-theater" },
    { label: "🏛️ Musée", value: "fa-solid fa-landmark" },

    // Loisirs & Divertissement
    { label: "🎬 Loisirs", value: "fa-solid fa-film" },
    { label: "🎵 Musique", value: "fa-solid fa-music" },
    { label: "🎮 Jeux", value: "fa-solid fa-gamepad" },
    { label: "🏋️ Sport", value: "fa-solid fa-dumbbell" },
    { label: "🎳 Bowling", value: "fa-solid fa-bowling-ball" },
    { label: "🎯 Activités", value: "fa-solid fa-bullseye" },
    { label: "🏊 Piscine", value: "fa-solid fa-person-swimming" },
    { label: "🎪 Spectacles", value: "fa-solid fa-star" },

    // Technologie
    { label: "🖥️ Électronique", value: "fa-solid fa-computer" },
    { label: "📷 Photo", value: "fa-solid fa-camera" },
    { label: "🎧 Audio", value: "fa-solid fa-headphones" },
    { label: "🖨️ Imprimante", value: "fa-solid fa-print" },
    { label: "🔌 Accessoires Tech", value: "fa-solid fa-plug" },
    { label: "📱 Applications", value: "fa-solid fa-mobile-screen-button" },

    // Famille & Enfants
    { label: "🍼 Enfants", value: "fa-solid fa-baby" },
    { label: "🧸 Jouets", value: "fa-solid fa-horse" },
    { label: "👶 Bébé", value: "fa-solid fa-baby-carriage" },
    { label: "🎒 École", value: "fa-solid fa-school" },
    { label: "🏫 Crèche", value: "fa-solid fa-building" },

    // Animaux
    { label: "🐶 Animaux", value: "fa-solid fa-dog" },
    { label: "🐱 Chat", value: "fa-solid fa-cat" },
    { label: "🐠 Aquarium", value: "fa-solid fa-fish-fins" },
    { label: "🦮 Vétérinaire", value: "fa-solid fa-user-doctor" },

    // Finances & Administration
    { label: "🏦 Banque", value: "fa-solid fa-building-columns" },
    { label: "📅 Impôts", value: "fa-solid fa-calendar-days" },
    { label: "📋 Assurance", value: "fa-solid fa-file-contract" },
    { label: "💰 Épargne", value: "fa-solid fa-piggy-bank" },
    { label: "📊 Investissement", value: "fa-solid fa-chart-line" },
    { label: "🏛️ Notaire", value: "fa-solid fa-scale-balanced" },

    // Cadeaux & Occasions
    { label: "🎁 Cadeaux", value: "fa-solid fa-gift" },
    { label: "🎄 Fêtes", value: "fa-solid fa-tree" },
    { label: "🎂 Anniversaires", value: "fa-solid fa-cake-candles" },
    { label: "💐 Fleurs", value: "fa-solid fa-seedling" },
    { label: "💒 Mariage", value: "fa-solid fa-heart" },

    // Professionnel
    { label: "💼 Travail", value: "fa-solid fa-briefcase" },
    { label: "📞 Télétravail", value: "fa-solid fa-laptop-house" },
    { label: "✈️ Déplacements Pro", value: "fa-solid fa-plane-departure" },
    { label: "🍽️ Repas d'affaires", value: "fa-solid fa-handshake" },

    // Urgences & Divers
    { label: "🚨 Urgence", value: "fa-solid fa-triangle-exclamation" },
    { label: "❓ Divers", value: "fa-solid fa-question" },
    { label: "🔄 Remboursement", value: "fa-solid fa-arrow-rotate-left" },
    { label: "💳 Frais Bancaires", value: "fa-solid fa-credit-card" },
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
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const notify = useNotify();

    // Suggestions intelligentes basées sur les mots-clés
    const smartSuggestions = {
        "nourriture": { icon: "fa-solid fa-utensils", color: "#f59e0b" },
        "alimentation": { icon: "fa-solid fa-utensils", color: "#f59e0b" },
        "restaurant": { icon: "fa-solid fa-utensils", color: "#f59e0b" },
        "courses": { icon: "fa-solid fa-cart-shopping", color: "#10b981" },
        "supermarché": { icon: "fa-solid fa-cart-shopping", color: "#10b981" },
        "transport": { icon: "fa-solid fa-car", color: "#3b82f6" },
        "voiture": { icon: "fa-solid fa-car", color: "#3b82f6" },
        "essence": { icon: "fa-solid fa-gas-pump", color: "#ef4444" },
        "carburant": { icon: "fa-solid fa-gas-pump", color: "#ef4444" },
        "logement": { icon: "fa-solid fa-house", color: "#8b5cf6" },
        "loyer": { icon: "fa-solid fa-house", color: "#8b5cf6" },
        "santé": { icon: "fa-solid fa-heart", color: "#ec4899" },
        "médical": { icon: "fa-solid fa-stethoscope", color: "#ec4899" },
        "pharmacie": { icon: "fa-solid fa-pills", color: "#ec4899" },
        "éducation": { icon: "fa-solid fa-graduation-cap", color: "#6366f1" },
        "école": { icon: "fa-solid fa-school", color: "#6366f1" },
        "formation": { icon: "fa-solid fa-laptop", color: "#6366f1" },
        "loisirs": { icon: "fa-solid fa-film", color: "#f97316" },
        "divertissement": { icon: "fa-solid fa-film", color: "#f97316" },
        "sport": { icon: "fa-solid fa-dumbbell", color: "#059669" },
        "vêtements": { icon: "fa-solid fa-shirt", color: "#db2777" },
        "mode": { icon: "fa-solid fa-shirt", color: "#db2777" },
        "électronique": { icon: "fa-solid fa-computer", color: "#374151" },
        "technologie": { icon: "fa-solid fa-computer", color: "#374151" },
        "téléphone": { icon: "fa-solid fa-mobile-screen", color: "#6b7280" },
        "internet": { icon: "fa-solid fa-globe", color: "#0ea5e9" },
        "énergie": { icon: "fa-solid fa-bolt", color: "#eab308" },
        "électricité": { icon: "fa-solid fa-bolt", color: "#eab308" },
        "eau": { icon: "fa-solid fa-droplet", color: "#06b6d4" },
        "gaz": { icon: "fa-solid fa-fire", color: "#dc2626" },
        "enfants": { icon: "fa-solid fa-baby", color: "#f472b6" },
        "bébé": { icon: "fa-solid fa-baby-carriage", color: "#f472b6" },
        "animaux": { icon: "fa-solid fa-dog", color: "#a3a3a3" },
        "voyage": { icon: "fa-solid fa-plane", color: "#0891b2" },
        "vacances": { icon: "fa-solid fa-plane", color: "#0891b2" },
        "travail": { icon: "fa-solid fa-briefcase", color: "#4b5563" },
        "professionnel": { icon: "fa-solid fa-briefcase", color: "#4b5563" },
        "banque": { icon: "fa-solid fa-building-columns", color: "#374151" },
        "finance": { icon: "fa-solid fa-building-columns", color: "#374151" },
        "impôts": { icon: "fa-solid fa-calendar-days", color: "#dc2626" },
        "assurance": { icon: "fa-solid fa-file-contract", color: "#6b7280" },
    };

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

    // Fonction pour générer des suggestions intelligentes
    const generateSuggestions = (input) => {
        if (!input || input.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const inputLower = input.toLowerCase();
        const matchedSuggestions = [];

        // Recherche dans les suggestions prédéfinies
        Object.keys(smartSuggestions).forEach(keyword => {
            if (keyword.includes(inputLower) || inputLower.includes(keyword)) {
                const suggestion = smartSuggestions[keyword];
                matchedSuggestions.push({
                    name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
                    icon: suggestion.icon,
                    color: suggestion.color,
                    confidence: keyword === inputLower ? 100 :
                               keyword.includes(inputLower) ? 80 : 60
                });
            }
        });

        // Trier par confiance et prendre les 5 meilleures
        const sortedSuggestions = matchedSuggestions
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 5);

        setSuggestions(sortedSuggestions);
        setShowSuggestions(sortedSuggestions.length > 0);
    };

    // Fonction pour appliquer une suggestion
    const applySuggestion = (suggestion) => {
        setCategorie(suggestion.name);
        setColorCategorie(suggestion.color);
        setIconName(suggestion.icon);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    // Gestion du changement de nom de catégorie
    const handleCategoryNameChange = (e) => {
        const value = e.target.value;
        setCategorie(value);
        generateSuggestions(value);
    };

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
                        <div className="category-input-container">
                            <input
                                type="text"
                                placeholder="Ex: Alimentation, Transport..."
                                value={categorie}
                                onChange={handleCategoryNameChange}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onFocus={() => generateSuggestions(categorie)}
                                required
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <div className="suggestions-dropdown">
                                    <div className="suggestions-header">
                                        💡 Suggestions intelligentes
                                    </div>
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            className="suggestion-item"
                                            onClick={() => applySuggestion(suggestion)}
                                        >
                                            <div className="suggestion-icon">
                                                <i
                                                    className={suggestion.icon}
                                                    style={{ color: suggestion.color }}
                                                ></i>
                                            </div>
                                            <div className="suggestion-content">
                                                <span className="suggestion-name">{suggestion.name}</span>
                                                <span className="suggestion-confidence">
                                                    {suggestion.confidence}% de correspondance
                                                </span>
                                            </div>
                                            <div className="suggestion-preview">
                                                <div
                                                    className="color-preview"
                                                    style={{ backgroundColor: suggestion.color }}
                                                ></div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
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
                        <select value={iconName} onChange={(e) => setIconName(e.target.value)} className="icon-select">
                            <option value="">Choisir une icône...</option>
                            <optgroup label="🍽️ Alimentation & Boissons">
                                {iconOptions.slice(0, 8).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🚗 Transport & Automobile">
                                {iconOptions.slice(8, 16).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🏠 Logement & Maison">
                                {iconOptions.slice(16, 24).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="⚡ Services & Utilities">
                                {iconOptions.slice(24, 32).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="❤️ Santé & Bien-être">
                                {iconOptions.slice(32, 40).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="👕 Mode & Beauté">
                                {iconOptions.slice(40, 46).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🎓 Éducation & Culture">
                                {iconOptions.slice(46, 53).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🎬 Loisirs & Divertissement">
                                {iconOptions.slice(53, 61).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🖥️ Technologie">
                                {iconOptions.slice(61, 67).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🍼 Famille & Enfants">
                                {iconOptions.slice(67, 72).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🐶 Animaux">
                                {iconOptions.slice(72, 76).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🏦 Finances & Administration">
                                {iconOptions.slice(76, 82).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🎁 Cadeaux & Occasions">
                                {iconOptions.slice(82, 87).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="💼 Professionnel">
                                {iconOptions.slice(87, 91).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                            <optgroup label="🚨 Urgences & Divers">
                                {iconOptions.slice(91).map((icon) => (
                                    <option key={icon.value} value={icon.value}>{icon.label}</option>
                                ))}
                            </optgroup>
                        </select>
                        {iconName && (
                            <div className="icon-preview">
                                <i className={iconName} style={{ fontSize: '24px', color: colorCategorie }}></i>
                                <span>Aperçu de l'icône sélectionnée</span>
                            </div>
                        )}
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
                        <ItemCategorie
                            key={item.id}
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

    const renderAnalyticsView = () => (
        <div className="modal-section">
            <CategoryAnalytics categories={categorieCard} />
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
                <button
                    className={`tab-button ${currentView === 'analytics' ? 'active' : ''}`}
                    onClick={() => setCurrentView('analytics')}
                >
                    📊 Analyses
                </button>
            </div>
            {currentView === 'create' ? renderCreateView() :
             currentView === 'analytics' ? renderAnalyticsView() :
             renderManageView()}
        </div>
    );
}
