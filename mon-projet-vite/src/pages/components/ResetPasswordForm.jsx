import React, { useState } from "react";
import lien from "../components/lien.js";
import "./css/connexion.css";

const ResetPasswordForm = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);

    const token = new URLSearchParams(window.location.search).get("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setSuccess(false);

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

            const data = await response.json().catch(() => ({})); // pour éviter erreur si pas un JSON

            if (!response.ok) {
                setMessage(data.message || `Erreur serveur: ${response.status}`);
                return;
            }

            setMessage(data.message || "Mot de passe réinitialisé");
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
                    {message && (
                        <p className={success ? "success" : "error"}>{message}</p>
                    )}
                </form>
            )}
        </div>
    );
};

export default ResetPasswordForm;
