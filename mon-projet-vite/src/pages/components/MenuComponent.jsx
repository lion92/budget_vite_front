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
    const [showChatBot, setShowChatBot] = useState(false);
    const [showMobileOverlay, setShowMobileOverlay] = useState(false); // Nouvel état pour l'overlay mobile

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

    const handlemenu = () => {
        const newState = !afficher;
        setAfficher(newState);
        if (isMobile) {
            setShowMobileOverlay(newState);
            // Empêcher le scroll du body quand le menu est ouvert sur mobile
            document.body.style.overflow = newState ? 'hidden' : 'auto';
        }
    };
    
    const handleLinkClick = () => {
        if (isMobile) {
            setAfficher(false);
            setShowMobileOverlay(false);
            document.body.style.overflow = 'auto';
        }
    };
    
    const handleOverlayClick = () => {
        if (isMobile) {
            setAfficher(false);
            setShowMobileOverlay(false);
            document.body.style.overflow = 'auto';
        }
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
            width: isMobile ? 320 : 280,
            background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
            backdropFilter: "blur(10px)",
            paddingTop: 20,
            minHeight: "100vh",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isMobile ? "8px 0 32px rgba(139, 92, 246, 0.3)" : "4px 0 20px rgba(139, 92, 246, 0.15)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? 0 : "auto",
            left: isMobile ? 0 : "auto",
            zIndex: isMobile ? 1050 : "auto",
            overflow: "hidden",
        },
        sidebarHidden: {
            transform: isMobile ? "translateX(-100%)" : "translateX(-280px)",
            opacity: isMobile ? 1 : 0,
        },
        mobileOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1040,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
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
            filter: (isMobile && showMobileOverlay) ? "blur(2px)" : "none",
            transition: "filter 0.3s ease",
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
            position: "relative",
            zIndex: 1060,
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
            bottom: isMobile ? 90 : 30,
            right: isMobile ? 20 : 30,
            width: isMobile ? 55 : 65,
            height: isMobile ? 55 : 65,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--primary-500), var(--primary-600))",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: isMobile ? 22 : 26,
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
            bottom: isMobile ? 160 : 110,
            right: isMobile ? 15 : 30,
            left: isMobile ? 15 : "auto",
            width: isMobile ? "auto" : "350px",
            maxHeight: isMobile ? "400px" : "500px",
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

    // Cleanup effect pour le scroll du body
    useEffect(() => {
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.notification}><Notifications /></div>

            {/* Overlay mobile */}
            {isMobile && showMobileOverlay && (
                <div 
                    style={styles.mobileOverlay} 
                    onClick={handleOverlayClick}
                />
            )}

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

            {/* Navigation mobile en bas */}
            {isMobile && (
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 70,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    zIndex: 1030,
                    boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.1)',
                }}>
                    {navLinks.slice(0, 4).map((link, index) => (
                        <NavLink 
                            key={index}
                            to={link.path}
                            style={({ isActive }) => ({
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '8px 12px',
                                borderRadius: 12,
                                textDecoration: 'none',
                                color: isActive ? '#8b5cf6' : '#666',
                                background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                                transform: isActive ? 'translateY(-2px)' : 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                minWidth: 60,
                                flex: 1,
                            })}
                            onClick={handleLinkClick}
                        >
                            <div style={{ fontSize: 20, marginBottom: 2 }}>{link.icon}</div>
                            <span style={{ fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 1 }}>
                                {link.label.length > 8 ? link.label.substring(0, 8) + '...' : link.label}
                            </span>
                        </NavLink>
                    ))}
                    <button 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '8px 12px',
                            borderRadius: 12,
                            border: 'none',
                            background: afficher ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                            color: '#8b5cf6',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            minWidth: 60,
                            flex: 1,
                            transform: afficher ? 'translateY(-2px)' : 'none',
                        }}
                        onClick={handlemenu}
                    >
                        <CiMenuBurger style={{ fontSize: 20, marginBottom: 2 }} />
                        <span style={{ fontSize: 10, fontWeight: '600', textAlign: 'center', lineHeight: 1 }}>
                            Menu
                        </span>
                    </button>
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
