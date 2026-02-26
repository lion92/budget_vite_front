import { useState, useEffect } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import './ExpenseModal.css';

const QUICK_AMOUNTS = [5, 10, 20, 50, 100, 200];

const ExpenseModal = ({ isOpen, onClose, expense = null, defaultDate = null }) => {
  const { addExpense, updateExpense, categories } = useAppStore();
  const userId = localStorage.getItem('utilisateur');

  const getDefaultDate = () =>
    defaultDate || new Date().toISOString().split('T')[0];

  const defaultForm = {
    description: '',
    montant: '',
    categorie: '',
    dateTransaction: getDefaultDate(),
  };

  const [formData, setFormData] = useState(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (expense) {
      // L'API retourne categorie comme nom (string), on cherche l'ID correspondant
      const catId = expense.categorie_id?.toString()
        || categories.find(c => c.categorie === expense.categorie)?.id?.toString()
        || expense.categorie?.toString()
        || '';

      setFormData({
        description: expense.description || '',
        montant: expense.montant || '',
        categorie: catId,
        dateTransaction: expense.dateTransaction?.split('T')[0] || new Date().toISOString().split('T')[0],
      });
    } else {
      setFormData({
        description: '',
        montant: '',
        categorie: '',
        dateTransaction: getDefaultDate(),
      });
    }
  }, [isOpen, expense, categories, defaultDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickAmount = (amount, mode = 'set') => {
    const current = parseFloat(formData.montant) || 0;
    let next;
    if (mode === 'add') next = current + amount;
    else if (mode === 'sub') next = Math.max(0, current - amount);
    else next = amount;
    setFormData((prev) => ({ ...prev, montant: next.toFixed(2) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description || !formData.montant || !formData.categorie) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (parseFloat(formData.montant) <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    setIsSubmitting(true);
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

    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const montantNum = parseFloat(formData.montant) || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal expense-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{expense ? 'Modifier la dépense' : 'Ajouter une dépense'}</h2>
          <button className="btn-close" onClick={onClose} type="button">
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
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Montant (€)</label>
              <div className="amount-input-wrapper">
                <div className="amount-display-row">
                  <span className="currency-symbol">€</span>
                  <input
                    type="number"
                    name="montant"
                    className="form-input amount-input"
                    value={formData.montant}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="quick-amounts">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      className="quick-amount-btn"
                      onClick={() => handleQuickAmount(amt, 'set')}
                    >
                      {amt}€
                    </button>
                  ))}
                </div>
                <div className="amount-adjust-row">
                  <button
                    type="button"
                    className="adjust-btn minus"
                    onClick={() => handleQuickAmount(1, 'sub')}
                  >
                    <Minus size={14} /> 1
                  </button>
                  <span className="amount-current">{montantNum.toFixed(2)} €</span>
                  <button
                    type="button"
                    className="adjust-btn plus"
                    onClick={() => handleQuickAmount(1, 'add')}
                  >
                    <Plus size={14} /> 1
                  </button>
                </div>
              </div>
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
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enregistrement...' : expense ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseModal;
