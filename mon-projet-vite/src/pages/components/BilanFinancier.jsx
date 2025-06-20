import React, { useState } from "react";
import useBudgetStore from "../../useBudgetStore";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./css/bilanFniancier.css"

const BilanFinancier = () => {
    const { revenus, depenses } = useBudgetStore();
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1)); // 1er janvier
    const [endDate, setEndDate] = useState(new Date()); // aujourd'hui

    const revenusFiltres = (revenus || []).filter(r => {
        const d = new Date(r.date);
        return d >= startDate && d <= endDate;
    });

    const depensesFiltres = (depenses || []).filter(d => {
        const dDate = new Date(d.dateTransaction);
        return dDate >= startDate && dDate <= endDate;
    });

    const totalRevenus = revenusFiltres.reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);
    const totalDepenses = depensesFiltres.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);
    const solde = totalRevenus - totalDepenses;

    const message = solde > 0
        ? `Bravo, vous êtes bénéficiaire de ${solde.toFixed(2)} € !`
        : solde < 0
            ? `Attention, vous êtes en déficit de ${Math.abs(solde).toFixed(2)} €…`
            : "Votre budget est à l’équilibre.";

    const messageColor = solde > 0 ? "green" : solde < 0 ? "red" : "gray";

    return (
        <div className="bilan-financier">
            <h2>Bilan Financier</h2>

            <div className="periode-select">
                <label>Du :
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        dateFormat="dd/MM/yyyy"
                    />
                </label>

                <label>Au :
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        dateFormat="dd/MM/yyyy"
                    />
                </label>
            </div>

            <p><strong>Total des revenus :</strong> {totalRevenus.toFixed(2)} €</p>
            <p><strong>Total des dépenses :</strong> {totalDepenses.toFixed(2)} €</p>
            <p><strong>Solde :</strong> {solde.toFixed(2)} €</p>
            <p style={{ color: messageColor }}>{message}</p>
        </div>
    );
};

export default BilanFinancier;
