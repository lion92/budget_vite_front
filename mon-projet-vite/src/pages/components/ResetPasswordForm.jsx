import React, { useState } from "react";
import lien from "../components/lien.js";
import "./css/connexion.css"; // Tu peux réutiliser ton style existant

const ResetPasswordForm = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    // Récupération du token dans l'URL
    const token = new URLSearchParams(window.location.search).get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword.length < 3) {
            setMessage("Le mot de passe doit contenir au moins 3 caractères");
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage("Les mots de passe ne correspondent pas");
            return;
        }

        try {
            const response = await fetch(lien.url + "connection/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setMessage(errorData.message || "Erreur serveur");
                return;
            }

            const data = await response.json();
            setMessage(data.message);
            if (data.success) {
                setSuccess(true);
            }
        } catch {
            setMessage("Erreur lors de la réinitialisation");
        }
    };

    return (
        <div className="container2">
            <h2>Réinitialisation du mot de passe</h2>
            {success ? (
                <p className="success">{message}</p>
            ) : (
                <form onSubmit={handleSubmit} className="reset-form">
                    <input
                        type="password"
                        placeholder="Nouveau mot de passe"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirmez le mot de passe"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit">Réinitialiser</button>
                    {message && <p className={success ? "success" : "error"}>{message}</p>}
                </form>
            )}
        </div>
    );
};

export default ResetPasswordForm;
