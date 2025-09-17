import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    CiMoneyBill,
    CiChat1,
    CiCalendar,
    CiSettings,
    CiExport,
    CiImport
} from "react-icons/ci";
import {
    BiSolidCategory,
    BiTrendingUp,
    BiCalculator,
    BiFile
} from "react-icons/bi";
import {
    GoTasklist,
    GoGraph
} from "react-icons/go";
import MenuComponent from './MenuComponent.jsx';

const ComptabiliteSpace = () => {
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem('darkMode') === 'true'
    );

    useEffect(() => {
        document.body.classList.toggle('dark-mode', darkMode);
    }, [darkMode]);

    const accountingFeatures = [
        {
            category: "Gestion des Finances",
            icon: <CiMoneyBill />,
            color: "#10b981",
            features: [
                { path: "/budget", label: "Budget Principal", description: "Gestion du budget global" },
                { path: "/allSpend", label: "Dépenses Mensuelles", description: "Analyse détaillée des dépenses" },
                { path: "/allSpendFilters", label: "Dépenses Filtrées", description: "Recherche avancée des transactions" },
                { path: "/enveloppe", label: "Système d'Enveloppes", description: "Allocation budgétaire par poste" }
            ]
        },
        {
            category: "Analyse et Reporting",
            icon: <GoGraph />,
            color: "#3b82f6",
            features: [
                { path: "/graph", label: "Graphiques Budget", description: "Visualisation des données financières" },
                { path: "/prediction", label: "Prédictions", description: "Analyse prédictive des dépenses" },
                { path: "/tickets", label: "Gestion des Tickets", description: "Suivi des justificatifs" }
            ]
        },
        {
            category: "Organisation",
            icon: <BiSolidCategory />,
            color: "#8b5cf6",
            features: [
                { path: "/categorie", label: "Catégories", description: "Classification des dépenses" },
                { path: "/form", label: "Gestion des Tâches", description: "Organisation des activités comptables" },
                { path: "/agenda", label: "Agenda Financier", description: "Planification des échéances" }
            ]
        }
    ];

    const quickActions = [
        { icon: <CiExport />, label: "Exporter les données", action: () => console.log("Export") },
        { icon: <CiImport />, label: "Importer des données", action: () => console.log("Import") },
        { icon: <BiCalculator />, label: "Calculatrice financière", action: () => console.log("Calc") },
        { icon: <BiFile />, label: "Générer un rapport", action: () => console.log("Report") }
    ];

    return (
        <MenuComponent title="📊 Espace Comptable - Tableau de Bord" contenue={
            <div style={{
                padding: '20px',
                background: 'var(--gradient-surface)',
                minHeight: '100vh',
                fontFamily: 'var(--font-family-sans)'
            }}>
                {/* En-tête de l'espace comptable */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                    borderRadius: '20px',
                    padding: '40px',
                    marginBottom: '30px',
                    color: 'white',
                    textAlign: 'center',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)'
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        margin: '0 0 15px 0',
                        background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        📊 Espace Comptable
                    </h1>
                    <p style={{
                        fontSize: '1.2rem',
                        opacity: 0.9,
                        margin: 0,
                        maxWidth: '600px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}>
                        Accès centralisé à tous les outils comptables et financiers
                    </p>
                </div>

                {/* Actions rapides */}
                <div style={{
                    marginBottom: '40px'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '20px',
                        color: 'var(--text-primary)'
                    }}>
                        ⚡ Actions Rapides
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                    }}>
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                onClick={action.action}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.9)',
                                    borderRadius: '15px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                    border: '1px solid rgba(0, 0, 0, 0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.transform = 'translateY(-5px)';
                                    e.target.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                                }}
                            >
                                <div style={{
                                    fontSize: '2rem',
                                    marginBottom: '10px',
                                    color: '#3b82f6'
                                }}>
                                    {action.icon}
                                </div>
                                <div style={{
                                    fontWeight: '600',
                                    color: 'var(--text-primary)'
                                }}>
                                    {action.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Modules comptables */}
                {accountingFeatures.map((category, categoryIndex) => (
                    <div key={categoryIndex} style={{ marginBottom: '40px' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px',
                            gap: '15px'
                        }}>
                            <div style={{
                                fontSize: '1.8rem',
                                color: category.color
                            }}>
                                {category.icon}
                            </div>
                            <h2 style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                margin: 0,
                                color: 'var(--text-primary)'
                            }}>
                                {category.category}
                            </h2>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '20px'
                        }}>
                            {category.features.map((feature, featureIndex) => (
                                <NavLink
                                    key={featureIndex}
                                    to={feature.path}
                                    style={{
                                        textDecoration: 'none',
                                        color: 'inherit'
                                    }}
                                >
                                    <div style={{
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: '15px',
                                        padding: '25px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                        border: `2px solid transparent`,
                                        borderLeftColor: category.color,
                                        borderLeftWidth: '4px'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-3px)';
                                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
                                        e.currentTarget.style.borderColor = category.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
                                        e.currentTarget.style.borderColor = 'transparent';
                                        e.currentTarget.style.borderLeftColor = category.color;
                                    }}
                                    >
                                        <h3 style={{
                                            fontSize: '1.2rem',
                                            fontWeight: '700',
                                            margin: '0 0 10px 0',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {feature.label}
                                        </h3>
                                        <p style={{
                                            margin: 0,
                                            color: 'var(--text-secondary)',
                                            fontSize: '0.95rem',
                                            lineHeight: '1.5'
                                        }}>
                                            {feature.description}
                                        </p>
                                        <div style={{
                                            marginTop: '15px',
                                            color: category.color,
                                            fontSize: '0.9rem',
                                            fontWeight: '600'
                                        }}>
                                            Accéder →
                                        </div>
                                    </div>
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Section statistiques rapides */}
                <div style={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '20px',
                    padding: '30px',
                    marginTop: '40px',
                    textAlign: 'center'
                }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        marginBottom: '20px',
                        color: 'var(--text-primary)'
                    }}>
                        📈 Aperçu Rapide
                    </h2>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '20px'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Budget Total</div>
                            <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '800' }}>€ 0,00</div>
                        </div>
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📊</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Catégories</div>
                            <div style={{ color: '#3b82f6', fontSize: '1.5rem', fontWeight: '800' }}>0</div>
                        </div>
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '20px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
                        }}>
                            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🎫</div>
                            <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Tickets</div>
                            <div style={{ color: '#8b5cf6', fontSize: '1.5rem', fontWeight: '800' }}>0</div>
                        </div>
                    </div>
                </div>
            </div>
        } />
    );
};

export default ComptabiliteSpace;