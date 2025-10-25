import React, { useState, useEffect } from 'react';
import {NavLink, useLocation} from "react-router-dom";
import './css/modern-sidebar.css';

Sidebar.propTypes = {};

function Sidebar(props) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const navigationItems = [
        { path: "/", label: "Dashboard", icon: "🏠" },
        { path: "/budget", label: "Budget", icon: "💰" },
        { path: "/categorie", label: "Catégories", icon: "📊" },
        { path: "/allSpend", label: "Dépenses", icon: "💳" },
        { path: "/enveloppe", label: "Enveloppes", icon: "📦" },
        { path: "/prediction", label: "Prédictions", icon: "📈" },
        { path: "/agenda", label: "Agenda", icon: "📅" },
    ];

    const authItems = [
        { path: "/login", label: "Connexion", icon: "🔐" },
        { path: "/inscription", label: "Inscription", icon: "👤" },
    ];

    return (
        <div className={`modern-sidebar ${isCollapsed ? 'collapsed' : ''} ${props.affiche || ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">💰</div>
                    {!isCollapsed && <span className="logo-text">Budget Pro</span>}
                </div>
                {!isMobile && (
                    <button
                        className="collapse-btn"
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label="Toggle sidebar"
                    >
                        {isCollapsed ? '→' : '←'}
                    </button>
                )}
            </div>

            <nav className="sidebar-nav">
                <div className="nav-section">
                    <div className="nav-section-title">
                        {!isCollapsed && <span>Principal</span>}
                    </div>
                    <ul className="nav-list">
                        {navigationItems.map(item => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {!isCollapsed && <span className="nav-text">{item.label}</span>}
                                    {isActive && <div className="active-indicator" />}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="nav-section">
                    <div className="nav-section-title">
                        {!isCollapsed && <span>Compte</span>}
                    </div>
                    <ul className="nav-list">
                        {authItems.map(item => (
                            <li key={item.path} className="nav-item">
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    {!isCollapsed && <span className="nav-text">{item.label}</span>}
                                    {isActive && <div className="active-indicator" />}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <div className="user-avatar">
                        <span>👤</span>
                    </div>
                    {!isCollapsed && (
                        <div className="user-info">
                            <div className="user-name">Utilisateur</div>
                            <div className="user-email">user@example.com</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;