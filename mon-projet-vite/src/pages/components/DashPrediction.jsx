import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import Prediction from "./Prediction.jsx";

const DashPrediction = () => {
    let titre = "Prediction"
    let contenue = <Prediction></Prediction>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashPrediction;