# CTA Command Center v4.1 — Setup

## 1. Initialisation du projet

```bash
npm create vite@latest cta-command-center -- --template react
cd cta-command-center
```

## 2. Installation des dépendances

```bash
npm install react-router-dom @supabase/supabase-js lucide-react

npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. Structure des fichiers

```
cta-command-center/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── GlassCard.jsx
│   │   ├── Button.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── ui/
│   │       ├── Label.jsx
│   │       ├── Pill.jsx
│   │       ├── Spinner.jsx
│   │       └── PriceRow.jsx
│   ├── pages/
│   │   ├── ClientTerminal.jsx
│   │   ├── AgentTerminal.jsx
│   │   └── TrackingTerminal.jsx
│   ├── utils/
│   │   ├── pricing.js
│   │   ├── mission.js
│   │   └── supabase.js
│   ├── hooks/
│   │   └── useMission.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

## 4. Variables d'environnement

Créer `.env.local` :
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## 5. Déploiement Vercel

```bash
npm run build
vercel --prod
```
