# YebaPay Mobile - Checklist de branchement backend

Ce document fige le contrat de branchement actuel entre `yebapay-customer` et `core`.

Base URL backend:

```text
/api/v1
```

Authentification:

- Toutes les routes hors `auth/register`, `auth/login`, `auth/refresh`, `auth/logout`, `auth/forgot-password/**` nécessitent `Authorization: Bearer <accessToken>`.
- Les réponses métier utilisent `XAF` comme code technique et `FCFA` comme libellé d'affichage.

## 1. Ecrans mobile branchables immédiatement

### Auth

- `Splash / restore session`
  - `POST /auth/refresh`
  - `GET /auth/me`
- `Connexion`
  - `POST /auth/login`
- `Inscription`
  - `POST /auth/register`
- `Mot de passe oublié`
  - `POST /auth/forgot-password/request-otp`
  - `POST /auth/forgot-password/verify-otp`
  - `POST /auth/forgot-password/reset`

### Wallet / accueil

- `Home / solde`
  - `GET /wallets/me`
- `Profil courant`
  - `GET /auth/me`
- `Historique`
  - `GET /wallets/me/transactions`

### Transfert P2P

- `Devis transfert`
  - `POST /transfers/p2p/quote`
- `Confirmation transfert`
  - `POST /transfers/p2p`

### Demande d'argent

- `Créer une demande`
  - `POST /money-requests`
- `Lister mes demandes`
  - `GET /money-requests/me`
- `Accepter une demande`
  - `POST /money-requests/{requestRef}/accept`
- `Refuser une demande`
  - `POST /money-requests/{requestRef}/decline`
- `Annuler une demande`
  - `POST /money-requests/{requestRef}/cancel`

### QR / paiement marchand

- `Afficher mon QR personnel`
  - `GET /qr/me/personal`
- `Décoder un QR scanné`
  - `POST /qr/decode`
- `Devis paiement marchand`
  - `POST /merchant-payments/quote`
- `Payer un marchand`
  - `POST /merchant-payments`

### Marchand

- `Créer / éditer profil marchand`
  - `POST /merchants/me/profile`
- `Voir profil marchand`
  - `GET /merchants/me/profile`
- `Générer QR statique marchand`
  - `POST /merchants/me/static-qr`

### Cash-in

- `Devis cash-in`
  - `POST /cash-operations/cash-in/quote`
- `Exécuter cash-in`
  - `POST /cash-operations/cash-in`

Note:
- Le `cash-in` fonctionne backend, mais côté produit mobile grand public il reste plutôt un flux de démo/MVP tant que la vraie logique agent/cash-point n'est pas terminée.

## 2. Payloads minimums à utiliser

### Auth

`POST /auth/register`

```json
{
  "phoneNumber": "242060123456",
  "password": "Secret123",
  "pin": "1234",
  "email": "user@example.com",
  "firstName": "Maeva",
  "lastName": "Ngoma"
}
```

`POST /auth/login`

```json
{
  "phoneNumber": "242060123456",
  "password": "Secret123"
}
```

`POST /auth/refresh`

```json
{
  "refreshToken": "..."
}
```

`POST /auth/forgot-password/request-otp`

```json
{
  "phoneNumber": "242060123456"
}
```

`POST /auth/forgot-password/verify-otp`

```json
{
  "phoneNumber": "242060123456",
  "otpCode": "123456"
}
```

`POST /auth/forgot-password/reset`

```json
{
  "resetToken": "...",
  "newPassword": "Secret456"
}
```

### P2P

`POST /transfers/p2p/quote`

```json
{
  "destinationPhoneNumber": "242060654321",
  "amount": 1000,
  "description": "Envoi"
}
```

`POST /transfers/p2p`

```json
{
  "destinationPhoneNumber": "242060654321",
  "amount": 1000,
  "idempotencyKey": "p2p-uuid-ou-ref-unique",
  "pin": "1234",
  "description": "Envoi"
}
```

### Demande d'argent

`POST /money-requests`

```json
{
  "payerPhoneNumber": "242060654321",
  "amount": 1500,
  "reason": "Remboursement",
  "expiresInMinutes": 120
}
```

`POST /money-requests/{requestRef}/accept`

```json
{
  "amount": 1500,
  "idempotencyKey": "money-request-accept-unique",
  "pin": "1234",
  "description": "Paiement demande"
}
```

### QR / paiement marchand

`POST /qr/decode`

```json
{
  "qrData": "signedPayload-ou-qrRef"
}
```

`POST /merchant-payments/quote`

