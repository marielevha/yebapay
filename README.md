# YebaPay

Plateforme de portefeuille electronique orientee QR code pour le Congo-Brazzaville.

## Structure du projet

- `core` : backend Spring Boot
- `apps/yebapay-customer` : application mobile Expo / React Native pour les clients
- `yebapay-admin` : backoffice d'administration, reserve pour la suite
- `yebapay-core` : dossier reserve dans le workspace

## Etat actuel

### Backend `core`

Le backend dispose maintenant d'un socle transactionnel exploitable pour demarrer serieusement le mobile :

- socle Spring Boot avec Web, Security, Validation, JPA, PostgreSQL, Flyway, OpenAPI, JWT et Lombok
- structure de code organisee par domaines metier
- migrations Flyway versionnees jusqu'a `V5`
- modele de donnees principal pose avec entites JPA et repositories
- authentification operationnelle :
  - inscription
  - connexion
  - refresh token
  - logout
  - mot de passe oublie
  - OTP de reinitialisation
  - endpoint de configuration initiale du PIN transactionnel apres inscription
- wallet et ledger internes poses
- transfert P2P entre particuliers
- demande d'argent
- paiement marchand
- cash-in MVP
- QR decode / verification
- frais MVP, PIN transactionnel et premiers controles de plafond

Le backend travaille avec `XAF` comme code devise technique et expose `FCFA` comme libelle metier.

### Mobile `apps/yebapay-customer`

La partie mobile a deja quitte le simple scaffold Expo :

- scaffold Expo initialise et renomme en `YebaPay`
- guide de marque dans `apps/yebapay-customer/BRAND_GUIDE.md`
- checklist API mobile dans `apps/yebapay-customer/MOBILE_API_CHECKLIST.md`
- structure de navigation documentee dans `apps/yebapay-customer/NAVIGATION_STRUCTURE.md`
- theme visuel, tokens de marque et assets de marque branches dans l'application
- splash screen et onboarding poses
- persistance locale pour n'afficher l'onboarding qu'a la premiere utilisation
- internationalisation `fr` / `en` avec textes centralises
- shell Expo Router avec les onglets :
  - `Accueil`
  - `Scanner`
  - `Transactions`
  - `Profil`
- ecrans auth poses et relies au backend :
  - login
  - register
  - forgot password
  - verification OTP
  - reset password
  - succes de creation / reinitialisation
  - ecran `Securisez votre wallet` pour definir le PIN transactionnel apres inscription
- formulaires auth simplifies et mieux adaptes aux petits ecrans
- messages d'erreur auth plus clairs, localises et orientes utilisateur
- session mobile branchee avec stockage local securise
- restauration de session au lancement
- deconnexion avec feedback visuel
- logo et assets de marque adaptes a l'identite visuelle
- generateur local d'assets via `npm run assets:brand`
- `Accueil` reprise de zero avec :
  - top bar fixe partage
  - cards wallet reelles, scrollables horizontalement si le user a plusieurs wallets
  - affichage du solde reel par wallet
  - 10 dernieres transactions branchees au backend
- page `Transactions` reprise de zero avec :
  - top bar fixe
  - filtre par wallet
  - filtre par type de transaction
  - timeline infinie par lots de 10
  - pull-to-refresh
  - affichage date + heure sur les cartes
- page detail transaction ajoutee avec :
  - endpoint backend dedie
  - recu detaille
  - partage d'un recu image brandee
- parcours `Transfert` branche de bout en bout :
  - choix du beneficiaire depuis les recents ou la liste complete
  - ajout manuel d'un beneficiaire
  - scan QR pour remplir un wallet destinataire
  - etape montant avec motif optionnel
  - calcul des frais et verification en direct du solde disponible
  - ecran de verification avant PIN
  - validation par PIN transactionnel
  - ecran succes avec recu simplifie
- experience `Accueil` et chargements renforces :
  - transactions de la home filtrees par le wallet courant du carousel
  - pull-to-refresh sur la home
  - hooks de chargement stabilises pour eviter les boucles de refetch
  - refresh de session mobile serialize pour eviter les conflits de tokens
  - QR personnel du wallet principal affichable depuis la home pour etre scanne comme beneficiaire
