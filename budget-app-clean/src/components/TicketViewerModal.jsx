import { X, ZoomIn, ZoomOut, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { getTicketUrl } from '../utils/ticketLinks';
import '../styles/components/TicketViewerModal.css';

const TicketViewerModal = ({ isOpen, onClose, ticketId, description }) => {
  const [zoom, setZoom] = useState(1);

  if (!isOpen || !ticketId) return null;

  const url = getTicketUrl(ticketId);

  return (
    <div className="modal-overlay ticket-viewer-overlay" onClick={onClose}>
      <div className="ticket-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ticket-viewer-header">
          <span className="ticket-viewer-title">Ticket — {description}</span>
          <div className="ticket-viewer-controls">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} title="Dézoomer">
              <ZoomOut size={16} />
            </button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(3, z + 0.25))} title="Zoomer">
              <ZoomIn size={16} />
            </button>
            <a href={url} target="_blank" rel="noopener noreferrer" title="Ouvrir dans un nouvel onglet">
              <ExternalLink size={16} />
            </a>
            <button onClick={onClose} title="Fermer">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="ticket-viewer-body">
          <img
            src={url}
            alt={`Ticket ${description}`}
            style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
          />
          <p className="ticket-viewer-error" style={{ display: 'none' }}>
            Impossible de charger l'image du ticket.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TicketViewerModal;
