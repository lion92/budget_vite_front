const BaniereLetchi = () => {
    return (
        <a
            href="https://www.leetchi.com/fr/c/projets-gratuits-pour-tous-pouvoir-payer-les-servers-informatiques-1999109?utm_source=copylink&utm_medium=social_sharing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'inline-block',
                background: 'linear-gradient(to right, #ff6a00, #ee0979)',
                color: 'white',
                fontWeight: 'bold',
                padding: '12px 20px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
            }}
        >
            💖 Soutenez le projet : Aidez à payer les serveurs !
        </a>
    );
};

export default BaniereLetchi;