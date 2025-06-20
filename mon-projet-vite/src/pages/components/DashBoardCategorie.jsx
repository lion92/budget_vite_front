import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import {Categorie} from "./Categorie.jsx";


const DashBoardCategorie = () => {
    let titre = "Categorie"
    let contenue = <Categorie></Categorie>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashBoardCategorie;