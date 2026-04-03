# YebaPay Customer

Application mobile Expo / React Native pour les parcours client YebaPay.

## Ce qui est en place

- une base de marque dans `BRAND_GUIDE.md`
- des tokens visuels dans `constants/brand.ts`
- un theme mobile dans `constants/theme.ts`
- des assets de marque generes dans `assets/`
- un splash screen et un onboarding
- i18n `fr` / `en`
- persistance locale pour ne plus rejouer l'onboarding apres la premiere utilisation
- un shell Expo Router avec quatre onglets :
  - `Accueil`
  - `Scanner`
  - `Activite`
  - `Profil`
- un flux auth complet :
  - login
  - register
  - forgot password
  - verification OTP
  - reset password
  - succes auth
  - ecran `Securisez votre wallet`
- une session branchee au backend avec stockage local securise
- logout avec feedback visuel

## Flux backend deja branchables

- authentification et session
- consultation wallet et historique
- transfert P2P
- demande d'argent
- paiement marchand
- QR decode / verification
- configuration initiale du PIN transactionnel

Le detail des contrats a consommer est documente dans `MOBILE_API_CHECKLIST.md`.

## Lancer l'app

```bash
npm install
npx expo start
```

Definir aussi `EXPO_PUBLIC_API_BASE_URL` dans `.env` pour pointer vers le backend local.

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

- remplacer les donnees de presentation par des vraies reponses backend
- integrer la camera pour le scan QR
- brancher les parcours metier complets autour du wallet
- ajouter un vrai ecran settings avec choix de langue
