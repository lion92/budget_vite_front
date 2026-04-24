import { useState, useRef } from 'react';
import { X, Upload, Camera, CheckCircle, AlertCircle, Loader, ShoppingCart, Edit3 } from 'lucide-react';
import { toast } from 'react-toastify';
import useAppStore from '../store/useAppStore';
import CategoryModal from './CategoryModal';
import { setTicketLink } from '../utils/ticketLinks';
import '../styles/components/TicketScannerModal.css';

const STEPS = { UPLOAD: 'upload', LOADING: 'loading', RESULT: 'result', ERROR: 'error' };

const parseDateFromTicket = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  // DD/MM/YYYY → YYYY-MM-DD
  const parts = dateStr.split('/');
  if (parts.length === 3) return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
  return new Date().toISOString().split('T')[0];
};

const TicketScannerModal = ({ isOpen, onClose }) => {
  const { categories, addExpense, linkTicketToExpense } = useAppStore();
  const jwt = localStorage.getItem('jwt');

  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [form, setForm] = useState({
    description: '',
    montant: '',
    categorie: '',
    dateTransaction: new Date().toISOString().split('T')[0],
  });

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep(STEPS.UPLOAD);
    setFile(null);
    setPreview(null);
    setOcrData(null);
    setErrorMsg('');
    setForm({ description: '', montant: '', categorie: '', dateTransaction: new Date().toISOString().split('T')[0] });
    onClose();
  };

  const selectFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep(STEPS.UPLOAD);
  };

  const handleFileInput = (e) => selectFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    selectFile(e.dataTransfer.files[0]);
  };

  const analyser = async () => {
    if (!file) return;
    setStep(STEPS.LOADING);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jwt', jwt);

    try {
      const res = await fetch('https://www.krisscode.fr/ticket/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'analyse');
      }

      setOcrData(data);
      setForm({
        description: data.extractedData?.merchant || data.metadata?.fileName?.replace(/\.[^.]+$/, '') || '',
        montant: data.extractedData?.total?.toString() || '',
        categorie: '',
        dateTransaction: parseDateFromTicket(data.extractedData?.date),
      });
      setStep(STEPS.RESULT);
    } catch (err) {
      setErrorMsg(err.message);
      setStep(STEPS.ERROR);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.montant || !form.categorie) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (parseFloat(form.montant) <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    setIsSubmitting(true);
    const result = await addExpense({
      description: form.description,
      montant: form.montant,
      categorie: form.categorie,
      dateTransaction: form.dateTransaction,
    });
    setIsSubmitting(false);

    if (result) {
      const expenseId = result?.id;
      const fileName  = ocrData?.metadata?.fileName;

      if (expenseId) {
        // Sauvegarde locale (fallback)
        if (fileName) setTicketLink(expenseId, ocrData.ticketId, fileName);

        // Sauvegarde backend : lie le ticket OCR à la dépense
        await linkTicketToExpense({
          ticketId:      ocrData.ticketId,
          expenseId,
          extractedData: ocrData.extractedData,
        });
      }

      toast.success('Dépense ajoutée depuis le ticket');
      handleClose();
    }
  };

  const handleCategoryCreated = (catName) => {
    const newCat = useAppStore.getState().categories.find((c) => c.categorie === catName);
    if (newCat) setForm((p) => ({ ...p, categorie: newCat.id.toString() }));
  };

  const confidence = ocrData?.extractedData?.confidence;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="modal ticket-scanner-modal" onClick={(e) => e.stopPropagation()}>

          <div className="modal-header">
            <div className="scanner-header-left">
              <Camera size={20} />
              <h2>Scanner un ticket de caisse</h2>
            </div>
            <button className="btn-close" onClick={handleClose} type="button">
              <X size={20} />
            </button>
          </div>

          {/* STEP: UPLOAD */}
          {(step === STEPS.UPLOAD) && (
            <div className="modal-body scanner-body">
              <div
                className={`drop-zone${isDragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                {preview ? (
                  <div className="preview-container">
                    <img src={preview} alt="Aperçu du ticket" className="ticket-preview" />
                    <button
                      className="change-file-btn"
                      type="button"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <div className="drop-zone-placeholder">
                    <Upload size={40} />
                    <p>Glissez votre ticket ici</p>
                    <span>ou cliquez pour parcourir</span>
                    <small>JPG, PNG, PDF — max 10 Mo</small>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                style={{ display: 'none' }}
                onChange={handleFileInput}
              />
              <div className="modal-footer">
                <button className="btn btn-outline" type="button" onClick={handleClose}>Annuler</button>
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={analyser}
                  disabled={!file}
                >
                  <Camera size={16} />
                  Analyser le ticket
                </button>
              </div>
            </div>
          )}

          {/* STEP: LOADING */}
          {step === STEPS.LOADING && (
            <div className="modal-body scanner-body scanner-loading">
              <Loader size={48} className="spin" />
              <p>Analyse OCR en cours...</p>
              <small>Tesseract + IA — quelques secondes</small>
            </div>
          )}

          {/* STEP: ERROR */}
          {step === STEPS.ERROR && (
            <div className="modal-body scanner-body scanner-error">
              <AlertCircle size={48} />
              <p>{errorMsg}</p>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => setStep(STEPS.UPLOAD)}>Réessayer</button>
                <button className="btn btn-outline" onClick={handleClose}>Fermer</button>
              </div>
            </div>
          )}

          {/* STEP: RESULT */}
          {step === STEPS.RESULT && ocrData && (
            <form onSubmit={handleSubmit}>
              <div className="modal-body scanner-body result-body">

                <div className="ocr-meta">
                  <div className={`confidence-badge ${confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low'}`}>
                    <CheckCircle size={14} />
                    Confiance : {confidence}% — {ocrData.extractedData?.source}
                  </div>
                  {ocrData.extractedData?.tva != null && (
                    <span className="tva-info">TVA : {ocrData.extractedData.tva.toFixed(2)} €</span>
                  )}
                </div>

                <div className="result-layout">
                  <div className="result-form">
                    <div className="form-group">
                      <label className="form-label">
                        <Edit3 size={13} /> Description (enseigne)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Montant total (€)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={form.montant}
                        onChange={(e) => setForm((p) => ({ ...p, montant: e.target.value }))}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-input"
                        value={form.dateTransaction}
                        onChange={(e) => setForm((p) => ({ ...p, dateTransaction: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Catégorie</label>
                      <div className="category-row">
                        <select
                          className="form-select"
                          value={form.categorie}
                          onChange={(e) => setForm((p) => ({ ...p, categorie: e.target.value }))}
                          required
                        >
                          <option value="">Sélectionner une catégorie</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.categorie}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="btn-new-cat"
                          onClick={() => setShowCategoryModal(true)}
                          title="Créer une catégorie"
                        >
                          + Cat.
                        </button>
                      </div>
                    </div>
                  </div>

                  {ocrData.extractedData?.articles?.length > 0 && (
                    <div className="articles-panel">
                      <h4>
                        <ShoppingCart size={14} />
                        Articles détectés ({ocrData.extractedData.articles.length})
                      </h4>
                      <ul className="articles-list">
                        {ocrData.extractedData.articles.map((art, i) => (
                          <li key={i}>
                            <span className="art-name">{art.name}</span>
                            <span className="art-detail">
                              {art.quantity > 1 && <span className="art-qty">x{art.quantity}</span>}
                              {art.price?.toFixed(2)} €
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setStep(STEPS.UPLOAD)}>
                  Rescanner
                </button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Enregistrement...' : 'Ajouter comme dépense'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSuccess={handleCategoryCreated}
      />
    </>
  );
};

export default TicketScannerModal;
