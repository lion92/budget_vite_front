import React, { useState } from "react";
import RevenueManager from "./pages/components/RevenuManager";
import { FilePlus } from "lucide-react";

export function Revenues() {
    const [showRevenuForm, setShowRevenuForm] = useState(false);

return(
    <>
        <button onClick={() => setShowRevenuForm(true)}><FilePlus/> Ajouter un revenu</button>
        {showRevenuForm && (
            <div className="modal-overlay">
                <div className="modal-content">
                    <RevenueManager onClose={() => setShowRevenuForm(false)}/>
                    <button type="button" onClick={() => setShowRevenuForm(false)}>Fermer</button>
                </div>
            </div>
        )}
    </>

)
}