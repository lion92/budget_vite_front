import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Edit, Eye, DollarSign } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { formatCurrency, formatDate } from '../utils/formatters';
import { toast } from 'react-toastify';
import TicketModal from '../components/TicketModal';
import ImageViewerModal from '../components/ImageViewerModal';
import './Tickets.css';

const Tickets = () => {
  const { tickets, uploadTicket, fetchTickets, deleteTicket, isLoading } = useAppStore();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    fetchTickets();
  }, []);

  // Charger les images des tickets via l'API
  useEffect(() => {
    const loadTicketImages = async () => {
      const newImageUrls = {};

      for (const ticket of tickets) {
        if (ticket.id && ticket.imagePath && !imageUrls[ticket.id]) {
          try {
            const response = await fetch(`https://www.krisscode.fr/ticket/image/${ticket.id}`, {
              method: 'GET',
              headers: {
                'Accept': 'image/*',
              },
            });

            if (response.ok) {
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              newImageUrls[ticket.id] = url;
            }
          } catch (error) {
            console.error(`Erreur lors du chargement de l'image du ticket ${ticket.id}:`, error);
          }
        }
      }

      if (Object.keys(newImageUrls).length > 0) {
        setImageUrls(prev => ({ ...prev, ...newImageUrls }));
      }
    };

    if (tickets.length > 0) {
      loadTicketImages();
    }

    // Cleanup: révoquer les URLs d'objet lors du démontage
    return () => {
      Object.values(imageUrls).forEach(url => {
        URL.revokeObjectURL(url);
      });
    };
  }, [tickets]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Format non supporté. Utilisez JPG, PNG ou PDF');
      return;
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Fichier trop volumineux (max 10MB)');
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jwt', localStorage.getItem('jwt'));

    const result = await uploadTicket(formData);

    setUploading(false);

    if (result) {
      toast.success('Ticket uploadé et analysé avec succès !');
      fetchTickets();
    } else {
      toast.error('Erreur lors de l\'upload du ticket');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      const success = await deleteTicket(ticketId);
      if (success) {
        toast.success('Ticket supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression du ticket');
      }
    }
  };

  const handleViewImage = (ticket) => {
    const imageUrl = imageUrls[ticket.id];
    if (imageUrl) {
      setViewingImage({
        url: imageUrl,
        info: {
          commercant: ticket.commercant || ticket.merchant,
          montant: ticket.montant || ticket.amount
        }
      });
    }
  };

  const getTotalTickets = () => {
    return tickets.reduce((sum, ticket) => {
      const amount = parseFloat(ticket.montant || ticket.amount || 0);
      return sum + amount;
    }, 0);
  };

  return (
    <div className="tickets-page">
      <div className="page-header">
        <div>
          <h1>Tickets & Reçus (OCR)</h1>
          <p>Scannez vos tickets de caisse automatiquement</p>
        </div>
      </div>

      {/* Zone d'upload */}
      <div className="card upload-section">
        <div
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="file-input"
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <label htmlFor="file-upload" className="upload-label">
            {uploading ? (
              <>
                <div className="spinner" />
                <p>Analyse en cours...</p>
              </>
            ) : (
              <>
                <Upload size={48} />
                <h3>Glissez-déposez un ticket ici</h3>
                <p>ou cliquez pour sélectionner</p>
                <span className="file-types">JPG, PNG ou PDF (max 10MB)</span>
              </>
            )}
          </label>
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <FileText size={24} />
          </div>
          <div>
            <div className="stat-label">Total tickets</div>
            <div className="stat-value">{tickets.length}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success">
            <DollarSign size={24} />
          </div>
          <div>
            <div className="stat-label">Montant total</div>
            <div className="stat-value">{formatCurrency(getTotalTickets())}</div>
          </div>
        </div>
      </div>

      {/* Liste des tickets */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mes tickets ({tickets.length})</h3>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Chargement des tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} />
              <p>Aucun ticket scanné</p>
              <p className="text-secondary">Uploadez votre premier ticket pour commencer</p>
            </div>
          ) : (
            <div className="tickets-grid">
              {tickets.map((ticket) => {
                // Utiliser l'URL d'image chargée depuis l'API
                const imageUrl = imageUrls[ticket.id];

                return (
                  <div key={ticket.id} className="ticket-card">
                    <div className="ticket-image" onClick={imageUrl ? () => handleViewImage(ticket) : undefined}>
                      {imageUrl ? (
                        <>
                          <img src={imageUrl} alt="Ticket" />
                          <div className="image-overlay">
                            <Eye size={24} />
                            <span>Voir l'image</span>
                          </div>
                        </>
                      ) : (
                        <div className="no-image-placeholder">
                          <FileText size={48} />
                          <span>Pas d'image</span>
                        </div>
                      )}
                    </div>
                  <div className="ticket-info">
                    <div className="ticket-header">
                      <h4>{ticket.commercant || ticket.merchant || 'Commerçant inconnu'}</h4>
                      <span className="ticket-amount">
                        {formatCurrency(ticket.montant || ticket.amount || 0)}
                      </span>
                    </div>

                    <div className="ticket-details-list">
                      <div className="detail-item">
                        <span className="detail-label">📅 Date:</span>
                        <span className="detail-value">
                          {formatDate(ticket.dateTransaction || ticket.date)}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">💰 Montant:</span>
                        <span className="detail-value amount">
                          {formatCurrency(ticket.montant || ticket.amount || 0)}
                        </span>
                      </div>

                      {ticket.categorie && (
                        <div className="detail-item">
                          <span className="detail-label">🏷️ Catégorie:</span>
                          <span className="ticket-category">{ticket.categorie}</span>
                        </div>
                      )}

                      {(ticket.description || ticket.extractedText) && (
                        <div className="detail-item">
                          <span className="detail-label">📝 Description:</span>
                          <span className="detail-value">
                            {ticket.description || ticket.extractedText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ticket-actions">
                    {imageUrl && (
                      <button
                        className="btn-icon"
                        onClick={() => handleViewImage(ticket)}
                        title="Voir l'image en grand"
                      >
                        <Eye size={16} />
                      </button>
                    )}
                    <button
                      className="btn-icon btn-primary"
                      onClick={() => setEditingTicket(ticket)}
                      title="Modifier le prix et la date"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => handleDeleteTicket(ticket.id)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="card help-card">
        <div className="card-header">
          <h3 className="card-title">💡 Comment ça marche ?</h3>
        </div>
        <div className="card-body">
          <ol className="steps-list">
            <li>
              <strong>Prenez une photo</strong> claire de votre ticket de caisse
            </li>
            <li>
              <strong>Uploadez-la</strong> via le formulaire ci-dessus (glisser-déposer ou cliquer)
            </li>
            <li>
              <strong>L'OCR analyse</strong> automatiquement le ticket et extrait :
              <ul>
                <li>Le montant total</li>
                <li>Le nom du commerçant</li>
                <li>La date de transaction</li>
              </ul>
            </li>
            <li>
              <strong>Consultez</strong> vos tickets dans la liste ci-dessous
            </li>
          </ol>
        </div>
      </div>

      {/* Modals */}
      <TicketModal
        isOpen={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        ticket={editingTicket}
      />

      <ImageViewerModal
        isOpen={!!viewingImage}
        onClose={() => setViewingImage(null)}
        imageUrl={viewingImage?.url}
        ticketInfo={viewingImage?.info}
      />
    </div>
  );
};

export default Tickets;