- parcours `Demande d'argent` branche :
  - choix du wallet de reception
  - creation de demande avec montant et note
  - ecran de partage QR simplifie
  - paiement d'une demande apres scan QR
  - review, choix du wallet source, saisie PIN et succes
- experience `Scanner` reprise avec :
  - camera QR reelle
  - cadre de scan anime
  - import d'un QR depuis la galerie
  - permission camera simplifiee
  - detection explicite des QR non YebaPay
- support backend ajoute pour la pagination et le filtrage des transactions :
  - `page`
  - `size`
  - `walletId`
  - `transactionType`

### Travaux de la branche `feat/customer-p2p-transfer`

Cette branche a fait passer le projet d'un socle wallet/auth a un premier parcours P2P vraiment exploitable sur mobile :

- backend :
  - migration `V6__add_beneficiaries.sql`
  - module `beneficiary` ajoute avec persistance, listing, recherche et reusage apres transfert reussi
  - support du `description` / motif sur le quote et l'execution des transferts P2P
  - endpoints distincts pour la `home` et l'historique complet des transactions
  - filtre de trace HTTP en terminal pour suivre les requetes entrantes
  - corrections sur les filtres optionnels et la recherche beneficiaries cote PostgreSQL
- mobile :
  - nouveau domaine `transfer` avec provider, API, types, erreurs et ecrans dedies
  - nouveau domaine `beneficiaries` pour recents, liste complete et ajout
  - support QR cote transfert pour remplir rapidement un wallet destinataire
  - revue des ecrans `recipient`, `amount`, `confirm`, `pin` et `success` avec une structure plus simple
  - verification visuelle du solde insuffisant pendant la saisie du montant a partir du `quote`
  - i18n et messages utilisateur etendus pour tout le parcours

### Travaux de la branche `feat/customer-scan-pay`

Cette branche a transforme le scanner en point d'entree reel du paiement QR et a boucle le reglement des demandes d'argent :

- backend :
  - support du `sourceWalletId` sur le quote et le paiement final d'une demande d'argent
  - ajout d'un marqueur d'emission sur les QR YebaPay pour distinguer les QR externes
  - validation plus explicite des QR non emis par YebaPay
- mobile :
  - refonte complete de l'ecran `Scanner` avec camera, animation, galerie et top bar adaptee a un onglet
  - redirection d'un QR `request` vers un ecran de validation inspire du detail transaction
  - choix du wallet source si le payeur en possede plusieurs
  - ecran PIN simplifie en 4 chiffres type OTP
  - ecran succes de reglement refait sans logique de card
  - navigation vers le detail transaction apres paiement avec retour propre vers l'onglet `Transactions`
  - modal QR du wallet perso accessible depuis la home pour faciliter l'ajout de beneficiaire

## Fonctionnalites deja couvertes cote backend

- auth et session
- consultation du wallet
- historique de transactions
- transfert entre particuliers
- gestion des beneficiaires recents
- demande d'argent
- paiement chez un commercant
- cash-in MVP
- QR personnel / QR marchand / decodage QR
- configuration du PIN transactionnel apres inscription

## Ce qui reste a faire

### Backend

- cash-out / parcours agent
- notifications reelles SMS / push
- endpoints admin minimum
- remboursements, litiges et supervision avances
- antifraude et controles operationnels plus pousses

### Mobile

- poursuivre le branchement backend reel sur `Profil`
- construire les parcours metier complets autour du wallet :
  - paiement marchand via QR statique / dynamique
  - historique des demandes d'argent
  - profil / settings / langue
- ajouter la gestion complete du PIN cote mobile hors onboarding initial

## Lancer les projets

### Backend

Depuis `core`:

```bash
./mvnw spring-boot:run
```

Pour un redemarrage automatique du backend quand un fichier dans `core/src/main` ou `core/pom.xml` change:

```bash
./scripts/dev-watch.sh
```

### Mobile customer

Depuis `apps/yebapay-customer`:

```bash
npm install
npx expo start
```

Configurer l'URL backend dans `apps/yebapay-customer/.env` :

```env
EXPO_PUBLIC_API_BASE_URL=http://<ip-locale>:9999/api/v1
```

Pour regenerer les assets de marque:

```bash
npm run assets:brand
```

## Notes

- `apps/yebapay-customer` est l'application client
- une application agent sera developpee plus tard separement
- `yebapay-admin` n'est pas encore initialise fonctionnellement
