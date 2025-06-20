import React from 'react';
import {NavLink} from "react-router-dom";


const Navigation = () => {
    return (
        <div>
            <nav className="container2">
                <ul className="container2">
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



                </ul>

            </nav>
            <h1>Hello</h1>
            <h2>Bienvenue dans l'outil de gestion de budget. <br/>Pour utliser l'outil veuillez vous inscrire et vous
                connecter avec votre mot de passe et email.</h2>
            <p>Bienvenue</p>

        </div>
    );
};

export default Navigation;