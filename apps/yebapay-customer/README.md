# YebaPay Customer

Application mobile Expo / React Native pour les parcours client YebaPay.

## Ce qu'on a pose

- une base de marque dans `BRAND_GUIDE.md`
- des tokens visuels dans `constants/brand.ts`
- un theme mobile dans `constants/theme.ts`
- un shell Expo Router avec deux onglets:
  - `Accueil`
  - `Scanner`

## Flux backend deja branchables

- authentification et session
- consultation wallet et historique
- transfert P2P
- demande d'argent
- paiement marchand
- QR decode / verification

Le detail des contrats a consommer est documente dans `MOBILE_API_CHECKLIST.md`.

## Lancer l'app

```bash
npm install
npx expo start
```

## Regenerer les assets de marque

```bash
npm run assets:brand
```

Cette commande regenera les fichiers suivants dans `assets/`:

- `icon.png`
- `splash-icon.png`
- `android-icon-*`
- `favicon.png`
- les visuels de marque additionnels

## Prochaines etapes cote mobile

- brancher l'API client et la gestion de session
- remplacer les donnees de presentation par des vraies reponses backend
- integrer la camera pour le scan QR
- affiner les variantes d'assets si le logo evolue
