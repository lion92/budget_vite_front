import React, { useState, useEffect } from 'react';
import { User, Mail, Camera, Save, AlertCircle, CheckCircle, Trash2, Phone, MapPin, Calendar } from 'lucide-react';
import './css/user-profile.css';

export default function UserProfile() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // État du profil
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    avatarUrl: '',
    phone: '',
    dateOfBirth: '',
    address: ''
  });

  // Charger les données du profil au montage
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('jwt');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await fetch('https://www.krisscode.fr/profile/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt: token })
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.profile || data;

        setProfile({
          firstName: profile.prenom || '',
          lastName: profile.nom || '',
          email: profile.email || '',
          avatarUrl: profile.profilePicture ? `https://www.krisscode.fr/profile/picture/${profile.id}` : '',
          phone: profile.phoneNumber || '',
          dateOfBirth: profile.dateOfBirth || '',
          address: profile.address || ''
        });
      } else if (response.status === 401) {
        localStorage.removeItem('jwt');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Erreur lors du chargement du profil:', error);
      showMessage('error', 'Erreur lors du chargement du profil');
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('https://www.krisscode.fr/profile/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jwt: token,
          prenom: profile.firstName,
          nom: profile.lastName,
          phoneNumber: profile.phone,
          dateOfBirth: profile.dateOfBirth,
          address: profile.address
        })
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Profil mis à jour avec succès');

        // Mettre à jour le localStorage si nécessaire
        const user = JSON.parse(localStorage.getItem('utilisateur') || '{}');
        user.prenom = profile.firstName;
        user.nom = profile.lastName;
        localStorage.setItem('utilisateur', JSON.stringify(user));
      } else {
        showMessage('error', data.message || 'Erreur lors de la mise à jour du profil');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validation
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      showMessage('error', 'L\'image ne doit pas dépasser 5MB');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('jwt');
      formData.append('jwt', token);

      const response = await fetch('https://www.krisscode.fr/profile/upload-picture', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Avatar mis à jour avec succès');
        // Recharger le profil pour avoir l'URL mise à jour
        await loadUserProfile();
      } else {
        showMessage('error', data.message || 'Erreur lors du téléchargement de l\'avatar');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur lors du téléchargement de l\'avatar');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!profile.avatarUrl) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer votre photo de profil ?')) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('jwt');
      const response = await fetch('https://www.krisscode.fr/profile/delete-picture', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jwt: token })
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(prev => ({
          ...prev,
          avatarUrl: ''
        }));
        showMessage('success', 'Photo de profil supprimée avec succès');
      } else {
        showMessage('error', data.message || 'Erreur lors de la suppression de la photo');
      }
    } catch (error) {
      console.error('Erreur:', error);
      showMessage('error', 'Erreur lors de la suppression de la photo');
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

  const getInitials = () => {
    const first = profile.firstName?.charAt(0) || '';
    const last = profile.lastName?.charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Mon Profil</h1>
        <p className="profile-subtitle">Gérez vos informations personnelles et vos paramètres de sécurité</p>
      </div>

      {message.text && (
        <div className={`profile-message ${message.type}`}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="profile-content">
        {/* Section Avatar et Informations de base */}
        <div className="profile-section">
          <div className="section-header">
            <User size={24} />
            <h2>Informations personnelles</h2>
          </div>

          <div className="avatar-section">
            <div className="avatar-preview">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {getInitials()}
                </div>
              )}
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                <Camera size={20} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div className="avatar-info">
              <p className="avatar-title">Photo de profil</p>
              <p className="avatar-subtitle">JPG, PNG ou GIF. Max 5MB.</p>
              {profile.avatarUrl && (
                <button
                  type="button"
                  className="btn-delete-avatar"
                  onClick={handleDeleteAvatar}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  Supprimer la photo
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleProfileSubmit} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <Mail size={18} />
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                disabled
                className="disabled-input"
              />
              <p className="input-hint">L'adresse email ne peut pas être modifiée</p>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={18} />
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Votre numéro de téléphone"
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateOfBirth">
                  <Calendar size={18} />
                  Date de naissance
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ''}
                  onChange={handleProfileChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">
                <MapPin size={18} />
                Adresse
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={profile.address}
                onChange={handleProfileChange}
                placeholder="Votre adresse complète"
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <Save size={20} />
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
