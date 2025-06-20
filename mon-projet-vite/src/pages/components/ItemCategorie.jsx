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
        changeIcon(iconName); // ✅ ajoute l'icône sélectionnée au formulaire
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // empêche le clic de remonter à la carte
        del(e, id);
    };

    return (
        <div
            className="card"
            style={{ height: "420px", boxShadow: "7px 7px 7px black"}}
            onClick={handleClick}
        >
            <div style={{backgroundColor:color, height:'1em', width:'1em'}}></div>
            {/* ✅ Affichage de l'icône */}
            {iconName && (
                <div style={{ fontSize: 32, marginBottom: 10, color:'black' }}>
                    <i className={iconName}></i>
                </div>
            )}

            <h1 style={{ color: "black" }}>{title}</h1>
            <h2 style={{ color: "black" }}>{color}</h2>
            <p style={{ color: "blue" }}>{categorie}</p>
            <p>Mois : {month}</p>
            <p>Année : {annee}</p>
            <p>Budget du mois : {budgetDebutMois}</p>

            <button style={{display:"flex", height:'2em', alignItems:"center",justifyContent:'center', position:"absolute", bottom:'0'}} onClick={handleDelete}>
                Supprimer
            </button>
        </div>
    );
}
