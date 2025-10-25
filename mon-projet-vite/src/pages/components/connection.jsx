import React, { useCallback, useEffect, useState } from 'react';
import lien from '../components/lien.js';
import './css/dash.scss';
import Budget from "./Budget.jsx";
import './css/connexion.css'

const Connection = () => {
    const [messageLog, setMessageLog] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [mailError, setEmailError] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [probleme, setProbleme] = useState("non connecte");
    const [notification, setNotification] = useState({
        show: false,
        type: "error",
        message: "",
    });

    const [showForgotForm, setShowForgotForm] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");

    const isEmailValid = email.length > 0 && mailError === "";
    const isPasswordValid = password.length >= 3 && passwordError === "";

    useEffect(() => {
        fetchUserToken();
    }, []);

    useEffect(() => {
        if (mailError || passwordError) {
            const timer = setTimeout(() => {
                setEmailError("");
                setPasswordError("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [mailError, passwordError]);

    const showNotification = (type, message) => {
        setNotification({ show: true, type, message });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, show: false }));
        }, 5000);
    };

    const ValidateEmail = (mail) => {
        const valid = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail);
        if (!valid) {
            setEmailError("Adresse email invalide");
            showNotification("error", "Adresse email invalide");
        } else {
            setEmailError("");
        }
        return valid;
    };

    const fetchUserToken = useCallback(async () => {
        console.log('🔍 [Connection] Vérification du token utilisateur...');
        const jwt = localStorage.getItem('jwt');
        if (!jwt || jwt === "null" || jwt === "undefined") {
            console.log('❌ [Connection] Aucun token JWT trouvé dans localStorage');
            setMessageLog("Aucun token trouvé, veuillez vous connecter");
            return;
        }

        try {
            console.log('📡 [Connection] Envoi de la requête de vérification du token à:', lien.url + 'connection/user');
            const response = await fetch(lien.url+"connection/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ jwt })
            });

            if (!response.ok) {
                console.log('❌ [Connection] Erreur serveur lors de la vérification du token:', response.status);
                setMessageLog(`Erreur du serveur: ${response.status}`);
                showNotification("error", `Erreur du serveur: ${response.status}`);
                return;
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setMessageLog("Réponse invalide du serveur");
                showNotification("error", "Réponse invalide du serveur");
                return;
            }

            if (!isNaN(data?.id)) {
                console.log('✅ [Connection] Token valide - Utilisateur connecté avec ID:', data.id);
                localStorage.setItem("utilisateur", data.id);
                setMessageLog("Code Bon");
                setProbleme("connecte");
                showNotification("success", "Connexion réussie");
            } else {
                console.log('❌ [Connection] Token invalide - ID utilisateur non reçu');
                setMessageLog("Déconnecté - Token invalide");
                showNotification("warning", "Session expirée - Veuillez vous reconnecter");
            }
        } catch (error) {
            console.log('❌ [Connection] Erreur lors de la vérification du token:', error);
            setMessageLog("Erreur de connexion au serveur");
            showNotification("error", "Erreur de connexion au serveur");
        }
    }, []);

    const fetchConnection = useCallback(async (e) => {
        e.preventDefault();
        console.log('🔐 [Connection] Tentative de connexion pour l\'email:', email);
        setPasswordError("");

        if (!ValidateEmail(email)) {
            console.log('❌ [Connection] Email invalide:', email);
            return;
        }
        if (password.length < 3) {
            console.log('❌ [Connection] Mot de passe trop court (longueur:', password.length, ')');
            setPasswordError("Mot de passe trop court");
            showNotification("error", "Mot de passe trop court");
            return;
        }

        try {
            console.log('📡 [Connection] Envoi de la requête de connexion à:', lien.url + 'connection/login');
            const response = await fetch(lien.url+'connection/login', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                console.log('❌ [Connection] Erreur serveur lors de la connexion:', response.status);
                setMessageLog(`Erreur serveur: ${response.status}`);
                showNotification("error", `Erreur serveur: ${response.status}`);
                return;
            }

            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setMessageLog("Réponse invalide");
                showNotification("error", "Réponse invalide du serveur");
                return;
            }

            console.log('📊 [Connection] Données reçues:', data);

            // L'API login renvoie { status, success, message, id, email, nom, prenom, jwt }
            // Si success est false, afficher le message d'erreur
            if (data.success === false || data.message) {
                console.log('❌ [Connection] Échec de connexion:', data.message);
                setMessageLog(data.message);
                showNotification("error", data.message);
                return;
            }

            // Si success est true et qu'on a jwt et id, c'est bon
            if (data.success && data.jwt && !isNaN(data?.id)) {
                console.log('✅ [Connection] Connexion réussie! ID utilisateur:', data.id);
                console.log('💾 [Connection] Sauvegarde du JWT et de l\'ID utilisateur dans localStorage');
                localStorage.setItem("utilisateur", data.id);
                localStorage.setItem("jwt", data.jwt);
                setMessageLog("Connexion réussie");
                setProbleme("connecte");
                showNotification("success", "Connexion réussie");
                window.location.reload();
            } else {
                console.log('❌ [Connection] Réponse invalide - Données manquantes');
                setMessageLog("Erreur de connexion");
                showNotification("error", "Erreur de connexion");
            }
        } catch (error) {
            console.log('❌ [Connection] Erreur lors de la connexion:', error);
            setMessageLog("Erreur de connexion");
            showNotification("error", "Erreur de connexion au serveur");
        }
    }, [email, password]);

    const fetchForgotPassword = async (e) => {
        e.preventDefault();
        console.log('🔐 [Connection] Demande de réinitialisation de mot de passe pour:', forgotEmail);

        if (!ValidateEmail(forgotEmail)) {
            console.log('❌ [Connection] Email invalide pour réinitialisation:', forgotEmail);
            return;
        }

        try {
            console.log('📡 [Connection] Envoi de la demande de réinitialisation à:', lien.url + 'connection/forgot-password');
            const response = await fetch(lien.url + 'connection/forgot-password', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail })
            });

            if (!response.ok) {
                console.log('❌ [Connection] Erreur serveur lors de la réinitialisation:', response.status);
                setForgotMessage(`Erreur serveur: ${response.status}`);
                showNotification("error", `Erreur serveur: ${response.status}`);
                return;
            }

            // On ne dépend plus de data.message
            console.log('✅ [Connection] Demande de réinitialisation envoyée avec succès');
            setForgotMessage("Vérifie tes mails");
            showNotification("info", "Vérifie tes mails");

        } catch (error) {
            console.log('❌ [Connection] Erreur lors de l\'envoi de la demande de réinitialisation:', error);
            setForgotMessage("Erreur lors de l'envoi de la demande");
            showNotification("error", "Erreur lors de l'envoi de la demande");
        }
    };

    const handleLogout = () => {
        console.log('🚪 [Connection] Déconnexion de l\'utilisateur');
        localStorage.removeItem("jwt");
        localStorage.removeItem("utilisateur");
        setProbleme("non connecte");
        setEmail("");
        setPassword("");
        showNotification("info", "Déconnecté");
    };

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

            {probleme === "connecte" ? (
                <div>
                    <button onClick={handleLogout} className="logout-button">Déconnexion</button>
                    <Budget />
                </div>
            ) : (
                <div className="container2">
                    <h1>Budget Manager</h1>
                    <div className="status-indicator">{messageLog || probleme}</div>

                    <input
                        id="email"
                        value={email}
                        placeholder="📧 Adresse email"
                        onChange={e => setEmail(e.target.value)}
                        type="email"
                        className={mailError ? "input-error" : isEmailValid ? "input-success" : ""}
                    />
                    <p className="error">{mailError}</p>

                    <input
                        id="password"
                        value={password}
                        placeholder="🔒 Mot de passe"
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        className={passwordError ? "input-error" : isPasswordValid ? "input-success" : ""}
                    />
                    <p className="error">{passwordError}</p>

                    <button onClick={fetchConnection} id="btnLogin">LOGIN</button>

                    <button onClick={() => setShowForgotForm(!showForgotForm)} className="forgot-button">
                        {showForgotForm ? "Annuler" : "Mot de passe oublié ?"}
                    </button>

                    {showForgotForm && (
                        <div className="forgot-container">
                            <input
                                type="email"
                                placeholder="📧 Votre adresse email"
                                value={forgotEmail}
                                onChange={e => setForgotEmail(e.target.value)}
                                className={mailError ? "input-error" : ""}
                            />
                            <button onClick={fetchForgotPassword}>Envoyer</button>
                            {forgotMessage && <p className="info">{forgotMessage}</p>}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Connection;
