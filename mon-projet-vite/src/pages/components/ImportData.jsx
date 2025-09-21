import React, { useState, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react";
import useBudgetStore from "../../useBudgetStore";
import { useNotify } from "./Notification";
import lien from "./lien";
import DataTable from "./DataTable";
import "./css/import-data.css";

const iconOptions = [
    { label: "🍽️ Nourriture", value: "fa-solid fa-utensils", keywords: ["nourriture", "alimentation", "restaurant", "courses", "supermarché", "groceries"] },
    { label: "🚗 Transport", value: "fa-solid fa-car", keywords: ["transport", "voiture", "essence", "bus", "métro", "taxi", "uber"] },
    { label: "🏠 Logement", value: "fa-solid fa-house", keywords: ["logement", "loyer", "appartement", "maison", "immobilier"] },
    { label: "❤️ Santé", value: "fa-solid fa-heart", keywords: ["santé", "médecin", "pharmacie", "hôpital", "dentiste"] },
    { label: "🛒 Courses", value: "fa-solid fa-cart-shopping", keywords: ["courses", "supermarché", "magasin", "shopping"] },
    { label: "🎓 Éducation", value: "fa-solid fa-graduation-cap", keywords: ["éducation", "école", "université", "formation", "cours"] },
    { label: "🎬 Loisirs", value: "fa-solid fa-film", keywords: ["loisirs", "cinéma", "spectacle", "sortie", "divertissement"] },
    { label: "👕 Vêtements", value: "fa-solid fa-shirt", keywords: ["vêtements", "habits", "mode", "shopping"] },
    { label: "⚡ Énergie", value: "fa-solid fa-bolt", keywords: ["électricité", "énergie", "edf", "gaz"] },
    { label: "💧 Eau", value: "fa-solid fa-droplet", keywords: ["eau", "facture"] },
    { label: "📱 Téléphone", value: "fa-solid fa-mobile-screen", keywords: ["téléphone", "mobile", "forfait", "orange", "sfr"] },
    { label: "🌐 Internet", value: "fa-solid fa-globe", keywords: ["internet", "wifi", "box", "abonnement"] },
    { label: "🎁 Cadeaux", value: "fa-solid fa-gift", keywords: ["cadeau", "anniversaire", "fête"] },
    { label: "🏋️ Sport", value: "fa-solid fa-dumbbell", keywords: ["sport", "gym", "fitness", "salle"] },
    { label: "🛠️ Réparations", value: "fa-solid fa-screwdriver-wrench", keywords: ["réparation", "bricolage", "maintenance"] },
    { label: "🍼 Enfants", value: "fa-solid fa-baby", keywords: ["enfants", "bébé", "garde", "crèche"] },
    { label: "✈️ Voyage", value: "fa-solid fa-plane", keywords: ["voyage", "vacances", "avion", "hôtel"] },
    { label: "🐶 Animaux", value: "fa-solid fa-dog", keywords: ["animaux", "vétérinaire", "chien", "chat"] },
    { label: "📚 Livres", value: "fa-solid fa-book", keywords: ["livre", "lecture", "librairie"] },
    { label: "🧼 Hygiène", value: "fa-solid fa-soap", keywords: ["hygiène", "toilette", "produits"] },
    { label: "📺 Abonnements", value: "fa-solid fa-tv", keywords: ["abonnement", "netflix", "spotify", "tv"] },
    { label: "🏦 Banque", value: "fa-solid fa-building-columns", keywords: ["banque", "frais", "commission"] },
    { label: "📅 Impôts", value: "fa-solid fa-calendar-days", keywords: ["impôts", "taxes", "fiscal"] },
    { label: "🍷 Sorties", value: "fa-solid fa-wine-glass", keywords: ["sortie", "bar", "restaurant", "soirée"] }
];

export function ImportData({ onClose }) {
    const [file, setFile] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [columnMapping, setColumnMapping] = useState({
        description: '',
        montant: '',
        categorie: '',
        date: ''
    });
    const [importing, setImporting] = useState(false);
    const [importResults, setImportResults] = useState(null);

    const { fetchCategories, fetchDepenses, addDepense } = useBudgetStore();
    const notify = useNotify();

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length === 0) return null;

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const rows = lines.slice(1).map(line => {
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let i = 0; i < line.length; i++) {
                const char = line[i];
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            return values;
        });

        return { headers, rows };
    };

    const handleFileUpload = useCallback(async (event) => {
        const uploadedFile = event.target.files[0];
        if (!uploadedFile) return;

        setFile(uploadedFile);
        setParsing(true);

        try {
            const text = await uploadedFile.text();
            const parsed = parseCSV(text);

            if (parsed) {
                setParsedData(parsed);
                // Auto-détection des colonnes
                const autoMapping = {};
                parsed.headers.forEach(header => {
                    const lowerHeader = header.toLowerCase();
                    if (lowerHeader.includes('description') || lowerHeader.includes('libelle') || lowerHeader.includes('nom')) {
                        autoMapping.description = header;
                    } else if (lowerHeader.includes('montant') || lowerHeader.includes('amount') || lowerHeader.includes('prix')) {
                        autoMapping.montant = header;
                    } else if (lowerHeader.includes('categorie') || lowerHeader.includes('category') || lowerHeader.includes('type')) {
                        autoMapping.categorie = header;
                    } else if (lowerHeader.includes('date')) {
                        autoMapping.date = header;
                    }
                });
                setColumnMapping(autoMapping);
            }
        } catch (error) {
            notify("Erreur lors de la lecture du fichier", "error");
        } finally {
            setParsing(false);
        }
    }, [notify]);

    const detectCategory = (description) => {
        const lowerDesc = description.toLowerCase();

        for (const icon of iconOptions) {
            for (const keyword of icon.keywords) {
                if (lowerDesc.includes(keyword)) {
                    return {
                        name: icon.label.split(' ')[1],
                        icon: icon.value
                    };
                }
            }
        }

        return {
            name: "Divers",
            icon: "fa-solid fa-question"
        };
    };

    const createCategory = async (categoryName, iconName) => {
        const jwt = localStorage.getItem("jwt") || "";
        const userId = parseInt(localStorage.getItem("utilisateur") || "0", 10);

        try {
            // Créer la catégorie
            const res = await fetch(`${lien.url}categorie`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categorie: categoryName,
                    description: `Catégorie créée automatiquement lors de l'import`,
                    color: "#" + Math.floor(Math.random()*16777215).toString(16),
                    user: userId,
                    month: new Date().toLocaleString('fr-FR', { month: 'long' }),
                    annee: new Date().getFullYear().toString(),
                    budgetDebutMois: 0,
                    jwt,
                }),
            });

            const created = await res.json();

            // Ajouter l'icône si la catégorie a été créée
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

            return created;
        } catch (error) {
            console.error("Erreur lors de la création de la catégorie:", error);
            return null;
        }
    };

    const processImport = async () => {
        if (!parsedData || importing) return;

        setImporting(true);
        const results = {
            categoriesCreated: 0,
            expensesCreated: 0,
            errors: []
        };

        try {
            // Récupérer les catégories existantes
            await fetchCategories();
            const { categories } = useBudgetStore.getState();
            const existingCategories = new Map(categories.map(cat => [cat.categorie.toLowerCase(), cat]));
            const newCategories = new Map();

            for (let i = 0; i < parsedData.rows.length; i++) {
                const row = parsedData.rows[i];
                try {
                    const description = row[parsedData.headers.indexOf(columnMapping.description)] || "";
                    const montantStr = row[parsedData.headers.indexOf(columnMapping.montant)] || "0";
                    const categorieStr = row[parsedData.headers.indexOf(columnMapping.categorie)] || "";
                    const dateStr = row[parsedData.headers.indexOf(columnMapping.date)] || "";

                    if (!description.trim()) continue;

                    // Traitement du montant
                    const montant = parseFloat(montantStr.replace(/[^\d.-]/g, ''));
                    if (isNaN(montant)) {
                        results.errors.push(`Ligne ${i + 2}: Montant invalide (${montantStr})`);
                        continue;
                    }

                    // Traitement de la date
                    let date = new Date();
                    if (dateStr) {
                        const parsedDate = new Date(dateStr);
                        if (!isNaN(parsedDate.getTime())) {
                            date = parsedDate;
                        }
                    }

                    // Déterminer la catégorie
                    let categoryToUse = null;
                    let finalCategoryName = "";

                    if (categorieStr.trim()) {
                        // Utiliser la catégorie fournie dans le fichier
                        finalCategoryName = categorieStr.trim();
                    } else {
                        // Auto-détection basée sur la description
                        const detected = detectCategory(description);
                        finalCategoryName = detected.name;
                    }

                    // Fonction pour trouver une correspondance flexible
                    const findMatchingCategory = (categoryName) => {
                        const searchName = categoryName.toLowerCase().trim();

                        // 1. Correspondance exacte
                        if (existingCategories.has(searchName)) {
                            return existingCategories.get(searchName);
                        }

                        // 2. Correspondance partielle (contient le nom)
                        for (const [key, category] of existingCategories) {
                            if (key.includes(searchName) || searchName.includes(key)) {
                                return category;
                            }
                        }

                        // 3. Correspondance par synonymes
                        const synonyms = {
                            'nourriture': ['alimentation', 'repas', 'restaurant', 'food'],
                            'transport': ['voiture', 'bus', 'metro', 'taxi', 'vehicule'],
                            'logement': ['loyer', 'appartement', 'maison', 'immobilier'],
                            'energie': ['electricite', 'edf', 'gaz', 'chauffage'],
                            'sante': ['medecin', 'pharmacie', 'hopital', 'medical'],
                            'courses': ['supermarche', 'magasin', 'shopping'],
                            'loisirs': ['cinema', 'spectacle', 'sortie', 'divertissement'],
                            'vetements': ['habits', 'mode', 'textile'],
                            'telephone': ['mobile', 'forfait', 'operateur'],
                            'internet': ['wifi', 'box', 'connexion'],
                            'sport': ['gym', 'fitness', 'salle'],
                            'sorties': ['bar', 'restaurant', 'cafe']
                        };

                        for (const [mainCategory, syns] of Object.entries(synonyms)) {
                            if (syns.includes(searchName) || searchName.includes(mainCategory)) {
                                if (existingCategories.has(mainCategory)) {
                                    return existingCategories.get(mainCategory);
                                }
                            }
                        }

                        return null;
                    };

                    // Chercher une catégorie existante
                    categoryToUse = findMatchingCategory(finalCategoryName);

                    if (!categoryToUse) {
                        // Vérifier dans les nouvelles catégories créées
                        const lowerCategoryName = finalCategoryName.toLowerCase();
                        if (newCategories.has(lowerCategoryName)) {
                            categoryToUse = newCategories.get(lowerCategoryName);
                        } else {
                            // Créer une nouvelle catégorie
                            const detected = detectCategory(description);
                            const iconToUse = detected.icon;
                            const newCategory = await createCategory(finalCategoryName, iconToUse);
                            if (newCategory) {
                                newCategories.set(lowerCategoryName, newCategory);
                                existingCategories.set(lowerCategoryName, newCategory);
                                categoryToUse = newCategory;
                                results.categoriesCreated++;
                            }
                        }
                    }

                    if (!categoryToUse) {
                        results.errors.push(`Ligne ${i + 2}: Impossible de créer/trouver la catégorie "${finalCategoryName}"`);
                        continue;
                    }

                    // Créer la dépense en utilisant la méthode du store
                    try {
                        await addDepense({
                            montant,
                            categorie: categoryToUse.id,
                            description,
                            date
                        }, () => {}); // Notification vide pour éviter les doublons
                        results.expensesCreated++;
                    } catch (error) {
                        results.errors.push(`Ligne ${i + 2}: Erreur lors de la création de la dépense: ${error.message}`);
                    }

                } catch (error) {
                    results.errors.push(`Ligne ${i + 2}: ${error.message}`);
                }
            }

            // Rafraîchir seulement les catégories (les dépenses sont automatiquement rafraîchies par addDepense)
            await fetchCategories();

            setImportResults(results);
            notify(`Import terminé: ${results.expensesCreated} dépenses et ${results.categoriesCreated} catégories créées`, "success");

        } catch (error) {
            notify("Erreur lors de l'import", "error");
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content import-modal">
                <div className="modal-header">
                    <h2>Importer des données</h2>
                    <button onClick={onClose} className="close-btn">
                        <X size={20} />
                    </button>
                </div>

                <div className="import-content">
                    {!file && (
                        <div className="upload-zone">
                            <Upload size={48} />
                            <h3>Sélectionnez un fichier CSV</h3>
                            <p>Le fichier doit contenir les colonnes: description, montant, catégorie (optionnel), date (optionnel)</p>

                            <div className="csv-example">
                                <h4>📋 Format CSV attendu :</h4>
                                <div className="example-code">
                                    <code>
                                        description,montant,categorie,date<br/>
                                        Restaurant McDonald's,12.50,Nourriture,2026-01-15<br/>
                                        Essence Station Total,45.80,Transport,2026-01-16<br/>
                                        Loyer appartement,850.00,Logement,2026-01-01
                                    </code>
                                </div>
                                <p className="example-note">
                                    ⚡ <strong>Colonnes requises :</strong> description, montant<br/>
                                    📅 <strong>Format date :</strong> AAAA-MM-JJ (ex: 2026-01-15)<br/>
                                    🏷️ <strong>Catégorie :</strong> Si non fournie, sera détectée automatiquement
                                </p>
                            </div>

                            <label className="upload-btn">
                                <input
                                    type="file"
                                    accept=".csv,.txt"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                                <Upload size={20} />
                            </label>
                        </div>
                    )}

                    {parsing && (
                        <div className="loading-state">
                            <div className="spinner"></div>
                            <p>Analyse du fichier en cours...</p>
                        </div>
                    )}

                    {parsedData && !importResults && (
                        <div className="mapping-section">
                            <div className="file-info">
                                <FileText size={20} />
                                <span>{file?.name}</span>
                                <span>({parsedData.rows.length} lignes)</span>
                            </div>

                            <h3>Correspondance des colonnes</h3>
                            <div className="column-mapping">
                                {Object.entries(columnMapping).map(([key, value]) => (
                                    <div key={key} className="mapping-row">
                                        <label>{key.charAt(0).toUpperCase() + key.slice(1)}:</label>
                                        <select
                                            value={value}
                                            onChange={(e) => setColumnMapping(prev => ({...prev, [key]: e.target.value}))}
                                        >
                                            <option value="">-- Sélectionner --</option>
                                            {parsedData.headers.map(header => (
                                                <option key={header} value={header}>{header}</option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </div>

                            <div className="preview-section">
                                <h4>Aperçu des données avec filtrage et tri</h4>
                                <div className="preview-table">
                                    <DataTable
                                        data={parsedData.rows}
                                        headers={parsedData.headers}
                                        title="Données d'import"
                                    />
                                </div>
                            </div>

                            <div className="import-actions">
                                <button
                                    onClick={() => {setFile(null); setParsedData(null);}}
                                    className="btn-secondary"
                                    title="Changer de fichier"
                                >
                                    <FileText size={20} />
                                </button>
                                <button
                                    onClick={processImport}
                                    disabled={!columnMapping.description || !columnMapping.montant || importing}
                                    className="btn-primary"
                                    title={importing ? 'Import en cours...' : 'Importer les données'}
                                >
                                    {importing ? <div className="spinner"></div> : <Check size={20} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {importResults && (
                        <div className="results-section">
                            <div className="success-icon">
                                <Check size={48} />
                            </div>
                            <h3>Import terminé</h3>
                            <div className="results-stats">
                                <div className="stat">
                                    <span className="stat-number">{importResults.expensesCreated}</span>
                                    <span className="stat-label">Dépenses créées</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-number">{importResults.categoriesCreated}</span>
                                    <span className="stat-label">Catégories créées</span>
                                </div>
                                {importResults.errors.length > 0 && (
                                    <div className="stat error">
                                        <span className="stat-number">{importResults.errors.length}</span>
                                        <span className="stat-label">Erreurs</span>
                                    </div>
                                )}
                            </div>

                            {importResults.errors.length > 0 && (
                                <div className="errors-section">
                                    <h4><AlertCircle size={16} /> Erreurs rencontrées</h4>
                                    <div className="errors-list">
                                        {importResults.errors.map((error, i) => (
                                            <div key={i} className="error-item">{error}</div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button onClick={onClose} className="btn-primary" title="Fermer">
                                <X size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}