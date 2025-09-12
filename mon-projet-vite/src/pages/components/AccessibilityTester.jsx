import React, { useState } from 'react';

const AccessibilityTester = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Fonction pour calculer le contraste entre deux couleurs
    const getContrast = (color1, color2) => {
        // Cette fonction est simplifiée - dans un vrai projet, 
        // on utiliserait une librairie comme chroma.js
        const getLuminance = (color) => {
            // Conversion hex vers RGB
            const hex = color.replace('#', '');
            const r = parseInt(hex.substr(0, 2), 16) / 255;
            const g = parseInt(hex.substr(2, 2), 16) / 255;
            const b = parseInt(hex.substr(4, 2), 16) / 255;
            
            // Calcul de la luminance relative
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            return luminance;
        };

        const l1 = getLuminance(color1);
        const l2 = getLuminance(color2);
        
        const brightest = Math.max(l1, l2);
        const darkest = Math.min(l1, l2);
        
        return (brightest + 0.05) / (darkest + 0.05);
    };

    const colorTests = [
        {
            name: 'Texte principal sur fond blanc',
            textColor: '#111827',
            bgColor: '#ffffff',
            minRequired: 4.5
        },
        {
            name: 'Texte secondaire sur fond',
            textColor: '#4b5563',
            bgColor: '#ffffff',
            minRequired: 4.5
        },
        {
            name: 'Liens sur fond blanc',
            textColor: '#6b46c1',
            bgColor: '#ffffff',
            minRequired: 4.5
        },
        {
            name: 'Bouton primaire',
            textColor: '#ffffff',
            bgColor: '#9f7aea',
            minRequired: 4.5
        },
        {
            name: 'Bouton succès',
            textColor: '#ffffff',
            bgColor: '#059669',
            minRequired: 4.5
        },
        {
            name: 'Bouton erreur',
            textColor: '#ffffff',
            bgColor: '#dc2626',
            minRequired: 4.5
        },
        {
            name: 'Mode sombre - Texte principal',
            textColor: '#f0f6fc',
            bgColor: '#0d1117',
            minRequired: 4.5
        },
        {
            name: 'Mode sombre - Texte secondaire',
            textColor: '#c9d1d9',
            bgColor: '#0d1117',
            minRequired: 4.5
        }
    ];

    const styles = {
        container: {
            position: 'fixed',
            top: '80px',
            right: '10px',
            width: '350px',
            maxHeight: '600px',
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            zIndex: 9998,
            backdropFilter: 'blur(20px)',
            fontFamily: 'monospace',
            fontSize: '12px',
            overflow: 'auto',
            display: isVisible ? 'block' : 'none'
        },
        header: {
            background: 'var(--gradient-primary)',
            color: 'white',
            padding: '16px',
            fontWeight: 'bold',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        },
        content: {
            padding: '16px'
        },
        testItem: {
            marginBottom: '12px',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid var(--border)'
        },
        testHeader: {
            fontWeight: 'bold',
            marginBottom: '8px',
            fontSize: '13px'
        },
        colorSample: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px'
        },
        colorBox: {
            width: '30px',
            height: '20px',
            border: '1px solid #ccc',
            borderRadius: '4px'
        },
        ratio: {
            fontSize: '14px',
            fontWeight: 'bold'
        },
        status: {
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
        },
        pass: {
            background: '#dcfce7',
            color: '#166534'
        },
        fail: {
            background: '#fee2e2',
            color: '#991b1b'
        },
        warning: {
            background: '#fef3c7',
            color: '#92400e'
        },
        toggle: {
            position: 'fixed',
            top: '10px',
            right: '120px',
            background: 'var(--gradient-primary)',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9999,
            boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
        },
        closeBtn: {
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '18px'
        }
    };

    const getContrastStatus = (ratio, minRequired) => {
        if (ratio >= 7) return { level: 'AAA', style: styles.pass };
        if (ratio >= minRequired) return { level: 'AA', style: styles.pass };
        if (ratio >= 3) return { level: 'AA Large', style: styles.warning };
        return { level: 'Échec', style: styles.fail };
    };

    return (
        <>
            <button
                style={styles.toggle}
                onClick={() => setIsVisible(!isVisible)}
            >
                🔍 Contraste
            </button>

            <div style={styles.container}>
                <div style={styles.header}>
                    <span>🎨 Test d'Accessibilité</span>
                    <button
                        style={styles.closeBtn}
                        onClick={() => setIsVisible(false)}
                    >
                        ✕
                    </button>
                </div>

                <div style={styles.content}>
                    <p style={{ marginBottom: '16px', fontSize: '11px', color: '#666' }}>
                        Test des ratios de contraste selon WCAG 2.1
                    </p>

                    {colorTests.map((test, index) => {
                        const ratio = getContrast(test.textColor, test.bgColor);
                        const status = getContrastStatus(ratio, test.minRequired);

                        return (
                            <div key={index} style={styles.testItem}>
                                <div style={styles.testHeader}>
                                    {test.name}
                                </div>

                                <div style={styles.colorSample}>
                                    <div
                                        style={{
                                            ...styles.colorBox,
                                            background: test.bgColor,
                                            color: test.textColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '8px',
                                            width: '60px'
                                        }}
                                    >
                                        Texte
                                    </div>
                                    <div>
                                        <div style={styles.ratio}>
                                            {ratio.toFixed(2)}:1
                                        </div>
                                        <div 
                                            style={{...styles.status, ...status.style}}
                                        >
                                            {status.level}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ fontSize: '10px', color: '#666' }}>
                                    Texte: {test.textColor} | Fond: {test.bgColor}
                                </div>
                            </div>
                        );
                    })}

                    <div style={{ marginTop: '16px', fontSize: '10px', color: '#666' }}>
                        <strong>Standards WCAG:</strong><br />
                        • AA: 4.5:1 (texte normal)<br />
                        • AA Large: 3:1 (gros texte)<br />
                        • AAA: 7:1 (contraste élevé)
                    </div>
                </div>
            </div>
        </>
    );
};

export default AccessibilityTester;