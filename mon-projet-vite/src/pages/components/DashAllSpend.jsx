import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import AllSpend from "./AllSpend.jsx";

const DashAllSpend = () => {
    let titre = "Budget"
    let contenue = <AllSpend></AllSpend>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashAllSpend;