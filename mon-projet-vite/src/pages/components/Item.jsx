import React from "react";

export default function Item({ id, title, description, color, updatefunc, changeDec, changetext, changeColor, del }) {
    // L'état iditem n'est jamais utilisé, donc je l'ai supprimé

    const handleCardClick = () => {
        updatefunc(id);
        changeDec(description);
        changetext(title);
        changeColor(color);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Empêche la propagation du clic au parent
        del(e, id);
    };

    return (
        <div
            className="card"
            style={{
                height: "400px",
                padding: "20px",
                boxShadow: "7px 7px 7px black",
                position: "relative",
                backgroundColor: color // Ajout de la couleur comme background
            }}
            onClick={handleCardClick}
        >
            <h1 className="card-title">{title}</h1>
            <p>{description}</p>
            <button
                style={{
                    position: "absolute",
                    bottom: "10px",
                    padding: "10px",
                    margin: "auto",
                    left: "28px",
                    borderRadius: "50%",
                    width: "30px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer"
                }}
                onClick={handleDeleteClick}
            >
                x
            </button>
        </div>
    );
}