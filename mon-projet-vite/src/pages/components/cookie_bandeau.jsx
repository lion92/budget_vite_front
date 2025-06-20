import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (consent !== 'given') {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'given');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div style={styles.container}>
            <p style={styles.text}>
                Nous utilisons des cookies pour améliorer votre expérience. En continuant à utiliser notre site, vous acceptez notre politique de cookies.
            </p>
            <button onClick={handleAccept} style={styles.button}>
                Accepter
            </button>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        backgroundColor: '#EBDDFB', // lavande claire
        color: '#5D3A9B', // violet doux
        textAlign: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        zIndex: 9999,
    },
    text: {
        margin: 0,
        padding: '0 1rem',
        fontSize: '1rem',
        maxWidth: '800px',
    },
    button: {
        backgroundColor: '#D3B4F0', // mauve clair
        color: '#ffffff',
        border: 'none',
        borderRadius: '6px',
        padding: '0.6rem 1.6rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
    },
};

export default CookieConsent;
