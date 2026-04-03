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
  - `Activite`
  - `Profil`
- ecrans auth poses et relies au backend :
  - login
  - register
  - forgot password
  - verification OTP
  - reset password
  - succes de creation / reinitialisation
  - ecran `Securisez votre wallet` pour definir le PIN transactionnel apres inscription
- session mobile branchee avec stockage local securise
- restauration de session au lancement
- deconnexion avec feedback visuel
- logo et assets de marque adaptes a l'identite visuelle
- generateur local d'assets via `npm run assets:brand`

## Fonctionnalites deja couvertes cote backend

- auth et session
- consultation du wallet
- historique de transactions
- transfert entre particuliers
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

- remplacer progressivement les donnees de presentation par les vraies donnees backend sur `Accueil`, `Activite`, `Scanner` et `Profil`
- integrer la camera pour le scan QR
- construire les parcours metier complets autour du wallet :
  - transfert P2P
  - demande d'argent
  - paiement marchand
  - historique detaille
  - profil / settings / langue
- ajouter la gestion complete du PIN cote mobile hors onboarding initial

## Lancer les projets

### Backend

Depuis `core`:

```bash
./mvnw spring-boot:run
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
