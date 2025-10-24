import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import './ExpenseModal.css';

const ExpenseModal = ({ isOpen, onClose, expense = null }) => {
  const { addExpense, updateExpense, categories } = useAppStore();
  const userId = localStorage.getItem('utilisateur');

  const [formData, setFormData] = useState({
    description: '',
    montant: '',
    categorie: '',
    dateTransaction: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description || '',
        montant: expense.montant || '',
        categorie: expense.categorie || '',
        dateTransaction: expense.dateTransaction?.split('T')[0] || '',
      });
    }
  }, [expense]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.montant || !formData.categorie) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const data = {
      description: formData.description,
      montant: formData.montant,
      categorie: formData.categorie,
      dateTransaction: formData.dateTransaction,
    };

    let success;
    if (expense) {
      success = await updateExpense(expense.id, data);
      if (success) toast.success('Dépense modifiée avec succès');
    } else {
      success = await addExpense(data);
      if (success) toast.success('Dépense ajoutée avec succès');
    }

    if (success) {
      onClose();
      setFormData({
        description: '',
        montant: '',
        categorie: '',
        dateTransaction: new Date().toISOString().split('T')[0],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Modifier la dépense' : 'Ajouter une dépense'}</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                type="text"
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Ex: Courses au supermarché"
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
              <label className="form-label">Catégorie</label>
              <select
                name="categorie"
                className="form-select"
                value={formData.categorie}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categorie}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                name="dateTransaction"
                className="form-input"
                value={formData.dateTransaction}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              {expense ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
