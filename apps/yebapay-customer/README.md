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
  - `Transactions`
  - `Profil`
- un flux auth complet :
  - login
  - register
  - forgot password
  - verification OTP
  - reset password
  - succes auth
  - ecran `Securisez votre wallet`
- des ecrans auth simplifies et adaptes aux petits ecrans
- des messages d'erreur auth plus lisibles et localises
- une session branchee au backend avec stockage local securise
- logout avec feedback visuel
- une `home` refaite avec :
  - top bar fixe partage
  - wallets reels du backend
  - carousel horizontal si plusieurs wallets
  - solde reel sur chaque card
  - 10 dernieres transactions
- une page `Transactions` refaite avec :
  - filtre wallet
  - filtre type
  - timeline continue avec infinite scroll
  - pull-to-refresh
  - date + heure sur les items

## Flux backend deja branchables

- authentification et session
- consultation wallet et historique
- historique pagine avec filtres `page`, `size`, `walletId`, `transactionType`
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

- poursuivre le branchement backend sur `Scanner` et `Profil`
- integrer la camera pour le scan QR
- brancher les parcours metier complets autour du wallet
- ajouter un vrai ecran settings avec choix de langue
