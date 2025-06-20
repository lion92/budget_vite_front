// AllSpend.jsx avec Zustand
import React, {useEffect, useRef, useState} from "react";
import {Bar} from "react-chartjs-2";
import html2canvas from "html2canvas";
import {jsPDF} from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import MonthlyExpensesByCategory from './MonthlyExpensesByCategoryIntegration.jsx';
import useBudgetStore from "../../useBudgetStore";

const AllSpend = () => {
    const pdfRef = useRef();
    const [budget, setBudget] = useState(0);
    const [budgetUsed, setBudgetUsed] = useState(0);
    const [budgetRemaining, setBudgetRemaining] = useState(0);

    const {
        depenses,
        monthlySummary,
        categoryColors,
        fetchDepenses,
        generateMonthlySummary,
        assignCategoryColors
    } = useBudgetStore();

    useEffect(() => {
        const init = async () => {
            await fetchDepenses();
            generateMonthlySummary();
            assignCategoryColors();
        };
        init();
    }, [fetchDepenses, generateMonthlySummary, assignCategoryColors]);

    useEffect(() => {
        const total = depenses.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);
        setBudgetUsed(total);
        setBudgetRemaining(budget - total);
    }, [depenses, budget]);

    const exportToPDF = async () => {
        const pdf = new jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        let yOffset = margin;

        // Définir les couleurs de la charte graphique
        const primaryColor = [88, 24, 139]; // blueviolet en RGB
        const secondaryColor = [33, 150, 243]; // bleu accent
        const textColor = [60, 60, 60]; // gris foncé pour le texte

        // Ajouter un en-tête stylisé
        // Fond de l'en-tête
        pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.rect(0, 0, pageWidth, 30, 'F');

        // Titre du document
        pdf.setTextColor(255, 255, 255); // Texte blanc
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(22);
        pdf.text("Bilan Mensuel des Dépenses", pageWidth / 2, 15, {align: "center"});

        // Sous-titre avec la date
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "italic");
        pdf.text(`Généré le ${new Date().toLocaleDateString("fr-FR", {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })}`, pageWidth / 2, 24, {align: "center"});

        // Commencer après l'en-tête
        yOffset = 40;

        // Sommaire / Aperçu général
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("Résumé Financier", margin, yOffset);
        yOffset += 8;

        // Séparateur
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 8;

        // Contenus du résumé
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);

        // Calcul des totaux pour le résumé
        const totalMonths = Object.keys(monthlySummary).length;
        const totalExpenses = Object.values(monthlySummary).reduce((sum, {total}) => sum + total, 0);
        const avgMonthlyExpense = totalExpenses / (totalMonths || 1);

        // Détermination du mois avec les dépenses les plus élevées
        let highestMonth = {month: "-", amount: 0};
        Object.entries(monthlySummary).forEach(([month, {total}]) => {
            if (total > highestMonth.amount) {
                highestMonth = {month, amount: total};
            }
        });

        // Détermination de la catégorie avec les dépenses les plus élevées
        const allCategories = {};
        Object.values(monthlySummary).forEach(({categories}) => {
            Object.entries(categories).forEach(([category, amount]) => {
                allCategories[category] = (allCategories[category] || 0) + amount;
            });
        });

        let highestCategory = {category: "-", amount: 0};
        Object.entries(allCategories).forEach(([category, amount]) => {
            if (amount > highestCategory.amount) {
                highestCategory = {category, amount};
            }
        });

        // Ajouter les informations du résumé dans un tableau informatif
        const summaryData = [
            ["Période couverte", `${totalMonths} mois`],
            ["Dépenses totales", `${totalExpenses.toFixed(2)} €`],
            ["Moyenne mensuelle", `${avgMonthlyExpense.toFixed(2)} €`],
            ["Mois avec le plus de dépenses", `${highestMonth.month} (${highestMonth.amount.toFixed(2)} €)`],
            ["Catégorie principale", `${highestCategory.category} (${highestCategory.amount.toFixed(2)} €)`]
        ];

        pdf.autoTable({
            startY: yOffset,
            body: summaryData,
            theme: 'plain',
            styles: {
                cellPadding: 5,
                fontSize: 11,
                textColor: [60, 60, 60],
            },
            columnStyles: {
                0: {fontStyle: 'bold', cellWidth: 80},
                1: {cellWidth: 'auto'}
            },
            margin: {left: margin, right: margin},
            alternateRowStyles: {fillColor: [245, 245, 255]}
        });

        yOffset = pdf.autoTable.previous.finalY + 15;

        // Graphique des dépenses (capture à partir du DOM)
        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(16);
        pdf.text("Évolution des Dépenses", margin, yOffset);
        yOffset += 8;

        // Séparateur
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 10;

        try {
            // Sélectionner uniquement le graphique (et non tout le contenu du PDF)
            const chartContainer = document.querySelector("[data-testid='bar-chart-container']") ||
                document.querySelector(".chartjs-render-monitor") ||
                document.querySelector("canvas");

            if (chartContainer) {
                const chartCanvas = await html2canvas(chartContainer);
                const chartImage = chartCanvas.toDataURL("image/png");

                // Calculer la taille pour que l'image s'adapte à la largeur de la page
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;

                // Vérifier si l'image tiendra sur la page actuelle
                if (yOffset + imgHeight + 20 > pageHeight) {
                    pdf.addPage();
                    yOffset = margin;
                }

                pdf.addImage(chartImage, "PNG", margin, yOffset, imgWidth, imgHeight);
                yOffset += imgHeight + 15;
            }
        } catch (error) {
            console.error("Erreur lors de la capture du graphique :", error);
            yOffset += 10; // avancer même en cas d'erreur
        }

        // NOUVELLE SECTION: Bilan détaillé par catégorie
        pdf.addPage();
        yOffset = margin;

        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("Bilan Détaillé par Catégorie", pageWidth / 2, yOffset, {align: "center"});
        yOffset += 10;

        // Séparateur principal
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 12;

        // Compiler toutes les dépenses par catégorie
        const categoriesDetails = {};

        // Parcourir toutes les dépenses pour les regrouper par catégorie
        depenses.forEach(({montant, dateTransaction, categorie, description = ""}) => {
            if (!categoriesDetails[categorie]) {
                categoriesDetails[categorie] = {
                    totalAmount: 0,
                    transactions: [],
                    color: categoryColors[categorie] || "#CCCCCC"
                };
            }

            categoriesDetails[categorie].totalAmount += montant;
            categoriesDetails[categorie].transactions.push({
                date: new Date(dateTransaction).toLocaleDateString("fr-FR"),
                description,
                amount: montant
            });
        });

        // Trier les catégories par montant total (du plus élevé au plus bas)
        const sortedCategories = Object.entries(categoriesDetails)
            .sort(([, a], [, b]) => b.totalAmount - a.totalAmount);

        // Afficher chaque catégorie avec ses détails
        for (const [category, details] of sortedCategories) {
            // Vérifier s'il reste suffisamment d'espace sur la page
            if (yOffset > pageHeight - 60) {
                pdf.addPage();
                yOffset = margin;
            }

            // Convertir la couleur hex en RGB pour l'utiliser dans le PDF
            let categoryColorRGB = [100, 100, 100]; // couleur par défaut
            if (details.color && details.color.startsWith('#')) {
                const hex = details.color.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                categoryColorRGB = [r, g, b];
            }

            // En-tête de la catégorie avec sa couleur
            pdf.setFillColor(categoryColorRGB[0], categoryColorRGB[1], categoryColorRGB[2]);

            // Déterminer si le texte doit être blanc ou noir selon la luminosité du fond
            const luminance = (0.299 * categoryColorRGB[0] + 0.587 * categoryColorRGB[1] + 0.114 * categoryColorRGB[2]) / 255;
            const textColorForHeader = luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];

            // Barre colorée avec le nom de la catégorie
            pdf.setFillColor(categoryColorRGB[0], categoryColorRGB[1], categoryColorRGB[2]);
            pdf.rect(margin, yOffset, pageWidth - (margin * 2), 10, 'F');

            pdf.setTextColor(textColorForHeader[0], textColorForHeader[1], textColorForHeader[2]);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`${category} - Total: ${details.totalAmount.toFixed(2)} € (${(details.totalAmount / totalExpenses * 100).toFixed(1)}%)`,
                margin + 3, yOffset + 6);

            yOffset += 15;

            // Tableau des transactions pour cette catégorie
            const transactionsData = details.transactions.map(t => [
                t.date,
                t.description || "-",
                `${t.amount.toFixed(2)} €`
            ]);

            if (transactionsData.length > 0) {
                pdf.autoTable({
                    startY: yOffset,
                    head: [["Date", "Description", "Montant"]],
                    body: transactionsData,
                    theme: "grid",
                    styles: {
                        fontSize: 9,
                        cellPadding: 3
                    },
                    headStyles: {
                        fillColor: [categoryColorRGB[0], categoryColorRGB[1], categoryColorRGB[2]],
                        textColor: textColorForHeader,
                        fontStyle: 'bold'
                    },
                    columnStyles: {
                        0: {cellWidth: 30},
                        1: {cellWidth: 'auto'},
                        2: {cellWidth: 30, halign: 'right'}
                    },
                    alternateRowStyles: {fillColor: [250, 250, 250]},
                    margin: {left: margin, right: margin},
                });

                yOffset = pdf.autoTable.previous.finalY + 15;
            } else {
                yOffset += 10;
            }

            // Statistiques supplémentaires pour la catégorie
            if (details.transactions.length > 0) {
                const avgTransaction = details.totalAmount / details.transactions.length;
                const maxTransaction = Math.max(...details.transactions.map(t => t.amount));
                const minTransaction = Math.min(...details.transactions.map(t => t.amount));

                pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
                pdf.setFontSize(9);
                pdf.setFont("helvetica", "normal");

                pdf.text([
                    `Nombre de transactions: ${details.transactions.length}`,
                    `Montant moyen: ${avgTransaction.toFixed(2)} €`,
                    `Transaction max: ${maxTransaction.toFixed(2)} €`,
                    `Transaction min: ${minTransaction.toFixed(2)} €`
                ], margin, yOffset, {lineHeightFactor: 1.5});

                yOffset += 30;
            }
        }

        // Détail par mois
        pdf.addPage();
        yOffset = margin;

        pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(18);
        pdf.text("Détail Mensuel des Dépenses", pageWidth / 2, yOffset, {align: "center"});
        yOffset += 10;

        // Séparateur principal
        pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        pdf.setLineWidth(0.5);
        pdf.line(margin, yOffset, pageWidth - margin, yOffset);
        yOffset += 12;

        Object.entries(monthlySummary).forEach(([month, {total, categories}]) => {
            // Vérifier s'il reste suffisamment d'espace sur la page
            if (yOffset > pageHeight - 60) {
                pdf.addPage();
                yOffset = margin;
            }

            // Titre du mois
            pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(14);
            pdf.text(month, margin, yOffset);
            yOffset += 6;

            // Mini séparateur
            pdf.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
            pdf.setLineWidth(0.3);
            pdf.line(margin, yOffset, margin + 30, yOffset);
            yOffset += 8;

            // Total mensuel
            pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.text(`Dépense Totale: ${total.toFixed(2)} €`, margin, yOffset);
            yOffset += 10;

            // Tableau des catégories
            const tableData = Object.entries(categories).map(([category, amount]) => [
                category,
                `${amount.toFixed(2)} €`,
                `${((amount / total) * 100).toFixed(1)}%` // Ajouter le pourcentage
            ]);

            pdf.autoTable({
                startY: yOffset,
                head: [["Catégorie", "Montant", "% du mois"]],
                body: tableData,
                theme: "grid",
                styles: {
                    fontSize: 10,
                    cellPadding: 5
                },
                headStyles: {
                    fillColor: secondaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: {cellWidth: 'auto'},
                    1: {cellWidth: 40, halign: 'right'},
                    2: {cellWidth: 30, halign: 'right'}
                },
                didParseCell: function (data) {
                    if (data.section === "body" && data.column.index === 0) {
                        const category = data.cell.raw;
                        if (categoryColors[category]) {
                            // Convertir la couleur hex en RGB
                            const hex = categoryColors[category].replace('#', '');
                            const r = parseInt(hex.substring(0, 2), 16);
                            const g = parseInt(hex.substring(2, 4), 16);
                            const b = parseInt(hex.substring(4, 6), 16);

                            // Appliquer avec une transparence pour un effet plus doux
                            data.cell.styles.fillColor = [r, g, b];
                            // Ajuster la couleur du texte selon la luminosité de la couleur de fond
                            const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                            data.cell.styles.textColor = luminance > 0.5 ? [0, 0, 0] : [255, 255, 255];
                        }
                    }
                },
                margin: {left: margin, right: margin},
            });

            yOffset = pdf.autoTable.previous.finalY + 15;
        });

        // Table des matières
        pdf.setPage(1);
        pdf.setFontSize(10);
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
        pdf.text("Table des matières:", 140, 40);
        pdf.text("1. Résumé Financier - p.1", 140, 48);
        pdf.text("2. Évolution des Dépenses - p.1", 140, 54);
        pdf.text("3. Bilan Détaillé par Catégorie - p.2", 140, 60);
        pdf.text("4. Détail Mensuel des Dépenses - p." + (sortedCategories.length > 3 ? "4" : "3"), 140, 66);

        // Pied de page
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);

            // Pied de page avec numéro de page
            pdf.setFontSize(8);
            pdf.setTextColor(150, 150, 150);
            pdf.text(`Page ${i} sur ${totalPages}`, pageWidth - margin, pageHeight - 10, {align: "right"});

            // Ligne de séparation du pied de page
            pdf.setDrawColor(200, 200, 200);
            pdf.setLineWidth(0.1);
            pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

            // Copyright ou texte informatif
            pdf.text("Budget Manager - Rapport confidentiel", margin, pageHeight - 10);
        }

        // Enregistrer le PDF
        pdf.save("Bilan_Financier_Détaillé.pdf");
    };

    // Nouvelle fonction pour exporter en Excel
    const exportToExcel = () => {
        // Création d'un workbook vide
        const wb = XLSX.utils.book_new();

        // --- FEUILLE 1: TABLEAU DE BORD ---

        // Création des données pour le tableau de bord
        const dashboardData = [
            ["TABLEAU DE BORD FINANCIER"],
            [""],
            ["Généré le", new Date().toLocaleDateString("fr-FR", {day: '2-digit', month: 'long', year: 'numeric'})],
            [""],
        ];

        // Calcul des statistiques générales
        const totalExpenses = Object.values(monthlySummary).reduce((sum, {total}) => sum + total, 0);
        const totalMonths = Object.keys(monthlySummary).length;
        const avgMonthlyExpense = totalExpenses / (totalMonths || 1);

        // Trouver le mois avec le plus de dépenses
        let highestMonth = {month: "-", amount: 0};
        Object.entries(monthlySummary).forEach(([month, {total}]) => {
            if (total > highestMonth.amount) {
                highestMonth = {month, amount: total};
            }
        });

        // Compiler toutes les catégories
        const allCategories = {};
        Object.values(monthlySummary).forEach(({categories}) => {
            Object.entries(categories).forEach(([category, amount]) => {
                allCategories[category] = (allCategories[category] || 0) + amount;
            });
        });

        // Trouver la catégorie avec le plus de dépenses
        let highestCategory = {category: "-", amount: 0};
        Object.entries(allCategories).forEach(([category, amount]) => {
            if (amount > highestCategory.amount) {
                highestCategory = {category, amount};
            }
        });

        // Ajouter les informations récapitulatives
        dashboardData.push(["RÉSUMÉ FINANCIER"], [""]);
        dashboardData.push(["Dépenses totales", totalExpenses.toFixed(2) + " €"]);
        dashboardData.push(["Période couverte", totalMonths + " mois"]);
        dashboardData.push(["Dépense mensuelle moyenne", avgMonthlyExpense.toFixed(2) + " €"]);
        dashboardData.push(["Mois le plus coûteux", highestMonth.month + " (" + highestMonth.amount.toFixed(2) + " €)"]);
        dashboardData.push(["Catégorie principale", highestCategory.category + " (" + highestCategory.amount.toFixed(2) + " €)"]);
        dashboardData.push([""]);

        // Créer la feuille de calcul pour le tableau de bord
        const dashboardSheet = XLSX.utils.aoa_to_sheet(dashboardData);

        // Ajouter des styles pour le tableau de bord
        dashboardSheet['!cols'] = [{wch: 30}, {wch: 25}];

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, dashboardSheet, "Tableau de Bord");

        // --- FEUILLE 2: DÉTAIL MENSUEL ---

        // Création d'une feuille de résumé mensuel avec en-têtes et formatage
        const monthlyData = [
            ["DÉTAIL MENSUEL DES DÉPENSES"],
            [""],
            ["Date d'export", new Date().toLocaleDateString("fr-FR")],
            [""],
        ];

        // Ajouter les données mensuelles
        Object.entries(monthlySummary).forEach(([month, {total, categories}]) => {
            monthlyData.push([""]); // Ligne vide pour séparation
            monthlyData.push([month, "TOTAL: " + total.toFixed(2) + " €"]);
            monthlyData.push(["Catégorie", "Montant", "% du mois"]);

            // Ajouter les catégories pour ce mois
            Object.entries(categories).forEach(([category, amount]) => {
                const percentage = ((amount / total) * 100).toFixed(1) + "%";
                monthlyData.push([category, amount.toFixed(2) + " €", percentage]);
            });
        });

        // Création de la feuille de calcul pour le résumé mensuel
        const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);

        // Configurer la largeur des colonnes
        monthlySheet['!cols'] = [{wch: 30}, {wch: 20}, {wch: 15}];

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, monthlySheet, "Détail Mensuel");

        // --- FEUILLE 3: DÉTAIL PAR CATÉGORIE ---

        // Compiler toutes les dépenses par catégorie
        const categoriesDetails = {};

        // Parcourir toutes les dépenses pour les regrouper par catégorie
        depenses.forEach(({montant, dateTransaction, categorie, description = ""}) => {
            if (!categoriesDetails[categorie]) {
                categoriesDetails[categorie] = {
                    totalAmount: 0,
                    transactions: []
                };
            }

            categoriesDetails[categorie].totalAmount += montant;
            categoriesDetails[categorie].transactions.push({
                date: new Date(dateTransaction).toLocaleDateString("fr-FR"),
                description,
                amount: montant
            });
        });

        // Trier les catégories par montant total (décroissant)
        const sortedCategories = Object.entries(categoriesDetails)
            .sort(([, a], [, b]) => b.totalAmount - a.totalAmount);

        // Création des données pour le détail par catégorie
        const categoryData = [
            ["BILAN DÉTAILLÉ PAR CATÉGORIE"],
            [""],
            ["Date d'export", new Date().toLocaleDateString("fr-FR")],
            [""],
        ];

        // Ajouter une ligne de résumé pour toutes les catégories
        categoryData.push(["Catégorie", "Montant Total", "% du Budget", "Nombre de Transactions", "Montant Moyen"]);

        sortedCategories.forEach(([category, details]) => {
            const percentOfTotal = (details.totalAmount / totalExpenses * 100).toFixed(1) + "%";
            const transactionCount = details.transactions.length;
            const avgAmount = (details.totalAmount / transactionCount).toFixed(2) + " €";

            categoryData.push([
                category,
                details.totalAmount.toFixed(2) + " €",
                percentOfTotal,
                transactionCount,
                avgAmount
            ]);
        });

        // Création de la feuille de calcul pour le détail par catégorie
        const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);

        // Configurer la largeur des colonnes
        categorySheet['!cols'] = [{wch: 30}, {wch: 15}, {wch: 15}, {wch: 25}, {wch: 15}];

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, categorySheet, "Détail par Catégorie");

        // --- FEUILLE 4: TRANSACTIONS DÉTAILLÉES ---

        // Création d'une feuille pour les transactions détaillées
        const transactionsData = [
            ["LISTE COMPLÈTE DES TRANSACTIONS"],
            [""],
            ["Date d'export", new Date().toLocaleDateString("fr-FR")],
            [""],
            ["Date", "Catégorie", "Description", "Montant"]
        ];

        // Trier les transactions par date (de la plus récente à la plus ancienne)
        const sortedTransactions = [...depenses].sort((a, b) =>
            new Date(b.dateTransaction) - new Date(a.dateTransaction)
        );

        // Ajouter toutes les transactions
        sortedTransactions.forEach(({dateTransaction, categorie, description = "", montant}) => {
            transactionsData.push([
                new Date(dateTransaction).toLocaleDateString("fr-FR"),
                categorie,
                description,
                montant.toFixed(2) + " €"
            ]);
        });

        // Création de la feuille pour les transactions
        const transactionsSheet = XLSX.utils.json_to_sheet(
            sortedTransactions.map(item => ({
                Date: new Date(item.dateTransaction).toLocaleDateString("fr-FR"),
                Catégorie: item.categorie,
                Description: item.description || "",
                Montant: `${item.montant.toFixed(2)} €`
            })),
            {header: ["Date", "Catégorie", "Description", "Montant"]}
        );

        // Ajouter un titre à la feuille
        XLSX.utils.sheet_add_aoa(transactionsSheet, [
            ["LISTE COMPLÈTE DES TRANSACTIONS"],
            [""],
            ["Date d'export", new Date().toLocaleDateString("fr-FR")],
            [""]
        ], {origin: "A1"});

        // Configurer la largeur des colonnes
        transactionsSheet['!cols'] = [{wch: 15}, {wch: 20}, {wch: 40}, {wch: 15}];

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, transactionsSheet, "Transactions");

        // --- FEUILLE 5: GRAPHIQUES (DONNÉES) ---

        // Créer des données pour les graphiques
        const chartData = [
            ["DONNÉES POUR GRAPHIQUES"],
            [""],
            ["Ces données sont utilisées pour générer des graphiques lors de l'ouverture du fichier Excel"],
            [""]
        ];

        // Données pour graphique mensuel
        chartData.push(["DONNÉES POUR GRAPHIQUE MENSUEL"], [""]);
        chartData.push(["Mois", "Montant"]);

        Object.entries(monthlySummary).forEach(([month, {total}]) => {
            chartData.push([month, total]);
        });

        chartData.push([""]);

        // Données pour graphique par catégorie
        chartData.push(["DONNÉES POUR GRAPHIQUE PAR CATÉGORIE"], [""]);
        chartData.push(["Catégorie", "Montant Total"]);

        sortedCategories.forEach(([category, details]) => {
            chartData.push([category, details.totalAmount]);
        });

        // Création de la feuille pour les données de graphique
        const chartDataSheet = XLSX.utils.aoa_to_sheet(chartData);

        // Ajouter la feuille au workbook
        XLSX.utils.book_append_sheet(wb, chartDataSheet, "Données Graphiques");

        // --- INSTRUCTIONS POUR CRÉER DES GRAPHIQUES ---

        // Ajouter une feuille avec des instructions pour créer des graphiques dans Excel
        const instructionsData = [
            ["INSTRUCTIONS POUR CRÉER DES GRAPHIQUES"],
            [""],
            ["Ce fichier Excel contient toutes les données nécessaires pour créer des graphiques visuels de vos dépenses."],
            ["Pour créer un graphique :"],
            [""],
            ["1. Allez dans l'onglet 'Données Graphiques'"],
            ["2. Sélectionnez les données (y compris les en-têtes) du graphique que vous souhaitez créer"],
            ["3. Dans le ruban Excel, cliquez sur l'onglet 'Insertion'"],
            ["4. Sélectionnez le type de graphique souhaité (ex: colonnes, camembert, etc.)"],
            ["5. Vous pouvez ensuite personnaliser le graphique selon vos préférences"],
            [""],
            ["Graphiques recommandés :"],
            ["- Dépenses mensuelles : graphique en colonnes ou en lignes"],
            ["- Répartition par catégorie : graphique en camembert ou en anneau"],
            [""],
            ["Vous pouvez également utiliser la fonctionnalité 'Analyse rapide' d'Excel en sélectionnant les données et en cliquant sur l'icône qui apparaît."]
        ];

        const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
        XLSX.utils.book_append_sheet(wb, instructionsSheet, "Instructions Graphiques");

        // Exportation du fichier Excel
        XLSX.writeFile(wb, "Bilan_Financier_Détaillé.xlsx");
    };

    const chartData = {
        labels: Object.keys(monthlySummary),
        datasets: [
            {
                label: "Dépenses par Mois",
                data: Object.values(monthlySummary).map((m) => m.total),
                backgroundColor: "blue",
                borderWidth: 1,
            },
        ],
    };


    return (
        <>
            <h1 style={{fontSize: 20, color: "blueviolet", textAlign: "center"}}>
                Toutes vos dépenses
            </h1>

            <div style={{display: "flex", gap: "10px", justifyContent: "flex-start", margin: "10px"}}>
                <button
                    onClick={exportToPDF}
                    style={{
                        padding: "10px",
                        backgroundColor: "blueviolet",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        borderRadius: "5px",
                    }}
                >
                    📄 Exporter en PDF
                </button>
                <button
                    onClick={exportToExcel}
                    style={{
                        padding: "10px",
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        borderRadius: "5px",
                    }}
                >
                    📊 Exporter en Excel
                </button>
            </div>

            <div ref={pdfRef} style={{padding: "10px"}}>
                <h2 style={{color: "black"}}>Bilan Mensuel</h2>
                <div className="container">
                    {Object.entries(monthlySummary || {}).map(([month, {total, categories}]) => (
                        <div key={month} style={{marginBottom: "20px", padding: "10px", border: "1px solid black"}}>
                            <h3 style={{color: "black"}}>
                                {month} - Dépense Totale: {total.toFixed(2)} €
                            </h3>
                            <ul>
                                {Object.entries(categories || {}).map(([category, amount]) => (
                                    <li key={category} style={{color: categoryColors[category] || "black"}}>
                                        {category}: {amount.toFixed(2)} €
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{width: "80%", margin: "auto"}}>
                    <h2>Graphique des Dépenses</h2>
                    <Bar data={chartData}/>
                </div>

                <MonthlyExpensesByCategory
                    monthlySummary={monthlySummary}
                    categoryColors={categoryColors}
                />
            </div>
        </>
    );
};

export default AllSpend;
