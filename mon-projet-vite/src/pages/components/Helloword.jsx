import React from 'react';
import './css/accueil.css'
import BaniereLetchi from "./BaniereLetchi";


const Helloword = () => {
    return (
        <>

            <div className="welcome-container">

                <div className="content-box">
                    <h1 className="main-title">Bienvenue dans <span>l'application de gestion de budget</span></h1>
                    <p className="subtitle">Suivez vos dépenses, maîtrisez vos finances, atteignez vos objectifs.</p>
                    <a className="about-link" href="https://projet.krissclotilde.com/" target="_blank"
                       rel="noopener noreferrer">
                        👉 Qui suis-je ?
                    </a>
                    <div className="video-wrapper">
                        <iframe src="https://www.youtube.com/embed/UVh_r5IQnfY?si=r4Du_SNMNa0VJwLZ"
                                title="YouTube video player" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Helloword;