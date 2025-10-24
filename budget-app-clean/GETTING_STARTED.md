# Guide de Démarrage Rapide 🚀

## Installation

### 1. Installer les dépendances

```bash
cd budget-app-clean
npm install
```

### 2. Configuration (Optionnel)

Créer un fichier `.env` basé sur `.env.example` :

```bash
cp .env.example .env
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## Connexion

### Compte de test (si disponible sur l'API)

- Email : `test@example.com`
- Password : `password`

### Créer un nouveau compte

1. Cliquer sur "S'inscrire" sur la page de connexion
2. Remplir le formulaire
3. Se connecter avec les identifiants créés

## Structure du Projet

```
src/
├── components/     # Composants réutilisables UI
├── pages/         # Pages de l'application
├── store/         # State management (Zustand)
├── services/      # API calls
├── utils/         # Fonctions utilitaires
└── styles/        # CSS global
```

## Fonctionnalités Principales

### 1. Dashboard (Home)
- Vue d'ensemble des finances
- Statistiques en temps réel
- Dernières dépenses

### 2. Gestion des Dépenses
- Ajouter une dépense
- Modifier une dépense
- Supprimer une dépense
- Recherche et filtres avancés
- Tri par colonne

### 3. Système de Catégories
- 40+ catégories prédéfinies avec icônes
- Filtrage par catégorie
- Statistiques par catégorie

## Utilisation

### Ajouter une dépense

1. Aller sur "Dépenses"
2. Cliquer sur "Ajouter une dépense"
3. Remplir le formulaire :
   - Description
   - Montant
   - Catégorie
   - Date
4. Cliquer sur "Ajouter"

### Rechercher des dépenses

1. Utiliser la barre de recherche en haut
2. Cliquer sur "Filtres" pour options avancées
3. Sélectionner les catégories à filtrer
4. Les résultats s'affichent en temps réel

### Modifier une dépense

1. Cliquer sur l'icône ✏️ dans le tableau
2. Modifier les informations
3. Cliquer sur "Modifier"

### Supprimer une dépense

1. Cliquer sur l'icône 🗑️ dans le tableau
2. Confirmer la suppression

## Personnalisation

### Modifier les couleurs

Éditer `src/styles/global.css` :

```css
:root {
  --primary: #2563eb;      /* Couleur principale */
  --secondary: #10b981;    /* Couleur secondaire */
  --danger: #ef4444;       /* Rouge */
  --warning: #f59e0b;      /* Orange */
}
```

### Ajouter une nouvelle page

1. Créer le fichier dans `src/pages/MaPage.jsx`
2. Ajouter la route dans `src/App.jsx`
3. Ajouter au menu dans `src/components/Layout.jsx`

Exemple :

```jsx
// src/pages/MaPage.jsx
const MaPage = () => {
  return (
    <div>
      <h1>Ma Nouvelle Page</h1>
    </div>
  );
};

export default MaPage;
```

```jsx
// src/App.jsx - Ajouter la route
<Route
  path="/ma-page"
  element={
    <ProtectedRoute>
      <MaPage />
    </ProtectedRoute>
  }
/>
```

```jsx
// src/components/Layout.jsx - Ajouter au menu
const navItems = [
  // ...
  { path: '/ma-page', icon: Star, label: 'Ma Page' },
];
```

## API Backend

L'application se connecte à : `https://www.krisscode.fr`

### Endpoints utilisés

- `POST /auth/login` - Connexion
- `POST /auth/register` - Inscription
- `GET /action/byuser/:userId` - Liste des dépenses
- `POST /action` - Créer une dépense
- `PUT /action/:id` - Modifier une dépense
- `DELETE /action/:id` - Supprimer une dépense
- `GET /categorie/byuser/:userId` - Liste des catégories
- `GET /revenues` - Liste des revenus

## Build pour Production

```bash
npm run build
```

Les fichiers optimisés seront dans le dossier `dist/`

## Preview de Production

```bash
npm run preview
```

## Résolution de Problèmes

### Erreur de connexion API

Vérifier que l'API est accessible :
```bash
curl https://www.krisscode.fr
```

### Token expiré

Si vous êtes déconnecté automatiquement :
1. Le token a expiré
2. Reconnectez-vous

### Dépendances manquantes

```bash
rm -rf node_modules package-lock.json
npm install
```

## Support & Questions

Pour toute question ou problème :
1. Consulter la documentation dans `STRUCTURE.md`
2. Vérifier les logs de la console
3. Vérifier l'onglet Network du navigateur

## Prochaines Fonctionnalités à Implémenter

- [ ] Page Analytics avec graphiques
- [ ] Page Catégories pour gestion personnalisée
- [ ] Page Revenus
- [ ] Page Budget avec enveloppes
- [ ] Page Tickets (OCR)
- [ ] Page Factures
- [ ] Page Paramètres
- [ ] Dark mode toggle
- [ ] Export Excel/PDF
- [ ] Notifications push
- [ ] PWA (Progressive Web App)

## Technologies

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Zustand** - State Management
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Chart.js** - Graphiques
- **Lucide React** - Icônes

## Licence

Projet personnel - Tous droits réservés
