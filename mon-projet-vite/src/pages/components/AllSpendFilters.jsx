import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import lien from "./lien";
import useBudgetStore from "../../useBudgetStore.js";

const AllSpendFilters = () => {
    const [listDesDepense, setListDesDepense] = useState([]);
    const [filteredDepense, setFilteredDepense] = useState([]);
    const [minMontant, setMinMontant] = useState("");
    const [maxMontant, setMaxMontant] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [descriptionSearch, setDescriptionSearch] = useState("");
    const [categorieSearch, setCategorieSearch] = useState("");
    const [totalFilteredMontant, setTotalFilteredMontant] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        montant: "",
        description: "",
        categorie: "",
        dateTransaction: "",
    });

    const updateDepense = useBudgetStore((state) => state.updateDepense);
    const categories = useBudgetStore((state) => state.categories);
    const fetchCategories = useBudgetStore((state) => state.fetchCategories);

    const fetchAPI = async () => {
        const idUser = parseInt(localStorage.getItem("utilisateur"));
        if (isNaN(idUser)) return console.error("ID utilisateur invalide");
        try {
            const response = await fetch(`${lien.url}action/byuser/${idUser}`);
            const resbis = await response.json();
            setListDesDepense(resbis);
            setFilteredDepense(resbis);
        } catch (err) {
            console.error("Erreur récupération dépenses :", err);
        }
    };

    useEffect(() => {
        fetchAPI();
        fetchCategories(); // 🔁 pour alimenter <select>
    }, []);

    useEffect(() => {
        const filterExpenses = () => {
            let filtered = [...listDesDepense];
            if (minMontant) filtered = filtered.filter(e => Number(e.montant) >= parseFloat(minMontant));
            if (maxMontant) filtered = filtered.filter(e => Number(e.montant) <= parseFloat(maxMontant));
            if (startDate) filtered = filtered.filter(e => new Date(e.dateTransaction) >= new Date(startDate));
            if (endDate) filtered = filtered.filter(e => new Date(e.dateTransaction) <= new Date(endDate));
            if (descriptionSearch) filtered = filtered.filter(e => e.description.toLowerCase().includes(descriptionSearch.toLowerCase()));
            if (categorieSearch) filtered = filtered.filter(e => e.categorie.toLowerCase().includes(categorieSearch.toLowerCase()));

            setFilteredDepense(filtered);
            setTotalFilteredMontant(filtered.reduce((acc, e) => acc + Number(e.montant), 0));
        };

        filterExpenses();
    }, [minMontant, maxMontant, startDate, endDate, descriptionSearch, categorieSearch, listDesDepense]);

    const resetFilters = () => {
        setMinMontant("");
        setMaxMontant("");
        setStartDate("");
        setEndDate("");
        setDescriptionSearch("");
        setCategorieSearch("");
        setFilteredDepense(listDesDepense);
        setTotalFilteredMontant(listDesDepense.reduce((acc, e) => acc + Number(e.montant), 0));
    };

    const handleEdit = (item) => {
        const foundCategory = categories.find(c => c.nom === item.categorie);
        setEditData({
            montant: item.montant,
            description: item.description,
            categorie: foundCategory?.id || "",
            dateTransaction: item.dateTransaction.split("T")[0],
        });
        setEditingId(item.id);
    };

    const handleEditSubmit = async (id) => {
        const date = new Date(editData.dateTransaction);
        await updateDepense(
            {
                id,
                montant: editData.montant,
                description: editData.description,
                categorie: parseInt(editData.categorie),
                date,
            },
            (msg, type) => console.log(msg, type)
        );
        setEditingId(null);
        fetchAPI(); // 🔁 recharge les données
    };

    const exportExcel = () => {
        if (filteredDepense.length === 0) return alert("Aucune dépense à exporter.");
        const data = filteredDepense.map((item) => ({
            ID: item.id,
            Montant: Number(item.montant).toFixed(2),
            Description: item.description,
            Catégorie: item.categorie,
            Date: new Date(item.dateTransaction).toLocaleDateString("fr-FR"),
        }));
        const wb = XLSX.utils.book_new();
        const wsAll = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, wsAll, "Toutes les dépenses");
        const uniqueCategories = [...new Set(data.map((i) => i.Catégorie))];
        uniqueCategories.forEach((cat) => {
            const rows = data.filter((row) => row.Catégorie === cat);
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, cat.substring(0, 31));
        });
        XLSX.writeFile(wb, "depenses.xlsx");
    };

    const exportPDF = () => {
        if (filteredDepense.length === 0) return alert("Aucune dépense à exporter.");
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Dépenses filtrées", 14, 22);
        const tableData = filteredDepense.map((item) => [
            item.id,
            Number(item.montant).toFixed(2) + " €",
            item.description,
            item.categorie,
            new Date(item.dateTransaction).toLocaleDateString("fr-FR"),
        ]);
        doc.autoTable({
            head: [["ID", "Montant", "Description", "Catégorie", "Date"]],
            body: tableData,
            startY: 30,
        });
        doc.save("depenses.pdf");
    };

    return (
        <>
            <h1 style={{ fontSize: 20, color: "blueviolet", textAlign: "center" }}>
                Toutes vos dépenses
            </h1>

            <div style={{ textAlign: "center", marginBottom: 20 }}>
                <input type="number" placeholder="Montant min" value={minMontant} onChange={(e) => setMinMontant(e.target.value)} />
                <input type="number" placeholder="Montant max" value={maxMontant} onChange={(e) => setMaxMontant(e.target.value)} />
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <input type="text" placeholder="Recherche description" value={descriptionSearch} onChange={(e) => setDescriptionSearch(e.target.value)} />
                <input type="text" placeholder="Recherche catégorie" value={categorieSearch} onChange={(e) => setCategorieSearch(e.target.value)} />
                <button onClick={resetFilters}>Réinitialiser</button>
                <button onClick={exportExcel}>Exporter Excel</button>
                <button onClick={exportPDF}>Exporter PDF</button>
            </div>

            <div style={{ textAlign: "center", fontSize: 18, marginBottom: 10 }}>
                <strong>Total filtré : </strong> {totalFilteredMontant.toFixed(2)} €
            </div>

            <div style={{ overflowX: "auto", padding: "0 20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ backgroundColor: "#f1f1f1" }}>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Montant (€)</th>
                        <th style={thStyle}>Description</th>
                        <th style={thStyle}>Catégorie</th>
                        <th style={thStyle}>Date</th>
                        <th style={thStyle}>Icône</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDepense.map((item) => (
                        <tr key={item.id}>
                            <td style={tdStyle}>{item.id}</td>
                            <td style={tdStyle}>
                                {editingId === item.id ? (
                                    <input type="number" value={editData.montant} onChange={(e) => setEditData({ ...editData, montant: e.target.value })} />
                                ) : Number(item.montant).toFixed(2) + " €"}
                            </td>
                            <td style={tdStyle}>
                                {editingId === item.id ? (
                                    <input type="text" value={editData.description} onChange={(e) => setEditData({ ...editData, description: e.target.value })} />
                                ) : item.description}
                            </td>
                            <td style={tdStyle}>
                                {editingId === item.id ? (
                                    <select value={editData.categorie} onChange={(e) => setEditData({ ...editData, categorie: e.target.value })}>
                                        <option value="">-- Choisir --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.categorie}
                                            </option>
                                        ))}
                                    </select>
                                ) : item.categorie}
                            </td>
                            <td style={tdStyle}>
                                {editingId === item.id ? (
                                    <input type="date" value={editData.dateTransaction} onChange={(e) => setEditData({ ...editData, dateTransaction: e.target.value })} />
                                ) : new Date(item.dateTransaction).toLocaleDateString("fr-FR")}
                            </td>
                            <td style={tdStyle}>
                                <i className={item.iconName}></i>
                            </td>
                            <td style={tdStyle}>
                                {editingId === item.id ? (
                                    <>
                                        <button onClick={() => handleEditSubmit(item.id)}>✅</button>
                                        <button onClick={() => setEditingId(null)}>❌</button>
                                    </>
                                ) : (
                                    <button onClick={() => handleEdit(item)}>✏️</button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

const thStyle = {
    padding: "10px",
    borderBottom: "2px solid #ccc",
    textAlign: "left",
    fontWeight: "bold",
};

const tdStyle = {
    padding: "8px",
    fontSize: "14px",
};

export default AllSpendFilters;
