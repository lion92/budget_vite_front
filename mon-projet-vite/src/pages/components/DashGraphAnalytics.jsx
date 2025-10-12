import React from 'react';
import './css/dashboard.scss';
import MenuComponent from "./MenuComponent.jsx";
import SimpleExpenseChart from "./SimpleExpenseChart.jsx";

const DashGraphAnalytics = () => {
    const titre = "Analyse Graphique";
    const contenue = <SimpleExpenseChart />;

    return (
        <>
            <MenuComponent contenue={contenue} title={titre} />
        </>
    );
};

export default DashGraphAnalytics;