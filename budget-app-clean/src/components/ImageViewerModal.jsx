import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { useState } from 'react';
import './ImageViewerModal.css';

const ImageViewerModal = ({ isOpen, onClose, imageUrl, ticketInfo }) => {
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
  };

  const handleDownload = () => {
    window.open(imageUrl, '_blank');
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="image-viewer-header">
          <div className="image-viewer-info">
            <h3>{ticketInfo?.commercant || 'Ticket'}</h3>
            {ticketInfo?.montant && (
              <span className="viewer-amount">{ticketInfo.montant} €</span>
            )}
          </div>
          <div className="image-viewer-controls">
            <button
              className="btn-icon"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
              title="Dézoomer"
            >
              <ZoomOut size={20} />
            </button>
            <span className="zoom-level">{zoom}%</span>
            <button
              className="btn-icon"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              title="Zoomer"
            >
              <ZoomIn size={20} />
            </button>
            <button
              className="btn-icon"
              onClick={handleDownload}
              title="Télécharger"
            >
              <Download size={20} />
            </button>
            <button className="btn-icon" onClick={onClose} title="Fermer">
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="image-viewer-body">
          <img
            src={imageUrl}
            alt="Ticket"
            style={{ transform: `scale(${zoom / 100})` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageViewerModal;