```json
{
  "qrData": "signedPayload-ou-qrRef",
  "amount": 500,
  "description": "Paiement marchand"
}
```

`POST /merchant-payments`

```json
{
  "qrData": "signedPayload-ou-qrRef",
  "amount": 500,
  "idempotencyKey": "merchant-payment-unique",
  "pin": "1234",
  "description": "Paiement marchand"
}
```

### Marchand

`POST /merchants/me/profile`

```json
{
  "businessName": "Chez Maeva",
  "displayName": "Chez Maeva",
  "merchantCategoryCode": "RETAIL",
  "addressLine1": "Centre-ville",
  "city": "Brazzaville"
}
```

### Cash-in

`POST /cash-operations/cash-in/quote`

```json
{
  "amount": 10000,
  "targetPhoneNumber": "242060654321"
}
```

`POST /cash-operations/cash-in`

```json
{
  "amount": 10000,
  "targetPhoneNumber": "242060654321",
  "idempotencyKey": "cashin-unique",
  "pin": "1234",
  "description": "Cash in"
}
```

## 3. Réponses importantes à exploiter côté mobile

### Session

`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`

Champs clés:

- `accessToken`
- `refreshToken`
- `tokenType`
- `expiresInSeconds`
- `refreshTokenExpiresInSeconds`
- `user`

### User courant

`GET /auth/me`

Champs clés:

- `id`
- `publicId`
- `phoneNumber`
- `email`
- `displayName`
- `status`
- `kycLevel`
- `roles`
- `merchantProfileId`
- `agentProfileId`
- `wallets[]`

### Wallets

`GET /wallets/me`

Champs clés:

- `walletNumber`
- `walletType`
- `availableBalance`
- `ledgerBalance`
- `dailyLimit`
- `monthlyLimit`
- `currencyCode`
- `currencyDisplayCode`
- `currencyDisplayName`

### Historique

`GET /wallets/me/transactions`

Champs clés:

- `transactionRef`
- `transactionType`
- `status`
- `direction`
- `amount`
- `feeAmount`
- `netAmount`
- `counterpartyDisplayName`
- `counterpartyPhoneNumber`
- `initiatedAt`
- `completedAt`

### QR

`GET /qr/me/personal`, `POST /merchants/me/static-qr`, `POST /money-requests`

Champs clés de `qr`:

- `qrRef`
- `qrType`
- `signedPayload`
- `walletNumber`
- `amount`
- `currencyDisplayCode`
- `singleUse`
- `expiresAt`

### Décodage QR

`POST /qr/decode`

Champs clés:

- `qrType`
- `merchantCode`
- `merchantDisplayName`
- `beneficiaryDisplayName`
- `moneyRequestRef`
- `walletNumber`
- `amount`
- `currencyDisplayCode`
- `expiresAt`

## 4. Checklist d'écrans Expo à créer maintenant

### Flux particulier

- `Splash / session restore`
- `Login`
- `Register`
- `Forgot password - phone`
- `Forgot password - OTP`
- `Forgot password - new password`
- `Home wallet`
- `Transaction history`
- `Transfer quote`
- `Transfer confirm`
- `Transfer success / failure`
- `Request money create`
- `Request money list`
- `Request money detail / action`
- `Scan QR`
- `Decoded QR summary`
- `Merchant payment quote`
- `Merchant payment confirm`
- `Merchant payment success / failure`
- `My personal QR`

### Flux commerçant

- `Merchant onboarding/profile`
- `Merchant dashboard basic`
- `Merchant static QR`
- `Merchant wallet / encaissements`

### Flux cash-in MVP

- `Cash-in quote`
- `Cash-in confirm`
- `Cash-in success / failure`

## 5. Ce qui n'est pas encore prêt pour le mobile final

- `cash-out` / retrait agent
- flux agent complets
- notifications push réelles
- vraie API SMS
- litiges / remboursements complets
- admin/backoffice mobile ou support
- antifraude avancée
- KYC métier complet

## 6. Recommandation de démarrage mobile

Ordre conseillé pour `yebapay-mobile`:

1. auth + restore session
2. home + wallets + history
3. P2P transfer
4. request money
5. scan QR + decode
6. merchant payment
7. personal QR
8. merchant flow
9. cash-in MVP

## 7. Référence backend

Contrats exposés par:

- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/identity/auth/AuthController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/wallet/WalletController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/transaction/TransferController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/transaction/MoneyRequestController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/transaction/MerchantPaymentController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/transaction/CashInController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/merchant/MerchantController.java`
- `/home/ssdlv/Documents/projects/yebapay/core/src/main/java/com/yebapay/core/qr/QrController.java`
