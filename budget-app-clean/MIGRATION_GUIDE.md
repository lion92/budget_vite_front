# Guide de Migration des Fonctionnalités

Ce guide explique comment migrer les fonctionnalités manquantes de l'ancien projet vers le nouveau.

## ✅ Déjà Implémenté

- [x] Authentification (Login/Register)
- [x] Dashboard (Vue d'ensemble)
- [x] Gestion des dépenses (CRUD)
- [x] Recherche et filtres
- [x] Catégories prédéfinies
- [x] Tableau avec tri
- [x] Responsive design
- [x] Notifications toast
- [x] Store Zustand
- [x] API integration

## 🔄 À Migrer

### 1. Analytics & Graphiques

**Fonctionnalités à porter :**
- Graphiques mensuels (Chart.js)
- Répartition par catégorie (Pie chart)
- Tendances temporelles
- Export des graphiques

**Template à créer :**

```jsx
// src/pages/Analytics.jsx
import { useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import useAppStore from '../store/useAppStore';
import { getCategoryStats } from '../utils/categories';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Analytics = () => {
  const { expenses, getExpensesByCategory, getMonthlyExpenses } = useAppStore();

  const categoryData = getExpensesByCategory();
  const monthlyData = getMonthlyExpenses();

  const pieData = {
    labels: Object.keys(categoryData),
    datasets: [{
      data: Object.values(categoryData).map(c => c.total),
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6']
    }]
  };

  const barData = {
    labels: Object.keys(monthlyData),
    datasets: [{
      label: 'Dépenses mensuelles',
      data: Object.values(monthlyData),
      backgroundColor: '#3b82f6'
    }]
  };

  return (
    <div className="analytics-page">
      <h1>Analytics</h1>

      <div className="grid grid-cols-2">
        <div className="card">
          <h3>Répartition par catégorie</h3>
          <Pie data={pieData} />
        </div>

        <div className="card">
          <h3>Dépenses mensuelles</h3>
          <Bar data={barData} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
```

**Ajouter la route dans App.jsx :**
```jsx
<Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
```

---

### 2. Gestion des Catégories

**Fonctionnalités à porter :**
- Créer des catégories personnalisées
- Modifier des catégories
- Choisir icône et couleur
- Supprimer des catégories

**Template à créer :**

```jsx
// src/pages/Categories.jsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { DEFAULT_CATEGORIES, getRandomColor } from '../utils/categories';

const Categories = () => {
  const { categories, addCategory } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    categorie: '',
    color: getRandomColor(),
    iconName: '📝'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');
    await addCategory({ ...newCategory, userId: parseInt(userId) });
    setShowModal(false);
    setNewCategory({ categorie: '', color: getRandomColor(), iconName: '📝' });
  };

  return (
    <div className="categories-page">
      <div className="page-header flex items-center justify-between">
        <h1>Catégories</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Nouvelle catégorie
        </button>
      </div>

      <div className="grid grid-cols-4">
        {categories.map((cat) => (
          <div key={cat.id} className="card">
            <div className="category-icon" style={{ backgroundColor: cat.color }}>
              {cat.iconName}
            </div>
            <h4>{cat.categorie}</h4>
          </div>
        ))}
      </div>

      {/* Modal pour ajouter catégorie */}
    </div>
  );
};

export default Categories;
```

---

### 3. Gestion des Revenus

**Fonctionnalités à porter :**
- CRUD des revenus
- Comparaison revenus vs dépenses
- Historique

**Template à créer :**

```jsx
// src/pages/Revenues.jsx
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const Revenues = () => {
  const { revenues, addRevenue, deleteRevenue, fetchRevenues } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    montant: '',
    dateRevenu: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRevenues();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addRevenue(formData);
    setShowModal(false);
    setFormData({ nom: '', montant: '', dateRevenu: '' });
  };

  const totalRevenues = revenues.reduce((sum, r) => sum + parseFloat(r.montant || 0), 0);

  return (
    <div className="revenues-page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Revenus</h1>
          <p>Total: {formatCurrency(totalRevenues)}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Ajouter un revenu
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Nom</th>
              <th>Montant</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((revenue) => (
              <tr key={revenue.id}>
                <td>{formatDate(revenue.dateRevenu)}</td>
                <td>{revenue.nom}</td>
                <td>{formatCurrency(revenue.montant)}</td>
                <td>
                  <button onClick={() => deleteRevenue(revenue.id)}>
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Revenues;
```

---

### 4. Gestion du Budget (Enveloppes)

**Fonctionnalités à porter :**
- Définir un budget global
- Créer des enveloppes par catégorie
- Alertes de dépassement
- Suivi en temps réel

**Template à créer :**

```jsx
// src/pages/Budget.jsx
import { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { formatCurrency } from '../utils/formatters';

const Budget = () => {
  const { categories, getExpensesByCategory } = useAppStore();
  const [budgets, setBudgets] = useState({});

  const expensesByCategory = getExpensesByCategory();

  return (
    <div className="budget-page">
      <h1>Gestion du Budget</h1>

      <div className="grid">
        {categories.map((cat) => {
          const spent = expensesByCategory[cat.categorie]?.total || 0;
          const budget = budgets[cat.categorie] || 0;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;

          return (
            <div key={cat.id} className="card">
              <h4>{cat.categorie}</h4>
              <div className="budget-bar">
                <div
                  className="budget-progress"
                  style={{
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: percentage > 100 ? 'var(--danger)' : 'var(--primary)'
                  }}
                />
              </div>
              <p>{formatCurrency(spent)} / {formatCurrency(budget)}</p>
              <input
                type="number"
                placeholder="Définir un budget"
                value={budgets[cat.categorie] || ''}
                onChange={(e) => setBudgets({...budgets, [cat.categorie]: e.target.value})}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;
```

---

### 5. Upload de Tickets (OCR)

**Fonctionnalités à porter :**
- Upload d'images (JPG, PNG, PDF)
- Extraction OCR
- Créer dépense depuis ticket
- Historique des tickets

**Template à créer :**

```jsx
// src/pages/Tickets.jsx
import { useState } from 'react';
import { Upload } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { formatCurrency, formatDate } from '../utils/formatters';

const Tickets = () => {
  const { tickets, uploadTicket, fetchTickets } = useAppStore();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', localStorage.getItem('userId'));

    setUploading(true);
    const result = await uploadTicket(formData);
    setUploading(false);

    if (result) {
      toast.success('Ticket uploadé avec succès');
      fetchTickets();
    }
  };

  return (
    <div className="tickets-page">
      <h1>Tickets & Reçus</h1>

      <div className="card mb-4">
        <label className="upload-zone">
          <Upload size={48} />
          <p>Cliquer pour uploader un ticket</p>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleUpload}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      <div className="card">
        <h3>Historique</h3>
        <div className="tickets-grid">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <img src={ticket.imageUrl} alt="Ticket" />
              <p>{formatDate(ticket.dateUpload)}</p>
              <p>{formatCurrency(ticket.montantExtrait)}</p>
              <p>{ticket.commercant}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tickets;
```

---

### 6. Génération de Factures

**Fonctionnalités à porter :**
- Créer des factures/devis
- Ajouter des lignes de produits
- Calcul automatique (TVA, total)
- Export PDF
- Historique des factures

**Template à créer :**

```jsx
// src/pages/Invoices.jsx
import { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const generatePDF = (invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text('FACTURE', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`N° ${invoice.numero}`, 20, 40);
    doc.text(`Date: ${invoice.date}`, 20, 50);

    // Add items
    let y = 80;
    invoice.items.forEach((item) => {
      doc.text(`${item.description}`, 20, y);
      doc.text(`${item.quantity} x ${item.price}€`, 150, y);
      y += 10;
    });

    doc.text(`Total: ${invoice.total}€`, 150, y + 20);

    doc.save(`facture-${invoice.numero}.pdf`);
  };

  return (
    <div className="invoices-page">
      <div className="page-header flex items-center justify-between">
        <h1>Factures & Devis</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Nouvelle facture
        </button>
      </div>

      <div className="grid grid-cols-3">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="card">
            <h4>Facture N° {invoice.numero}</h4>
            <p>Date: {invoice.date}</p>
            <p>Client: {invoice.client}</p>
            <p>Total: {invoice.total}€</p>
            <button
              className="btn btn-primary"
              onClick={() => generatePDF(invoice)}
            >
              <Download size={16} />
              Télécharger PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Invoices;
```

---

### 7. Paramètres Utilisateur

**Fonctionnalités à porter :**
- Modifier profil
- Changer mot de passe
- Préférences (devise, langue)
- Dark mode toggle
- Notifications

**Template à créer :**

```jsx
// src/pages/Settings.jsx
import { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { Moon, Sun } from 'lucide-react';

const Settings = () => {
  const { user } = useAppStore();
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.setAttribute('data-theme', darkMode ? 'light' : 'dark');
  };

  return (
    <div className="settings-page">
      <h1>Paramètres</h1>

      <div className="card mb-4">
        <h3>Profil</h3>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={user?.email} className="form-input" />
        </div>
        <div className="form-group">
          <label>Nom</label>
          <input type="text" value={user?.name} className="form-input" />
        </div>
        <button className="btn btn-primary">Enregistrer</button>
      </div>

      <div className="card mb-4">
        <h3>Apparence</h3>
        <div className="flex items-center justify-between">
          <span>Mode sombre</span>
          <button className="btn btn-outline" onClick={toggleDarkMode}>
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            {darkMode ? 'Mode clair' : 'Mode sombre'}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Sécurité</h3>
        <button className="btn btn-primary">Changer le mot de passe</button>
      </div>
    </div>
  );
};

export default Settings;
```

---

## 🎨 Styles à Ajouter

Pour chaque nouvelle page, créer un fichier CSS correspondant :

```css
/* src/pages/NomPage.css */

.nom-page {
  max-width: 100%;
}

/* Vos styles spécifiques ici */

@media (max-width: 768px) {
  /* Responsive */
}
```

---

## 📝 Checklist de Migration

Pour chaque fonctionnalité :

- [ ] Créer le fichier page dans `src/pages/`
- [ ] Créer le fichier CSS associé
- [ ] Ajouter la route dans `src/App.jsx`
- [ ] Ajouter l'item dans le menu `src/components/Layout.jsx`
- [ ] Ajouter les actions nécessaires dans `src/store/useAppStore.js` (si besoin)
- [ ] Tester la fonctionnalité
- [ ] Vérifier le responsive
- [ ] Documenter

---

## 🔄 Ordre de Migration Recommandé

1. ✅ Analytics (graphiques simples)
2. ✅ Catégories (CRUD simple)
3. ✅ Revenus (similaire aux dépenses)
4. ✅ Budget (calculs simples)
5. ⚠️ Tickets (nécessite backend OCR)
6. ⚠️ Factures (génération PDF complexe)
7. ✅ Paramètres (simple)

---

## 💡 Conseils

1. **Commencer simple** - Migrer d'abord les fonctionnalités sans dépendances
2. **Tester au fur et à mesure** - Ne pas tout migrer d'un coup
3. **Réutiliser les composants** - ExpenseTable, StatCard, etc.
4. **Suivre les patterns** - Regarder Home.jsx et Expenses.jsx comme exemples
5. **Documenter** - Ajouter des commentaires pour les futures modifications

---

## 🆘 Aide

Si vous bloquez sur une migration :

1. Consulter l'ancien code dans `mon-projet-vite/`
2. Regarder les exemples dans `budget-app-clean/src/pages/`
3. Vérifier le store `useAppStore.js` pour les actions disponibles
4. Consulter la doc officielle des librairies

---

## 🎯 Résultat Final

Une fois toutes les fonctionnalités migrées, vous aurez :

- ✅ Application complète et fonctionnelle
- ✅ Code propre et maintenable
- ✅ Performance optimale
- ✅ Documentation complète
- ✅ Prêt pour la production

**Bonne migration ! 🚀**
