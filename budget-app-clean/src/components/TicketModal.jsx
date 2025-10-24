import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import './TicketModal.css';

const TicketModal = ({ isOpen, onClose, ticket = null }) => {
  const { updateTicket, categories } = useAppStore();

  const [formData, setFormData] = useState({
    commercant: '',
    montant: '',
    categorie: '',
    dateTransaction: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    if (ticket) {
      setFormData({
        commercant: ticket.commercant || ticket.merchant || '',
        montant: ticket.montant || ticket.amount || '',
        categorie: ticket.categorie || '',
        dateTransaction: (ticket.dateTransaction || ticket.date)?.split('T')[0] || '',
        description: ticket.extractedText || ticket.description || '',
      });
    }
  }, [ticket]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.montant) {
      toast.error('Le montant est requis');
      return;
    }

    const data = {
      commercant: formData.commercant,
      montant: formData.montant,
      categorie: formData.categorie,
      dateTransaction: formData.dateTransaction,
      description: formData.description,
    };

    const success = await updateTicket(ticket.id, data);

    if (success) {
      toast.success('Ticket modifié avec succès');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Modifier le ticket</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Commerçant</label>
              <input
                type="text"
                name="commercant"
                className="form-input"
                value={formData.commercant}
                onChange={handleChange}
                placeholder="Ex: Carrefour"
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

            <div className="form-group">
              <label className="form-label">Description / Notes</label>
              <textarea
                name="description"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                placeholder="Notes supplémentaires..."
                rows="3"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary">
              Modifier
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketModal;
