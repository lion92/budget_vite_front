import React from 'react';
import './css/dashboard.scss';
import MenuComponent from "./MenuComponent.jsx";
import SimpleExpenseChart from "./SimpleExpenseChart.jsx";
import MonthlyExpensesByCategory from './MonthlyExpensesByCategoryIntegration.jsx';

const DashGraphAnalytics = () => {
    const titre = "Analyse Graphique";
    const contenue = (
        <div>
            <SimpleExpenseChart />
            <div style={{ marginTop: '24px' }}>
                <MonthlyExpensesByCategory />
            </div>
        </div>
    );

    return (
        <>
            <MenuComponent contenue={contenue} title={titre} />
        </>
    );
};

export default DashGraphAnalytics;