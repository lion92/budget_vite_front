import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import GraphBudget from "./GraphBudget.jsx";

const DashGraphBudget = () => {
    let titre = "Budget"
    let contenue = <GraphBudget></GraphBudget>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashGraphBudget;