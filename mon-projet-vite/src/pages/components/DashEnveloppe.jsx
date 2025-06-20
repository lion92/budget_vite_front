import React from 'react';
import './css/dashboard.scss'
import MenuComponent from "./MenuComponent.jsx";
import EnveloppeManager from "./EnveloppeManager";

const DashEnveloppe = () => {
    let titre = "Budget"
    let contenue = <EnveloppeManager></EnveloppeManager>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>
    );
};

export default DashEnveloppe;