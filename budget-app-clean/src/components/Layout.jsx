import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Home, TrendingUp, Receipt, FileText, Tag,
  LogOut, Menu, X, Calendar, BarChart3, Plus
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ExpenseModal from './ExpenseModal';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAppStore();
  const userEmail = user?.email || localStorage.getItem('utilisateur') || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/analytics', icon: BarChart3, label: 'Analytique' },
    { path: '/monthly-expenses', icon: Calendar, label: 'Dépenses du mois' },
    { path: '/expenses', icon: Receipt, label: 'Toutes les dépenses' },
    { path: '/revenues', icon: TrendingUp, label: 'Revenus' },
    { path: '/categories', icon: Tag, label: 'Catégories' },
    { path: '/tickets', icon: FileText, label: 'Tickets & Reçus' },
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
            <button
              className="btn btn-primary btn-sm quick-add-btn"
              onClick={() => setQuickAddOpen(true)}
              title="Ajouter une dépense rapidement"
            >
              <Plus size={16} />
              <span className="quick-add-label">Dépense</span>
            </button>
            {userEmail && (
              <div className="user-badge">
                <span>{userEmail}</span>
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

      {/* Quick Add Expense Modal */}
      <ExpenseModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
      />
    </div>
  );
};

export default Layout;
