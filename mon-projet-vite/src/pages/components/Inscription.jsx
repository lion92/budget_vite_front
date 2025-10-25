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
        console.log('🔍 [Inscription] Validation du formulaire...');
        let valid = true;
        
        if (!nom.trim()) {
            console.log('❌ [Inscription] Nom manquant');
            setNomError("Le nom est obligatoire");
            valid = false;
        } else {
            setNomError("");
        }
        
        if (!prenom.trim()) {
            console.log('❌ [Inscription] Prénom manquant');
            setPrenomError("Le prénom est obligatoire");
            valid = false;
        } else {
            setPrenomError("");
        }
        
        if (!validateEmail(email)) {
            console.log('❌ [Inscription] Email invalide:', email);
            valid = false;
        }
        
        if (password.length < 12) {
            console.log('❌ [Inscription] Mot de passe trop court (longueur:', password.length, ')');
            setPasswordError("Le mot de passe doit comporter au moins 12 caractères");
            valid = false;
        } else {
            setPasswordError("");
        }

        console.log('🔍 [Inscription] Résultat de la validation:', valid ? 'Valide' : 'Invalide');
        return valid;
    };

    const fetchInscription = useCallback(async (e) => {
        e.preventDefault();
        console.log('📝 [Inscription] Début du processus d\'inscription pour:', email);
        setIsSuccess(false);
        setInscriptionMessage("");

        if (!validateForm()) {
            console.log('❌ [Inscription] Formulaire invalide - arrêt du processus');
            showNotification("error", "Veuillez corriger les erreurs dans le formulaire");
            return;
        }

        console.log('🔄 [Inscription] Démarrage de l\'inscription...');
        setIsLoading(true);

        try {
            console.log('📡 [Inscription] Envoi de la requête d\'inscription à:', `${lien.url}connection/signup`);
            console.log('📄 [Inscription] Données envoyées:', { nom: nom.trim(), prenom: prenom.trim(), email, password: '***' });
            const response = await fetch(`${lien.url}connection/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom: nom.trim(), prenom: prenom.trim(), email, password })
            });

            console.log('📊 [Inscription] Statut HTTP:', response.status, 'OK:', response.ok);

            // Essayer de parser le JSON, sinon lire comme texte
            const contentType = response.headers.get('content-type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json().catch(() => ({}));
            } else {
                const text = await response.text();
                console.log('📝 [Inscription] Réponse texte du serveur:', text);
                // Si c'est "ok", c'est que l'inscription a réussi
                if (text === 'ok' && (response.status === 200 || response.status === 201)) {
                    data = { success: true };
                } else {
                    data = { message: text };
                }
            }

            console.log('📝 [Inscription] Réponse reçue du serveur:', data);
            console.log('🔍 [Inscription] Vérification - data.jwt:', !!data.jwt, 'data.id:', data.id, 'data.success:', data.success);

            // L'API signup peut renvoyer soit { id, email, nom, prenom, jwt } soit juste "ok"
            // On vérifie les différents cas de succès
            if ((data.jwt && data.id) || data.success || (response.ok && !data.message)) {
                console.log('✅ [Inscription] Inscription réussie!');
                setIsSuccess(true);
                setInscriptionMessage("Inscription réussie ! Vérifiez votre email pour activer votre compte.");
                showNotification("success", "Inscription réussie ! Vérifiez vos emails.");

                // Reset form
                console.log('🧹 [Inscription] Nettoyage du formulaire après inscription réussie');
                setNom("");
                setPrenom("");
                setEmail("");
                setPassword("");
                setNomError("");
                setPrenomError("");
                setEmailError("");
                setPasswordError("");
            } else if (!response.ok) {
                console.log('❌ [Inscription] Erreur serveur lors de l\'inscription:', response.status);
                setIsSuccess(false);
                const errorMsg = data.message || `Erreur serveur: ${response.status}`;
                setInscriptionMessage(errorMsg);
                showNotification("error", errorMsg);
            } else {
                console.log('❌ [Inscription] Échec de l\'inscription - Données manquantes');
                console.log('📊 [Inscription] Données reçues:', JSON.stringify(data));
                setIsSuccess(false);
                const errorMsg = data.message || "Une erreur est survenue. Veuillez réessayer.";
                setInscriptionMessage(errorMsg);
                showNotification("error", errorMsg);
            }
        } catch (error) {
            console.log('❌ [Inscription] Erreur lors de l\'inscription:', error);
            const errorMsg = "Erreur de connexion au serveur.";
            setInscriptionMessage(errorMsg);
            showNotification("error", errorMsg);
        } finally {
            console.log('🏁 [Inscription] Fin du processus d\'inscription');
            setIsLoading(false);
        }
    }, [nom, prenom, email, password]);

    const isFormValid = nom.trim() && prenom.trim() && email && password.length >= 12 && !emailError;

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
                        placeholder="🔒 Mot de passe (min. 12 caractères)" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={12}
                        className={passwordError ? "input-error" : password.length >= 12 ? "input-success" : ""}
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