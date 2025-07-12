import { useTicketStore, useTicketActions, useTicketLoadingStates } from '../../useTicketStore';
import { useEffect, useState } from "react";
import TicketList from "./TicketList";

const ImportTicket = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [bubble, setBubble] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    // Utilisation des hooks séparés pour plus de clarté
    const { result, error, allTickets } = useTicketStore();
    const { uploading } = useTicketLoadingStates();
    const { importTicket, clearError, clearResult, fetchTickets } = useTicketActions();

    // Charger les tickets au montage du composant
    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Calculer le total de tous les tickets
    const calculateTotalAmount = () => {
        return allTickets
            .filter(ticket => !isNaN(Number(ticket.totalExtrait)) && Number(ticket.totalExtrait) > 0)
            .reduce((sum, ticket) => sum + Number(ticket.totalExtrait), 0);
    };
    // Compter les tickets avec total
    const getTicketsWithTotal = () => {
        return allTickets.filter(ticket => ticket.totalExtrait && ticket.totalExtrait > 0);
    };

    // Validation des fichiers
    const validateFile = (selectedFile) => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!allowedTypes.includes(selectedFile.type)) {
            throw new Error('Format non supporté. Utilisez JPG, JPEG, PNG ou PDF.');
        }

        if (selectedFile.size > maxSize) {
            throw new Error('Fichier trop volumineux (max 10MB).');
        }

        return true;
    };

    // Gestion du changement de fichier
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        processFile(selectedFile);
    };

    // Traitement du fichier (commun pour input et drag&drop)
    const processFile = (selectedFile) => {
        if (!selectedFile) return;

        try {
            validateFile(selectedFile);
            setFile(selectedFile);

            // Aperçu pour les images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => setPreview(e.target.result);
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }

            // Effacer les erreurs précédentes
            setBubble(null);
            clearError();
        } catch (err) {
            setBubble({
                type: 'error',
                message: err.message
            });
            setFile(null);
            setPreview(null);
        }
    };

    // Drag & Drop handlers
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    // Soumission du formulaire
    const handleSubmit = async () => {
        if (!file) {
            setBubble({
                type: 'error',
                message: 'Veuillez sélectionner un fichier.'
            });
            return;
        }

        try {
            await importTicket(file);
        } catch (err) {
            console.error('Erreur lors de l\'import:', err);
        }
    };

    // Réinitialiser le formulaire
    const resetForm = () => {
        setFile(null);
        setPreview(null);
        setBubble(null);
        clearResult();
        clearError();
        // Reset input file
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.value = '';
    };

    // Gestion automatique des bulles de notification
    useEffect(() => {
        if (result || error) {
            setBubble(result ? {
                type: 'success',
                message: 'OCR effectué avec succès !',
                details: result.extractedData ? {
                    total: result.extractedData.total,
                    merchant: result.extractedData.merchant,
                    date: result.extractedData.date,
                    confidence: result.extractedData.confidence,
                    allNumbers: result.extractedData.allNumbers,
                    prices: result.extractedData.prices
                } : null,
                raw: result.text
            } : {
                type: 'error',
                message: error
            });

            // Auto-hide après succès et rechargement des tickets
            if (result) {
                const timer = setTimeout(() => {
                    setBubble(null);
                    resetForm();
                    fetchTickets(); // Recharger les tickets pour mettre à jour les totaux
                }, 5000);
                return () => clearTimeout(timer);
            }
        }
    }, [result, error, fetchTickets]);

    // Formater la taille du fichier
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Formater les montants
    const formatCurrency = (amount) => {
        const value = Number(amount);
        if (isNaN(value)) return '0,00€';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(value);
    };

    const totalAmount = calculateTotalAmount();
    const ticketsWithTotal = getTicketsWithTotal();

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>📄 Analyser un ticket de caisse</h2>
                <p style={styles.subtitle}>
                    Uploadez votre ticket pour extraction automatique des données
                </p>
            </div>

            {/* Statistiques des tickets */}
            {allTickets.length > 0 && (
                <div style={styles.statsContainer}>
                    <div style={styles.statsGrid}>
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>🧾</div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{allTickets.length}</div>
                                <div style={styles.statLabel}>Tickets total</div>
                            </div>
                        </div>

                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>✅</div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{ticketsWithTotal.length}</div>
                                <div style={styles.statLabel}>Avec montant</div>
                            </div>
                        </div>

                        <div style={{...styles.statCard, ...styles.totalCard}}>
                            <div style={styles.statIcon}>💰</div>
                            <div style={styles.statContent}>
                                <div style={styles.statValue}>{formatCurrency(totalAmount)}</div>
                                <div style={styles.statLabel}>Total général</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Zone de drag & drop */}
            <div
                style={{
                    ...styles.dropZone,
                    ...(dragActive ? styles.dropZoneActive : {}),
                    ...(file ? styles.dropZoneWithFile : {})
                }}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input').click()}
            >
                {!file ? (
                    <div style={styles.dropContent}>
                        <div style={styles.uploadIcon}>📁</div>
                        <p style={styles.dropText}>
                            Glissez votre ticket ici ou <span style={styles.clickText}>cliquez pour choisir</span>
                        </p>
                        <p style={styles.dropSubtext}>
                            JPG, JPEG, PNG ou PDF (max 10MB)
                        </p>
                    </div>
                ) : (
                    <div style={styles.fileInfo}>
                        <div style={styles.fileDetails}>
                            <div style={styles.fileName}>
                                <span style={styles.fileIcon}>
                                    {file.type.startsWith('image/') ? '🖼️' : '📄'}
                                </span>
                                {file.name}
                            </div>
                            <div style={styles.fileSize}>
                                {formatFileSize(file.size)}
                            </div>
                        </div>

                        {preview && (
                            <div style={styles.previewContainer}>
                                <img
                                    src={preview}
                                    alt="Aperçu"
                                    style={styles.preview}
                                />
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                resetForm();
                            }}
                            style={styles.removeButton}
                            type="button"
                        >
                            ✕ Supprimer
                        </button>
                    </div>
                )}
            </div>

            {/* Input file caché */}
            <input
                id="file-input"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                style={styles.hiddenInput}
            />

            {/* Boutons d'action */}
            <div style={styles.actions}>
                <button
                    onClick={handleSubmit}
                    disabled={uploading || !file}
                    style={{
                        ...styles.button,
                        ...(!file || uploading ? styles.buttonDisabled : {})
                    }}
                >
                    {uploading ? (
                        <span>
                            <span style={styles.spinner}></span>
                            Analyse en cours...
                        </span>
                    ) : (
                        '🔍 Analyser le ticket'
                    )}
                </button>

                {file && !uploading && (
                    <button
                        onClick={resetForm}
                        style={styles.resetButton}
                        type="button"
                    >
                        🔄 Nouveau ticket
                    </button>
                )}
            </div>

            {/* Bulle de notification */}
            {bubble && (
                <div
                    style={{
                        ...styles.bubble,
                        backgroundColor: bubble.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: bubble.type === 'success' ? '#155724' : '#721c24',
                        borderColor: bubble.type === 'success' ? '#c3e6cb' : '#f5c6cb',
                    }}
                >
                    <div style={styles.bubbleHeader}>
                        <span style={styles.bubbleIcon}>
                            {bubble.type === 'success' ? '✅' : '❌'}
                        </span>
                        <strong>{bubble.message}</strong>
                        <button
                            onClick={() => setBubble(null)}
                            style={styles.closeBubble}
                        >
                            ✕
                        </button>
                    </div>

                    {/* Données extraites */}
                    {bubble.details && (
                        <div style={styles.extractedData}>
                            <h4 style={styles.dataTitle}>📊 Données extraites :</h4>
                            <div style={styles.dataGrid}>
                                {bubble.details.total && (
                                    <div style={styles.dataItem}>
                                        <span style={styles.dataLabel}>💰 Total :</span>
                                        <span style={styles.dataValue}>{formatCurrency(bubble.details.total)}</span>
                                    </div>
                                )}
                                {bubble.details.merchant && (
                                    <div style={styles.dataItem}>
                                        <span style={styles.dataLabel}>🏪 Magasin :</span>
                                        <span style={styles.dataValue}>{bubble.details.merchant}</span>
                                    </div>
                                )}
                                {bubble.details.date && (
                                    <div style={styles.dataItem}>
                                        <span style={styles.dataLabel}>📅 Date :</span>
                                        <span style={styles.dataValue}>{bubble.details.date}</span>
                                    </div>
                                )}
                                {bubble.details.confidence && (
                                    <div style={styles.dataItem}>
                                        <span style={styles.dataLabel}>🎯 Confiance :</span>
                                        <span style={styles.dataValue}>{bubble.details.confidence.toFixed(1)}%</span>
                                    </div>
                                )}
                            </div>

                            {/* Afficher tous les chiffres détectés */}
                            {bubble.details.allNumbers && bubble.details.allNumbers.length > 0 && (
                                <div style={styles.numbersSection}>
                                    <h5 style={styles.numbersTitle}>🔢 Chiffres détectés :</h5>
                                    <div style={styles.numbersGrid}>
                                        {bubble.details.allNumbers.slice(0, 10).map((num, index) => (
                                            <span key={index} style={styles.numberChip}>
                                                {num}
                                            </span>
                                        ))}
                                        {bubble.details.allNumbers.length > 10 && (
                                            <span style={styles.moreNumbers}>
                                                +{bubble.details.allNumbers.length - 10} autres...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Afficher les prix détectés */}
                            {bubble.details.prices && bubble.details.prices.length > 0 && (
                                <div style={styles.pricesSection}>
                                    <h5 style={styles.pricesTitle}>💶 Prix détectés :</h5>
                                    <div style={styles.pricesGrid}>
                                        {bubble.details.prices.map((price, index) => (
                                            <span key={index} style={styles.priceChip}>
                                                {formatCurrency(price)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Texte brut (repliable) */}
                    {bubble.raw && (
                        <details style={styles.rawDetails}>
                            <summary style={styles.rawSummary}>📝 Voir le texte brut extrait</summary>
                            <pre style={styles.rawText}>{bubble.raw}</pre>
                        </details>
                    )}
                </div>
            )}

            <TicketList />
        </div>
    );
};

const styles = {
    container: {
        padding: '2rem',
        maxWidth: '700px',
        margin: '2rem auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
    header: {
        textAlign: 'center',
        marginBottom: '2rem',
    },
    title: {
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    subtitle: {
        color: '#7f8c8d',
        margin: '0',
        fontSize: '0.9rem',
    },

    // Styles pour les statistiques
    statsContainer: {
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem',
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        transition: 'transform 0.2s ease',
    },
    totalCard: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        border: 'none',
    },
    statIcon: {
        fontSize: '1.5rem',
        marginRight: '0.75rem',
    },
    statContent: {
        flex: 1,
    },
    statValue: {
        fontSize: '1.2rem',
        fontWeight: '700',
        lineHeight: '1.2',
    },
    statLabel: {
        fontSize: '0.8rem',
        opacity: 0.8,
        marginTop: '0.2rem',
    },

    dropZone: {
        border: '2px dashed #bdc3c7',
        borderRadius: '8px',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backgroundColor: '#f8f9fa',
        marginBottom: '1.5rem',
        minHeight: '200px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropZoneActive: {
        borderColor: '#3498db',
        backgroundColor: '#ebf3fd',
        transform: 'scale(1.02)',
    },
    dropZoneWithFile: {
        borderColor: '#27ae60',
        backgroundColor: '#eafaf1',
    },
    dropContent: {
        pointerEvents: 'none',
    },
    uploadIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
    },
    dropText: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.1rem',
        color: '#2c3e50',
    },
    clickText: {
        color: '#3498db',
        fontWeight: '600',
    },
    dropSubtext: {
        margin: '0',
        fontSize: '0.85rem',
        color: '#7f8c8d',
    },
    fileInfo: {
        width: '100%',
    },
    fileDetails: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    fileName: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '1rem',
        fontWeight: '500',
        color: '#2c3e50',
    },
    fileIcon: {
        marginRight: '0.5rem',
        fontSize: '1.2rem',
    },
    fileSize: {
        fontSize: '0.85rem',
        color: '#7f8c8d',
    },
    previewContainer: {
        marginBottom: '1rem',
    },
    preview: {
        maxWidth: '200px',
        maxHeight: '150px',
        objectFit: 'cover',
        borderRadius: '6px',
        border: '1px solid #ddd',
    },
    removeButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        transition: 'background-color 0.2s',
    },
    hiddenInput: {
        display: 'none',
    },
    actions: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
    },
    button: {
        flex: 1,
        padding: '0.75rem 1.5rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    buttonDisabled: {
        backgroundColor: '#bdc3c7',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    resetButton: {
        padding: '0.75rem 1rem',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s',
    },
    spinner: {
        display: 'inline-block',
        width: '16px',
        height: '16px',
        border: '2px solid transparent',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '0.5rem',
    },
    bubble: {
        marginBottom: '1.5rem',
        padding: '1rem',
        border: '1px solid',
        borderRadius: '8px',
        position: 'relative',
    },
    bubbleHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
    },
    bubbleIcon: {
        fontSize: '1.2rem',
    },
    closeBubble: {
        marginLeft: 'auto',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2rem',
        opacity: 0.7,
    },
    extractedData: {
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: '6px',
        border: '1px solid rgba(0,0,0,0.1)',
    },
    dataTitle: {
        margin: '0 0 0.75rem 0',
        fontSize: '1rem',
        fontWeight: '600',
    },
    dataGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.5rem',
        marginBottom: '1rem',
    },
    dataItem: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.25rem 0',
    },
    dataLabel: {
        fontWeight: '500',
    },
    dataValue: {
        fontWeight: '600',
        color: '#2c3e50',
    },

    // Styles pour les chiffres détectés
    numbersSection: {
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: 'rgba(52, 152, 219, 0.1)',
        borderRadius: '6px',
    },
    numbersTitle: {
        margin: '0 0 0.5rem 0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#2980b9',
    },
    numbersGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3rem',
    },
    numberChip: {
        padding: '0.2rem 0.5rem',
        backgroundColor: '#3498db',
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },
    moreNumbers: {
        padding: '0.2rem 0.5rem',
        backgroundColor: '#95a5a6',
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontStyle: 'italic',
    },

    // Styles pour les prix
    pricesSection: {
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        borderRadius: '6px',
    },
    pricesTitle: {
        margin: '0 0 0.5rem 0',
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#27ae60',
    },
    pricesGrid: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.3rem',
    },
    priceChip: {
        padding: '0.2rem 0.5rem',
        backgroundColor: '#27ae60',
        color: 'white',
        borderRadius: '12px',
        fontSize: '0.8rem',
        fontWeight: '500',
    },

    rawDetails: {
        marginTop: '1rem',
    },
    rawSummary: {
        cursor: 'pointer',
        fontWeight: '500',
        padding: '0.5rem 0',
    },
    rawText: {
        maxHeight: '150px',
        overflow: 'auto',
        background: 'rgba(255,255,255,0.9)',
        padding: '0.75rem',
        border: '1px solid rgba(0,0,0,0.1)',
        borderRadius: '4px',
        marginTop: '0.5rem',
        fontSize: '0.85rem',
        lineHeight: '1.4',
    },
};

// Ajout de l'animation CSS pour le spinner
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;
document.head.appendChild(styleSheet);

export default ImportTicket;