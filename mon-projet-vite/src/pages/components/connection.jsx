import React, {useCallback, useEffect, useState} from 'react';
import lien from '../components/lien.js';
import './css/dash.scss';
import Budget from "./Budget.jsx";
import './css/connexion.css';

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
        setNotification({show: true, type, message});
        setTimeout(() => {
            setNotification(prev => ({...prev, show: false}));
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
        const jwt = localStorage.getItem('jwt');
        if (!jwt || jwt === "null" || jwt === "undefined") {
            setMessageLog("Aucun token trouvé, veuillez vous connecter");
            return;
        }

        try {
            const response = await fetch(`${lien.url}connection/user`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({jwt})
            });

            if (!response.ok) {
                setMessageLog(`Erreur du serveur: ${response.status}`);
                showNotification("error", `Erreur du serveur: ${response.status}`);
                return;
            }

            const text = await response.text();
            if (!text) {
                setMessageLog("Réponse vide du serveur");
                showNotification("error", "Réponse vide du serveur");
                return;
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setMessageLog("Réponse invalide du serveur");
                showNotification("error", "Réponse invalide du serveur");
                return;
            }

            if (!isNaN(data?.id)) {
                localStorage.setItem("utilisateur", data.id);
                setMessageLog("Code Bon");
                setProbleme("connecte");
                showNotification("success", "Connexion réussie");
            } else {
                setMessageLog("Déconnecté - Token invalide");
                showNotification("warning", "Session expirée - Veuillez vous reconnecter");
            }
        } catch (err) {
            setMessageLog("Erreur de connexion au serveur");
            showNotification("error", "Erreur de connexion au serveur");
        }
    }, []);

    const fetchConnection = useCallback(async (e) => {
        e.preventDefault();
        setPasswordError("");

        if (!ValidateEmail(email)) return;
        if (password.length < 3) {
            setPasswordError("Mot de passe trop court");
            showNotification("error", "Mot de passe trop court");
            return;
        }

        try {
            const response = await fetch(`${lien.url}connection/login`, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email, password})
            });

            if (!response.ok) {
                setMessageLog(`Erreur serveur: ${response.status}`);
                showNotification("error", `Erreur serveur: ${response.status}`);
                return;
            }

            const text = await response.text();
            if (!text) {
                setMessageLog("Réponse vide du serveur");
                showNotification("error", "Réponse vide du serveur");
                return;
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch {
                setMessageLog("Réponse invalide");
                showNotification("error", "Réponse invalide du serveur");
                return;
            }

            if (data.message && !data.success) {
                setMessageLog(data.message);
                showNotification(data.message.includes("email") ? "warning" : "error", data.message);
                return;
            }

            if (!data.jwt) {
                setMessageLog("JWT manquant dans la réponse");
                showNotification("error", "JWT manquant dans la réponse");
                return;
            }

            if (!isNaN(data?.id)) {
                localStorage.setItem("utilisateur", data.id);
                localStorage.setItem("jwt", data.jwt);
                setMessageLog("Connexion réussie");
                setProbleme("connecte");
                showNotification("success", "Connexion réussie");
                window.location.reload();
            } else {
                setMessageLog("Identifiants incorrects");
                showNotification("error", "Identifiants incorrects");
            }
        } catch (err) {
            setMessageLog("Erreur de connexion");
            showNotification("error", "Erreur de connexion au serveur");
        }
    }, [email, password]);

    const handleLogout = () => {
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
                        <button onClick={() => setNotification(prev => ({...prev, show: false}))}>&times;</button>
                    </div>
                </div>
            )}

            {probleme === "connecte" ? (
                <div>
                    <button onClick={handleLogout} className="logout-button">Déconnexion</button>
                    <Budget/>
                </div>
            ) : (
                <div className="container2">
                    <div className="status-indicator">{messageLog || probleme}</div>

                    <input
                        id="email"
                        value={email}
                        placeholder="email"
                        onChange={e => setEmail(e.target.value)}
                        type="text"
                        className={mailError ? "input-error" : isEmailValid ? "input-success" : ""}
                    />
                    <p className="error">{mailError}</p>

                    <input
                        id="password"
                        value={password}
                        placeholder="password"
                        onChange={e => setPassword(e.target.value)}
                        type="password"
                        className={passwordError ? "input-error" : isPasswordValid ? "input-success" : ""}
                    />
                    <p className="error">{passwordError}</p>

                    <button onClick={fetchConnection} id="btnLogin">LOGIN</button>
                </div>
            )}
        </div>
    );
};

export default Connection;
