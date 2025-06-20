import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import Inscription from "./Inscription.jsx";

const DashBoardInscription = () => {
    let titre = "Inscription"
    let contenue = <Inscription></Inscription>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    )
        ;
};

export default DashBoardInscription;