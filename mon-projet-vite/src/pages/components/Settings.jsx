import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Globe,
  Shield,
  Palette,
  Moon,
  Sun,
  Monitor,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import './css/settings.css';

export default function Settings() {
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // État des paramètres
  const [settings, setSettings] = useState({
    // Apparence
    theme: localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light',

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    budgetAlerts: true,
    weeklyReport: true,
    monthlyReport: true,

    // Langue et Région
    language: 'fr',
    currency: 'EUR',
    dateFormat: 'DD/MM/YYYY',

    // Sécurité
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    // Charger les paramètres depuis localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Erreur lors du chargement des paramètres:', error);
      }
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({ ...prev, theme }));
    const isDark = theme === 'dark';
    localStorage.setItem('darkMode', isDark.toString());
    document.documentElement.setAttribute('data-theme', theme);

    // Déclencher un événement pour mettre à jour le menu
    window.dispatchEvent(new Event('storage'));
  };

  const handleSaveSettings = () => {
    setLoading(true);

    try {
      // Sauvegarder dans localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // Ici, vous pourriez aussi sauvegarder sur le serveur
      // await fetch('/api/users/settings', { method: 'PUT', body: JSON.stringify(settings) });

      showMessage('success', 'Paramètres enregistrés avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur lors de l\'enregistrement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 5000);
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Paramètres</h1>
        <p className="settings-subtitle">Personnalisez votre expérience Budget Pro</p>
      </div>

      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="settings-content">
        {/* Section Apparence */}
        <div className="settings-section">
          <div className="section-header">
            <Palette size={24} />
            <div>
              <h2>Apparence</h2>
              <p className="section-description">Personnalisez l'apparence de l'application</p>
            </div>
          </div>

          <div className="settings-group">
            <label className="setting-label">
              <span className="label-text">Thème</span>
              <span className="label-description">Choisissez le thème de l'interface</span>
            </label>
            <div className="theme-selector">
              <button
                className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
              >
                <Sun size={20} />
                <span>Clair</span>
              </button>
              <button
                className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
              >
                <Moon size={20} />
                <span>Sombre</span>
              </button>
              <button
                className={`theme-option ${settings.theme === 'auto' ? 'active' : ''}`}
                onClick={() => handleThemeChange('auto')}
              >
                <Monitor size={20} />
                <span>Auto</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section Notifications */}
        <div className="settings-section">
          <div className="section-header">
            <Bell size={24} />
            <div>
              <h2>Notifications</h2>
              <p className="section-description">Gérez vos préférences de notifications</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Notifications par email</span>
                <span className="setting-desc">Recevez des notifications importantes par email</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Notifications push</span>
                <span className="setting-desc">Activez les notifications push dans votre navigateur</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Alertes de budget</span>
                <span className="setting-desc">Recevez des alertes lorsque vous approchez de vos limites</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.budgetAlerts}
                  onChange={(e) => handleSettingChange('budgetAlerts', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Rapport hebdomadaire</span>
                <span className="setting-desc">Recevez un résumé de vos dépenses chaque semaine</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyReport}
                  onChange={(e) => handleSettingChange('weeklyReport', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Rapport mensuel</span>
                <span className="setting-desc">Recevez un rapport détaillé chaque mois</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.monthlyReport}
                  onChange={(e) => handleSettingChange('monthlyReport', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Section Langue et Région */}
        <div className="settings-section">
          <div className="section-header">
            <Globe size={24} />
            <div>
              <h2>Langue et région</h2>
              <p className="section-description">Configurez vos préférences régionales</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-group">
              <label className="setting-label">
                <span className="label-text">Langue</span>
              </label>
              <select
                className="settings-select"
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            <div className="settings-group">
              <label className="setting-label">
                <span className="label-text">Devise</span>
              </label>
              <select
                className="settings-select"
                value={settings.currency}
                onChange={(e) => handleSettingChange('currency', e.target.value)}
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CHF">CHF (Fr.)</option>
              </select>
            </div>

            <div className="settings-group">
              <label className="setting-label">
                <span className="label-text">Format de date</span>
              </label>
              <select
                className="settings-select"
                value={settings.dateFormat}
                onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="settings-section">
          <div className="section-header">
            <Shield size={24} />
            <div>
              <h2>Sécurité</h2>
              <p className="section-description">Protégez votre compte</p>
            </div>
          </div>

          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-name">Authentification à deux facteurs</span>
                <span className="setting-desc">Ajoutez une couche de sécurité supplémentaire</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="settings-group">
              <label className="setting-label">
                <span className="label-text">Délai d'expiration de session</span>
                <span className="label-description">Durée d'inactivité avant déconnexion (minutes)</span>
              </label>
              <select
                className="settings-select"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 heure</option>
                <option value="120">2 heures</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde fixe */}
      <div className="settings-footer">
        <button
          className="btn-save-settings"
          onClick={handleSaveSettings}
          disabled={loading}
        >
          <Save size={20} />
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
