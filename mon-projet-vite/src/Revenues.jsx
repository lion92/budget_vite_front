import React, {useRef, useState} from "react";
import {useNotify} from "./pages/components/Notification";
import useBudgetStore from "./useBudgetStore";
import RevenueManager from "./pages/components/RevenuManager";

import {FilePlus} from "lucide-react";

export function Revenues() {
    const [depensesForm, setDepensesForm] = useState([{description: "", montant: 0, categorie: "", date: new Date()}]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showModal, setShowModal] = useState(false);
    const [showDepenseForm, setShowDepenseForm] = useState(false);
    const [showRevenuForm, setShowRevenuForm] = useState(false);
    const [showDepenseTable, setShowDepenseTable] = useState(true);
    const [showGraph, setShowGraph] = useState(true);
    const [filterId, setFilterId] = useState('');
    const [filterMontant, setFilterMontant] = useState('');
    const [filterDescription, setFilterDescription] = useState('');
    const [filterCategorie, setFilterCategorie] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const notify = useNotify();
    const bilanRef = useRef();

    const {
        depenses,
        revenus,
        categories,
        fetchDepenses,
        fetchCategories,
        fetchRevenus,
        addDepense,
        deleteDepense
    } = useBudgetStore();

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