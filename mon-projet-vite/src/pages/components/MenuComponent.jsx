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
import DesktopQuickMenu from "./DesktopQuickMenu.jsx";
import "./css/enhanced-mobile-menu.css";
import "./css/mobile-optimizations.css";
import "./css/modern-menu.css";

export default function MenuComponent(props) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [afficher, setAfficher] = useState(window.innerWidth >= 768);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("jwt"));
    const [showChatBot, setShowChatBot] = useState(false);
    const [showMobileOverlay, setShowMobileOverlay] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('utilisateur') || '{}'));

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setAfficher(!mobile);
        };

        const handleStorageChange = () => {
            setIsAuthenticated(!!localStorage.getItem("jwt"));
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
            // mais permettre le scroll dans la sidebar
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
            paddingBottom: isMobile ? "100px" : "20px", // Espace pour la nav mobile
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: isMobile ? "8px 0 32px rgba(139, 92, 246, 0.3)" : "4px 0 20px rgba(139, 92, 246, 0.15)",
            borderRight: "1px solid rgba(255, 255, 255, 0.1)",
            position: isMobile ? "fixed" : "relative",
            top: isMobile ? 0 : "auto",
            left: isMobile ? 0 : "auto",
            zIndex: isMobile ? 1050 : "auto",
            overflow: "auto", // Permettre le scroll si nécessaire
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
            bottom: 80, // Éviter la navigation mobile en bas
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
            zIndex: 1070, // Plus élevé que la sidebar
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
            bottom: isMobile ? 95 : 30,
            right: isMobile ? 20 : 30,
            width: isMobile ? 60 : 65,
            height: isMobile ? 60 : 65,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: isMobile ? 24 : 26,
            cursor: "pointer",
            zIndex: 1020,
            boxShadow: "0 8px 25px rgba(16, 185, 129, 0.4)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            border: "2px solid rgba(255, 255, 255, 0.2)",
        },
        chatBubbleBtnHover: {
            transform: "scale(1.1) translateY(-3px)",
            boxShadow: "0 12px 35px rgba(16, 185, 129, 0.5)",
        },
        chatContainer: {
            position: "fixed",
            bottom: isMobile ? 170 : 110,
            right: isMobile ? 15 : 30,
            left: isMobile ? 15 : "auto",
            width: isMobile ? "auto" : "350px",
            maxHeight: isMobile ? "350px" : "500px",
            background: "rgba(255, 255, 255, 0.95)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
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

    const navigationSections = {
        main: [
            { path: "/", label: "Tableau de bord", icon: <SiWelcometothejungle />, badge: null },
            { path: "/budget", label: "Budget", icon: <CiMoneyBill />, badge: null },
            { path: "/categorie", label: "Catégories", icon: <BiSolidCategory />, badge: null },
        ],
        finance: [
            { path: "/allSpend", label: "Dépenses mensuelles", icon: <CiMoneyBill />, badge: null },
            { path: "/allSpendFilters", label: "Analyse des dépenses", icon: <CiMoneyBill />, badge: null },
            { path: "/prediction", label: "Prévisions", icon: <CiMoneyBill />, badge: "Nouveau" },
            { path: "/enveloppe", label: "Enveloppes", icon: <CiMoneyBill />, badge: null },
            { path: "/comptabilite", label: "Espace Comptable", icon: <CiMoneyBill />, badge: null },
        ],
        tools: [
            { path: "/form", label: "Tâches", icon: <GoTasklist />, badge: null },
            { path: "/agenda", label: "Agenda", icon: <CiMoneyBill />, badge: null },
            { path: "/tickets", label: "Support", icon: <CiMoneyBill />, badge: null },
            { path: "/graph", label: "Graphiques", icon: <CiMoneyBill />, badge: null },
        ]
    };

    const privateLinks = [
        ...navigationSections.main,
        ...navigationSections.finance,
        ...navigationSections.tools
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
        <div className={`modern-menu-container ${isDarkMode ? 'dark-mode' : ''}`}>
            <div style={styles.notification}><Notifications /></div>

            {/* Overlay mobile */}
            {isMobile && showMobileOverlay && (
                <div
                    className={`modern-overlay ${showMobileOverlay ? 'show' : ''}`}
                    onClick={handleOverlayClick}
                />
            )}

            {/* Sidebar moderne */}
            <aside className={`modern-sidebar ${afficher ? 'open' : ''}`}>
                {/* Header du sidebar */}
                <div className="modern-sidebar-header">
                    <div className="modern-logo">
                        <div className="modern-logo-icon">
                            💰
                        </div>
                        <div className="modern-logo-text">
                            <h1 className="modern-logo-title">Budget Manager</h1>
                            <p className="modern-logo-subtitle">Gestion Financière</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <DarkModeToggleSimple />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="modern-nav">
                    {isAuthenticated ? (
                        <>
                            <div className="modern-nav-section">
                                <h3 className="modern-nav-title">Principal</h3>
                                <ul className="modern-nav-list">
                                    {navigationSections.main.map((link, index) => (
                                        <li key={index} className="modern-nav-item">
                                            <NavLink
                                                to={link.path}
                                                className={({isActive}) =>
                                                    `modern-nav-link ${isActive ? 'active' : ''}`
                                                }
                                                onClick={handleLinkClick}
                                            >
                                                <div className="modern-nav-icon">{link.icon}</div>
                                                <span className="modern-nav-text">{link.label}</span>
                                                {link.badge && <span className="modern-nav-badge">{link.badge}</span>}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="modern-nav-section">
                                <h3 className="modern-nav-title">Finances</h3>
                                <ul className="modern-nav-list">
                                    {navigationSections.finance.map((link, index) => (
                                        <li key={index} className="modern-nav-item">
                                            <NavLink
                                                to={link.path}
                                                className={({isActive}) =>
                                                    `modern-nav-link ${isActive ? 'active' : ''}`
                                                }
                                                onClick={handleLinkClick}
                                            >
                                                <div className="modern-nav-icon">{link.icon}</div>
                                                <span className="modern-nav-text">{link.label}</span>
                                                {link.badge && <span className="modern-nav-badge">{link.badge}</span>}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="modern-nav-section">
                                <h3 className="modern-nav-title">Outils</h3>
                                <ul className="modern-nav-list">
                                    {navigationSections.tools.map((link, index) => (
                                        <li key={index} className="modern-nav-item">
                                            <NavLink
                                                to={link.path}
                                                className={({isActive}) =>
                                                    `modern-nav-link ${isActive ? 'active' : ''}`
                                                }
                                                onClick={handleLinkClick}
                                            >
                                                <div className="modern-nav-icon">{link.icon}</div>
                                                <span className="modern-nav-text">{link.label}</span>
                                                {link.badge && <span className="modern-nav-badge">{link.badge}</span>}
                                            </NavLink>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    ) : (
                        <div className="modern-nav-section">
                            <h3 className="modern-nav-title">Connexion</h3>
                            <ul className="modern-nav-list">
                                {publicLinks.map((link, index) => (
                                    <li key={index} className="modern-nav-item">
                                        <NavLink
                                            to={link.path}
                                            className={({isActive}) =>
                                                `modern-nav-link ${isActive ? 'active' : ''}`
                                            }
                                            onClick={handleLinkClick}
                                        >
                                            <div className="modern-nav-icon">{link.icon}</div>
                                            <span className="modern-nav-text">{link.label}</span>
                                        </NavLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* Footer du sidebar */}
                {isAuthenticated && (
                    <div className="modern-sidebar-footer">
                        <div className="modern-user-profile">
                            <div className="modern-user-avatar">
                                {currentUser.prenom ? currentUser.prenom.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div className="modern-user-info">
                                <p className="modern-user-name">
                                    {currentUser.prenom && currentUser.nom
                                        ? `${currentUser.prenom} ${currentUser.nom}`
                                        : 'Utilisateur'
                                    }
                                </p>
                                <p className="modern-user-role">Gestionnaire</p>
                            </div>
                        </div>
                        <button
                            className="modern-logout-btn"
                            onClick={() => {
                                localStorage.removeItem("jwt");
                                localStorage.removeItem("utilisateur");
                                window.location.reload();
                            }}
                        >
                            <span>🚪</span>
                            Déconnexion
                        </button>
                    </div>
                )}
            </aside>

            {/* Contenu principal moderne */}
            <main className="modern-content">
                <CookieConsent/>

                {/* Header moderne */}
                <header className="modern-header">
                    <div className="modern-header-left">
                        <h1 className="modern-header-title">{props.title || 'Budget Manager'}</h1>
                        {props.breadcrumb && (
                            <div className="modern-header-breadcrumb">
                                {props.breadcrumb}
                            </div>
                        )}
                    </div>
                    <div className="modern-header-right">
                        {isMobile && (
                            <button
                                className="modern-header-btn"
                                onClick={handlemenu}
                                aria-label="Ouvrir le menu"
                            >
                                <CiMenuBurger/>
                                Menu
                            </button>
                        )}
                    </div>
                </header>

                {/* Contenu de la page */}
                <div className="modern-main">
                    {isAuthenticated && (
                        <div className="container">
                            <BaniereLetchi/>
                            <Depenses/>
                            <Revenues/>
                        </div>
                    )}
                    {props.contenue}
                </div>
            </main>

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

            {/* Navigation mobile moderne */}
            {isMobile && (
                <nav className="modern-mobile-nav">
                    {navLinks.slice(0, 3).map((link, index) => (
                        <NavLink
                            key={index}
                            to={link.path}
                            className={({isActive}) =>
                                `modern-mobile-nav-item ${isActive ? 'active' : ''}`
                            }
                            onClick={handleLinkClick}
                        >
                            <div className="modern-mobile-nav-icon">{link.icon}</div>
                            <span>{link.label.length > 8 ? link.label.substring(0, 8) + '...' : link.label}</span>
                        </NavLink>
                    ))}
                    <button
                        className={`modern-mobile-nav-item ${afficher ? 'active' : ''}`}
                        onClick={handlemenu}
                        aria-label={afficher ? 'Fermer le menu' : 'Ouvrir le menu'}
                    >
                        <div className="modern-mobile-nav-icon">
                            <CiMenuBurger style={{
                                transform: afficher ? 'rotate(90deg)' : 'rotate(0deg)',
                                transition: 'transform 0.3s ease'
                            }}/>
                        </div>
                        <span>{afficher ? 'Fermer' : 'Menu'}</span>
                    </button>
                </nav>
            )}

            {/* Menu rapide desktop */}
            {!isMobile && (
                <DesktopQuickMenu
                    isAuthenticated={isAuthenticated}
                    onToggleMain={handlemenu}
                />
            )}

            {/* Debug et tests - temporaires pour développement */}
            {process.env.NODE_ENV === 'development' && (
                <>
                    <ThemeDebug />
                    <AccessibilityTester />
                </>
            )}

            <style jsx="true">{`
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
