import React from 'react';
import {NavLink} from "react-router-dom";


Sidebar.propTypes = {};

function Sidebar(props) {

    return (
        <div className="divCentrer">
            <div className={props.affiche}>
                <div className="logo-details">
                    <div className="logo_name">Budget</div>
                </div>

                <ul className="nav-list">


                    <NavLink to={"/"}>
                        <li>Bienvenue</li>
                    </NavLink>
                    <NavLink to={"/login"}>
                        <li>Connexion</li>
                    </NavLink>
                    <NavLink to={"/inscription"}>
                        <li>Inscription</li>
                    </NavLink>
                    <NavLink to={"/categorie"}>
                        <li>Categorie</li>
                    </NavLink>
                    <NavLink to={"/form"}>
                        <li>Tache</li>
                    </NavLink>
                    <NavLink to={"/budget"}>
                        <li>Budget</li>
                    </NavLink>
                    <NavLink to={"/enveloppe"}>
                        <li>Budget</li>
                    </NavLink>
                </ul>
            </div>
        </div>


    );
}

export default Sidebar;