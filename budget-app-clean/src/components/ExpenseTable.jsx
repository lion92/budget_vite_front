import { useState } from 'react';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryIcon } from '../utils/categories';
import useAppStore from '../store/useAppStore';
import { toast } from 'react-toastify';
import './ExpenseTable.css';

const ExpenseTable = ({ expenses, onEdit }) => {
  const { deleteExpense } = useAppStore();
  const [sortField, setSortField] = useState('dateTransaction');
  const [sortOrder, setSortOrder] = useState('desc');

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

    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
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
            <th onClick={() => handleSort('dateTransaction')} className="sortable">
              Date <SortIcon field="dateTransaction" />
            </th>
            <th onClick={() => handleSort('description')} className="sortable">
              Description <SortIcon field="description" />
            </th>
            <th onClick={() => handleSort('categorie')} className="sortable">
              Catégorie <SortIcon field="categorie" />
            </th>
            <th onClick={() => handleSort('montant')} className="sortable">
              Montant <SortIcon field="montant" />
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => (
            <tr key={expense.id}>
              <td>{formatDate(expense.dateTransaction)}</td>
              <td>{expense.description}</td>
              <td>
                <div className="category-cell">
                  <span className="category-icon">{getCategoryIcon(expense.categorie)}</span>
                  <span>{expense.categorie}</span>
                </div>
              </td>
              <td className="amount-cell">{formatCurrency(expense.montant)}</td>
              <td>
                <div className="action-buttons">
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
    </div>
  );
};

export default ExpenseTable;
