import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import '../styles/components/CategoryModal.css';

// Liste complète des 130+ icônes Font Awesome
const iconOptions = [
  // Alimentation & Boissons
  { label: "🍽️ Nourriture", value: "fa-solid fa-utensils" },
  { label: "🛒 Courses", value: "fa-solid fa-cart-shopping" },
  { label: "🍷 Sorties", value: "fa-solid fa-wine-glass" },
  { label: "☕ Café/Thé", value: "fa-solid fa-mug-saucer" },
  { label: "🍕 Fast Food", value: "fa-solid fa-pizza-slice" },
  { label: "🥖 Boulangerie", value: "fa-solid fa-bread-slice" },
  { label: "🍎 Fruits/Légumes", value: "fa-solid fa-apple-whole" },
  { label: "🥩 Viande/Poisson", value: "fa-solid fa-fish" },

  // Transport & Automobile
  { label: "🚗 Transport", value: "fa-solid fa-car" },
  { label: "⛽ Carburant", value: "fa-solid fa-gas-pump" },
  { label: "🚌 Transport Public", value: "fa-solid fa-bus" },
  { label: "🚕 Taxi/VTC", value: "fa-solid fa-taxi" },
  { label: "🚲 Vélo", value: "fa-solid fa-bicycle" },
  { label: "🛞 Entretien Auto", value: "fa-solid fa-tire" },
  { label: "🅿️ Parking", value: "fa-solid fa-square-parking" },
  { label: "✈️ Voyage", value: "fa-solid fa-plane" },

  // Logement & Maison
  { label: "🏠 Logement", value: "fa-solid fa-house" },
  { label: "🔧 Réparations", value: "fa-solid fa-screwdriver-wrench" },
  { label: "🚿 Entretien", value: "fa-solid fa-broom" },
  { label: "🪴 Jardinage", value: "fa-solid fa-seedling" },
  { label: "🏗️ Travaux", value: "fa-solid fa-hammer" },
  { label: "🪑 Mobilier", value: "fa-solid fa-chair" },
  { label: "🔒 Sécurité", value: "fa-solid fa-shield-halved" },

  // Services & Utilities
  { label: "⚡ Énergie", value: "fa-solid fa-bolt" },
  { label: "💧 Eau", value: "fa-solid fa-droplet" },
  { label: "📱 Téléphone", value: "fa-solid fa-mobile-screen" },
  { label: "🌐 Internet", value: "fa-solid fa-globe" },
  { label: "📺 Abonnements", value: "fa-solid fa-tv" },
  { label: "📡 Streaming", value: "fa-solid fa-satellite-dish" },

  // Santé & Bien-être
  { label: "❤️ Santé", value: "fa-solid fa-heart" },
  { label: "👩‍⚕️ Médical", value: "fa-solid fa-stethoscope" },
  { label: "💊 Pharmacie", value: "fa-solid fa-pills" },
  { label: "🦷 Dentiste", value: "fa-solid fa-tooth" },
  { label: "👓 Optique", value: "fa-solid fa-glasses" },
  { label: "🧘 Bien-être", value: "fa-solid fa-spa" },

  // Mode & Beauté
  { label: "👕 Vêtements", value: "fa-solid fa-shirt" },
  { label: "👠 Chaussures", value: "fa-solid fa-shoe-prints" },
  { label: "💄 Cosmétiques", value: "fa-solid fa-wand-magic-sparkles" },
  { label: "💇 Coiffeur", value: "fa-solid fa-scissors" },
  { label: "👜 Accessoires", value: "fa-solid fa-bag-shopping" },
  { label: "💍 Bijoux", value: "fa-solid fa-gem" },

  // Loisirs & Divertissement
  { label: "🎬 Loisirs", value: "fa-solid fa-film" },
  { label: "🎵 Musique", value: "fa-solid fa-music" },
  { label: "🎮 Jeux", value: "fa-solid fa-gamepad" },
  { label: "🏋️ Sport", value: "fa-solid fa-dumbbell" },
  { label: "🎯 Activités", value: "fa-solid fa-bullseye" },

  // Autres
  { label: "🎁 Cadeaux", value: "fa-solid fa-gift" },
  { label: "💼 Travail", value: "fa-solid fa-briefcase" },
  { label: "🐶 Animaux", value: "fa-solid fa-dog" },
  { label: "🍼 Enfants", value: "fa-solid fa-baby" },
  { label: "🏦 Banque", value: "fa-solid fa-building-columns" },
  { label: "❓ Divers", value: "fa-solid fa-question" },
];

