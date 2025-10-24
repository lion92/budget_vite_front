# Structure du Projet Budget App Clean

## 📁 Architecture Simplifiée

```
budget-app-clean/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── Layout.jsx       # Layout principal avec sidebar
│   │   ├── Layout.css
│   │   ├── StatCard.jsx     # Carte de statistiques
│   │   ├── StatCard.css
│   │   ├── ExpenseModal.jsx # Modal ajout/édition dépense
│   │   ├── ExpenseModal.css
│   │   ├── ExpenseTable.jsx # Tableau des dépenses
│   │   └── ExpenseTable.css
│   │
│   ├── pages/              # Pages de l'application
│   │   ├── Login.jsx       # Page de connexion
│   │   ├── Auth.css        # Styles authentification
│   │   ├── Home.jsx        # Dashboard d'accueil
│   │   ├── Home.css
│   │   ├── Expenses.jsx    # Page liste des dépenses
│   │   └── Expenses.css
│   │
│   ├── store/              # State management Zustand
│   │   └── useAppStore.js  # Store global unique
│   │
│   ├── services/           # Services API
│   │   └── api.js          # Configuration Axios
│   │
│   ├── utils/              # Utilitaires
│   │   ├── formatters.js   # Formatage (dates, montants)
│   │   └── categories.js   # Gestion des catégories
│   │
│   ├── styles/             # Styles globaux
│   │   └── global.css      # Design system CSS
│   │
│   ├── App.jsx             # Routing principal
│   └── main.jsx            # Point d'entrée
│
├── index.html              # HTML de base
├── package.json            # Dépendances (simplifiées)
├── vite.config.js          # Configuration Vite
└── README.md               # Documentation

## 🎯 Différences avec l'Ancien Projet

### Simplifications

1. **State Management**
   - ❌ Avant : Redux + Zustand (double gestion)
   - ✅ Maintenant : Zustand uniquement (un seul store)

2. **Nombre de Dépendances**
   - ❌ Avant : 50+ dépendances
   - ✅ Maintenant : 12 dépendances essentielles

3. **Structure des Composants**
   - ❌ Avant : 112 composants éparpillés
   - ✅ Maintenant : Composants organisés et réutilisables

4. **CSS**
   - ❌ Avant : Multiple fichiers CSS, SCSS, systèmes mixtes
   - ✅ Maintenant : Un seul design system (global.css)

5. **Architecture**
   - ❌ Avant : Fichiers mélangés, difficile à naviguer
   - ✅ Maintenant : Structure claire par fonctionnalité

## 🔧 Technologies Utilisées

### Core
- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **React Router v6** - Routing

### State & Data
- **Zustand** - State management simple
- **Axios** - HTTP client

### UI & Visualisation
- **Chart.js** + React-ChartJS-2 - Graphiques
- **Lucide React** - Icônes modernes
- **React Toastify** - Notifications

### Utilitaires
- **React DatePicker** - Sélection de dates
- **jsPDF** - Génération PDF
- **XLSX** - Export Excel

## 📊 Store Zustand - useAppStore

### Structure du State

```javascript
{
  // Auth
  user: null,
  token: string,

  // Data
  expenses: [],
  categories: [],
  revenues: [],
  tickets: [],

  // UI State
  isLoading: false,
  error: null,

  // Filters
  searchTerm: '',
  selectedCategories: [],
  dateRange: { start, end },
  amountRange: { min, max }
}
```

### Actions Disponibles

**Authentification**
- `login(email, password)`
- `logout()`
- `register(userData)`

**Dépenses**
- `fetchExpenses(userId)`
- `addExpense(expense)`
- `updateExpense(id, expense)`
- `deleteExpense(id)`

**Catégories**
- `fetchCategories(userId)`
- `addCategory(category)`

**Revenus**
- `fetchRevenues()`
- `addRevenue(revenue)`
- `deleteRevenue(id)`

**Tickets (OCR)**
- `uploadTicket(formData)`
- `fetchTickets()`

**Filtres**
- `setSearchTerm(term)`
- `setSelectedCategories(categories)`
- `setDateRange(range)`
- `setAmountRange(range)`
- `resetFilters()`

**Selectors (Computed)**
- `getFilteredExpenses()`
- `getTotalExpenses()`
- `getTotalRevenues()`
- `getExpensesByCategory()`
- `getMonthlyExpenses()`

## 🎨 Design System

Le fichier `global.css` contient :

### Variables CSS
- Couleurs (primary, secondary, danger, warning, success)
- Backgrounds (light/dark mode ready)
- Textes (hierarchy)
- Borders & Shadows
- Radius & Transitions

### Classes Utilitaires
- `.btn` (primary, secondary, danger, outline)
- `.card` (header, body, footer)
- `.form-*` (input, select, textarea, label)
- `.table`
- `.modal` (overlay, header, body, footer)
- `.badge`
- `.grid`, `.flex`
- Spacing (margin, padding)
- Typography

### Composants Réutilisables

1. **Layout**
   - Sidebar responsive
   - Header avec user info
   - Navigation
   - Mobile-friendly

2. **StatCard**
   - Affichage de statistiques
   - Icône + valeur + tendance
   - 4 variantes de couleurs

3. **ExpenseTable**
   - Tri par colonne
   - Actions (éditer, supprimer)
   - Responsive

4. **ExpenseModal**
   - Ajout/édition de dépenses
   - Validation de formulaire
   - Catégories dynamiques

## 🚀 Comment Étendre

### Ajouter une nouvelle page

1. Créer le fichier dans `src/pages/`
2. Ajouter la route dans `src/App.jsx`
3. Ajouter l'item dans le menu `src/components/Layout.jsx`

### Ajouter une action au store

1. Ajouter la fonction dans `src/store/useAppStore.js`
2. Utiliser `set` et `get` pour manipuler le state
3. Utiliser dans les composants avec `useAppStore()`

### Ajouter un composant réutilisable

1. Créer dans `src/components/`
2. Suivre le pattern : Component.jsx + Component.css
3. Utiliser les classes du design system

## 📱 Responsive

- Mobile-first approach
- Breakpoint principal : 768px
- Sidebar collapse sur mobile
- Grid adaptatif
- Touch-friendly

## 🔐 Sécurité

- JWT Token dans localStorage
- Interceptor Axios pour auth automatique
- Protected routes
- Redirection auto si non connecté
- Logout si token expiré (401)

## 📝 Bonnes Pratiques Appliquées

1. **Composants réutilisables** - DRY principle
2. **Single Responsibility** - Chaque composant fait une chose
3. **Prop drilling évité** - Zustand pour state global
4. **CSS modulaire** - Scoped par composant
5. **Code lisible** - Nommage clair, commentaires
6. **Performance** - Lazy loading possible, memoization
7. **Accessibilité** - Labels, aria, keyboard navigation
```

## 🎯 Prochaines Étapes Suggérées

Pour étendre l'application, voici les pages à créer :

1. **Analytics.jsx** - Graphiques Chart.js
2. **Categories.jsx** - Gestion des catégories
3. **Revenues.jsx** - Gestion des revenus
4. **Budget.jsx** - Définition de budgets
5. **Tickets.jsx** - Upload OCR
6. **Invoices.jsx** - Génération de factures
7. **Settings.jsx** - Paramètres utilisateur

Toutes ces pages suivront le même pattern que Home.jsx et Expenses.jsx.
