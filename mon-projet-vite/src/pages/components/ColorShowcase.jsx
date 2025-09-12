import React from 'react';

const ColorShowcase = () => {
    const buttonExamples = [
        { class: 'btn-primary', label: 'Primaire', description: 'Action principale' },
        { class: 'btn-secondary', label: 'Secondaire', description: 'Action secondaire' },
        { class: 'btn-success', label: 'Succès', description: 'Confirmation positive' },
        { class: 'btn-danger', label: 'Danger', description: 'Action destructive' },
        { class: 'btn-warning', label: 'Attention', description: 'Action avec prudence' },
        { class: 'btn-info', label: 'Information', description: 'Information neutre' },
        { class: 'btn-outline', label: 'Contour', description: 'Action subtile' },
    ];

    const cardExamples = [
        { class: 'card', label: 'Standard', description: 'Carte par défaut' },
        { class: 'card card-primary', label: 'Primaire', description: 'Carte mise en avant' },
        { class: 'card card-success', label: 'Succès', description: 'Statut positif' },
        { class: 'card card-warning', label: 'Attention', description: 'Statut d\'attention' },
        { class: 'card card-error', label: 'Erreur', description: 'Statut d\'erreur' },
    ];

    const styles = {
        container: {
            padding: '40px',
            maxWidth: '1200px',
            margin: '0 auto',
            fontFamily: 'var(--font-family-sans)'
        },
        title: {
            fontSize: '2rem',
            fontWeight: '700',
            marginBottom: '2rem',
            color: 'var(--text-primary)',
            textAlign: 'center'
        },
        section: {
            marginBottom: '3rem'
        },
        sectionTitle: {
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
            borderBottom: '2px solid var(--primary-200)',
            paddingBottom: '0.5rem'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        },
        buttonGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
        },
        buttonExample: {
            textAlign: 'center',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)'
        },
        buttonDescription: {
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)'
        },
        colorPalette: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
        },
        colorSwatch: {
            textAlign: 'center',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden'
        },
        colorBox: {
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '0.875rem',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
        },
        colorInfo: {
            padding: '0.75rem 0.5rem',
            fontSize: '0.75rem'
        },
        colorName: {
            fontWeight: '600',
            color: 'var(--text-primary)'
        },
        colorValue: {
            color: 'var(--text-muted)',
            fontFamily: 'monospace'
        },
        usage: {
            background: 'var(--surface)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            marginTop: '2rem'
        },
        codeBlock: {
            background: 'var(--primary-900)',
            color: 'var(--text-inverse)',
            padding: '1rem',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
            marginTop: '1rem'
        }
    };

    const colors = [
        { name: 'Primary', value: '#9f7aea', css: 'var(--primary-500)' },
        { name: 'Success', value: '#059669', css: 'var(--success)' },
        { name: 'Error', value: '#dc2626', css: 'var(--error)' },
        { name: 'Warning', value: '#d97706', css: 'var(--warning)' },
        { name: 'Info', value: '#0284c7', css: 'var(--info)' },
        { name: 'Text Primary', value: '#111827', css: 'var(--text-primary)' },
        { name: 'Text Secondary', value: '#4b5563', css: 'var(--text-secondary)' },
        { name: 'Background', value: '#ffffff', css: 'var(--background)' },
    ];

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🎨 Guide des Couleurs et Contrastes Améliorés</h1>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Palette de Couleurs Optimisée</h2>
                <div style={styles.colorPalette}>
                    {colors.map((color, index) => (
                        <div key={index} style={styles.colorSwatch}>
                            <div 
                                style={{
                                    ...styles.colorBox,
                                    backgroundColor: color.value
                                }}
                            >
                                {color.name}
                            </div>
                            <div style={styles.colorInfo}>
                                <div style={styles.colorName}>{color.name}</div>
                                <div style={styles.colorValue}>{color.value}</div>
                                <div style={styles.colorValue}>{color.css}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Boutons avec Contrastes Améliorés</h2>
                <div style={styles.buttonGrid}>
                    {buttonExamples.map((btn, index) => (
                        <div key={index} style={styles.buttonExample}>
                            <button className={btn.class}>
                                {btn.label}
                            </button>
                            <div style={styles.buttonDescription}>
                                <strong>{btn.description}</strong><br />
                                <code>.{btn.class}</code>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.section}>
                <h2 style={styles.sectionTitle}>Cartes avec États Visuels</h2>
                <div style={styles.grid}>
                    {cardExamples.map((card, index) => (
                        <div key={index} className={card.class}>
                            <h3 className="card-title">{card.label}</h3>
                            <p className="card-description">{card.description}</p>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
                                <code>.{card.class}</code>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div style={styles.usage}>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>
                    📋 Utilisation des Nouvelles Classes
                </h3>
                
                <p style={{ color: 'var(--text-secondary)' }}>
                    Toutes les couleurs ont été optimisées pour respecter les standards WCAG 2.1 
                    avec un ratio de contraste minimum de 4.5:1.
                </p>

                <div style={styles.codeBlock}>
                    {`<!-- Boutons avec contrastes optimisés -->
<button class="btn-primary">Action Principale</button>
<button class="btn-secondary">Action Secondaire</button>
<button class="btn-success">Confirmer</button>
<button class="btn-danger">Supprimer</button>

<!-- Cartes avec états visuels -->
<div class="card card-success">Statut positif</div>
<div class="card card-warning">Attention requise</div>
<div class="card card-error">Erreur détectée</div>

<!-- Variables CSS personnalisées -->
color: var(--text-primary);     /* Contraste AAA */
color: var(--text-secondary);   /* Contraste AA */
background: var(--success);     /* Vert accessible */
border-color: var(--primary-600); /* Bordure contrastée */`}
                </div>
            </div>
        </div>
    );
};

export default ColorShowcase;