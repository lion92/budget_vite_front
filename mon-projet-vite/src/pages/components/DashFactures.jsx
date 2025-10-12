import React, { useState, useEffect } from 'react';
import MenuComponent from './MenuComponent.jsx';
import useBudgetStore from '../../useBudgetStore';
import { FileText, Plus, Download, Edit2, Trash2, Calendar, DollarSign, User, Building, MapPin, Receipt, CreditCard, ShoppingCart, Percent, X, Save, Search, Filter, RotateCcw, Eye, Check, AlertCircle } from 'lucide-react';
import './css/factures.css';

export default function DashFactures() {
    const [factures, setFactures] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingFacture, setEditingFacture] = useState(null);
    const [showExpensesModal, setShowExpensesModal] = useState(false);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Store pour récupérer les dépenses
    const { depenses, fetchDepenses, categories, fetchCategories } = useBudgetStore();

    const [formData, setFormData] = useState({
        numero: '',
        date: new Date().toISOString().split('T')[0],
        dateEcheance: '',
        clientNom: '',
        clientEmail: '',
        clientAdresse: '',
        expediteurNom: 'Votre Entreprise',
        expediteurAdresse: 'Votre adresse\nVille, Code Postal\nPays',
        expediteurEmail: 'contact@votreentreprise.com',
        expediteurTelephone: '+33 1 23 45 67 89',
        items: [{ description: '', quantite: 1, prixUnitaire: 0, total: 0 }],
        sousTotal: 0,
        tauxTaxes: [
            { nom: 'TVA', taux: 20, montant: 0 },
        ],
        total: 0,
        notes: '',
        typeDocument: 'facture',
        conditions: 'Paiement à 30 jours'
    });

    useEffect(() => {
        loadFactures();
        loadSavedAddresses();
        fetchDepenses();
        fetchCategories();
    }, [fetchDepenses, fetchCategories]);

    const loadFactures = () => {
        const savedFactures = localStorage.getItem('factures');
        if (savedFactures) {
            setFactures(JSON.parse(savedFactures));
        }
    };

    const saveFactures = (newFactures) => {
        localStorage.setItem('factures', JSON.stringify(newFactures));
        setFactures(newFactures);
    };

    const loadSavedAddresses = () => {
        const saved = localStorage.getItem('savedAddresses');
        if (saved) {
            setSavedAddresses(JSON.parse(saved));
        }
    };

    const saveAddress = (address) => {
        const newAddresses = [...savedAddresses, { ...address, id: Date.now() }];
        setSavedAddresses(newAddresses);
        localStorage.setItem('savedAddresses', JSON.stringify(newAddresses));
    };

    const generateNumeroFacture = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = factures.length + 1;
        const prefix = formData.typeDocument === 'facture' ? 'FAC' :
                      formData.typeDocument === 'devis' ? 'DEV' : 'TIC';
        return `${prefix}-${year}${month}-${String(count).padStart(3, '0')}`;
    };

    const calculateTotals = (items, tauxTaxes) => {
        const sousTotal = items.reduce((sum, item) => sum + item.total, 0);

        const updatedTaxes = tauxTaxes.map(taxe => ({
            ...taxe,
            montant: (sousTotal * taxe.taux) / 100
        }));

        const totalTaxes = updatedTaxes.reduce((sum, taxe) => sum + taxe.montant, 0);
        const total = sousTotal + totalTaxes;

        return { sousTotal, total, tauxTaxes: updatedTaxes };
    };

    const handleItemChange = (index, field, value) => {
        if (!formData.items[index]) return;

        const newItems = [...formData.items];
        newItems[index][field] = value;

        if (field === 'quantite' || field === 'prixUnitaire') {
            const quantite = parseFloat(newItems[index].quantite) || 0;
            const prixUnitaire = parseFloat(newItems[index].prixUnitaire) || 0;
            newItems[index].total = quantite * prixUnitaire;
        }

        const { sousTotal, total, tauxTaxes } = calculateTotals(newItems, formData.tauxTaxes);

        setFormData({
            ...formData,
            items: newItems,
            sousTotal,
            total,
            tauxTaxes
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { description: '', quantite: 1, prixUnitaire: 0, total: 0 }]
        });
    };

    const removeItem = (index) => {
        const newItems = formData.items.filter((_, i) => i !== index);
        const { sousTotal, total, tauxTaxes } = calculateTotals(newItems, formData.tauxTaxes);

        setFormData({
            ...formData,
            items: newItems,
            sousTotal,
            total,
            tauxTaxes
        });
    };

    const addExpenseToInvoice = (expense) => {
        if (!expense || !expense.montant) return;

        const categoryName = categories?.find(c => c.id == expense.categorie)?.categorie || 'Non catégorisé';
        const montant = parseFloat(expense.montant) || 0;
        const newItem = {
            description: `${expense.description || 'Dépense'} (${categoryName})`,
            quantite: 1,
            prixUnitaire: montant,
            total: montant
        };

        const newItems = [...formData.items];
        if (newItems.length === 1 && !newItems[0].description) {
            newItems[0] = newItem;
        } else {
            newItems.push(newItem);
        }

        const { sousTotal, total, tauxTaxes } = calculateTotals(newItems, formData.tauxTaxes);

        setFormData({
            ...formData,
            items: newItems,
            sousTotal,
            total,
            tauxTaxes
        });

        setShowExpensesModal(false);
    };

    // Filtrer les dépenses selon la catégorie et le terme de recherche
    const filteredExpenses = depenses?.filter(expense => {
        if (!expense) return false;
        const categoryMatch = !selectedCategory || expense.categorie == selectedCategory;
        const searchMatch = !searchTerm ||
            (expense.description && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return categoryMatch && searchMatch;
    }) || [];

    const resetExpenseFilters = () => {
        setSelectedCategory('');
        setSearchTerm('');
    };

    const handleTaxChange = (index, field, value) => {
        if (!formData.tauxTaxes[index]) return;

        const newTaxes = [...formData.tauxTaxes];
        newTaxes[index][field] = field === 'taux' ? parseFloat(value) || 0 : value;

        const { sousTotal, total, tauxTaxes } = calculateTotals(formData.items, newTaxes);

        setFormData({
            ...formData,
            tauxTaxes,
            sousTotal,
            total
        });
    };

    const addTax = () => {
        setFormData({
            ...formData,
            tauxTaxes: [...formData.tauxTaxes, { nom: 'Nouvelle taxe', taux: 0, montant: 0 }]
        });
    };

    const removeTax = (index) => {
        if (formData.tauxTaxes.length <= 1) return; // Garder au moins une taxe

        const newTaxes = formData.tauxTaxes.filter((_, i) => i !== index);
        const { sousTotal, total, tauxTaxes } = calculateTotals(formData.items, newTaxes);

        setFormData({
            ...formData,
            tauxTaxes,
            sousTotal,
            total
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const factureData = {
            ...formData,
            id: editingFacture ? editingFacture.id : Date.now(),
            numero: formData.numero || generateNumeroFacture(),
            dateCreation: editingFacture ? editingFacture.dateCreation : new Date().toISOString()
        };

        // Sauvegarder aussi comme ticket de caisse si demandé
        if (formData.typeDocument === 'ticket') {
            const ticketData = {
                id: factureData.id,
                commercant: formData.expediteurNom,
                dateAjout: factureData.dateCreation,
                totalExtrait: factureData.total,
                articles: formData.items.map(item => ({
                    nom: item.description,
                    prix: item.prixUnitaire,
                    quantite: item.quantite
                })),
                source: 'facture',
                numeroFacture: factureData.numero
            };

            const savedTickets = JSON.parse(localStorage.getItem('tickets') || '[]');
            const newTickets = editingFacture
                ? savedTickets.map(t => t.numeroFacture === factureData.numero ? ticketData : t)
                : [...savedTickets, ticketData];
            localStorage.setItem('tickets', JSON.stringify(newTickets));
        }

        let newFactures;
        if (editingFacture) {
            newFactures = factures.map(f => f.id === editingFacture.id ? factureData : f);
        } else {
            newFactures = [...factures, factureData];
        }

        saveFactures(newFactures);
        resetForm();
        setShowForm(false);
    };

    const resetForm = () => {
        setFormData({
            numero: '',
            date: new Date().toISOString().split('T')[0],
            dateEcheance: '',
            clientNom: '',
            clientEmail: '',
            clientAdresse: '',
            expediteurNom: 'Votre Entreprise',
            expediteurAdresse: 'Votre adresse\nVille, Code Postal\nPays',
            expediteurEmail: 'contact@votreentreprise.com',
            expediteurTelephone: '+33 1 23 45 67 89',
            items: [{ description: '', quantite: 1, prixUnitaire: 0, total: 0 }],
            sousTotal: 0,
            tauxTaxes: [
                { nom: 'TVA', taux: 20, montant: 0 },
            ],
            total: 0,
            notes: '',
            typeDocument: 'facture',
            conditions: 'Paiement à 30 jours'
        });
        setEditingFacture(null);
    };

    const editFacture = (facture) => {
        setFormData(facture);
        setEditingFacture(facture);
        setShowForm(true);
    };

    const deleteFacture = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            const newFactures = factures.filter(f => f.id !== id);
            saveFactures(newFactures);
        }
    };

    const exportToPDF = (facture) => {
        if (!facture) return;

        const typeDoc = facture.typeDocument === 'facture' ? 'FACTURE' :
                       facture.typeDocument === 'devis' ? 'DEVIS' : 'TICKET DE CAISSE';

        // Protection contre les valeurs undefined
        const safeFacture = {
            ...facture,
            expediteurNom: facture.expediteurNom || 'Entreprise',
            expediteurAdresse: facture.expediteurAdresse || 'Adresse non renseignée',
            expediteurEmail: facture.expediteurEmail || '',
            expediteurTelephone: facture.expediteurTelephone || '',
            clientNom: facture.clientNom || 'Client',
            clientEmail: facture.clientEmail || '',
            clientAdresse: facture.clientAdresse || 'Adresse non renseignée',
            items: facture.items || [],
            tauxTaxes: facture.tauxTaxes || [],
            sousTotal: facture.sousTotal || 0,
            total: facture.total || 0,
            notes: facture.notes || '',
            conditions: facture.conditions || ''
        };

        const content = `
            <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h1 style="text-align: center; color: #333;">${typeDoc}</h1>
                <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                    <div>
                        <h3>Émetteur</h3>
                        <p>${safeFacture.expediteurNom}<br>${safeFacture.expediteurAdresse.replace(/\n/g, '<br>')}<br>${safeFacture.expediteurEmail}<br>${safeFacture.expediteurTelephone}</p>
                    </div>
                    <div>
                        <h3>${typeDoc} N°</h3>
                        <p>${safeFacture.numero}</p>
                        <p>Date: ${new Date(safeFacture.date).toLocaleDateString()}</p>
                        ${safeFacture.dateEcheance ? `<p>Échéance: ${new Date(safeFacture.dateEcheance).toLocaleDateString()}</p>` : ''}
                    </div>
                </div>
                <div style="margin: 20px 0;">
                    <h3>Client</h3>
                    <p>${safeFacture.clientNom}<br>${safeFacture.clientEmail}<br>${safeFacture.clientAdresse.replace(/\n/g, '<br>')}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background: #f5f5f5;">
                            <th style="border: 1px solid #ddd; padding: 10px; text-align: left;">Description</th>
                            <th style="border: 1px solid #ddd; padding: 10px; text-align: center;">Quantité</th>
                            <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Prix unitaire</th>
                            <th style="border: 1px solid #ddd; padding: 10px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${safeFacture.items.map(item => `
                            <tr>
                                <td style="border: 1px solid #ddd; padding: 10px;">${item.description || ''}</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${item.quantite || 0}</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${(item.prixUnitaire || 0).toFixed(2)} €</td>
                                <td style="border: 1px solid #ddd; padding: 10px; text-align: right;">${(item.total || 0).toFixed(2)} €</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div style="text-align: right; margin: 20px 0;">
                    <p>Sous-total: ${safeFacture.sousTotal.toFixed(2)} €</p>
                    ${safeFacture.tauxTaxes.map(taxe => `<p>${taxe.nom || 'Taxe'} (${taxe.taux || 0}%): ${(taxe.montant || 0).toFixed(2)} €</p>`).join('')}
                    <h3>Total: ${safeFacture.total.toFixed(2)} €</h3>
                </div>
                ${safeFacture.notes ? `<div style="margin: 20px 0;"><h4>Notes:</h4><p>${safeFacture.notes}</p></div>` : ''}
                ${safeFacture.conditions ? `<div style="margin: 20px 0;"><h4>Conditions:</h4><p>${safeFacture.conditions}</p></div>` : ''}
            </div>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>${typeDoc} ${facture.numero}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${content}
                    <script>
                        window.onload = function() {
                            window.print();
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    return (
        <MenuComponent title="Gestion des Factures" contenue={
            <div className="factures-container">
                <div className="factures-header">
                    <div className="header-info">
                        <h2><FileText size={24} /> Mes Factures</h2>
                        <p>Créez et gérez vos factures, devis et tickets facilement</p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            resetForm();
                            setShowForm(true);
                        }}
                    >
                        <Plus size={20} /> Nouveau Document
                    </button>
                </div>

                <div className="factures-stats">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <FileText size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{factures.length}</h3>
                            <p>Documents créés</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{factures.reduce((sum, f) => sum + f.total, 0).toFixed(2)} €</h3>
                            <p>Montant total</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            <Receipt size={24} />
                        </div>
                        <div className="stat-info">
                            <h3>{factures.filter(f => f.typeDocument === 'facture').length}</h3>
                            <p>Factures</p>
                        </div>
                    </div>
                </div>

                <div className="factures-list">
                    {factures.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <h3>Aucun document</h3>
                            <p>Commencez par créer votre premier document</p>
                        </div>
                    ) : (
                        <div className="factures-grid">
                            {factures.map(facture => (
                                <div key={facture.id} className="facture-card">
                                    <div className="facture-header">
                                        <div>
                                            <h4>{facture.numero}</h4>
                                            <span className={`facture-type ${facture.typeDocument}`}>
                                                {facture.typeDocument.toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="facture-total">{facture.total.toFixed(2)} €</span>
                                    </div>
                                    <div className="facture-info">
                                        <p><User size={16} /> {facture.clientNom}</p>
                                        <p><Calendar size={16} /> {new Date(facture.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="facture-actions">
                                        <button
                                            className="btn-icon btn-view"
                                            onClick={() => exportToPDF(facture)}
                                            title="Voir et imprimer"
                                        >
                                            <Eye size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-download"
                                            onClick={() => exportToPDF(facture)}
                                            title="Télécharger PDF"
                                        >
                                            <Download size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-edit"
                                            onClick={() => editFacture(facture)}
                                            title="Modifier"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="btn-icon btn-danger"
                                            onClick={() => deleteFacture(facture.id)}
                                            title="Supprimer"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showForm && (
                    <div className="form-section">
                        <div className="form-header">
                            <div className="form-title">
                                <h3>{editingFacture ? 'Modifier le document' : 'Nouveau document'}</h3>
                                <p>Remplissez les informations ci-dessous</p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => setShowForm(false)}
                                title="Fermer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                            <form onSubmit={handleSubmit} className="facture-form">
                                {/* Section informations générales */}
                                <div className="form-grid four-columns">
                                    <div className="form-section-title">
                                        <h4><FileText size={20} /> Informations générales</h4>
                                    </div>
                                    <div className="form-group">
                                        <label>Type de document</label>
                                        <select
                                            value={formData.typeDocument}
                                            onChange={(e) => setFormData({...formData, typeDocument: e.target.value})}
                                        >
                                            <option value="facture">Facture</option>
                                            <option value="devis">Devis</option>
                                            <option value="ticket">Ticket de caisse</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Numéro</label>
                                        <input
                                            type="text"
                                            value={formData.numero}
                                            onChange={(e) => setFormData({...formData, numero: e.target.value})}
                                            placeholder={generateNumeroFacture()}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Date d'échéance</label>
                                        <input
                                            type="date"
                                            value={formData.dateEcheance}
                                            onChange={(e) => setFormData({...formData, dateEcheance: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Section Expéditeur */}
                                <div className="form-grid three-columns">
                                    <div className="form-section-title">
                                        <h4><Building size={20} /> Informations expéditeur</h4>
                                    </div>
                                    <div className="form-group">
                                        <label>Nom de l'entreprise</label>
                                        <input
                                            type="text"
                                            value={formData.expediteurNom}
                                            onChange={(e) => setFormData({...formData, expediteurNom: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.expediteurEmail}
                                            onChange={(e) => setFormData({...formData, expediteurEmail: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Téléphone</label>
                                        <input
                                            type="tel"
                                            value={formData.expediteurTelephone}
                                            onChange={(e) => setFormData({...formData, expediteurTelephone: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Adresse complète</label>
                                        <textarea
                                            value={formData.expediteurAdresse}
                                            onChange={(e) => setFormData({...formData, expediteurAdresse: e.target.value})}
                                            rows="3"
                                            placeholder="Rue, Ville, Code postal, Pays"
                                        />
                                    </div>
                                </div>

                                {/* Section Destinataire */}
                                <div className="form-grid three-columns">
                                    <div className="form-section-title">
                                        <h4><User size={20} /> Informations destinataire</h4>
                                    </div>
                                    <div className="form-group">
                                        <label>Nom du client</label>
                                        <input
                                            type="text"
                                            value={formData.clientNom}
                                            onChange={(e) => setFormData({...formData, clientNom: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={formData.clientEmail}
                                            onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group full-width">
                                        <label>Adresse du client</label>
                                        <textarea
                                            value={formData.clientAdresse}
                                            onChange={(e) => setFormData({...formData, clientAdresse: e.target.value})}
                                            rows="3"
                                            placeholder="Rue, Ville, Code postal, Pays"
                                        />
                                    </div>
                                </div>

                                <div className="items-section">
                                    <div className="items-header">
                                        <h4>Articles / Services</h4>
                                        <div className="items-actions">
                                            <button
                                                type="button"
                                                className="btn-secondary btn-expenses"
                                                onClick={() => setShowExpensesModal(true)}
                                            >
                                                <CreditCard size={16} /> Importer dépenses
                                            </button>
                                            <button
                                                type="button"
                                                className="btn-secondary btn-add-item"
                                                onClick={addItem}
                                            >
                                                <Plus size={16} /> Nouvel article
                                            </button>
                                        </div>
                                    </div>

                                    {formData.items.map((item, index) => (
                                        <div key={index} className="item-row">
                                            <div className="item-inputs">
                                                <input
                                                    type="text"
                                                    placeholder="Description"
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qté"
                                                    value={item.quantite}
                                                    onChange={(e) => handleItemChange(index, 'quantite', parseFloat(e.target.value) || 0)}
                                                    min="1"
                                                    required
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Prix unitaire"
                                                    value={item.prixUnitaire}
                                                    onChange={(e) => handleItemChange(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={`${item.total.toFixed(2)} €`}
                                                    readOnly
                                                    className="total-input"
                                                />
                                            </div>
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="taxes-section">
                                    <div className="taxes-header">
                                        <h4><Percent size={20} /> Taxes</h4>
                                        <button
                                            type="button"
                                            className="btn-secondary btn-add-tax"
                                            onClick={addTax}
                                        >
                                            <Percent size={16} /> Ajouter une taxe
                                        </button>
                                    </div>

                                    {formData.tauxTaxes.map((taxe, index) => (
                                        <div key={index} className="tax-row">
                                            <input
                                                type="text"
                                                placeholder="Nom de la taxe"
                                                value={taxe.nom}
                                                onChange={(e) => handleTaxChange(index, 'nom', e.target.value)}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Taux %"
                                                value={taxe.taux}
                                                onChange={(e) => handleTaxChange(index, 'taux', e.target.value)}
                                                step="0.01"
                                                min="0"
                                                max="100"
                                            />
                                            <input
                                                type="text"
                                                value={`${taxe.montant.toFixed(2)} €`}
                                                readOnly
                                                className="total-input"
                                            />
                                            {formData.tauxTaxes.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn-remove"
                                                    onClick={() => removeTax(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="totals-section">
                                    <div className="totals-display">
                                        <p>Sous-total: <strong>{formData.sousTotal.toFixed(2)} €</strong></p>
                                        {formData.tauxTaxes.map((taxe, index) => (
                                            <p key={index}>{taxe.nom} ({taxe.taux}%): <strong>{taxe.montant.toFixed(2)} €</strong></p>
                                        ))}
                                        <p className="total-final">Total: <strong>{formData.total.toFixed(2)} €</strong></p>
                                    </div>
                                </div>

                                {/* Section Informations complémentaires */}
                                <div className="form-grid two-columns">
                                    <div className="form-section-title">
                                        <h4><FileText size={20} /> Informations complémentaires</h4>
                                    </div>
                                    <div className="form-group">
                                        <label>Conditions de paiement</label>
                                        <input
                                            type="text"
                                            value={formData.conditions}
                                            onChange={(e) => setFormData({...formData, conditions: e.target.value})}
                                            placeholder="Ex: Paiement à 30 jours"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Notes additionnelles</label>
                                        <textarea
                                            value={formData.notes}
                                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                            rows="4"
                                            placeholder="Notes, remarques, conditions particulières..."
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn-secondary btn-cancel"
                                        onClick={() => setShowForm(false)}
                                    >
                                        <X size={18} /> Annuler
                                    </button>
                                    <button type="submit" className="btn-primary btn-save">
                                        <Save size={18} /> {editingFacture ? 'Modifier' : 'Créer'} le document
                                    </button>
                                </div>
                            </form>
                    </div>
                )}

                {showExpensesModal && (
                    <div className="expenses-section">
                        <div className="expenses-header">
                            <div className="expenses-title">
                                <h3>Sélectionner des dépenses</h3>
                                <p>Choisissez les dépenses à ajouter à votre facture</p>
                            </div>
                            <button
                                className="btn-close"
                                onClick={() => {
                                    setShowExpensesModal(false);
                                    resetExpenseFilters();
                                }}
                                title="Fermer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="expenses-content">
                            {/* Filtres */}
                            <div className="expenses-filters">
                                <div className="filter-group">
                                    <label><Search size={16} /> Rechercher</label>
                                    <div className="input-with-icon">
                                        <Search size={16} className="input-icon" />
                                        <input
                                            type="text"
                                            placeholder="Rechercher une dépense..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="search-input"
                                        />
                                    </div>
                                </div>
                                <div className="filter-group">
                                    <label><Filter size={16} /> Catégorie</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="category-filter"
                                    >
                                        <option value="">Toutes les catégories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.categorie}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    type="button"
                                    className="btn-reset"
                                    onClick={resetExpenseFilters}
                                    title="Réinitialiser les filtres"
                                >
                                    <RotateCcw size={16} /> Réinitialiser
                                </button>
                            </div>

                            {/* Statistiques des résultats */}
                            <div className="expenses-stats">
                                <div className="stats-info">
                                    <span className="results-count">
                                        {filteredExpenses.length} dépense(s) trouvée(s)
                                    </span>
                                    <span className="total-amount">
                                        Total: {filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.montant), 0).toFixed(2)} €
                                    </span>
                                </div>
                            </div>

                            {/* Liste des dépenses */}
                            <div className="expenses-list">
                                {filteredExpenses.length === 0 ? (
                                    <div className="no-expenses">
                                        <p>Aucune dépense trouvée avec ces filtres</p>
                                        <button
                                            type="button"
                                            className="btn-secondary"
                                            onClick={resetExpenseFilters}
                                        >
                                            <Eye size={16} /> Voir toutes les dépenses
                                        </button>
                                    </div>
                                ) : (
                                    filteredExpenses.map(expense => {
                                        const categoryName = categories.find(c => c.id == expense.categorie)?.categorie || 'Non catégorisé';
                                        return (
                                            <div key={expense.id} className="expense-item" onClick={() => addExpenseToInvoice(expense)}>
                                                <div className="expense-info">
                                                    <h5>{expense.description}</h5>
                                                    <div className="expense-meta">
                                                        <span className="expense-date">
                                                            {new Date(expense.dateTransaction).toLocaleDateString()}
                                                        </span>
                                                        <span className={`expense-category category-${expense.categorie}`}>
                                                            {categoryName}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="expense-amount">
                                                    {parseFloat(expense.montant).toFixed(2)} €
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        } />
    );
}