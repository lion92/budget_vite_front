import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import Budget from "./Budget.jsx";
import Agenda from "./Agenda.jsx";

const DashBoardBudget = () => {
    let titre = "Budget"
    let contenue = <Agenda></Agenda>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashBoardBudget;