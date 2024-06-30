# Mini Social Network


## Structure du Projet

Le projet est divisé en deux parties principales :

- `backend/` : Contient le code du serveur Node.js avec Express et MongoDB
- `frontend/` : Contient le code de l'application Angular

## Prérequis

Assurez-vous d'avoir les éléments suivants installés sur votre machine :

- Node.js (LTS)
- npm 
- MongoDB 
- Angular CLI (version 18.0.0 ou supérieure)

## Backend

### Installation

1. Naviguez dans le dossier backend :
cd backend
2. Installez les dépendances :
npm install
3. Créez un fichier `.env` à la racine du dossier backend et ajoutez :
MONGODB_URI=<votre_uri_mongodb>
JWT_SECRET=<votre_secret_jwt>
PORT=5000


### Lancement du serveur

Pour démarrer le serveur backend :
npm start
Le serveur fonctionnera sur `http://localhost:5000`.

### Structure du Backend

- `src/` : Code source
  - `config/` : Configuration 
  - `controllers/` : Logique de traitement des requêtes
  - `models/` : Modèles Mongoose
  - `routes/` : Routes de l'API
  - `middleware/` : Middleware personnalisé
  - `utils/` : Utilitaires
- `app.js` : Point d'entrée de l'application Express
- `server.js` : Démarrage du serveur

### API Endpoints

- POST `/api/auth/register` : Inscription
- POST `/api/auth/login` : Connexion
- GET `/api/posts` : Récupérer les posts
- POST `/api/posts` : Créer un post
- POST `/api/posts/:id/like` : Aimer/Ne plus aimer un post
- POST `/api/posts/:postId/comments` : Ajouter un commentaire
- GET `/api/posts/:postId/comments` : Récupérer les commentaires
- DELETE `/api/posts/:postId/comments/:commentId` : Supprimer un commentaire

## Frontend

### Installation

1. Naviguez dans le dossier frontend :
cd frontend
2. Installez les dépendances :
npm install

### Lancement de l'application

Pour démarrer l'application Angular en mode développement :
ng serve

L'application sera accessible sur `http://localhost:4200`.

### Structure du Frontend

- `src/`
  - `app/`
    - `components/` : Composants Angular
    - `services/` : Services pour la communication avec l'API
    - `models/` : Interfaces ou classes pour les données
    - `guards/` : Gardes de route pour l'authentification
  - `assets/` : Ressources statiques
  - `environments/` : Configurations d'environnement

### Fonctionnalités principales

- Inscription et connexion des utilisateurs
- Affichage, création et interaction avec les posts
- Ajout et suppression de commentaires
- Pagination des posts
- Likes sur les posts

## Exécution du projet complet

1. Démarrez le serveur backend (dans le dossier `backend`) :
npm start

2. Dans un nouveau terminal, démarrez l'application frontend (dans le dossier `frontend`) :
ng serve

3. Accédez à `http://localhost:4200` dans votre navigateur.

## Tests

### Backend
Dans le dossier `backend` :
npm test

### Frontend
Dans le dossier `frontend` :
ng test

## Logging

Les logs d'erreur du backend sont enregistrés dans `backend/error.log`.