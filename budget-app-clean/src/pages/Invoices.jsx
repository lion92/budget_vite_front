import { useState, useEffect } from 'react';
import {
  FileText, Plus, Download, Edit2, Trash2, Calendar, DollarSign,
  User, Building, Receipt, X, Save, Eye, AlertCircle
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import './Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [previewInvoice, setPreviewInvoice] = useState(null);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = () => {
    const saved = localStorage.getItem('invoices');
    if (saved) {
      setInvoices(JSON.parse(saved));
    }
  };

  const saveInvoices = (newInvoices) => {
    localStorage.setItem('invoices', JSON.stringify(newInvoices));
    setInvoices(newInvoices);
  };

  const handleAddInvoice = () => {
    setEditingInvoice(null);
    setShowModal(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowModal(true);
  };

  const handleDeleteInvoice = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      const updated = invoices.filter(inv => inv.id !== id);
      saveInvoices(updated);
      toast.success('Facture supprimée');
    }
  };

  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      // Update existing
      const updated = invoices.map(inv =>
        inv.id === editingInvoice.id ? { ...invoiceData, id: editingInvoice.id } : inv
      );
      saveInvoices(updated);
      toast.success('Facture modifiée');
    } else {
      // Add new
      const newInvoice = {
        ...invoiceData,
        id: Date.now(),
        dateCreation: new Date().toISOString()
      };
      saveInvoices([...invoices, newInvoice]);
      toast.success('Facture créée');
    }
    setShowModal(false);
    setEditingInvoice(null);
  };

  const handlePreview = (invoice) => {
    setPreviewInvoice(invoice);
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case 'facture': return 'Facture';
      case 'devis': return 'Devis';
      case 'ticket': return 'Ticket';
      default: return type;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'facture': return '#2563eb';
      case 'devis': return '#f59e0b';
      case 'ticket': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredInvoices = filterType === 'all'
    ? invoices
    : invoices.filter(inv => inv.typeDocument === filterType);

  const getTotalAmount = () => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  };

  const getCountByType = (type) => {
    return invoices.filter(inv => inv.typeDocument === type).length;
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <div>
          <h1>Factures & Devis</h1>
          <p>Gérez vos factures, devis et tickets de caisse</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddInvoice}>
          <Plus size={20} />
          Nouveau document
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-label">Factures</div>
            <div className="stat-value">{getCountByType('facture')}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <Receipt size={24} />
          </div>
          <div>
            <div className="stat-label">Devis</div>
            <div className="stat-value">{getCountByType('devis')}</div>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon success">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Total</div>
            <div className="stat-value">{formatCurrency(getTotalAmount())}</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="card filters-card">
        <div className="filters-group">
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            Tous ({invoices.length})
          </button>
          <button
            className={`filter-btn ${filterType === 'facture' ? 'active' : ''}`}
            onClick={() => setFilterType('facture')}
          >
            Factures ({getCountByType('facture')})
          </button>
          <button
            className={`filter-btn ${filterType === 'devis' ? 'active' : ''}`}
            onClick={() => setFilterType('devis')}
          >
            Devis ({getCountByType('devis')})
          </button>
          <button
            className={`filter-btn ${filterType === 'ticket' ? 'active' : ''}`}
            onClick={() => setFilterType('ticket')}
          >
            Tickets ({getCountByType('ticket')})
          </button>
        </div>
      </div>

      {/* Liste des factures */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mes documents ({filteredInvoices.length})</h3>
        </div>
        <div className="card-body">
          {filteredInvoices.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>Aucun document</p>
              <p className="text-secondary">Créez votre première facture ou devis</p>
            </div>
          ) : (
            <div className="invoices-grid">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="invoice-card">
                  <div className="invoice-header">
                    <div className="invoice-type-badge" style={{ backgroundColor: getTypeColor(invoice.typeDocument) }}>
                      {getTypeLabel(invoice.typeDocument)}
                    </div>
                    <span className="invoice-numero">{invoice.numero}</span>
                  </div>

                  <div className="invoice-body">
                    <div className="invoice-client">
                      <User size={16} />
                      <span>{invoice.clientNom || 'Client non spécifié'}</span>
                    </div>

                    <div className="invoice-date">
                      <Calendar size={16} />
                      <span>{formatDate(invoice.date)}</span>
                    </div>

                    {invoice.dateEcheance && (
                      <div className="invoice-due-date">
                        <AlertCircle size={16} />
                        <span>Échéance: {formatDate(invoice.dateEcheance)}</span>
                      </div>
                    )}

                    <div className="invoice-total">
                      <DollarSign size={16} />
                      <span className="amount">{formatCurrency(invoice.total)}</span>
                    </div>

                    {invoice.notes && (
                      <div className="invoice-notes">
                        {invoice.notes.substring(0, 80)}
                        {invoice.notes.length > 80 && '...'}
                      </div>
                    )}
                  </div>

                  <div className="invoice-footer">
                    <button
                      className="btn-icon"
                      onClick={() => handlePreview(invoice)}
                      title="Aperçu"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => handleEditInvoice(invoice)}
                      title="Modifier"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aide */}
      <div className="card help-card">
        <div className="card-header">
          <h3 className="card-title">💡 Guide d'utilisation</h3>
        </div>
        <div className="card-body">
          <div className="help-section">
            <h4>Types de documents</h4>
            <ul>
              <li><strong>Facture</strong> : Document comptable pour une vente réalisée</li>
              <li><strong>Devis</strong> : Proposition commerciale avant la vente</li>
              <li><strong>Ticket</strong> : Reçu simplifié pour les petites transactions</li>
            </ul>
          </div>
          <div className="help-section">
            <h4>Fonctionnalités</h4>
            <ul>
              <li>Création de documents avec numérotation automatique</li>
              <li>Gestion des clients et fournisseurs</li>
              <li>Ajout d'articles avec quantités et prix</li>
              <li>Calcul automatique des taxes (TVA)</li>
              <li>Aperçu et export PDF</li>
              <li>Sauvegarde locale de tous les documents</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <InvoiceModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingInvoice(null);
          }}
          invoice={editingInvoice}
          invoicesCount={invoices.length}
          onSave={handleSaveInvoice}
        />
      )}

      {previewInvoice && (
        <InvoicePreviewModal
          isOpen={!!previewInvoice}
          onClose={() => setPreviewInvoice(null)}
          invoice={previewInvoice}
        />
      )}
    </div>
  );
};

export default Invoices;
