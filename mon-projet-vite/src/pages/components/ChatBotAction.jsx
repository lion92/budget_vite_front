import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/chat.css";
import useBudgetStore from "../../useBudgetStore";

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
        setMessages([{ from: "bot", text: "Souhaitez-vous ajouter une dépense ou un revenu ?" }]);
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
                    sendBotMessage("Très bien. Quelle est la description ?");
                    setStep("description");
                } else if (input === "revenu") {
                    setActionType("revenu");
                    sendBotMessage("Très bien. Quelle est la description ?");
                    setStep("description");
                } else {
                    sendBotMessage("Veuillez taper 'dépense' ou 'revenu'.");
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
                    maxHeight: "400px",  // Ajuste selon ta mise en page
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
                            onChange={setPendingDate}
                            dateFormat="dd/MM/yyyy"
                        />
                        <button onClick={handleValidateDate} disabled={submitting}>
                            {submitting ? "En cours..." : "Valider la date"}
                        </button>
                    </div>
                )}

                {(step === "chooseType" || step === "description" || step === "montant") && (
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
