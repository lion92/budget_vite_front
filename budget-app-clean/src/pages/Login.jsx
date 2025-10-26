import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, TrendingUp, PieChart, Target, Sparkles, Shield, Zap } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAppStore();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const success = await login(formData.email, formData.password);

    if (success) {
      toast.success('Connexion réussie !');
      navigate('/');
    } else {
      toast.error('Email ou mot de passe incorrect');
    }
  };

  return (
    <div className="landing-page">
      {/* Left Side - Branding & Features */}
      <div className="landing-left">
        <div className="landing-content">
          <div className="brand-section">
            <h1 className="brand-title">
              <Sparkles className="brand-icon" size={40} />
              Budget App
            </h1>
            <p className="brand-tagline">
              Prenez le contrôle de vos finances avec intelligence et simplicité
            </p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon primary">
                <TrendingUp size={24} />
              </div>
              <div className="feature-text">
                <h3>Suivi en temps réel</h3>
                <p>Visualisez vos dépenses et revenus instantanément</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon success">
                <PieChart size={24} />
              </div>
              <div className="feature-text">
                <h3>Catégories intelligentes</h3>
                <p>Organisez vos finances par catégories personnalisées</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon warning">
                <Target size={24} />
              </div>
              <div className="feature-text">
                <h3>Objectifs financiers</h3>
                <p>Définissez et atteignez vos objectifs d'épargne</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon info">
                <Shield size={24} />
              </div>
              <div className="feature-text">
                <h3>Sécurisé et privé</h3>
                <p>Vos données sont cryptées et protégées</p>
              </div>
            </div>
          </div>

          <div className="stats-banner">
            <div className="stat-item">
              <Zap className="stat-icon" size={20} />
              <div>
                <span className="stat-number">100%</span>
                <span className="stat-label">Gratuit</span>
              </div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <Shield className="stat-icon" size={20} />
              <div>
                <span className="stat-number">Sécurisé</span>
                <span className="stat-label">Données protégées</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="landing-right">
        <div className="auth-card modern">
          <div className="auth-header">
            <h2>Bon retour !</h2>
            <p>Connectez-vous pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className="form-input modern"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                name="password"
                className="form-input modern"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block modern"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner" />
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/register" className="link-primary">S'inscrire gratuitement</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
