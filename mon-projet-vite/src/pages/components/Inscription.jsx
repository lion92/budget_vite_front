import React, { useCallback, useState } from 'react';
import lien from './lien';
import './css/connexion.css'
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

    const validateEmail = (mail) => {
        const valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
        setEmailError(valid ? "" : "Adresse email invalide");
        return valid;
    };

    const validateForm = () => {
        let valid = true;
        if (!nom) { setNomError("Le nom est obligatoire"); valid = false; } else setNomError("");
        if (!prenom) { setPrenomError("Le prénom est obligatoire"); valid = false; } else setPrenomError("");
        if (!validateEmail(email)) valid = false;
        if (password.length < 3) {
            setPasswordError("Le mot de passe doit comporter au moins 3 caractères");
            valid = false;
        } else setPasswordError("");
        return valid;
    };

    const fetchInscription = useCallback(async (e) => {
        e.preventDefault();
        setIsSuccess(false);
        setInscriptionMessage("");

        if (!validateForm()) return;
        setIsLoading(true);

        try {
            const response = await fetch(`${lien.url}connection/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prenom, email, password })
            });

            const data = await response.json().catch(() => ({}));
            if (response.ok) {
                setIsSuccess(true);
                setInscriptionMessage("Inscription réussie ! Vérifiez votre email pour activer votre compte.");
                setNom(""); setPrenom(""); setEmail(""); setPassword("");
            } else {
                setIsSuccess(false);
                setInscriptionMessage(data.message || "Une erreur est survenue. Veuillez réessayer.");
            }
        } catch (error) {
            console.error("Erreur inscription :", error);
            setInscriptionMessage("Erreur de connexion au serveur.");
        } finally {
            setIsLoading(false);
        }
    }, [nom, prenom, email, password]);

    return (
        <div className="containerInscription">
            <div className="form-card">
                <h2>Inscription</h2>

                <input type="text" placeholder="Nom" value={nom}
                       onChange={e => setNom(e.target.value)}/>
                <p className="error">{nomError}</p>

                <input type="text" placeholder="Prénom" value={prenom}
                       onChange={e => setPrenom(e.target.value)}/>
                <p className="error">{prenomError}</p>

                <input type="text" placeholder="Email" value={email}
                       onChange={e => setEmail(e.target.value)}/>
                <p className="error">{emailError}</p>

                <input type="password" placeholder="Mot de passe" value={password}
                       onChange={e => setPassword(e.target.value)}/>
                <p className="error">{passwordError}</p>

                <p className={isSuccess ? "success-message" : "error-message"}>
                    {inscriptionMessage}
                </p>

                <button onClick={fetchInscription} disabled={isLoading}>
                    {isLoading ? "Inscription en cours..." : "S'inscrire"}
                </button>

                <p className="info-message">
                    Vous recevrez un email pour activer votre compte.
                </p>
            </div>
        </div>
    );
};

export default Inscription;
