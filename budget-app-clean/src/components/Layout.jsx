import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, TrendingUp, PieChart, Receipt, FileText, DollarSign, Tag,
  Settings, LogOut, Menu, X, User, Calendar
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/monthly-expenses', icon: Calendar, label: 'Dépenses du mois' },
    { path: '/expenses', icon: Receipt, label: 'Toutes les dépenses' },
    { path: '/revenues', icon: TrendingUp, label: 'Revenus' },
    { path: '/categories', icon: Tag, label: 'Catégories' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>💰 Budget App</h2>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>

          <div className="header-right">
            {user && (
              <div className="user-info">

              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
};

export default Layout;
