import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/chat.css";
import useBudgetStore from "../../useBudgetStore";

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

            case "montant":
                if (!/^\d+(\.\d{1,2})?$/.test(input)) {
                    sendBotMessage("Veuillez entrer un montant valide (ex : 12.50).");
                    return;
                }
                setFormData(prev => ({ ...prev, montant: input }));
                if (categories.length > 0) {
                    sendBotMessage("Choisissez une catégorie en cliquant sur un des boutons ci-dessous :");
                    setStep("categorie");
                } else {
                    sendBotMessage("⚠️ Aucune catégorie disponible. Veuillez en créer une d'abord.");
                    setStep("done");
                }
                break;

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
                    <div className="chat-bubble bot category-buttons">
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => handleCategorySelect(cat.id, cat.categorie)}>
                                {cat.categorie}
                            </button>
                        ))}
                    </div>
                )}

                {step === "date" && (
                    <div className="chat-bubble bot">
                        <DatePicker
                            selected={pendingDate}
                            onChange={(date) => setPendingDate(date)}
                            dateFormat="dd/MM/yyyy"
                        />
                        <button onClick={handleValidateDate}>Valider la date</button>
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
