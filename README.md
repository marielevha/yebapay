# YebaPay

Plateforme de portefeuille electronique orientee QR code pour le Congo-Brazzaville.

## Structure du projet

- `core` : backend Spring Boot
- `apps/yebapay-customer` : application mobile Expo / React Native pour les clients
- `yebapay-admin` : backoffice d'administration, reserve pour la suite
- `yebapay-core` : dossier reserve dans le workspace

## Ce qui a ete fait

### Backend `core`

Le backend a deja une base solide pour lancer le travail mobile:

- socle Spring Boot avec Web, Security, Validation, JPA, PostgreSQL, Flyway, OpenAPI, JWT et Lombok
- structure de code organisee par domaines metier
- migrations Flyway versionnees jusqu'a `V5`
- modele de donnees principal pose avec entites JPA et repositories
- authentification operationnelle:
  - inscription
  - connexion
  - refresh token
  - logout
  - mot de passe oublie
  - OTP de reinitialisation
- wallet et ledger internes poses
- transfert P2P entre particuliers
- demande d'argent
- paiement marchand
- cash-in MVP
- QR decode / verification
- frais MVP, PIN transactionnel et premiers controles de plafond

Le backend travaille avec `XAF` comme code devise technique et expose `FCFA` comme libelle metier.

### Mobile `apps/yebapay-customer`

La partie mobile a ete preparee pour demarrer sur de bonnes bases:

- scaffold Expo initialise et renomme en `YebaPay`
- guide de marque dans `apps/yebapay-customer/BRAND_GUIDE.md`
- checklist API mobile dans `apps/yebapay-customer/MOBILE_API_CHECKLIST.md`
- theme visuel branche dans l'application
- shell Expo Router avec les onglets:
  - `Accueil`
  - `Scanner`
- premiers ecrans YebaPay poses a la place du starter Expo
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

## Ce qui reste a faire

### Backend

- cash-out / parcours agent
- notifications reelles SMS / push
- endpoints admin minimum
- remboursements, litiges et supervision avances
- antifraude et controles operationnels plus pousses

### Mobile

- brancher le client API
- brancher la session et le stockage local
- remplacer les donnees de presentation par les vraies donnees backend
- integrer la camera pour le scan QR
- construire les parcours auth, home, transfer, demande, paiement et historique

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

Pour regenerer les assets de marque:

```bash
npm run assets:brand
```

## Notes

- `apps/yebapay-customer` est l'application client
- une application agent sera developpee plus tard separement
- `yebapay-admin` n'est pas encore initialise fonctionnellement
