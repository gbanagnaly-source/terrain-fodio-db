# FODIO TERRAIN BESSIKOI - Déploiement Render

## 📋 Contenu de ce dossier

Ce dossier contient tous les fichiers nécessaires pour déployer l'application sur Render.

## 🚀 Instructions de Déploiement

### Étape 1: Créer un compte Render

1. Allez sur https://render.com
2. Cliquez "Get Started for Free"
3. Connectez-vous avec GitHub

### Étape 2: Créer la Base de Données PostgreSQL

1. Dashboard → **New** → **PostgreSQL**
2. Configuration:
   - **Name:** fodio-terrain-db
   - **Region:** Frankfurt (ou Oregon)
   - **PostgreSQL Version:** 15
   - **Plan:** Free
3. Cliquez **Create Database**
4. **⚠️ COPIEZ l'URL "Internal Database URL"**

### Étape 3: Créer le Web Service

1. Dashboard → **New** → **Web Service**
2. Connectez votre repository GitHub (poussez ce dossier sur GitHub)
3. Configuration:

| Champ | Valeur |
|-------|--------|
| Name | fodio-terrain |
| Region | Frankfurt (même région que la DB) |
| Branch | main |
| Runtime | Node |
| Build Command | `npm install && npx prisma generate && npx prisma db push && npm run build` |
| Start Command | `npm run start` |
| Plan | Free |

### Étape 4: Variables d'Environnement

Cliquez **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| DATABASE_URL | *(collez l'URL de l'étape 2)* |
| DIRECT_DATABASE_URL | *(même URL)* |
| NODE_ENV | production |

### Étape 5: Déployer

1. Cliquez **Create Web Service**
2. Attendez 5-10 minutes
3. Votre app sera sur: `https://fodio-terrain.onrender.com`

---

## 📁 Structure des Fichiers

```
render-deploy/
├── prisma/
│   └── schema.prisma      # Modèle PostgreSQL
├── src/
│   ├── app/               # Pages et API Next.js
│   ├── components/        # Composants UI
│   ├── contexts/          # Contextes React
│   └── lib/               # Utilitaires
├── package.json           # Dépendances
├── render.yaml            # Config Render Blueprint
├── next.config.ts         # Config Next.js
├── tailwind.config.ts     # Config Tailwind
├── tsconfig.json          # Config TypeScript
└── README.md              # Ce fichier
```

---

## ⚠️ Limites du Plan Gratuit

| Ressource | Limite |
|-----------|--------|
| Heures/mois | 750h |
| Base de données | 90 jours gratuits |
| RAM | 512MB |
| Bande passante | 100GB/mois |

---

## 📥 Après le Déploiement

1. Allez sur votre application
2. Cliquez ⚙️ Paramètres
3. Onglet Import
4. Sélectionnez votre fichier Excel
5. Cliquez "Importer les données"

---

## 🔧 Dépannage

### Build Failed
- Vérifiez que les variables DATABASE_URL sont correctes
- Vérifiez que la région Web Service = région DB

### Database Connection Error
- Attendez que la DB soit "Available"
- Vérifiez l'URL de connexion

### Application Error
- Consultez les logs sur Render Dashboard
- Vérifiez les migrations Prisma
