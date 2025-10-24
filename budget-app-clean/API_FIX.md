# 🔧 Correctifs API - Authentification

## ✅ Problème Résolu

L'erreur **404 sur `/auth/login`** a été corrigée.

---

## 🔍 Cause du Problème

L'API n'utilise pas les endpoints standard `/auth/login` mais des endpoints personnalisés :

### ❌ Ancien (incorrect)
```
POST /auth/login
POST /auth/register
```

### ✅ Nouveau (correct)
```
POST /connection/login
POST /connection/inscription
```

---

## 📝 Modifications Effectuées

### 1. **Store Zustand** (`src/store/useAppStore.js`)

#### Login corrigé
```javascript
login: async (email, password) => {
  const response = await fetch('https://www.krisscode.fr/connection/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.jwt && data.id) {
    localStorage.setItem('jwt', data.jwt);
    localStorage.setItem('utilisateur', data.id);
    // ...
  }
}
```

#### Inscription corrigée
```javascript
register: async (userData) => {
  const response = await fetch('https://www.krisscode.fr/connection/inscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  // ...
}
```

### 2. **LocalStorage Keys**

#### ❌ Avant
```javascript
localStorage.setItem('token', ...);
localStorage.setItem('userId', ...);
```

#### ✅ Maintenant
```javascript
localStorage.setItem('jwt', ...);
localStorage.setItem('utilisateur', ...);
```

### 3. **Format de Réponse API**

L'API retourne :
```json
{
  "jwt": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": 123,
  "success": true
}
```

### 4. **Fichiers Modifiés**

- ✅ `src/store/useAppStore.js` - Endpoints et localStorage
- ✅ `src/services/api.js` - Interceptor avec 'jwt'
- ✅ `src/pages/Home.jsx` - Utilise 'utilisateur'
- ✅ `src/pages/Expenses.jsx` - Utilise 'utilisateur'
- ✅ `src/components/ExpenseModal.jsx` - Utilise 'utilisateur'
- ✅ `src/pages/Register.jsx` - Nouvelle page d'inscription
- ✅ `src/App.jsx` - Route /register ajoutée

---

## 🧪 Test de Connexion

### 1. S'inscrire
```
1. Aller sur /register
2. Remplir le formulaire :
   - Nom
   - Prénom
   - Email
   - Mot de passe (min 6 caractères)
   - Confirmer mot de passe
3. Cliquer sur "S'inscrire"
4. Redirection vers /login
```

### 2. Se connecter
```
1. Aller sur /login
2. Entrer email et mot de passe
3. Cliquer sur "Se connecter"
4. Redirection vers / (Dashboard)
```

### 3. Vérifier localStorage
```javascript
// Dans la console du navigateur
console.log(localStorage.getItem('jwt'));        // JWT token
console.log(localStorage.getItem('utilisateur')); // User ID
```

---

## 🔐 Sécurité

### JWT Storage
Le JWT est stocké dans **localStorage** :
- ✅ Persiste entre les sessions
- ✅ Accessible via JavaScript
- ⚠️ Vulnérable au XSS (considérer httpOnly cookies en production)

### Authorization Header
Toutes les requêtes API incluent automatiquement :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Grâce à l'interceptor Axios dans `src/services/api.js`.

---

## 🚀 Test Complet

### Démarrer l'application
```bash
cd budget-app-clean
npm run dev
```

### Scénario de test
1. ✅ Ouvrir http://localhost:3000
2. ✅ Être redirigé vers /login
3. ✅ Cliquer sur "S'inscrire"
4. ✅ Créer un compte
5. ✅ Se connecter avec le compte créé
6. ✅ Accéder au dashboard
7. ✅ Ajouter une dépense
8. ✅ Se déconnecter
9. ✅ Vérifier la redirection vers /login

---

## 📊 Endpoints API Utilisés

| Méthode | Endpoint | Description | Body |
|---------|----------|-------------|------|
| POST | `/connection/login` | Connexion | `{ email, password }` |
| POST | `/connection/inscription` | Inscription | `{ nom, prenom, email, password }` |
| GET | `/action/byuser/:userId` | Liste dépenses | - |
| POST | `/action` | Créer dépense | `{ description, montant, categorie, dateTransaction, userId }` |
| PUT | `/action/:id` | Modifier dépense | Données dépense |
| DELETE | `/action/:id` | Supprimer dépense | - |
| GET | `/categorie/byuser/:userId` | Liste catégories | - |
| POST | `/categorie` | Créer catégorie | Données catégorie |
| GET | `/revenues` | Liste revenus | - |
| POST | `/revenues` | Créer revenu | Données revenu |
| DELETE | `/revenues/:id` | Supprimer revenu | - |

---

## 🐛 Debug

### Erreur 404
```
✅ Vérifier l'URL : https://www.krisscode.fr/connection/login
✅ Pas /auth/login
```

### Erreur 401
```
✅ Vérifier que le JWT est dans localStorage
✅ Vérifier que l'interceptor fonctionne
✅ Se reconnecter si nécessaire
```

### JWT manquant
```javascript
// Vérifier la réponse de l'API
const response = await fetch('https://www.krisscode.fr/connection/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
console.log(data); // Doit contenir { jwt: "...", id: 123 }
```

---

## ✅ Statut Actuel

- ✅ Authentification fonctionnelle
- ✅ Inscription fonctionnelle
- ✅ Déconnexion fonctionnelle
- ✅ JWT correctement stocké
- ✅ Interceptor configuré
- ✅ Routes protégées
- ✅ Redirection automatique

---

## 🎉 Résultat

L'authentification fonctionne maintenant correctement avec l'API !

**Vous pouvez :**
1. Créer un compte
2. Vous connecter
3. Accéder au dashboard
4. Gérer vos dépenses
5. Vous déconnecter

---

*Correctif appliqué le 24 octobre 2025*
