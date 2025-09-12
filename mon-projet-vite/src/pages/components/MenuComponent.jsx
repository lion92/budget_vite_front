import {Link, NavLink} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {SiWelcometothejungle} from "react-icons/si";
import {TbLogin2} from "react-icons/tb";
import {MdOutlineAppRegistration} from "react-icons/md";
import {BiSolidCategory} from "react-icons/bi";
import {GoTasklist} from "react-icons/go";
import {CiMenuBurger, CiMoneyBill, CiChat1} from "react-icons/ci"; // Ajout icône chat
import CookieConsent from "./cookie_bandeau.jsx";
import Notifications from "./Notification";
import {Depenses} from "./Depenses.jsx";
import {Revenues} from "../../Revenues.jsx";
import BaniereLetchi from "./BaniereLetchi.jsx";
import ChatBotAction from "./ChatBotAction.jsx";
import DarkModeToggleSimple from "./DarkModeToggleSimple.jsx";
import ThemeDebug from "./ThemeDebug.jsx";
import AccessibilityTester from "./AccessibilityTester.jsx";

export default function MenuComponent(props) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [afficher, setAfficher] = useState(window.innerWidth >= 768);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("jwt"));
    const [showChatBot, setShowChatBot] = useState(false); // 👉 état pour ouvrir/fermer la bulle chat

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setAfficher(!mobile);
        };

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
            fontFamily: "var(--font-family-sans)",
        },
        sidebar: {
            width: 280,
            background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
            backdropFilter: "blur(10px)",
            paddingTop: 20,
            minHeight: "100vh",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "4px 0 20px rgba(139, 92, 246, 0.15)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            position: "relative",
            overflow: "hidden",
        },
        sidebarHidden: {
            transform: isMobile ? "translateX(-100%)" : "translateX(-280px)",
            opacity: 0,
        },
        sidebarOverlay: {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
            pointerEvents: "none",
        },
        logoContainer: {
            padding: "30px 20px",
            textAlign: "center",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            marginBottom: 20,
            position: "relative",
        },
        logoName: {
            fontSize: 28,
            fontWeight: "800",
            color: "white",
            textShadow: "0 2px 10px rgba(0,0,0,0.3)",
            letterSpacing: "0.5px",
            background: "linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
        },
        logoSubtext: {
            fontSize: 12,
            color: "rgba(255, 255, 255, 0.8)",
            marginTop: 5,
            letterSpacing: "1px",
            textTransform: "uppercase",
        },
        navList: {
            listStyle: "none",
            padding: "0 10px",
            margin: 0,
        },
        navLink: {
            textDecoration: "none",
            display: "block",
            margin: "8px 0",
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            overflow: "hidden",
        },
        navItem: {
            padding: "16px 20px",
            color: "white",
            fontWeight: "600",
            display: "flex",
            alignItems: "center",
            gap: "15px",
            cursor: "pointer",
            fontSize: 15,
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(5px)",
        },
        navItemHover: {
            background: "rgba(255, 255, 255, 0.15)",
            transform: "translateX(5px)",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
        },
        navItemActive: {
            background: "rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        },
        navItemIcon: {
            fontSize: 20,
            opacity: 0.9,
        },
        content: {
            padding: 20,
            flexGrow: 1,
            width: "100%",
            background: "var(--gradient-surface)",
            minHeight: "100vh",
            transition: "margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        contentWithSidebar: {
            marginLeft: isMobile ? 0 : (afficher ? 0 : 0),
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "20px 30px",
            borderRadius: 16,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            marginBottom: 30,
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        headerTitle: {
            fontSize: 28,
            fontWeight: "700",
            background: "linear-gradient(135deg, var(--primary-600), var(--primary-800))",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: 0,
        },
        toggleBtn: {
            background: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            color: "white",
            padding: "12px 16px",
            borderRadius: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 15px rgba(139, 92, 246, 0.3)",
        },
        toggleBtnHover: {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(139, 92, 246, 0.4)",
        },
        notification: {
            position: "fixed",
            top: 20,
            left: 50,
            fontSize: 30,
            zIndex: 1000,
        },
        chatBubbleBtn: {
            position: "fixed",
            bottom: 30,
            right: 30,
            width: 65,
            height: 65,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 26,
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 8px 25px rgba(139, 92, 246, 0.4)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
        },
        chatBubbleBtnHover: {
            transform: "scale(1.1) translateY(-3px)",
            boxShadow: "0 12px 35px rgba(139, 92, 246, 0.5)",
        },
        chatContainer: {
            position: "fixed",
            bottom: 110,
            right: 30,
            width: "350px",
            maxHeight: "500px",
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            borderRadius: 20,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
            zIndex: 999,
            backdropFilter: "blur(20px)",
            animation: "slideUpFade 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        logoutSection: {
            textAlign: 'center',
            marginBottom: 20,
        },
        logoutBtn: {
            background: "linear-gradient(135deg, #ef4444, #dc2626)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: 12,
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.3)",
        },
        logoutBtnHover: {
            transform: "translateY(-2px)",
            boxShadow: "0 6px 20px rgba(239, 68, 68, 0.4)",
        }
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
        { path: "/graph", label: "Graphique budget", icon: <CiMoneyBill /> },
    ];

    const navLinks = isAuthenticated ? privateLinks : publicLinks;

    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoveredButton, setHoveredButton] = useState(null);

    return (
        <div style={styles.container}>
            <div style={styles.notification}><Notifications /></div>

            {afficher && (
                <div style={{...styles.sidebar, ...(afficher ? {} : styles.sidebarHidden)}}>
                    <div style={styles.sidebarOverlay} />
                    <div style={styles.logoContainer}>
                        <div style={styles.logoName}>Budget Manager</div>
                        <div style={styles.logoSubtext}>Gestion Financière</div>
                        <div style={{ marginTop: '20px' }}>
                            <DarkModeToggleSimple />
                        </div>
                    </div>
                    <ul style={styles.navList}>
                        {navLinks.map((link, index) => (
                            <NavLink 
                                to={link.path} 
                                key={index} 
                                onClick={handleLinkClick}
                                style={styles.navLink}
                            >
                                <li 
                                    style={{
                                        ...styles.navItem,
                                        ...(hoveredItem === index ? styles.navItemHover : {})
                                    }}
                                    onMouseEnter={() => setHoveredItem(index)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                >
                                    <span style={styles.navItemIcon}>{link.icon}</span>
                                    <span>{link.label}</span>
                                </li>
                            </NavLink>
                        ))}
                    </ul>
                </div>
            )}

            <section style={{...styles.content, ...styles.contentWithSidebar}}>
                <CookieConsent/>
                <div style={styles.header}>
                    <h1 style={styles.headerTitle}>{props.title}</h1>
                    {isMobile && (
                        <button 
                            style={{
                                ...styles.toggleBtn,
                                ...(hoveredButton === 'toggle' ? styles.toggleBtnHover : {})
                            }}
                            onClick={handlemenu}
                            onMouseEnter={() => setHoveredButton('toggle')}
                            onMouseLeave={() => setHoveredButton(null)}
                        >
                            <CiMenuBurger/>
                        </button>
                    )}
                </div>
                {isAuthenticated && (
                    <div className="container">
                        {localStorage.getItem("jwt") ?
                            <div style={styles.logoutSection}>
                                <button
                                    style={{
                                        ...styles.logoutBtn,
                                        ...(hoveredButton === 'logout' ? styles.logoutBtnHover : {})
                                    }}
                                    onClick={() => {
                                        localStorage.removeItem("jwt");
                                        localStorage.removeItem("utilisateur");
                                        window.location.reload();
                                    }}
                                    onMouseEnter={() => setHoveredButton('logout')}
                                    onMouseLeave={() => setHoveredButton(null)}
                                >
                                    🚪 Déconnexion
                                </button>
                            </div>
                            : ""}
                        <BaniereLetchi/>
                        <Depenses/>
                        <Revenues/>
                    </div>
                )}
                {props.contenue}
            </section>

            {/* Bulle flottante pour ouvrir le chat */}
            <div 
                style={{
                    ...styles.chatBubbleBtn,
                    ...(hoveredButton === 'chat' ? styles.chatBubbleBtnHover : {})
                }} 
                onClick={() => setShowChatBot(!showChatBot)}
                onMouseEnter={() => setHoveredButton('chat')}
                onMouseLeave={() => setHoveredButton(null)}
            >
                <CiChat1/>
            </div>

            {showChatBot && (
                <div style={styles.chatContainer}>
                    <ChatBotAction/>
                </div>
            )}

            {/* Debug et tests - temporaires pour développement */}
            {process.env.NODE_ENV === 'development' && (
                <>
                    <ThemeDebug />
                    <AccessibilityTester />
                </>
            )}

            <style jsx>{`
                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `}</style>
        </div>
    );
}
