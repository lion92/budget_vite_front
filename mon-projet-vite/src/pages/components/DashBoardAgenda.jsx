import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import Agenda from "./Agenda.jsx";

const DashBoardAgenda = () => {
    let titre = "Agenda"
    let contenue = <Agenda></Agenda>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashBoardAgenda;