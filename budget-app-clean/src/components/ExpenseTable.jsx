import { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp, Camera } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categories';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import { getTicketForExpense } from '../utils/ticketLinks';
import TicketViewerModal from './TicketViewerModal';
import './ExpenseTable.css';

const ExpenseTable = ({ expenses, onEdit }) => {
  const { deleteExpense } = useAppStore();
  const [sortField, setSortField] = useState('dateTransaction');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewingTicket, setViewingTicket] = useState(null); // { ticketId, description }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (sortField === 'montant') {
      aVal = parseFloat(aVal);
      bVal = parseFloat(bVal);
    } else if (sortField === 'dateTransaction') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    } else {
      aVal = aVal?.toLowerCase() || '';
      bVal = bVal?.toLowerCase() || '';
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      const success = await deleteExpense(id);
      if (success) {
        toast.success('Dépense supprimée avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <p>Aucune dépense à afficher</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table expense-table">
        <thead>
          <tr>
            <th className="col-date sortable" onClick={() => handleSort('dateTransaction')}>
              Date <SortIcon field="dateTransaction" />
            </th>
            <th className="col-desc sortable" onClick={() => handleSort('description')}>
              Description <SortIcon field="description" />
            </th>
            <th className="col-cat sortable" onClick={() => handleSort('categorie')}>
              Catégorie <SortIcon field="categorie" />
            </th>
            <th className="sortable" onClick={() => handleSort('montant')}>
              Montant <SortIcon field="montant" />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr key={expense.id}>
              <td className="col-date">{formatDate(expense.dateTransaction)}</td>
              <td className="col-desc">{expense.description}</td>
              <td className="col-cat">
                <div className="category-cell">
                  <span className="category-icon">{getCategoryIcon(expense.categorie)}</span>
                  <span className="cat-label">{expense.categorie}</span>
                </div>
              </td>
              <td className="amount-cell">{formatCurrency(expense.montant)}</td>
              <td>
                <div className="action-buttons">
                  {(() => {
                    const link = getTicketForExpense(expense.id);
                    const ticketId = link?.ticketId || expense.ticketId || null;
                    return ticketId ? (
                      <button
                        className="btn-icon btn-ticket"
                        onClick={() => setViewingTicket({ ticketId, description: expense.description })}
                        title="Voir le ticket de caisse"
                      >
                        <Camera size={16} />
                      </button>
                    ) : null;
                  })()}
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => onEdit(expense)}
                    title="Modifier"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => handleDelete(expense.id)}
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TicketViewerModal
        isOpen={!!viewingTicket}
        onClose={() => setViewingTicket(null)}
        ticketId={viewingTicket?.ticketId}
        description={viewingTicket?.description}
      />
    </div>
  );
};

export default ExpenseTable;
