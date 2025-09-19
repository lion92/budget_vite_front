import React from "react";

export default function ItemCategorie(props) {
    const {
        id,
        title,
        annee,
        month,
        categorie,
        budgetDebutMois,
        color,
        iconName,
        del,
        idFunc,
        changeTitle,
        changeAnnee,
        changeMonth,
        changecategorie,
        changeBudgetDebutMois,
        changeColor,
        changeIcon,
    } = props;

    const handleClick = () => {
        idFunc(id);
        changeTitle(title);
        changeAnnee(annee);
        changeMonth(month);
        changecategorie(categorie);
        changeBudgetDebutMois(budgetDebutMois);
        changeColor(color);
        changeIcon(iconName);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categorie}" ?`)) {
            del(e, id);
        }
    };

    const formatBudget = (budget) => {
        return budget ? `${parseFloat(budget).toLocaleString('fr-FR')} €` : "Non défini";
    };

    const getMonthYear = () => {
        if (month && annee) {
            return `${month} ${annee}`;
        } else if (annee) {
            return `Année ${annee}`;
        }
        return "Non spécifié";
    };

    return (
        <div className="category-item-card" onClick={handleClick}>
            {/* Header avec couleur et icône */}
            <div className="category-header">
                <div
                    className="category-color-indicator"
                    style={{ backgroundColor: color }}
                    title={`Couleur: ${color}`}
                ></div>
                {iconName && (
                    <div className="category-icon" style={{ color: color }}>
                        <i className={iconName}></i>
                    </div>
                )}
            </div>

            {/* Contenu principal */}
            <div className="category-content">
                <h3 className="category-name" title={categorie}>
                    {categorie}
                </h3>

                <div className="category-details">
                    <div className="detail-item">
                        <span className="detail-label">📅 Période</span>
                        <span className="detail-value">{getMonthYear()}</span>
                    </div>

                    <div className="detail-item">
                        <span className="detail-label">💰 Budget</span>
                        <span className="detail-value">{formatBudget(budgetDebutMois)}</span>
                    </div>

                    {title && (
                        <div className="detail-item">
                            <span className="detail-label">📝 Description</span>
                            <span className="detail-value" title={title}>{title}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="category-actions">
                <button
                    className="edit-btn"
                    onClick={handleClick}
                    title="Modifier cette catégorie"
                >
                    ✏️ Modifier
                </button>
                <button
                    className="delete-btn"
                    onClick={handleDelete}
                    title="Supprimer cette catégorie"
                >
                    🗑️ Supprimer
                </button>
            </div>

            {/* Indicateur de sélection */}
            <div className="selection-indicator">
                <span>Cliquer pour modifier</span>
            </div>
        </div>
    );
}
