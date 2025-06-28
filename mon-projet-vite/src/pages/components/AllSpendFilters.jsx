import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import lien from "./lien";

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

    useEffect(() => {
        const fetchAPI = async () => {
            const idUser = parseInt(localStorage.getItem("utilisateur"));
            if (isNaN(idUser)) {
                console.error("Invalid user ID from localStorage");
                return;
            }
            try {
                const response = await fetch(`${lien.url}action/byuser/${idUser}`);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                const resbis = await response.json();
                setListDesDepense(resbis);
                setFilteredDepense(resbis);
            } catch (error) {
                console.error("Failed to fetch expenses:", error);
            }
        };

        fetchAPI();
    }, []);

    useEffect(() => {
        const filterExpenses = () => {
            let filtered = listDesDepense;

            if (minMontant !== "") {
                filtered = filtered.filter(
                    (expense) => Number(expense.montant) >= parseFloat(minMontant)
                );
            }
            if (maxMontant !== "") {
                filtered = filtered.filter(
                    (expense) => Number(expense.montant) <= parseFloat(maxMontant)
                );
            }
            if (startDate !== "") {
                filtered = filtered.filter(
                    (expense) =>
                        new Date(expense.dateTransaction) >= new Date(startDate)
                );
            }
            if (endDate !== "") {
                filtered = filtered.filter(
                    (expense) => new Date(expense.dateTransaction) <= new Date(endDate)
                );
            }
            if (descriptionSearch !== "") {
                filtered = filtered.filter((expense) =>
                    expense.description
                        .toLowerCase()
                        .includes(descriptionSearch.toLowerCase())
                );
            }
            if (categorieSearch !== "") {
                filtered = filtered.filter((expense) =>
                    expense.categorie
                        .toLowerCase()
                        .includes(categorieSearch.toLowerCase())
                );
            }

            setFilteredDepense(filtered);
            const total = filtered.reduce(
                (acc, expense) => acc + Number(expense.montant),
                0
            );
            setTotalFilteredMontant(total);
        };

        filterExpenses();
    }, [
        minMontant,
        maxMontant,
        startDate,
        endDate,
        descriptionSearch,
        categorieSearch,
        listDesDepense,
    ]);

    const resetFilters = () => {
        setMinMontant("");
        setMaxMontant("");
        setStartDate("");
        setEndDate("");
        setDescriptionSearch("");
        setCategorieSearch("");
        setFilteredDepense(listDesDepense);
        setTotalFilteredMontant(
            listDesDepense.reduce((acc, expense) => acc + Number(expense.montant), 0)
        );
    };

    const exportExcel = () => {
        if (filteredDepense.length === 0) {
            alert("Aucune dépense à exporter.");
            return;
        }

        const data = filteredDepense.map((item) => ({
            ID: item.id,
            Montant: Number(item.montant).toFixed(2),
            Description: item.description,
            Catégorie: item.categorie,
            Date: new Date(item.dateTransaction).toLocaleDateString("fr-FR"),
        }));

        const wb = XLSX.utils.book_new();

        // Onglet global
        const wsAll = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, wsAll, "Toutes les dépenses");

        // Onglets par catégorie
        const categories = [...new Set(filteredDepense.map((i) => i.categorie))];
        categories.forEach((categorie) => {
            const rows = data.filter((row) => row.Catégorie === categorie);
            const ws = XLSX.utils.json_to_sheet(rows);
            XLSX.utils.book_append_sheet(wb, ws, categorie.substring(0, 31));
        });

        XLSX.writeFile(wb, "depenses.xlsx");
    };

    const exportPDF = () => {
        if (filteredDepense.length === 0) {
            alert("Aucune dépense à exporter.");
            return;
        }

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

            <div
                className="container"
                style={{ marginBottom: "20px", textAlign: "center" }}
            >
                <input
                    type="number"
                    placeholder="Montant minimal"
                    value={minMontant}
                    onChange={(e) => setMinMontant(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <input
                    type="number"
                    placeholder="Montant maximal"
                    value={maxMontant}
                    onChange={(e) => setMaxMontant(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    style={{ marginRight: "10px", color: "black" }}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ marginRight: "10px", color: "black" }}
                />
                <input
                    type="text"
                    placeholder="Recherche description"
                    value={descriptionSearch}
                    onChange={(e) => setDescriptionSearch(e.target.value)}
                    style={{ marginRight: "10px", color: "black" }}
                />
                <input
                    type="text"
                    placeholder="Recherche catégorie"
                    value={categorieSearch}
                    onChange={(e) => setCategorieSearch(e.target.value)}
                    style={{ marginRight: "10px", color: "black" }}
                />
                <button
                    onClick={resetFilters}
                    style={{ padding: "5px 10px", marginLeft: "10px" }}
                >
                    Réinitialiser
                </button>
                <button
                    onClick={exportExcel}
                    style={{ padding: "5px 10px", marginLeft: "10px" }}
                >
                    Exporter Excel
                </button>
                <button
                    onClick={exportPDF}
                    style={{ padding: "5px 10px", marginLeft: "10px" }}
                >
                    Exporter PDF
                </button>
            </div>

            <div
                style={{
                    textAlign: "center",
                    marginBottom: "20px",
                    color: "red",
                    fontSize: 30,
                }}
            >
                <strong style={{ color: "black" }}>
                    Total des montants après filtre :{" "}
                </strong>
                {totalFilteredMontant.toFixed(2)} €
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
                    </tr>
                    </thead>
                    <tbody>
                    {filteredDepense.map((item) => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #ddd" }}>
                            <td style={tdStyle}>{item.id}</td>
                            <td style={{ ...tdStyle, color: "red" }}>
                                {Number(item.montant).toFixed(2)} €
                            </td>
                            <td style={tdStyle}>{item.description}</td>
                            <td style={tdStyle}>{item.categorie}</td>
                            <td style={tdStyle}>
                                {new Date(item.dateTransaction).toLocaleDateString("fr-FR")}
                            </td>
                            <td style={{ ...tdStyle, fontSize: "24px", color: "black" }}>
                                <i className={item.iconName}></i>
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
