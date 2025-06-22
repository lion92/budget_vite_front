import { NavLink } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { SiWelcometothejungle } from "react-icons/si";
import { TbLogin2 } from "react-icons/tb";
import { MdOutlineAppRegistration } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import { GoTasklist } from "react-icons/go";
import { CiMenuBurger, CiMoneyBill } from "react-icons/ci";
import CookieConsent from "./cookie_bandeau.jsx";
import Notifications from "./Notification";
import {Depenses} from "./Depenses.jsx";
import {Revenues} from "../../Revenues.jsx";
import BaniereLetchi from "./BaniereLetchi.jsx";
import ChatBotDepense from "./ChatBotDepense.jsx";

export default function MenuComponent(props) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [afficher, setAfficher] = useState(window.innerWidth >= 768);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("jwt"));

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setAfficher(!mobile);
        };

        // Réécoute en cas de login/logout dans d'autres onglets
        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const handlemenu = () => setAfficher(!afficher);

    const handleLinkClick = () => {
        if (isMobile) setAfficher(false);
    };

    const styles = {
        container: {
            display: "flex",
            flexDirection: "row",
            width: "100vw",
            minHeight: "100vh",
        },
        sidebar: {
            width: 220,
            backgroundColor: "#EBDDFB",
            paddingTop: 60,
            minHeight: "100vh",
            transition: "transform 0.3s ease",
        },
        sidebarHidden: {
            display: "none",
        },
        navList: {
            listStyle: "none",
            padding: 0,
            margin: 0,
        },
        navItem: {
            padding: "15px",
            color: "#5D3A9B",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            cursor: "pointer",
        },
        content: {
            padding: 20,
            flexGrow: 1,
            width: "100%",
        },
        contentWithSidebar: {
            marginLeft: isMobile ? 0 : 10,
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        toggleBtn: {
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 25,
            color: "#5D3A9B",
        },
        notification: {
            position: "fixed",
            top: 20,
            left: 50,
            fontSize: 30,
            zIndex: 1000,
        },
        logoName: {
            textAlign: "center",
            fontSize: 24,
            fontWeight: "bold",
            color: "#5D3A9B",
        },
    };

    const publicLinks = [
        { path: "/login", label: "Connexion", icon: <TbLogin2 /> },
        { path: "/inscription", label: "Inscription", icon: <MdOutlineAppRegistration /> },
    ];

    const privateLinks = [
        { path: "/", label: "Bienvenue", icon: <SiWelcometothejungle /> },
        { path: "/categorie", label: "Catégorie", icon: <BiSolidCategory /> },
        { path: "/form", label: "Tâche", icon: <GoTasklist /> },
        { path: "/budget", label: "Budget", icon: <CiMoneyBill /> },
        { path: "/allspend", label: "Dépenses par mois", icon: <CiMoneyBill /> },
        { path: "/allspendFilters", label: "Dépenses filtrées", icon: <CiMoneyBill /> },
        { path: "/prediction", label: "Prédiction", icon: <CiMoneyBill /> },
        { path: "/agenda", label: "Agenda", icon: <CiMoneyBill /> },
        { path: "/enveloppe", label: "Enveloppe", icon: <CiMoneyBill /> },
    ];

    const navLinks = isAuthenticated ? privateLinks : publicLinks;

    return (
        <div style={styles.container}>
            <div style={styles.notification}><Notifications /></div>

            {afficher && (
                <div style={styles.sidebar}>
                    <div style={styles.logoName}>Budget</div>
                    <ul style={styles.navList}>
                        {navLinks.map((link, index) => (
                            <NavLink to={link.path} key={index} onClick={handleLinkClick}>
                                <li style={styles.navItem}>
                                    {link.label} {link.icon}
                                </li>
                            </NavLink>
                        ))}
                    </ul>
                </div>
            )}

            <section style={{...styles.content, ...styles.contentWithSidebar}}>
                <CookieConsent/>
                <div style={styles.header}>
                    <h1>{props.title}</h1>
                    {isMobile && (
                        <button style={styles.toggleBtn} onClick={handlemenu}>
                            <CiMenuBurger/>
                        </button>
                    )}
                </div>
                {isAuthenticated &&
                    (
                        <div className="container">
                            <BaniereLetchi></BaniereLetchi>
                            <Depenses></Depenses>
                            <Revenues></Revenues>
                        </div>
                    )
                }
                <ChatBotDepense></ChatBotDepense>
                {props.contenue}
            </section>
        </div>
    );
}
