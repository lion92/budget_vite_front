# 🧪 Guide de Test Rapide

## 🚀 Démarrage

```bash
cd budget-app-clean
npm run dev
```

➡️ Ouvrir http://localhost:3000

---

## ✅ Checklist de Test

### 1. Authentification

#### Inscription
- [ ] Aller sur /register
- [ ] Remplir tous les champs
- [ ] Tester mot de passe < 6 caractères (erreur attendue)
- [ ] Tester mots de passe différents (erreur attendue)
- [ ] Inscription réussie → redirection /login

#### Connexion
- [ ] Aller sur /login
- [ ] Tester email/password incorrect (erreur attendue)
- [ ] Tester email/password correct
- [ ] Connexion réussie → redirection /
- [ ] Vérifier localStorage : `jwt` et `utilisateur` présents

#### Déconnexion
- [ ] Cliquer sur "Déconnexion" dans le menu
- [ ] Redirection vers /login
- [ ] localStorage vidé

---

### 2. Dashboard (Home)

- [ ] Affichage des statistiques
  - [ ] Total dépenses
  - [ ] Total revenus
  - [ ] Solde (revenus - dépenses)
  - [ ] Nombre de dépenses

- [ ] Section "Ce mois-ci"
  - [ ] Dépenses du mois
  - [ ] Nombre de transactions
  - [ ] Moyenne par transaction

- [ ] Section "Aperçu rapide"
  - [ ] Taux d'épargne
  - [ ] Dépense moyenne

- [ ] Dernières dépenses (5 max)
  - [ ] Affichage correct
  - [ ] Catégorie + montant

---

### 3. Gestion des Dépenses

#### Ajouter une dépense
- [ ] Cliquer sur "Ajouter une dépense"
- [ ] Modal s'ouvre
- [ ] Remplir le formulaire :
  - [ ] Description
  - [ ] Montant
  - [ ] Catégorie (liste déroulante)
  - [ ] Date
- [ ] Cliquer "Ajouter"
- [ ] Notification de succès
- [ ] Dépense apparaît dans le tableau
- [ ] Total mis à jour

#### Modifier une dépense
- [ ] Cliquer sur l'icône ✏️
- [ ] Modal s'ouvre avec données pré-remplies
- [ ] Modifier les données
- [ ] Cliquer "Modifier"
- [ ] Notification de succès
- [ ] Modification visible dans le tableau

#### Supprimer une dépense
- [ ] Cliquer sur l'icône 🗑️
- [ ] Confirmation demandée
- [ ] Accepter la suppression
- [ ] Notification de succès
- [ ] Dépense disparaît du tableau
- [ ] Total mis à jour

#### Recherche
- [ ] Taper dans la barre de recherche
- [ ] Résultats filtrés en temps réel
- [ ] Chercher par description
- [ ] Chercher par catégorie
- [ ] Compteur mis à jour

#### Filtres
- [ ] Cliquer sur "Filtres"
- [ ] Panel de filtres s'ouvre
- [ ] Cocher des catégories
- [ ] Résultats filtrés
- [ ] Compteur mis à jour
- [ ] Cliquer "Réinitialiser"
- [ ] Filtres supprimés

#### Tri
- [ ] Cliquer sur en-tête "Date" → tri ascendant
- [ ] Cliquer à nouveau → tri descendant
- [ ] Tester avec "Montant"
- [ ] Tester avec "Catégorie"
- [ ] Tester avec "Description"
- [ ] Icône de tri visible

---

### 4. Navigation

#### Sidebar
- [ ] Menu visible sur desktop
- [ ] Tous les liens fonctionnent :
  - [ ] Accueil
  - [ ] Dépenses
  - [ ] Budget (TODO)
  - [ ] Analytics (TODO)
  - [ ] Catégories (TODO)
  - [ ] Revenus (TODO)
  - [ ] Tickets (TODO)
  - [ ] Factures (TODO)
  - [ ] Paramètres (TODO)
- [ ] Item actif highlighted
- [ ] Déconnexion fonctionne

