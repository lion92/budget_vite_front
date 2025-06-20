
import { useTicketStore } from '../../useTicketStore';
import {useEffect, useState} from "react";
import TicketList from "./TicketList";

const ImportTicket = () => {
    const [file, setFile] = useState(null);
    const [bubble, setBubble] = useState(null); // pour l'affichage

    const { loading, result, error, importTicket } = useTicketStore();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async () => {
        if (!file) {
            alert('Veuillez sélectionner un fichier.');
            return;
        }

        await importTicket(file);
    };

    // bulle automatique si result ou error
    useEffect(() => {
        if (result || error) {
            setBubble(result ? {
                type: 'success',
                message: 'OCR effectué avec succès.',
                raw: result.text
            } : {
                type: 'error',
                message: error
            });

            const timer = setTimeout(() => setBubble(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [result, error]);

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>Importer un ticket de caisse</h2>


            <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                style={styles.input}
            />

            {file && <p style={{ marginTop: '0.5rem' }}>🧾 {file.name}</p>}

            <button onClick={handleSubmit} disabled={loading} style={styles.button}>
                {loading ? 'Analyse en cours...' : 'Analyser'}
            </button>

            {bubble && (
                <div
                    style={{
                        ...styles.bubble,
                        backgroundColor: bubble.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: bubble.type === 'success' ? '#155724' : '#721c24',
                        borderColor: bubble.type === 'success' ? '#c3e6cb' : '#f5c6cb',
                    }}
                >
                    <p><strong>{bubble.message}</strong></p>
                    {bubble.raw && (
                        <pre style={{
                            maxHeight: '200px',
                            overflow: 'auto',
                            background: '#fff',
                            padding: '10px',
                            border: '1px solid #ccc',
                            marginTop: '10px'
                        }}>{bubble.raw}</pre>
                    )}
                </div>
            )}
            <TicketList></TicketList>
        </div>
    );
};

const styles = {
    container: {
        padding: '1.5rem',
        maxWidth: '500px',
        margin: '2rem auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        position: 'relative',
    },
    title: {
        fontSize: '1.3rem',
        marginBottom: '1rem',
        fontWeight: 'bold',
    },
    input: {
        marginBottom: '1rem',
        width: '100%',
    },
    button: {
        padding: '0.6rem 1rem',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        width: '100%',
    },
    bubble: {
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        border: '1px solid',
        borderRadius: '6px',
        textAlign: 'left',
        fontWeight: 'normal',
        whiteSpace: 'pre-wrap',
    },
};

export default ImportTicket;
