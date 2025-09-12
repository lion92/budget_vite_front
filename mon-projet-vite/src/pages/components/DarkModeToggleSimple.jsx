import React, { useState, useEffect } from 'react';

const DarkModeToggleSimple = () => {
    const [isDark, setIsDark] = useState(false);

    // Fonction pour appliquer le thème
    const applyTheme = (dark) => {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            document.body.classList.add('dark-mode');
        } else {
            document.documentElement.removeAttribute('data-theme');
            document.body.classList.remove('dark-mode');
        }
        localStorage.setItem('theme', dark ? 'dark' : 'light');
    };

    // Initialisation au chargement
    useEffect(() => {
        const saved = localStorage.getItem('theme');
        const shouldBeDark = saved === 'dark';
        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark);
    }, []);

    // Toggle theme
    const handleToggle = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        applyTheme(newDark);
    };

    return (
        <button
            onClick={handleToggle}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(167, 139, 250, 0.3)',
                background: isDark 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(167, 139, 250, 0.1)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '14px',
                fontWeight: '500',
            }}
        >
            <span style={{ fontSize: '16px' }}>
                {isDark ? '☀️' : '🌙'}
            </span>
            <span>
                {isDark ? 'Mode clair' : 'Mode sombre'}
            </span>
        </button>
    );
};

export default DarkModeToggleSimple;