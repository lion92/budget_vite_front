import React from 'react';
import { Categorie } from "./Categorie.jsx";

const ModalCategorie = ({ onClose }) => {
    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <h2>Nouvelle Catégorie</h2>
                    <button style={styles.closeButton} onClick={onClose}>Fermer</button>
                </div>
                <div style={styles.content}>
                    <Categorie />
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        zIndex: 1000,
    },
    modal: {
        background: 'white',
        borderRadius: '8px',
        maxWidth: '90vw',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '1rem',
        boxSizing: 'border-box',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
    },
    closeButton: {
        padding: '0.4rem 0.8rem',
        fontSize: '0.9rem',
        cursor: 'pointer',
        borderRadius: '5px',
        backgroundColor: '#f44336',
        color: 'white',
        border: 'none',
    },
    content: {
        overflowY: 'auto',
    },
};

export default ModalCategorie;
