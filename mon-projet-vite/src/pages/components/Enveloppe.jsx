import React from 'react'
import './enveloppe.scss'
import HelloBis from "./HelloBis";
import EnveloppeChallenge from "./EnveloppeChallenge";

function Enveloppe() {
    return <>
        <HelloBis></HelloBis>
        <EnveloppeChallenge></EnveloppeChallenge>
        <h1>projet à venir</h1>
        <div className="containerCote">
            <div id="enveloppe">
                <div id="back"></div>
                <div id="lid-top"></div>
                <div id="letter">
                    <div className="head line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                    <div className="line"></div>
                </div>
                <div id="lid-right-shadow"></div>
                <div id="lid-right"></div>
                <div id="lid-left-shadow"></div>
                <div id="lid-left"></div>
            </div>
        </div>
    </>
}

export default Enveloppe