#### Mobile
- [ ] Menu masqué par défaut
- [ ] Bouton hamburger visible
- [ ] Cliquer → menu slide in
- [ ] Overlay visible
- [ ] Cliquer sur overlay → menu se ferme
- [ ] Cliquer sur un lien → menu se ferme

---

### 5. Responsive

#### Desktop (>768px)
- [ ] Sidebar fixe à gauche
- [ ] Contenu à droite
- [ ] Cartes en grille 2-4 colonnes
- [ ] Tableau visible
- [ ] Aucun scroll horizontal

#### Tablet (768px)
- [ ] Sidebar collapse
- [ ] Bouton menu visible
- [ ] Grille 2 colonnes
- [ ] Tableau scroll horizontal si besoin

#### Mobile (<480px)
- [ ] Menu hamburger
- [ ] Grille 1 colonne
- [ ] Cartes stack verticalement
- [ ] Boutons touch-friendly
- [ ] Tableau responsive

---

### 6. UI/UX

#### Notifications Toast
- [ ] Succès (vert) pour actions réussies
- [ ] Erreur (rouge) pour échecs
- [ ] Position top-right
- [ ] Auto-dismiss après 3s
- [ ] Cliquable pour fermer

#### Modales
- [ ] Overlay sombre
- [ ] Centré à l'écran
- [ ] Bouton X pour fermer
- [ ] Clic overlay → ferme
- [ ] Scroll si contenu long

#### Formulaires
- [ ] Labels clairs
- [ ] Placeholders
- [ ] Validation en temps réel
- [ ] Messages d'erreur
- [ ] Focus visible

#### Boutons
- [ ] Hover effect
- [ ] Disabled state
- [ ] Loading spinner
- [ ] Icônes visibles

---

### 7. Performance

- [ ] Chargement initial < 2s
- [ ] Pas de lag lors du scroll
- [ ] Recherche instantanée
- [ ] Filtres réactifs
- [ ] Pas d'erreur console

---

### 8. API

#### Vérifier les requêtes (Network tab)

**Login**
```
POST /connection/login
Body: { email, password }
Response: { jwt, id, success }
```

**Dépenses**
```
GET /action/byuser/:userId
Response: Array of expenses
```

**Créer dépense**
```
POST /action
Body: { description, montant, categorie, dateTransaction, userId }
Response: Created expense
```

**Modifier dépense**
```
PUT /action/:id
Body: Updated expense data
Response: Updated expense
```

**Supprimer dépense**
```
DELETE /action/:id
Response: Success message
```

---

### 9. Sécurité

- [ ] Routes protégées si non connecté
- [ ] Redirection /login si token absent
- [ ] JWT dans Authorization header
- [ ] Logout vide localStorage
- [ ] Pas de données sensibles en console

---

### 10. Bugs Connus à Vérifier

- [ ] Aucun warning React dans console
- [ ] Aucune erreur 404
- [ ] Aucune erreur CORS
- [ ] Images chargent correctement
- [ ] Fonts chargent correctement
- [ ] CSS appliqué partout

---

## 🐛 Si un test échoue

1. **Vérifier la console navigateur** (F12)
2. **Vérifier Network tab** pour les requêtes
3. **Vérifier localStorage** : `jwt` et `utilisateur`
4. **Relancer le serveur** : `npm run dev`
5. **Vider le cache** : Ctrl+Shift+Delete

---

## ✅ Test Réussi

Si tous les tests passent :
- ✅ Application fonctionnelle
- ✅ API intégrée
- ✅ UI responsive
- ✅ Prêt pour production (après ajout features)

---

## 📝 Rapport de Test

### Résultats

| Catégorie | Tests | Passés | Échecs |
|-----------|-------|--------|--------|
| Auth | 8 | | |
| Dashboard | 10 | | |
| Dépenses | 20 | | |
| Navigation | 12 | | |
| Responsive | 10 | | |
| UI/UX | 15 | | |
| Performance | 5 | | |
| API | 5 | | |
| Sécurité | 5 | | |
| **Total** | **90** | | |

---

**Bon test ! 🧪**
