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

  const handleGoogleLogin = () => {
    window.location.href = 'https://www.krisscode.fr/connection/google';
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

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <button
            type="button"
            className="btn-google"
            onClick={() => handleGoogleLogin()}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuer avec Google
          </button>

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
