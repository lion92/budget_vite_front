import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { CiMenuBurger, CiHome, CiMoneyBill } from 'react-icons/ci';
import { BiSolidCategory } from 'react-icons/bi';
import { GoTasklist } from 'react-icons/go';

const DesktopQuickMenu = ({ isAuthenticated, onToggleMain }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const quickLinks = isAuthenticated ? [
        { path: "/", label: "Accueil", icon: <CiHome />, color: "#3b82f6" },
        { path: "/budget", label: "Budget", icon: <CiMoneyBill />, color: "#10b981" },
        { path: "/categorie", label: "Catégories", icon: <BiSolidCategory />, color: "#f59e0b" },
        { path: "/form", label: "Tâches", icon: <GoTasklist />, color: "#ef4444" },
    ] : [];

    const styles = {
        quickMenuContainer: {
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        mainButton: {
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: 'white',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 22,
            cursor: 'pointer',
            boxShadow: '0 8px 25px rgba(139, 92, 246, 0.35)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            position: 'relative',
            overflow: 'hidden',
        },
        mainButtonExpanded: {
            transform: 'scale(1.1) rotate(45deg)',
            boxShadow: '0 12px 35px rgba(139, 92, 246, 0.45)',
        },
        quickLink: {
            width: 50,
            height: 50,
            borderRadius: '50%',
            color: 'white',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 18,
            cursor: 'pointer',
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isExpanded ? 'scale(1)' : 'scale(0)',
            opacity: isExpanded ? 1 : 0,
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
            position: 'relative',
            overflow: 'hidden',
        },
        quickLinkHover: {
            transform: 'scale(1.15) translateY(-2px)',
        },
        tooltip: {
            position: 'absolute',
            left: '70px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            opacity: 0,
            pointerEvents: 'none',
            transition: 'all 0.3s ease',
            zIndex: 1002,
        },
        tooltipVisible: {
            opacity: 1,
            transform: 'translateY(-50%) translateX(5px)',
        },
        expandButton: {
            position: 'absolute',
            top: 0,
            right: 0,
            width: 20,
            height: 20,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
        }
    };

    return (
        <div style={styles.quickMenuContainer}>
            <button
                style={{
                    ...styles.mainButton,
                    ...(isExpanded ? styles.mainButtonExpanded : {})
                }}
                onClick={() => setIsExpanded(!isExpanded)}
                onMouseEnter={(e) => {
                    if (!isExpanded) {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.45)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isExpanded) {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.35)';
                    }
                }}
                title="Menu rapide"
            >
                <CiMenuBurger />
                {quickLinks.length > 0 && (
                    <div style={styles.expandButton}>
                        {quickLinks.length}
                    </div>
                )}
            </button>

            {/* Liens rapides */}
            {isAuthenticated && quickLinks.map((link, index) => {
                const [isHovered, setIsHovered] = useState(false);

                return (
                    <NavLink
                        key={index}
                        to={link.path}
                        style={{
                            ...styles.quickLink,
                            background: `linear-gradient(135deg, ${link.color}, ${link.color}dd)`,
                            animationDelay: `${index * 0.1}s`,
                            ...(isHovered ? styles.quickLinkHover : {})
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        {link.icon}
                        <div style={{
                            ...styles.tooltip,
                            ...(isHovered ? styles.tooltipVisible : {})
                        }}>
                            {link.label}
                        </div>
                    </NavLink>
                );
            })}

            {/* Bouton pour ouvrir le menu principal */}
            {isExpanded && (
                <button
                    style={{
                        ...styles.quickLink,
                        background: 'linear-gradient(135deg, #6b7280, #4b5563)',
                        animationDelay: `${quickLinks.length * 0.1}s`,
                    }}
                    onClick={() => {
                        onToggleMain();
                        setIsExpanded(false);
                    }}
                    title="Menu principal"
                >
                    <CiMenuBurger />
                </button>
            )}
        </div>
    );
};

export default DesktopQuickMenu;