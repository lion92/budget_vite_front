import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  CreditCard,
  PieChart,
  TrendingUp,
  Calendar,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  DollarSign,
  Target,
  Briefcase,
  FileText,
  BarChart3,
  MessageCircle,
  Sun,
  Moon,
  Receipt
} from 'lucide-react';
import './css/premium-menu.css';

// Composants utilitaires importés
import CookieConsent from "./cookie_bandeau.jsx";
import Notifications from "./Notification";
import { Depenses } from "./Depenses.jsx";
import { Revenues } from "../../Revenues.jsx";
import BaniereLetchi from "./BaniereLetchi.jsx";
import ChatBotAction from "./ChatBotAction.jsx";

export default function MenuComponent(props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("jwt"));
  const [showChatBot, setShowChatBot] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('utilisateur') || '{}'));

  // Gestion du responsive
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem("jwt"));
      setCurrentUser(JSON.parse(localStorage.getItem('utilisateur') || '{}'));
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [sidebarOpen]);

  // Navigation items
  const navigationSections = {
    dashboard: [
      { path: "/", label: "Tableau de bord", icon: Home, description: "Vue d'ensemble" },
    ],
    finance: [
      { path: "/budget", label: "Budget", icon: DollarSign, description: "Gérer mon budget" },
      { path: "/categorie", label: "Catégories", icon: PieChart, description: "Organiser mes dépenses" },
      { path: "/allSpend", label: "Dépenses", icon: CreditCard, description: "Historique des dépenses" },
      { path: "/allSpendFilters", label: "Analyses", icon: BarChart3, description: "Analyses avancées" },
      { path: "/analytics", label: "Graphiques", icon: TrendingUp, description: "Visualisation des dépenses", badge: "Nouveau" },
      { path: "/enveloppe", label: "Enveloppes", icon: Target, description: "Système d'enveloppes" },
    ],
    tools: [
      { path: "/form", label: "Tâches", icon: FileText, description: "Gestion des tâches" },
      { path: "/agenda", label: "Agenda", icon: Calendar, description: "Planning personnel" },
      { path: "/comptabilite", label: "Comptabilité", icon: Briefcase, description: "Espace comptable" },
      { path: "/factures", label: "Factures", icon: Receipt, description: "Gestion des factures" },
      { path: "/graph", label: "Graphiques", icon: BarChart3, description: "Visualisations" },
    ]
  };

  const publicLinks = [
    { path: "/login", label: "Connexion", icon: User, description: "Se connecter" },
    { path: "/inscription", label: "Inscription", icon: Settings, description: "Créer un compte" },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    if (isMobile) {
      document.body.style.overflow = !sidebarOpen ? 'hidden' : 'auto';
    }
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
      document.body.style.overflow = 'auto';
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("utilisateur");
    setIsAuthenticated(false);
    window.location.reload();
  };

  const renderNavSection = (title, items, sectionKey) => (
    <div key={sectionKey} className="nav-section">
      <div className="nav-section-header">
        <h3 className="nav-section-title">{title}</h3>
      </div>
      <div className="nav-items">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={handleLinkClick}
            >
              <div className="nav-item-content">
                <div className="nav-item-left">
                  <div className="nav-item-icon">
                    <IconComponent size={20} />
                  </div>
                  <div className="nav-item-text">
                    <span className="nav-item-label">{item.label}</span>
                    <span className="nav-item-description">{item.description}</span>
                  </div>
                </div>
                {item.badge && (
                  <span className="nav-item-badge">{item.badge}</span>
                )}
              </div>
              <div className="nav-item-indicator"></div>
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`premium-app ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Overlay mobile */}
      {isMobile && sidebarOpen && (
        <div className="mobile-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`premium-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-content">
          {/* Header */}
          <div className="sidebar-header">
            <div className="logo-container">
              <div className="logo-icon">
                <DollarSign size={24} />
              </div>
              <div className="logo-text">
                <h1 className="logo-title">Budget Pro</h1>
                <p className="logo-subtitle">Gestion Financière</p>
              </div>
            </div>

            <div className="header-actions">
              <button
                className="theme-toggle"
                onClick={toggleDarkMode}
                aria-label="Changer de thème"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {isAuthenticated ? (
              <>
                {renderNavSection("Principal", navigationSections.dashboard, "dashboard")}
                {renderNavSection("Finance", navigationSections.finance, "finance")}
                {renderNavSection("Outils", navigationSections.tools, "tools")}
              </>
            ) : (
              renderNavSection("Connexion", publicLinks, "auth")
            )}
          </nav>

          {/* Footer */}
          {isAuthenticated && (
            <div className="sidebar-footer">
              <div className="user-profile">
                <div className="user-avatar">
                  <User size={20} />
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {currentUser.prenom && currentUser.nom
                      ? `${currentUser.prenom} ${currentUser.nom}`
                      : 'Utilisateur'
                    }
                  </span>
                  <span className="user-role">Gestionnaire</span>
                </div>
                <button
                  className="logout-btn"
                  onClick={handleLogout}
                  title="Déconnexion"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="premium-main">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="sidebar-toggle"
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="page-title">
              <h1>{props.title || 'Budget Manager'}</h1>
              {props.breadcrumb && (
                <div className="breadcrumb">{props.breadcrumb}</div>
              )}
            </div>
          </div>

          <div className="top-bar-right">
            <div className="notifications-container">
              <Notifications />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="page-content">
          <CookieConsent />

          {isAuthenticated && (
            <div className="widgets-container">
              <BaniereLetchi />
              <Depenses />
              <Revenues />
            </div>
          )}

          <div className="main-content">
            {props.contenue}
          </div>
        </div>
      </main>

      {/* Chat Bubble */}
      <button
        className="chat-bubble"
        onClick={() => setShowChatBot(!showChatBot)}
        aria-label="Ouvrir le chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Panel */}
      {showChatBot && (
        <div className="chat-panel">
          <div className="chat-header">
            <h3>Assistant</h3>
            <button
              className="chat-close"
              onClick={() => setShowChatBot(false)}
            >
              <X size={18} />
            </button>
          </div>
          <div className="chat-content">
            <ChatBotAction />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav className="mobile-bottom-nav">
          {(isAuthenticated ? navigationSections.dashboard.concat(navigationSections.finance.slice(0, 2)) : publicLinks.slice(0, 2)).map((item, index) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <IconComponent size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          <button
            className={`mobile-nav-item ${sidebarOpen ? 'active' : ''}`}
            onClick={toggleSidebar}
            title="Menu"
          >
            <Menu size={20} />
          </button>
        </nav>
      )}
    </div>
  );
}