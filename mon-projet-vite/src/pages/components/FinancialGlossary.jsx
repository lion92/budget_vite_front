import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from './ui';
import './css/financial-glossary.css';

const FinancialGlossary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedTerm, setSelectedTerm] = useState(null);
    const [filteredTerms, setFilteredTerms] = useState([]);

    const categories = {
        all: { label: 'Tous les termes', icon: '📚', color: '#667eea' },
        budget: { label: 'Budget', icon: '📊', color: '#48bb78' },
        savings: { label: 'Épargne', icon: '💰', color: '#ed8936' },
        investments: { label: 'Investissements', icon: '📈', color: '#9f7aea' },
        credit: { label: 'Crédit', icon: '💳', color: '#f56565' },
        insurance: { label: 'Assurance', icon: '🛡️', color: '#38b2ac' },
        taxes: { label: 'Impôts', icon: '🧾', color: '#a0aec0' }
    };

    const glossaryTerms = [
        // Budget
        {
            term: 'Budget',
            category: 'budget',
            level: 'débutant',
            definition: 'Plan financier qui compare vos revenus et vos dépenses sur une période donnée.',
            explanation: 'Un budget vous aide à contrôler vos finances en planifiant comment dépenser votre argent. Il vous permet de voir où va votre argent et d\'identifier les postes où vous pourriez économiser.',
            example: 'Si vous gagnez 2000€/mois, votre budget pourrait prévoir 800€ pour le logement, 300€ pour la nourriture, 200€ pour les transports, etc.',
            tips: [
                'Commencez par noter toutes vos dépenses pendant un mois',
                'Utilisez la règle 50/30/20 : 50% besoins, 30% envies, 20% épargne',
                'Révisez votre budget chaque mois'
            ]
        },
        {
            term: 'Cashflow',
            category: 'budget',
            level: 'intermédiaire',
            definition: 'Flux de trésorerie : différence entre vos entrées et sorties d\'argent.',
            explanation: 'Un cashflow positif signifie que vous recevez plus d\'argent que vous n\'en dépensez. Un cashflow négatif indique que vous dépensez plus que vous ne gagnez.',
            example: 'Revenus 2500€ - Dépenses 2200€ = Cashflow positif de 300€',
            relatedTerms: ['Budget', 'Revenus', 'Dépenses']
        },

        // Épargne
        {
            term: 'Livret A',
            category: 'savings',
            level: 'débutant',
            definition: 'Compte d\'épargne réglementé français, sans risque et défiscalisé.',
            explanation: 'Le Livret A est le placement préféré des Français. Votre argent est disponible à tout moment, les intérêts sont garantis par l\'État et vous ne payez pas d\'impôts dessus.',
            example: 'Avec 10 000€ sur un Livret A à 3%, vous gagnez 300€ d\'intérêts par an.',
            tips: [
                'Parfait pour votre fonds d\'urgence',
                'Plafond à 22 950€ pour les particuliers',
                'Idéal pour débuter dans l\'épargne'
            ],
            relatedTerms: ['LDDS', 'LEP', 'Fonds d\'urgence']
        },
        {
            term: 'Fonds d\'urgence',
            category: 'savings',
            level: 'débutant',
            definition: 'Réserve d\'argent mise de côté pour faire face aux imprévus.',
            explanation: 'C\'est votre filet de sécurité financière. Il vous permet de faire face aux urgences (perte d\'emploi, réparation voiture, problème de santé) sans vous endetter.',
            example: 'Si vos dépenses mensuelles sont de 2000€, votre fonds d\'urgence devrait être entre 6000€ et 12000€.',
            tips: [
                'Commencez par économiser 1000€',
                'Objectif : 3 à 6 mois de dépenses',
                'Placez-le sur un Livret A pour y accéder rapidement'
            ],
            relatedTerms: ['Livret A', 'Épargne', 'Sécurité financière']
        },
        {
            term: 'Intérêts composés',
            category: 'savings',
            level: 'intermédiaire',
            definition: 'Intérêts calculés sur le capital initial ET sur les intérêts précédemment acquis.',
            explanation: 'C\'est "l\'effet boule de neige" de l\'épargne. Plus vous laissez votre argent placé longtemps, plus les intérêts s\'accumulent et génèrent eux-mêmes des intérêts.',
            example: '1000€ placés à 5% pendant 10 ans : année 1 = 1050€, année 2 = 1102.50€, année 10 = 1628€',
            tips: [
                'Commencez à épargner le plus tôt possible',
                'Ne touchez pas à votre épargne long terme',
                'Même de petits montants peuvent devenir importants'
            ],
            relatedTerms: ['Épargne', 'Rendement', 'Investissement']
        },

        // Investissements
        {
            term: 'Action',
            category: 'investments',
            level: 'intermédiaire',
            definition: 'Part de propriété dans une entreprise cotée en bourse.',
            explanation: 'Quand vous achetez une action, vous devenez actionnaire de l\'entreprise. Si l\'entreprise va bien, la valeur de vos actions peut augmenter. Vous pouvez aussi recevoir des dividendes.',
            example: 'Acheter une action Apple à 150€. Si elle monte à 180€, vous gagnez 30€. Risque : elle peut aussi descendre à 120€.',
            tips: [
                'Ne mettez jamais tous vos œufs dans le même panier',
                'Investissez sur le long terme (5 ans minimum)',
                'Commencez par des ETF pour diversifier'
            ],
            relatedTerms: ['Bourse', 'Dividendes', 'ETF', 'Portefeuille']
        },
        {
            term: 'ETF',
            category: 'investments',
            level: 'intermédiaire',
            definition: 'Fonds négocié en bourse qui réplique un indice boursier.',
            explanation: 'Un ETF vous permet d\'investir dans des centaines d\'entreprises en une seule fois. C\'est plus simple et moins risqué que choisir des actions individuelles.',
            example: 'Un ETF World contient des actions de 1600+ entreprises mondiales. En achetant une part, vous investissez dans toutes.',
            tips: [
                'Parfait pour débuter en bourse',
                'Frais généralement très bas',
                'Diversification automatique'
            ],
            relatedTerms: ['Action', 'Diversification', 'Indice', 'PEA']
        },
        {
            term: 'PEA',
            category: 'investments',
            level: 'intermédiaire',
            definition: 'Plan d\'Épargne en Actions : enveloppe fiscale française pour investir en bourse.',
            explanation: 'Le PEA vous permet d\'investir en actions tout en bénéficiant d\'avantages fiscaux. Après 5 ans, les plus-values ne sont soumises qu\'aux prélèvements sociaux.',
            example: 'Avec 10 000€ investis dans un PEA pendant 5 ans, vos gains ne seront taxés qu\'à 17,2% au lieu de 30%.',
            tips: [
                'Plafond de 150 000€',
                'Idéal pour investir à long terme',
                'Ne sortez pas d\'argent avant 5 ans'
            ],
            relatedTerms: ['Action', 'ETF', 'Assurance vie', 'Fiscalité']
        },

        // Crédit
        {
            term: 'Crédit à la consommation',
            category: 'credit',
            level: 'débutant',
            definition: 'Prêt accordé pour financer l\'achat de biens ou services.',
            explanation: 'Ce type de crédit vous permet d\'acheter immédiatement quelque chose que vous n\'avez pas les moyens de payer cash. Attention aux taux d\'intérêt élevés !',
            example: 'Crédit de 5000€ à 8% sur 2 ans = remboursement de 226€/mois, soit 5424€ au total.',
            tips: [
                'Comparez les taux avant de vous engager',
                'Ne dépassez pas 33% d\'endettement',
                'Évitez les crédits revolving'
            ],
            relatedTerms: ['TAEG', 'Surendettement', 'Mensualité']
        },
        {
            term: 'TAEG',
            category: 'credit',
            level: 'intermédiaire',
            definition: 'Taux Annuel Effectif Global : coût total d\'un crédit exprimé en pourcentage annuel.',
            explanation: 'Le TAEG inclut non seulement le taux d\'intérêt, mais aussi tous les frais (dossier, assurance, garanties). C\'est LE taux à comparer entre différentes offres.',
            example: 'Un crédit peut afficher 5% de taux nominal, mais un TAEG de 7% avec les frais inclus.',
            tips: [
                'Toujours comparer les TAEG, pas les taux nominaux',
                'Plus le TAEG est bas, moins le crédit coûte cher',
                'Le TAEG doit obligatoirement figurer dans les publicités'
            ],
            relatedTerms: ['Crédit', 'Taux d\'intérêt', 'Frais de dossier']
        },
        {
            term: 'Surendettement',
            category: 'credit',
            level: 'débutant',
            definition: 'Situation où une personne ne peut plus faire face à l\'ensemble de ses dettes.',
            explanation: 'Le surendettement survient quand vos mensualités de crédit dépassent vos capacités de remboursement. C\'est une spirale dangereuse à éviter absolument.',
            example: 'Revenus 2000€, mensualités de crédits 800€ = ratio de 40%, c\'est du surendettement.',
            tips: [
                'Ne jamais dépasser 33% d\'endettement',
                'Éviter de multiplier les crédits',
                'En cas de difficultés, contactez votre banque rapidement'
            ],
            relatedTerms: ['Crédit', 'Endettement', 'Commission de surendettement']
        },

        // Assurance
        {
            term: 'Assurance vie',
            category: 'insurance',
            level: 'intermédiaire',
            definition: 'Produit d\'épargne à long terme avec avantages fiscaux.',
            explanation: 'Contrairement à ce que son nom indique, l\'assurance vie est surtout un outil d\'épargne et de transmission. Elle offre une fiscalité avantageuse après 8 ans.',
            example: 'Après 8 ans, vous pouvez retirer jusqu\'à 4600€/an (9200€ pour un couple) sans payer d\'impôts.',
            tips: [
                'Diversifiez entre fonds euros (sécurisé) et unités de compte',
                'Attendez 8 ans pour optimiser la fiscalité',
                'Parfait pour préparer sa retraite'
            ],
            relatedTerms: ['Fonds euros', 'Unités de compte', 'Succession']
        },

        // Impôts
        {
            term: 'Prélèvement à la source',
            category: 'taxes',
            level: 'débutant',
            definition: 'Système de collecte de l\'impôt directement sur le salaire.',
            explanation: 'Depuis 2019, vos impôts sont prélevés chaque mois sur votre salaire par votre employeur, qui les reverse au fisc.',
            example: 'Salaire brut 3000€ - cotisations 600€ - impôts 200€ = salaire net de 2200€ sur votre compte.',
            tips: [
                'Vérifiez votre taux de prélèvement sur impots.gouv.fr',
                'Vous pouvez moduler ce taux en cours d\'année',
                'La déclaration annuelle reste obligatoire'
            ],
            relatedTerms: ['Déclaration de revenus', 'Taux marginal', 'Crédit d\'impôt']
        }
    ];

    useEffect(() => {
        let filtered = glossaryTerms;

        // Filtrer par catégorie
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(term => term.category === selectedCategory);
        }

        // Filtrer par terme de recherche
        if (searchTerm) {
            filtered = filtered.filter(term =>
                term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.definition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                term.explanation.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredTerms(filtered);
    }, [searchTerm, selectedCategory]);

    const getLevelColor = (level) => {
        switch (level) {
            case 'débutant': return '#48bb78';
            case 'intermédiaire': return '#ed8936';
            case 'avancé': return '#e53e3e';
            default: return '#667eea';
        }
    };

    const handleTermClick = (term) => {
        setSelectedTerm(term);
    };

    const closeModal = () => {
        setSelectedTerm(null);
    };

    return (
        <div className="financial-glossary">
            <div className="glossary-header">
                <h1>📚 Glossaire Financier</h1>
                <p>Comprenez le vocabulaire de la finance personnelle</p>
            </div>

            <div className="glossary-controls">
                <div className="search-section">
                    <Input
                        type="text"
                        placeholder="🔍 Rechercher un terme..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>

                <div className="categories-section">
                    <h3>Catégories</h3>
                    <div className="categories-grid">
                        {Object.entries(categories).map(([key, category]) => (
                            <button
                                key={key}
                                className={`category-button ${selectedCategory === key ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(key)}
                                style={{
                                    '--category-color': category.color
                                }}
                            >
                                <span className="category-icon">{category.icon}</span>
                                <span className="category-label">{category.label}</span>
                                <span className="category-count">
                                    ({key === 'all' ? glossaryTerms.length : glossaryTerms.filter(t => t.category === key).length})
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glossary-content">
                <div className="terms-header">
                    <h2>
                        {selectedCategory === 'all' ? 'Tous les termes' : categories[selectedCategory]?.label}
                        <span className="terms-count">({filteredTerms.length} terme{filteredTerms.length > 1 ? 's' : ''})</span>
                    </h2>
                </div>

                <div className="terms-grid">
                    {filteredTerms.map((term, index) => (
                        <TermCard
                            key={index}
                            term={term}
                            onClick={() => handleTermClick(term)}
                            levelColor={getLevelColor(term.level)}
                        />
                    ))}
                </div>

                {filteredTerms.length === 0 && (
                    <div className="no-results">
                        <div className="no-results-icon">😔</div>
                        <h3>Aucun terme trouvé</h3>
                        <p>
                            {searchTerm
                                ? `Aucun résultat pour "${searchTerm}"`
                                : 'Aucun terme dans cette catégorie'
                            }
                        </p>
                        {searchTerm && (
                            <Button
                                variant="secondary"
                                onClick={() => setSearchTerm('')}
                            >
                                Effacer la recherche
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {selectedTerm && (
                <TermModal term={selectedTerm} onClose={closeModal} levelColor={getLevelColor(selectedTerm.level)} />
            )}
        </div>
    );
};

const TermCard = ({ term, onClick, levelColor }) => (
    <Card className="term-card" onClick={onClick}>
        <div className="term-header">
            <h3>{term.term}</h3>
            <span
                className="level-badge"
                style={{ backgroundColor: levelColor }}
            >
                {term.level}
            </span>
        </div>
        <p className="term-definition">{term.definition}</p>
        <div className="term-footer">
            <span className="term-category">
                📁 {term.category.charAt(0).toUpperCase() + term.category.slice(1)}
            </span>
            <span className="read-more">En savoir plus →</span>
        </div>
    </Card>
);

const TermModal = ({ term, onClose, levelColor }) => (
    <div className="term-modal-overlay" onClick={onClose}>
        <div className="term-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
                <div className="modal-title">
                    <h2>{term.term}</h2>
                    <span
                        className="level-badge"
                        style={{ backgroundColor: levelColor }}
                    >
                        {term.level}
                    </span>
                </div>
                <button className="close-button" onClick={onClose}>✕</button>
            </div>

            <div className="modal-content">
                <div className="definition-section">
                    <h3>📝 Définition</h3>
                    <p>{term.definition}</p>
                </div>

                <div className="explanation-section">
                    <h3>💡 Explication détaillée</h3>
                    <p>{term.explanation}</p>
                </div>

                {term.example && (
                    <div className="example-section">
                        <h3>📋 Exemple concret</h3>
                        <div className="example-box">
                            <p>{term.example}</p>
                        </div>
                    </div>
                )}

                {term.tips && term.tips.length > 0 && (
                    <div className="tips-section">
                        <h3>💡 Conseils pratiques</h3>
                        <ul className="tips-list">
                            {term.tips.map((tip, index) => (
                                <li key={index}>{tip}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {term.relatedTerms && term.relatedTerms.length > 0 && (
                    <div className="related-section">
                        <h3>🔗 Termes associés</h3>
                        <div className="related-terms">
                            {term.relatedTerms.map((relatedTerm, index) => (
                                <span key={index} className="related-term">
                                    {relatedTerm}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <Button variant="primary" onClick={onClose}>
                    J'ai compris !
                </Button>
            </div>
        </div>
    </div>
);

export default FinancialGlossary;