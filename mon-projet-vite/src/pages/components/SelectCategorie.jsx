import React, { useCallback, useEffect, useState } from "react";
import lien from './lien';

export default function SelectCategorie(props) {
    const [valueOption, setValueOption] = useState("");
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const jwt = localStorage.getItem("jwt") || "";
            const idUser = parseInt(localStorage.getItem("utilisateur") || "0", 10);

            if (!idUser) {
                throw new Error("Utilisateur non connecté");
            }

            const response = await fetch(`${lien.url}categorie/byuser/${idUser}`, {
                headers: {
                    Authorization: `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const categoriesData = await response.json();

            // Récupérer les icônes pour chaque catégorie
            const iconResponse = await fetch(`${lien.url}category-images`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            let icons = [];
            if (iconResponse.ok) {
                icons = await iconResponse.json();
            }

            // Combiner les catégories avec leurs icônes
            const categoriesWithIcons = categoriesData.map(cat => {
                const icon = icons.find(i => i.categorie?.id === cat.id);
                return { ...cat, iconName: icon?.iconName || "" };
            });

            setCategories(categoriesWithIcons);
        } catch (err) {
            console.error("Erreur lors du chargement des catégories:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleCategoryChange = (e) => {
        const selectedValue = e.target.value;
        setValueOption(selectedValue);

        if (selectedValue && props.categorie) {
            const selectedCategory = categories.find(cat => cat.id.toString() === selectedValue);
            props.categorie(selectedCategory);
        }
    };

    const handleRefresh = () => {
        fetchCategories();
    };

    if (error) {
        return (
            <div className="select-categorie-error">
                <select disabled>
                    <option>Erreur: {error}</option>
                </select>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="refresh-btn"
                    title="Actualiser les catégories"
                >
                    🔄
                </button>
            </div>
        );
    }

    return (
        <div className="select-categorie-container">
            <select
                value={valueOption}
                onChange={handleCategoryChange}
                disabled={loading}
                className="select-categorie"
            >
                <option value="">
                    {loading ? "Chargement..." : "Sélectionner une catégorie"}
                </option>
                {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                        {category.iconName ? "📂 " : ""}{category.categorie}
                        {category.budgetDebutMois ? ` (Budget: ${category.budgetDebutMois}€)` : ""}
                    </option>
                ))}
            </select>
            <button
                type="button"
                onClick={handleRefresh}
                className="refresh-btn"
                title="Actualiser les catégories"
                disabled={loading}
            >
                {loading ? "⏳" : "🔄"}
            </button>
        </div>
    );
}