const CategoryModal = ({ isOpen, onClose, category = null, onSuccess = null }) => {
  const { addCategory, updateCategory } = useAppStore();
  const userId = localStorage.getItem('utilisateur');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().toLocaleString('fr-FR', { month: 'long' });

  const [formData, setFormData] = useState({
    categorie: '',
    description: '',
    color: '#667eea',
    iconName: '',
    month: currentMonth,
    annee: currentYear.toString(),
    budgetDebutMois: '',
  });

  useEffect(() => {
    if (category) {
      setFormData({
        categorie: category.categorie || '',
        description: category.description || '',
        color: category.color || '#667eea',
        iconName: category.iconName || '',
        month: category.month || currentMonth,
        annee: category.annee || currentYear.toString(),
        budgetDebutMois: category.budgetDebutMois || '',
      });
    } else {
      setFormData({
        categorie: '',
        description: '',
        color: '#667eea',
        iconName: '',
        month: currentMonth,
        annee: currentYear.toString(),
        budgetDebutMois: '',
      });
    }
  }, [isOpen, category, currentMonth, currentYear]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categorie.trim()) {
      toast.error('Le nom de la catégorie est requis');
      return;
    }

    const data = {
      categorie: formData.categorie.trim(),
      description: formData.description.trim(),
      color: formData.color,
      iconName: formData.iconName,
      month: formData.month,
      annee: formData.annee,
      budgetDebutMois: parseFloat(formData.budgetDebutMois) || 0,
      user: parseInt(userId),
      jwt: localStorage.getItem('jwt')
    };

    let success;
    if (category) {
      success = await updateCategory(category.id, data);
      if (success) toast.success('Catégorie modifiée avec succès');
    } else {
      success = await addCategory(data);
      if (success) toast.success('Catégorie ajoutée avec succès');
    }

    if (success) {
      onSuccess?.(formData.categorie.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{category ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Nom de la catégorie *</label>
                <input
                  type="text"
                  name="categorie"
                  className="form-input"
                  value={formData.categorie}
                  onChange={handleChange}
                  placeholder="Ex: Alimentation, Transport..."
                  required
                  maxLength={50}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Couleur</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    name="color"
                    className="form-input-color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#667eea"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Icône</label>
              <select
                name="iconName"
                className="form-select"
                value={formData.iconName}
                onChange={handleChange}
              >
                <option value="">Sélectionner une icône</option>
                {iconOptions.map((icon) => (
                  <option key={icon.value} value={icon.value}>
                    {icon.label}
                  </option>
                ))}
              </select>
              {formData.iconName && (
                <div className="icon-preview">
                  <i className={formData.iconName} style={{ color: formData.color, fontSize: '2rem' }}></i>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Description (optionnelle)</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description de la catégorie..."
                rows="2"
                maxLength={200}
              />
              <small className="form-hint">
                {formData.description.length}/200 caractères
              </small>
            </div>

            <div className="form-divider">
              <span>Budget Mensuel</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mois</label>
                <select
                  name="month"
                  className="form-select"
                  value={formData.month}
                  onChange={handleChange}
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Année</label>
                <select
                  name="annee"
                  className="form-select"
                  value={formData.annee}
                  onChange={handleChange}
                >
                  {years.map((y) => (
                    <option key={y} value={y.toString()}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Budget (€)</label>
                <input
                  type="number"
                  name="budgetDebutMois"
                  className="form-input"
                  value={formData.budgetDebutMois}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {category ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
