# Navigation Structure

Structure recommande pour `apps/yebapay-customer`.

## Principe

YebaPay n'est pas une banque mobile generique. La navigation doit rester:

- simple
- QR-first
- rapide a lire
- centree sur les actions du quotidien

## Tabs retenus

- `Accueil`
  - solde
  - actions rapides
  - resume d'activite
- `Scanner`
  - scan QR
  - paiement marchand
  - reglement d'une demande
  - affichage du QR personnel
- `Activite`
  - historique
  - recus
  - demandes en attente
- `Profil`
  - compte
  - securite
  - QR personnel
  - mode commercant

## Pourquoi cette structure

- `Transferer`, `Demander`, `Payer` et `Mon QR` sont des actions, pas des tabs.
- les mettre en tabs rendrait l'app trop lourde pour un MVP
- `Scanner` reste visible en permanence parce que c'est le geste cle de YebaPay
- `Activite` permet de regrouper l'historique et les demandes sans dupliquer les entrees
- `Profil` porte les reglages, la securite et les fonctions secondaires

## Ecrans secondaires a porter ensuite en stack

- `auth/*`
- `transfer/*`
- `money-requests/*`
- `merchant-payments/*`
- `qr/*`
- `merchant/*`

## Correspondance backend immediate

- `Accueil`
  - `GET /wallets/me`
  - `GET /auth/me`
- `Activite`
  - `GET /wallets/me/transactions`
  - `GET /money-requests/me`
- `Scanner`
  - `POST /qr/decode`
  - `POST /merchant-payments/quote`
  - `POST /merchant-payments`
  - `GET /qr/me/personal`
- `Profil`
  - `GET /auth/me`
  - `GET /qr/me/personal`
  - `GET /merchants/me/profile`
