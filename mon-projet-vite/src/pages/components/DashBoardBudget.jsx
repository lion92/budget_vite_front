import React from 'react';
import './css/dashboard.scss'
import './css/budget_style.css'
import MenuComponent from "./MenuComponent.jsx";
import Budget from "./Budget.jsx";

const DashBoardBudget = () => {
    let titre = "Budget"
    let contenue = <Budget></Budget>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashBoardBudget;