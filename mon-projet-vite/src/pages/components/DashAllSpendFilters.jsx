import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import AllSpendFilters from "./AllSpendFilters.jsx";

const DashAllSpendFilters = () => {
    let titre = "Budget"
    let contenue = <AllSpendFilters></AllSpendFilters>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashAllSpendFilters;