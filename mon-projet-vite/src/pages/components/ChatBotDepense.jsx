import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/chat.css";
import useBudgetStore from "../../useBudgetStore";

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

const getIconEmoji = (iconValue) => {
    const icon = iconOptions.find(opt => opt.value === iconValue);
    return icon ? icon.label.split(' ')[0] : "📁";
};

export default function ChatBotDepense({ addDepense = null, notify = () => {} }) {
    // ✅ notify par défaut = fonction vide
    const { categories, fetchCategories, addDepense: storeAddDepense } = useBudgetStore();
    const [messages, setMessages] = useState([]);
    const [step, setStep] = useState("description");
    const [formData, setFormData] = useState({
        description: "",
        montant: "",
        categorie: "",
        date: new Date()
    });
    const [inputValue, setInputValue] = useState("");
    const [pendingDate, setPendingDate] = useState(new Date());
    const [submitting, setSubmitting] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    useEffect(() => {
        if (categories.length === 0) {
            fetchCategories();
        }
        startNewConversation();
    }, []);

    const startNewConversation = () => {
        setMessages([{ from: "bot", text: "Nous allons ajouter une dépense. Quelle est la description ?" }]);
        setStep("description");
        setFormData({
            description: "",
            montant: "",
            categorie: "",
            date: new Date()
        });
        setPendingDate(new Date());
        setInputValue("");
        setResetKey(prev => prev + 1);
    };

    const sendBotMessage = (text) => {
        setMessages(prev => [...prev, { from: "bot", text }]);
    };

    const handleUserInput = (text) => {
        setMessages(prev => [...prev, { from: "user", text }]);
        processStep(text);
    };

    const processStep = (input) => {
        switch (step) {
            case "description":
                setFormData(prev => ({ ...prev, description: input }));
                sendBotMessage("Quel est le montant ?");
                setStep("montant");
                break;

            case "montant": {
                if (!/^\d+(\.\d{0,2})?$/.test(input)) {
                    sendBotMessage("Veuillez entrer un montant valide (ex : 12.50). Maximum 2 chiffres après la virgule.");
                    return;
                }
                // Stocke proprement à 2 décimales
                const montantFormate = parseFloat(input).toFixed(2);
                setFormData(prev => ({ ...prev, montant: montantFormate }));
                if (categories.length > 0) {
                    sendBotMessage("Choisissez une catégorie en cliquant sur un des boutons ci-dessous :");
                    setStep("categorie");
                } else {
                    sendBotMessage("⚠️ Aucune catégorie disponible. Veuillez en créer une d'abord.");
                    setStep("done");
                }
                break;
            }

            default:
                break;
        }
    };

    const handleCategorySelect = (catId, catName) => {
        setMessages(prev => [...prev, { from: "user", text: catName }]);
        setFormData(prev => ({ ...prev, categorie: catId }));
        sendBotMessage("Sélectionnez une date puis cliquez sur Valider :");
        setStep("date");
    };

    const handleValidateDate = async () => {
        if (!(pendingDate instanceof Date) || isNaN(pendingDate.getTime())) {
            sendBotMessage("⚠️ Veuillez choisir une date valide.");
            return;
        }

        setFormData(prev => ({ ...prev, date: pendingDate }));

        if (submitting) return;
        setSubmitting(true);

        const depenseToAdd = {
            ...formData,
            date: pendingDate,
            montant: parseFloat(formData.montant)
        };

        if (addDepense) {
            await addDepense(depenseToAdd, notify);
        } else {
            await storeAddDepense(depenseToAdd, notify);
        }

        sendBotMessage("✅ Dépense ajoutée avec succès !");
        if (typeof notify === "function") {
            notify("Dépense ajoutée avec succès !", "success");
        }
        setSubmitting(false);
        setTimeout(() => {
            startNewConversation();
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
            <div className="chat-window">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.from}`}>
                        {msg.text}
                    </div>
                ))}

                {step === "categorie" && (
                    <div className="chat-bubble bot">
                        <p style={{ marginBottom: "12px", fontWeight: "500" }}>Choisissez une catégorie :</p>
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
                                    className="category-button"
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        padding: "14px 18px",
                                        border: "2px solid #ddd",
                                        borderRadius: "10px",
                                        background: "white",
                                        cursor: "pointer",
                                        fontSize: "16px",
                                        textAlign: "left",
                                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                        minHeight: "56px",
                                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)"
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
                                            {getIconEmoji(cat.iconName)}
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

                {step === "date" && (
                    <div className="chat-bubble bot">
                        <p style={{ marginBottom: "12px", fontWeight: "500" }}>Sélectionnez une date :</p>
                        <DatePicker
                            selected={pendingDate}
                            onChange={(date) => setPendingDate(date)}
                            dateFormat="dd/MM/yyyy"
                            inline
                        />
                        <button
                            onClick={handleValidateDate}
                            disabled={submitting}
                            style={{
                                width: "100%",
                                marginTop: "12px",
                                padding: "12px",
                                backgroundColor: submitting ? "#ccc" : "#4caf50",
                                color: "white",
                                border: "none",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "600",
                                cursor: submitting ? "not-allowed" : "pointer"
                            }}
                        >
                            {submitting ? "⏳ En cours..." : "✅ Valider la date"}
                        </button>
                    </div>
                )}

                {(step === "description" || step === "montant") && (
                    <div className="chat-input">
                        <input
                            key={resetKey}
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
