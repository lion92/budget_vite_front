import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import './Revenues.css';

const Revenues = () => {
  const { revenues, addRevenue, deleteRevenue, fetchRevenues, getTotalRevenues, getTotalExpenses } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    montant: '',
    dateRevenu: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRevenues();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom || !formData.montant) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const success = await addRevenue(formData);
    if (success) {
      toast.success('Revenu ajouté avec succès');
      setShowModal(false);
      setFormData({
        nom: '',
        montant: '',
        dateRevenu: new Date().toISOString().split('T')[0]
      });
    } else {
      toast.error('Erreur lors de l\'ajout du revenu');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce revenu ?')) {
      const success = await deleteRevenue(id);
      if (success) {
        toast.success('Revenu supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const totalRevenues = getTotalRevenues();
  const totalExpenses = getTotalExpenses();
  const balance = totalRevenues - totalExpenses;

  return (
    <div className="revenues-page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Revenus</h1>
          <p>Gérez vos sources de revenus</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Ajouter un revenu
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="card">
          <div className="stat-label">Total Revenus</div>
          <div className="stat-value success">{formatCurrency(totalRevenues)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Total Dépenses</div>
          <div className="stat-value danger">{formatCurrency(totalExpenses)}</div>
        </div>
        <div className="card">
          <div className="stat-label">Solde</div>
          <div className={`stat-value ${balance >= 0 ? 'success' : 'danger'}`}>
            {formatCurrency(balance)}
          </div>
        </div>
        <div className="card">
          <div className="stat-label">Nombre de revenus</div>
          <div className="stat-value primary">{revenues.length}</div>
        </div>
      </div>

      {/* Tableau des revenus */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Liste des revenus</h3>
        </div>
        <div className="card-body">
          {revenues.length === 0 ? (
            <div className="empty-state">
              <TrendingUp size={48} />
              <p>Aucun revenu enregistré</p>
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                Ajouter votre premier revenu
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Nom</th>
                    <th>Montant</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {revenues.map((revenue) => (
                    <tr key={revenue.id}>
                      <td>{formatDate(revenue.date || revenue.dateRevenu)}</td>
                      <td>{revenue.name || revenue.nom}</td>
                      <td className="amount-cell success">{formatCurrency(revenue.amount || revenue.montant)}</td>
                      <td>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(revenue.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Ajout Revenu */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Ajouter un revenu</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    className="form-input"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Ex: Salaire, Freelance, etc."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Montant (€)</label>
                  <input
                    type="number"
                    name="montant"
                    className="form-input"
                    value={formData.montant}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    name="dateRevenu"
                    className="form-input"
                    value={formData.dateRevenu}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Revenues;
