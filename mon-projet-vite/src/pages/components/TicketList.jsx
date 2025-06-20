import React, { useEffect } from 'react';
import { useTicketStore } from '../../useTicketStore';

const TicketList = () => {
    const { allTickets, fetchTickets, result, deleteTicket } = useTicketStore();

    useEffect(() => {
        fetchTickets();
    }, []);

    useEffect(() => {
        if (result) {
            fetchTickets();
        }
    }, [result]);

    const handleDelete = (id) => {
        if (window.confirm('Supprimer ce ticket ?')) {
            deleteTicket(id);
        }
    };

    return (
        <div style={styles.container}>
            <h2>📋 Historique des tickets</h2>
            {allTickets.length === 0 ? (
                <p>Aucun ticket pour le moment.</p>
            ) : (
                <ul style={styles.list}>
                    {allTickets.map((ticket) => (
                        <li key={ticket.id} style={styles.item}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <strong>Date :</strong>{' '}
                                    {new Date(ticket.dateAjout).toLocaleString('fr-FR')}
                                    <br />
                                    <strong>Texte OCR :</strong>
                                    <pre style={styles.text}>{ticket.texte}</pre>
                                </div>
                                <button onClick={() => handleDelete(ticket.id)} style={styles.deleteBtn}>
                                    🗑️
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const styles = {
    container: {
        margin: '2rem auto',
        maxWidth: '700px',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        background: '#fefefe',
    },
    list: {
        listStyle: 'none',
        padding: 0,
    },
    item: {
        marginBottom: '1rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: '6px',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    },
    text: {
        whiteSpace: 'pre-wrap',
        background: '#fff',
        padding: '10px',
        border: '1px solid #ddd',
        marginTop: '0.5rem',
    },
    deleteBtn: {
        background: 'transparent',
        border: 'none',
        fontSize: '1.2rem',
        cursor: 'pointer',
        color: '#c00',
    },
};

export default TicketList;
