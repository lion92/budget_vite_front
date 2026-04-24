import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Sparkles, TrendingUp, PieChart, Target, Shield, Zap, Heart, FileText } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import '../styles/pages/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAppStore();

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [cguAccepted, setCguAccepted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom || !formData.prenom || !formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (!cguAccepted) {
      toast.error('Veuillez accepter les CGU pour continuer');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const success = await register({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      password: formData.password,
    });

    if (success) {
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
      navigate('/login');
    } else {
      toast.error("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="landing-page">
      {/* Left Side - Branding */}
      <div className="landing-left">
        <div className="landing-content">
          <div className="brand-section">
            <h1 className="brand-title">
              <Sparkles className="brand-icon" size={40} />
              Budget App
            </h1>
            <p className="brand-tagline">
              Rejoignez votre espace financier personnel — gratuit, simple, efficace
            </p>
          </div>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon primary"><TrendingUp size={24} /></div>
              <div className="feature-text">
                <h3>Suivi en temps réel</h3>
                <p>Visualisez vos dépenses et revenus instantanément</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon success"><PieChart size={24} /></div>
              <div className="feature-text">
                <h3>Catégories intelligentes</h3>
                <p>Organisez vos finances par catégories personnalisées</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon warning"><Target size={24} /></div>
              <div className="feature-text">
                <h3>Objectifs financiers</h3>
                <p>Définissez et atteignez vos objectifs d'épargne</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon info"><Shield size={24} /></div>
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

          <div className="cgu-landing-box">
            <div className="cgu-landing-row">
              <Heart size={14} className="cgu-heart" />
              <span>Projet personnel — aucun usage commercial</span>
            </div>
            <Link to="/cgu" className="cgu-landing-link">
              <FileText size={13} />
              Lire les Conditions Générales d'Utilisation
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="landing-right">
        <div className="auth-card modern">
          <div className="auth-header">
            <h2>Créer un compte</h2>
            <p>Rejoignez Budget App gratuitement</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  name="nom"
                  className="form-input modern"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input
                  type="text"
                  name="prenom"
                  className="form-input modern"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Marie"
                  required
                />
              </div>
            </div>

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

            <div className="form-group">
              <label className="form-label">Confirmer le mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input modern"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group cgu-check">
              <label className="cgu-label">
                <input
                  type="checkbox"
                  checked={cguAccepted}
                  onChange={(e) => setCguAccepted(e.target.checked)}
                />
                <span>
                  J'accepte les{' '}
                  <Link to="/cgu" target="_blank" className="link-primary">CGU</Link>
                  {' '}— application gratuite, projet d'apprentissage
                </span>
              </label>
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
                  <UserPlus size={20} />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Déjà un compte ?{' '}
              <Link to="/login" className="link-primary">Se connecter</Link>
            </p>
            <p className="auth-cgu-notice">
              En vous inscrivant, vous acceptez nos{' '}
              <Link to="/cgu" target="_blank" className="link-primary">CGU</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
