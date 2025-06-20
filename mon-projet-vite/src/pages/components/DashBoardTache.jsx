import React from 'react';
import './css/dashboard.scss'
import Form from "./Form.jsx";
import MenuComponent from "./MenuComponent.jsx";

const DashBoardTache = () => {
    let titre = "Tache"
    let contenue = <Form></Form>
    return (
        <>
            <MenuComponent contenue={contenue} title={titre}></MenuComponent>
        </>

    );
};

export default DashBoardTache;