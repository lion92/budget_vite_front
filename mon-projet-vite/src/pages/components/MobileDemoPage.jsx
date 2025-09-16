import React, { useState } from 'react';
import MobileOptimizer, {
    MobileContainer,
    MobileCard,
    MobileButton,
    MobileInput,
    MobileSelect,
    MobileModal,
    MobileList,
    MobileGrid,
    MobileToast,
    FloatingActionButton,
    MobileTable,
    useMobile
} from './MobileOptimizer';

const MobileDemoPage = () => {
    const { isMobile, screenSize } = useMobile();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastType, setToastType] = useState('info');

    // Données d'exemple
    const listItems = [
        {
            icon: '💰',
            title: 'Budget mensuel',
            subtitle: '€2,500 disponible',
            action: '→'
        },
        {
            icon: '📊',
            title: 'Dépenses récentes',
            subtitle: '15 transactions',
            action: '→'
        },
        {
            icon: '🎯',
            title: 'Objectifs',
            subtitle: '3 en cours',
            action: '→'
        }
    ];

    const tableData = [
        { date: '2024-01-15', description: 'Courses', montant: '€45.30', categorie: 'Alimentation' },
        { date: '2024-01-14', description: 'Essence', montant: '€60.00', categorie: 'Transport' },
        { date: '2024-01-13', description: 'Restaurant', montant: '€35.50', categorie: 'Sorties' }
    ];

    const tableColumns = [
        { header: 'Date', accessor: 'date' },
        { header: 'Description', accessor: 'description' },
        { header: 'Montant', accessor: 'montant' },
        { header: 'Catégorie', accessor: 'categorie' }
    ];

    const selectOptions = [
        { value: 'alimentation', label: 'Alimentation' },
        { value: 'transport', label: 'Transport' },
        { value: 'logement', label: 'Logement' },
        { value: 'loisirs', label: 'Loisirs' }
    ];

    const showToastMessage = (type) => {
        setToastType(type);
        setShowToast(true);
    };

    return (
        <MobileOptimizer>
            <MobileContainer>
                {/* En-tête avec informations */}
                <MobileCard
                    title="Interface Mobile Optimisée"
                    icon="📱"
                    className="mb-4"
                >
                    <p>
                        Écran détecté: <strong>{screenSize}</strong>
                        <br />
                        Mode: <strong>{isMobile ? 'Mobile' : 'Desktop'}</strong>
                    </p>
                </MobileCard>

                {/* Grille de cartes */}
                <MobileGrid columns={2} className="mb-6">
                    <MobileCard
                        title="Revenus"
                        icon="💵"
                        onClick={() => showToastMessage('success')}
                    >
                        <div className="mobile-text-center">
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
                                €3,200
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Ce mois
                            </div>
                        </div>
                    </MobileCard>

                    <MobileCard
                        title="Dépenses"
                        icon="💸"
                        onClick={() => showToastMessage('warning')}
                    >
                        <div className="mobile-text-center">
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>
                                €1,850
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Ce mois
                            </div>
                        </div>
                    </MobileCard>
                </MobileGrid>

                {/* Liste d'éléments */}
                <MobileCard title="Navigation rapide" className="mb-6">
                    <MobileList
                        items={listItems}
                        onItemClick={(item) => showToastMessage('info')}
                    />
                </MobileCard>

                {/* Formulaire d'exemple */}
                <MobileCard title="Ajouter une transaction" className="mb-6">
                    <div className="space-y-4">
                        <MobileInput
                            label="Description"
                            placeholder="Ex: Courses au supermarché"
                        />

                        <MobileInput
                            label="Montant"
                            type="number"
                            placeholder="0.00"
                        />

                        <MobileSelect
                            label="Catégorie"
                            options={selectOptions}
                        />

                        <MobileButton
                            variant="primary"
                            fullWidth
                            onClick={() => setIsModalOpen(true)}
                        >
                            💾 Enregistrer la transaction
                        </MobileButton>
                    </div>
                </MobileCard>

                {/* Tableau responsive */}
                <MobileCard title="Transactions récentes" className="mb-6">
                    <MobileTable
                        data={tableData}
                        columns={tableColumns}
                        onRowClick={(row) => showToastMessage('info')}
                    />
                </MobileCard>

                {/* Boutons d'action */}
                <MobileGrid columns={2} className="mb-6">
                    <MobileButton
                        variant="primary"
                        onClick={() => showToastMessage('success')}
                    >
                        ✅ Succès
                    </MobileButton>

                    <MobileButton
                        variant="secondary"
                        onClick={() => showToastMessage('error')}
                    >
                        ❌ Erreur
                    </MobileButton>
                </MobileGrid>

                <MobileButton
                    variant="primary"
                    fullWidth
                    size="large"
                    onClick={() => setIsModalOpen(true)}
                >
                    🚀 Ouvrir la modale
                </MobileButton>

                {/* Bouton flottant (visible seulement sur mobile) */}
                <FloatingActionButton
                    icon="+"
                    onClick={() => showToastMessage('info')}
                />

                {/* Modale */}
                <MobileModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="Confirmation"
                >
                    <div className="mobile-text-center">
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            ✅
                        </div>
                        <p style={{ marginBottom: '24px' }}>
                            Votre transaction a été enregistrée avec succès !
                        </p>
                        <MobileButton
                            variant="primary"
                            fullWidth
                            onClick={() => setIsModalOpen(false)}
                        >
                            Fermer
                        </MobileButton>
                    </div>
                </MobileModal>

                {/* Toast */}
                <MobileToast
                    message={`Message ${toastType} affiché !`}
                    type={toastType}
                    isVisible={showToast}
                    onClose={() => setShowToast(false)}
                />

                {/* Informations de debug */}
                <MobileCard title="Informations techniques" className="mt-8">
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        <p>• Responsive design automatique</p>
                        <p>• Optimisations tactiles iOS/Android</p>
                        <p>• Support safe areas (iPhone X+)</p>
                        <p>• Mode sombre automatique</p>
                        <p>• Animations optimisées mobile</p>
                        <p>• Tables adaptatives (cartes sur mobile)</p>
                        <p>• Navigation persistante en bas</p>
                    </div>
                </MobileCard>
            </MobileContainer>
        </MobileOptimizer>
    );
};

export default MobileDemoPage;