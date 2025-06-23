import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/chat.css";
import useBudgetStore from "../../useBudgetStore";
import lien from "./lien";

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

const monthsOptions = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function ChatBotAction({ notify = () => {} }) {
    const { categories, fetchCategories, addDepense, addRevenu } = useBudgetStore();
    const [messages, setMessages] = useState([]);
    const [step, setStep] = useState("chooseType");
    const [actionType, setActionType] = useState(null);
    const [formData, setFormData] = useState({
        description: "",
        montant: "",
        categorie: "",
        date: new Date()
    });
    const [categoryData, setCategoryData] = useState({
        categorie: "",
        description: "",
        color: "#000000",
        month: "",
        annee: "",
        budgetDebutMois: "",
        iconName: ""
    });
    const [inputValue, setInputValue] = useState("");
    const [pendingDate, setPendingDate] = useState(new Date());
    const [submitting, setSubmitting] = useState(false);
    const [inputKey, setInputKey] = useState(0);

    const chatWindowRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        askActionType();
    }, []);

    useEffect(() => {
        // Scroll automatique en bas
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const askActionType = () => {
        setMessages([{ from: "bot", text: "Que souhaitez-vous faire ?\n• Ajouter une dépense\n• Ajouter un revenu\n• Créer une catégorie" }]);
        setStep("chooseType");
        setActionType(null);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            description: "",
            montant: "",
            categorie: "",
            date: new Date()
        });
        setCategoryData({
            categorie: "",
            description: "",
            color: "#000000",
            month: "",
            annee: "",
            budgetDebutMois: "",
            iconName: ""
        });
        setPendingDate(new Date());
        setInputValue("");
        setInputKey(prev => prev + 1);
    };

    const sendBotMessage = (text) => {
        setMessages(prev => [...prev, { from: "bot", text }]);
    };

    const handleUserInput = (text) => {
        setMessages(prev => [...prev, { from: "user", text }]);
        processStep(text.toLowerCase());
    };

    const processStep = (input) => {
        switch (step) {
            case "chooseType":
                if (input === "dépense" || input === "depense") {
                    setActionType("depense");
                    sendBotMessage("Très bien. Quelle est la description de la dépense ?");
                    setStep("description");
                } else if (input === "revenu") {
                    setActionType("revenu");
                    sendBotMessage("Très bien. Quelle est la description du revenu ?");
                    setStep("description");
                } else if (input === "catégorie" || input === "categorie") {
                    setActionType("categorie");
                    sendBotMessage("Parfait ! Quel est le nom de la nouvelle catégorie ?");
                    setStep("categoryName");
                } else {
                    sendBotMessage("Veuillez taper 'dépense', 'revenu' ou 'catégorie'.");
                }
                break;

            case "description":
                setFormData(prev => ({ ...prev, description: input }));
                sendBotMessage("Quel est le montant ?");
                setStep("montant");
                break;

            case "montant":
                if (!/^\d+(\.\d{1,2})?$/.test(input)) {
                    sendBotMessage("Montant invalide. Exemple : 12.50");
                    return;
                }
                setFormData(prev => ({ ...prev, montant: input }));
                if (actionType === "depense" && categories.length > 0) {
                    sendBotMessage("Choisissez une catégorie :");
                    setStep("categorie");
                } else if (actionType === "depense") {
                    sendBotMessage("⚠️ Aucune catégorie disponible. Veuillez en créer une d'abord.");
                    setStep("chooseType");
                } else {
                    sendBotMessage("Sélectionnez une date puis validez.");
                    setStep("date");
                }
                break;

            // Étapes pour créer une catégorie
            case "categoryName":
                setCategoryData(prev => ({ ...prev, categorie: input }));
                sendBotMessage("Ajoutez une description pour cette catégorie (optionnel, tapez 'skip' pour ignorer) :");
                setStep("categoryDescription");
                break;

            case "categoryDescription":
                if (input !== "skip") {
                    setCategoryData(prev => ({ ...prev, description: input }));
                }
                sendBotMessage("Choisissez une couleur pour cette catégorie :");
                setStep("categoryColor");
                break;

            case "categoryColor":
                if (!/^#[0-9A-Fa-f]{6}$/.test(input)) {
                    sendBotMessage("Format de couleur invalide. Utilisez le format #RRGGBB (ex: #FF5733) ou choisissez ci-dessous :");
                    return;
                }
                setCategoryData(prev => ({ ...prev, color: input }));
                sendBotMessage("Quelle année pour cette catégorie ? (ex: 2024)");
                setStep("categoryYear");
                break;

            case "categoryYear":
                if (!/^\d{4}$/.test(input)) {
                    sendBotMessage("Année invalide. Format attendu : YYYY (ex: 2024)");
                    return;
                }
                setCategoryData(prev => ({ ...prev, annee: input }));
                sendBotMessage("Choisissez un mois :");
                setStep("categoryMonth");
                break;

            case "categoryBudget":
                if (!/^\d+(\.\d{1,2})?$/.test(input)) {
                    sendBotMessage("Budget invalide. Exemple : 500.00");
                    return;
                }
                setCategoryData(prev => ({ ...prev, budgetDebutMois: input }));
                sendBotMessage("Choisissez une icône pour cette catégorie :");
                setStep("categoryIcon");
                break;

            default:
                break;
        }
    };

    const handleCategorySelect = (id, name) => {
        setMessages(prev => [...prev, { from: "user", text: name }]);
        setFormData(prev => ({ ...prev, categorie: id }));
        sendBotMessage("Sélectionnez une date puis validez.");
        setStep("date");
    };

    const handleColorSelect = (color) => {
        setMessages(prev => [...prev, { from: "user", text: color }]);
        setCategoryData(prev => ({ ...prev, color }));
        sendBotMessage("Quelle année pour cette catégorie ? (ex: 2024)");
        setStep("categoryYear");
    };

    const handleMonthSelect = (month) => {
        setMessages(prev => [...prev, { from: "user", text: month }]);
        setCategoryData(prev => ({ ...prev, month }));
        sendBotMessage("Quel est le budget de début de mois ? (ex: 500.00)");
        setStep("categoryBudget");
    };

    const handleIconSelect = (iconValue, iconLabel) => {
        setMessages(prev => [...prev, { from: "user", text: iconLabel }]);
        setCategoryData(prev => ({ ...prev, iconName: iconValue }));
        sendBotMessage("Parfait ! Validez pour créer la catégorie.");
        setStep("validateCategory");
    };

    const handleValidateDate = async () => {
        if (!(pendingDate instanceof Date) || isNaN(pendingDate.getTime())) {
            sendBotMessage("Date invalide. Réessayez.");
            return;
        }

        setSubmitting(true);

        if (actionType === "depense") {
            await addDepense({
                ...formData,
                montant: parseFloat(formData.montant),
                date: pendingDate
            }, notify);
            sendBotMessage("✅ Dépense ajoutée !");
        } else if (actionType === "revenu") {
            await addRevenu({
                name: formData.description,
                amount: parseFloat(formData.montant),
                date: pendingDate
            }, notify);
            sendBotMessage("✅ Revenu ajouté !");
        }

        if (typeof notify === "function") {
            notify(`${actionType === "depense" ? "Dépense" : "Revenu"} ajouté`, "success");
        }

        setSubmitting(false);
        setTimeout(() => {
            askActionType();
        }, 300);
    };

    const handleValidateCategory = async () => {
        setSubmitting(true);

        try {
            const jwt = localStorage.getItem("jwt") || "";
            const userId = parseInt(localStorage.getItem("utilisateur") || "0", 10);

            // Créer la catégorie
            const res = await fetch(`${lien.url}categorie`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categorie: categoryData.categorie,
                    description: categoryData.description,
                    color: categoryData.color,
                    user: userId,
                    month: categoryData.month,
                    annee: categoryData.annee,
                    budgetDebutMois: parseFloat(categoryData.budgetDebutMois),
                    jwt,
                }),
            });

            const created = await res.json();

            // Ajouter l'icône si la catégorie a été créée avec succès
            if (created?.id && categoryData.iconName) {
                await fetch(`${lien.url}category-images`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        categoryId: created.id,
                        iconName: categoryData.iconName,
                    }),
                });
            }

            // Rafraîchir les catégories
            await fetchCategories();

            sendBotMessage("✅ Catégorie créée avec succès !");

            if (typeof notify === "function") {
                notify("Catégorie créée avec succès", "success");
            }

        } catch (error) {
            console.error("Erreur lors de la création :", error);
            sendBotMessage("❌ Erreur lors de la création de la catégorie.");

            if (typeof notify === "function") {
                notify("Échec de la création de la catégorie", "error");
            }
        }

        setSubmitting(false);
        setTimeout(() => {
            askActionType();
        }, 300);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && inputValue.trim()) {
            handleUserInput(inputValue.trim());
            setInputValue("");
        }
    };

    return (
        <div className="chatbot-container">
            <div
                className="chat-window"
                ref={chatWindowRef}
                style={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "8px"
                }}
            >
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.from}`}>
                        {msg.text}
                    </div>
                ))}

                {step === "categorie" && (
                    <div className="chat-bubble bot">
                        <p>Choisissez une catégorie :</p>
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                            maxHeight: "250px",
                            overflowY: "auto",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            backgroundColor: "#f9f9f9"
                        }}>
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(cat.id, cat.categorie)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "12px 16px",
                                        border: "1px solid #ccc",
                                        borderRadius: "6px",
                                        background: "white",
                                        cursor: "pointer",
                                        fontSize: "15px",
                                        textAlign: "left",
                                        transition: "all 0.2s ease",
                                        minHeight: "50px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = "#e8f5e8";
                                        e.target.style.borderColor = "#4caf50";
                                        e.target.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = "white";
                                        e.target.style.borderColor = "#ccc";
                                        e.target.style.transform = "translateY(0)";
                                    }}
                                >
                                    {cat.iconName && (
                                        <span style={{
                                            fontSize: "20px",
                                            minWidth: "25px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            {iconOptions.find(opt => opt.value === cat.iconName)?.label.split(' ')[0] || "📁"}
                                        </span>
                                    )}
                                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                                        <span style={{ fontWeight: "500", color: "#333" }}>{cat.categorie}</span>
                                        {cat.budgetDebutMois && (
                                            <span style={{ fontSize: "12px", color: "#666" }}>
                                                Budget: {cat.budgetDebutMois}€
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === "categoryColor" && (
                    <div className="chat-bubble bot category-buttons">
                        {["#FF5733", "#33FF57", "#3357FF", "#FF33F1", "#33FFF1", "#F1FF33", "#FF8C33", "#8C33FF"].map(color => (
                            <button
                                key={color}
                                onClick={() => handleColorSelect(color)}
                                style={{ backgroundColor: color, color: "white", margin: "2px" }}
                            >
                                {color}
                            </button>
                        ))}
                    </div>
                )}

                {step === "categoryMonth" && (
                    <div className="chat-bubble bot category-buttons">
                        {monthsOptions.map(month => (
                            <button key={month} onClick={() => handleMonthSelect(month)}>
                                {month}
                            </button>
                        ))}
                    </div>
                )}

                {step === "categoryIcon" && (
                    <div className="chat-bubble bot">
                        <p>Choisissez une icône :</p>
                        <div style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "8px",
                            padding: "10px",
                            border: "1px solid #ddd",
                            borderRadius: "6px",
                            backgroundColor: "#f9f9f9"
                        }}>
                            {iconOptions.map(icon => (
                                <button
                                    key={icon.value}
                                    onClick={() => handleIconSelect(icon.value, icon.label)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "flex-start",
                                        gap: "8px",
                                        padding: "8px 12px",
                                        border: "1px solid #ccc",
                                        borderRadius: "4px",
                                        background: "white",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        textAlign: "left",
                                        transition: "all 0.2s ease",
                                        minHeight: "40px"
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = "#e3f2fd";
                                        e.target.style.borderColor = "#2196f3";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = "white";
                                        e.target.style.borderColor = "#ccc";
                                    }}
                                >
                                    <span style={{ fontSize: "18px", minWidth: "20px" }}>
                                        {icon.label.split(' ')[0]}
                                    </span>
                                    <span style={{ fontSize: "13px", color: "#333" }}>
                                        {icon.label.substring(icon.label.indexOf(' ') + 1)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {step === "date" && (
                    <div className="chat-bubble bot">
                        <DatePicker
                            selected={pendingDate}
                            onChange={setPendingDate}
                            dateFormat="dd/MM/yyyy"
                        />
                        <button onClick={handleValidateDate} disabled={submitting}>
                            {submitting ? "En cours..." : "Valider la date"}
                        </button>
                    </div>
                )}

                {step === "validateCategory" && (
                    <div className="chat-bubble bot">
                        <div style={{
                            marginBottom: "15px",
                            padding: "15px",
                            border: "1px solid #e0e0e0",
                            borderRadius: "8px",
                            backgroundColor: "#f8f9fa"
                        }}>
                            <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>📋 Récapitulatif de la catégorie</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong>Nom :</strong>
                                    <span>{categoryData.categorie}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong>Description :</strong>
                                    <span>{categoryData.description || "Aucune"}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong>Couleur :</strong>
                                    <div style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: categoryData.color,
                                        borderRadius: "4px",
                                        border: "1px solid #ccc"
                                    }}></div>
                                    <span>{categoryData.color}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong>Période :</strong>
                                    <span>{categoryData.month} {categoryData.annee}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong>Budget :</strong>
                                    <span>{categoryData.budgetDebutMois}€</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <strong>Icône :</strong>
                                    {categoryData.iconName && (
                                        <span style={{ fontSize: "20px" }}>
                                            {iconOptions.find(i => i.value === categoryData.iconName)?.label.split(' ')[0]}
                                        </span>
                                    )}
                                    <span>{iconOptions.find(i => i.value === categoryData.iconName)?.label.substring(iconOptions.find(i => i.value === categoryData.iconName)?.label.indexOf(' ') + 1) || "Aucune"}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleValidateCategory}
                            disabled={submitting}
                            style={{
                                padding: "12px 24px",
                                backgroundColor: submitting ? "#ccc" : "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: submitting ? "not-allowed" : "pointer",
                                fontSize: "16px",
                                fontWeight: "500",
                                transition: "background-color 0.2s ease"
                            }}
                        >
                            {submitting ? "⏳ Création..." : "✅ Créer la catégorie"}
                        </button>
                    </div>
                )}

                {(step === "chooseType" || step === "description" || step === "montant" ||
                    step === "categoryName" || step === "categoryDescription" || step === "categoryColor" ||
                    step === "categoryYear" || step === "categoryBudget") && (
                    <div className="chat-input">
                        <input
                            key={inputKey}
                            placeholder="Votre réponse..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
}