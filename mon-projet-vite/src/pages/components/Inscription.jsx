import React, { useCallback, useState } from 'react';
import lien from './lien';
import './css/connexion.css';

const Inscription = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nom, setNom] = useState("");
    const [prenom, setPrenom] = useState("");
    const [nomError, setNomError] = useState("");
    const [prenomError, setPrenomError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [inscriptionMessage, setInscriptionMessage] = useState("");
    const [notification, setNotification] = useState({
        show: false,
        type: "error",
        message: "",
    });

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const validateEmail = (mail) => {
        const valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
        setEmailError(valid ? "" : "Adresse email invalide");
        return valid;
    };

    const validateForm = () => {
        let valid = true;
        
        if (!nom.trim()) { 
            setNomError("Le nom est obligatoire"); 
            valid = false; 
        } else {
            setNomError("");
        }
        
        if (!prenom.trim()) { 
            setPrenomError("Le prénom est obligatoire"); 
            valid = false; 
        } else {
            setPrenomError("");
        }
        
        if (!validateEmail(email)) {
            valid = false;
        }
        
        if (password.length < 3) {
            setPasswordError("Le mot de passe doit comporter au moins 3 caractères");
            valid = false;
        } else {
            setPasswordError("");
        }
        
        return valid;
    };

    const fetchInscription = useCallback(async (e) => {
        e.preventDefault();
        setIsSuccess(false);
        setInscriptionMessage("");

        if (!validateForm()) {
            showNotification("error", "Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${lien.url}connection/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom: nom.trim(), prenom: prenom.trim(), email, password })
            });

            const data = await response.json().catch(() => ({}));
            
            if (response.ok) {
                setIsSuccess(true);
                setInscriptionMessage("Inscription réussie ! Vérifiez votre email pour activer votre compte.");
                showNotification("success", "Inscription réussie ! Vérifiez vos emails.");
                
                // Reset form
                setNom(""); 
                setPrenom(""); 
                setEmail(""); 
                setPassword("");
                setNomError("");
                setPrenomError("");
                setEmailError("");
                setPasswordError("");
            } else {
                setIsSuccess(false);
                const errorMsg = data.message || "Une erreur est survenue. Veuillez réessayer.";
                setInscriptionMessage(errorMsg);
                showNotification("error", errorMsg);
            }
        } catch (error) {
            console.error("Erreur inscription :", error);
            const errorMsg = "Erreur de connexion au serveur.";
            setInscriptionMessage(errorMsg);
            showNotification("error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [nom, prenom, email, password]);

    const isFormValid = nom.trim() && prenom.trim() && email && password.length >= 3 && !emailError;

    return (
        <div>
            {notification.show && (
                <div className={`notification ${notification.type}`}>
                    <div className="notification-content">
                        <span>{notification.message}</span>
                        <button onClick={() => setNotification(prev => ({ ...prev, show: false }))}>&times;</button>
                    </div>
                </div>
            )}

            <div className="container2">
                <h1>Créer un compte</h1>
                <div className="status-indicator">
                    Rejoignez Budget Manager pour gérer vos finances
                </div>

                <form onSubmit={fetchInscription}>
                    <input 
                        type="text" 
                        placeholder="👤 Nom" 
                        value={nom}
                        onChange={(e) => setNom(e.target.value)}
                        required
                        className={nomError ? "input-error" : nom.trim() ? "input-success" : ""}
                    />
                    {nomError && <p className="error">{nomError}</p>}

                    <input 
                        type="text" 
                        placeholder="🙂 Prénom" 
                        value={prenom}
                        onChange={(e) => setPrenom(e.target.value)}
                        required
                        className={prenomError ? "input-error" : prenom.trim() ? "input-success" : ""}
                    />
                    {prenomError && <p className="error">{prenomError}</p>}

                    <input 
                        type="email" 
                        placeholder="📧 Adresse email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={emailError ? "input-error" : email && !emailError ? "input-success" : ""}
                    />
                    {emailError && <p className="error">{emailError}</p>}

                    <input 
                        type="password" 
                        placeholder="🔒 Mot de passe (min. 3 caractères)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={3}
                        className={passwordError ? "input-error" : password.length >= 3 ? "input-success" : ""}
                    />
                    {passwordError && <p className="error">{passwordError}</p>}

                    {inscriptionMessage && (
                        <div className={isSuccess ? "success-message" : "error-message"}>
                            {inscriptionMessage}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        id="btnInscription"
                        disabled={isLoading || !isFormValid}
                        className={isLoading ? "loading" : ""}
                    >
                        {isLoading ? "Inscription en cours..." : "S'INSCRIRE"}
                    </button>

                    <div className="info-message">
                        ℹ️ Vous recevrez un email pour activer votre compte.
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Inscription;