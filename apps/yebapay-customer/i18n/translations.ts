export const supportedLanguages = ['fr', 'en'] as const;

export type LanguageCode = (typeof supportedLanguages)[number];

export const translations = {
  fr: {
    common: {
      mvp: 'MVP',
      walletQr: 'Wallet QR',
      account: 'Compte',
      continue: 'Continuer',
      getStarted: 'Commencer',
      login: 'Se connecter',
      register: "S'inscrire",
      save: 'Enregistrer',
      resend: 'Renvoyer',
      done: 'Terminer',
      ordinaryAccount: 'Compte ordinaire',
      available: 'Disponible',
      active: 'Actif',
      today: "Aujourd'hui",
      pending: 'En attente',
      returnHome: "Retour a l'accueil",
    },
    brand: {
      slogan: "Scanne. Paye. C'est regle.",
      productLine: 'Le wallet QR du quotidien.',
      splashSubtitle: 'Paiement, transfert et QR dans une experience plus simple.',
    },
    modal: {
      close: "Retour a l'accueil",
    },
    onboarding: {
      slides: {
        pay: {
          title: 'Payer le quotidien en un scan.',
          description:
            'Chez le marchand ou dans les paiements de proximite, Yeba Pay rend le geste plus direct et plus lisible.',
        },
        money: {
          title: 'Transferer et demander sans confusion.',
          description:
            'Montant, frais et confirmation restent visibles avant validation, pour une experience plus rassurante.',
        },
        qr: {
          title: 'Un wallet QR pense pour la vraie vie.',
          description:
            'QR personnel, paiement marchand et historique clair dans une app simple a prendre en main.',
        },
      },
    },
    auth: {
      login: {
        title: 'Bon retour',
        footerPrompt: 'Pas encore de compte ?',
        footerCta: "S'inscrire",
        forgotPassword: 'Mot de passe oublie ?',
        submit: 'Se connecter',
      },
      register: {
        title: 'Creer un compte',
        footerPrompt: 'Vous avez deja un compte ?',
        footerCta: 'Se connecter',
        submit: 'Creer mon compte',
      },
      secureWallet: {
        title: 'Securisez votre wallet',
        subtitle: 'Ajoutez un PIN pour confirmer les paiements, transferts et operations sensibles.',
        note: "Ce PIN servira au moment de bouger de l'argent. Vous pourrez le gerer plus tard dans votre espace securite.",
        submit: 'Activer mon PIN',
        skip: 'Je le ferai plus tard',
        footerPrompt: 'Vous preferez continuer sans PIN pour le moment ?',
        footerCta: 'Passer',
      },
      forgotPassword: {
        title: 'Mot de passe oublie',
        footerPrompt: 'Vous vous souvenez de votre mot de passe ?',
        footerCta: 'Se connecter',
        submit: 'Recevoir le code',
      },
      verifyOtp: {
        title: 'Verifier le code',
        footerPrompt: "Le code n'est pas arrive ?",
        footerCta: 'Renvoyer',
        submit: 'Valider le code',
        back: "Revenir a l'etape precedente",
      },
      resetPassword: {
        title: 'Nouveau mot de passe',
        footerPrompt: 'Vous preferez revenir a la connexion ?',
        footerCta: 'Retour login',
        submit: 'Enregistrer',
      },
      success: {
        accountCreated: {
          title: 'Compte cree',
          description: 'Votre compte est pret. Ouvrez votre espace pour commencer.',
          button: 'Continuer',
        },
        passwordReset: {
          title: 'Mot de passe mis a jour',
          description: 'La reinitialisation est terminee. Vous pouvez vous reconnecter.',
          button: 'Retour a la connexion',
        },
      },
      status: {
        signingIn: 'Connexion...',
        creatingAccount: 'Creation du compte...',
        savingPin: 'Activation du PIN...',
        requestingCode: 'Envoi du code...',
        verifyingCode: 'Verification du code...',
        savingPassword: 'Mise a jour...',
      },
      messages: {
        otpResent: 'Un nouveau code a ete envoye.',
      },
      errors: {
        generic: 'Une erreur est survenue. Reessayez.',
        network: 'Impossible de joindre le serveur. Verifiez votre connexion.',
        server: 'Le service est temporairement indisponible. Reessayez dans un instant.',
        tooManyAttempts: 'Trop de tentatives. Patientez un instant avant de reessayer.',
        sessionExpired: 'Votre session a expire. Reconnectez-vous pour continuer.',
        pinMismatch: 'Les deux PIN ne correspondent pas.',
        login: {
          invalidCredentials: 'Numero de telephone ou mot de passe incorrect.',
          accountInactive: "Ce compte n'est pas actif. Contactez le support si besoin.",
          accountLocked: 'Ce compte est temporairement verrouille. Reessayez plus tard.',
        },
        register: {
          phoneAlreadyRegistered: 'Ce numero est deja utilise par un autre compte.',
          emailAlreadyRegistered: 'Cette adresse email est deja utilisee.',
          invalidData: 'Certaines informations sont invalides. Verifiez le formulaire.',
        },
        forgotPassword: {
          invalidPhone: 'Entrez un numero de telephone valide pour recevoir le code.',
        },
        verifyOtp: {
          invalidCode: 'Le code saisi est invalide ou a expire.',
        },
        resetPassword: {
          invalidToken: 'Le lien ou la session de reinitialisation a expire. Recommencez la procedure.',
          invalidPassword: 'Le nouveau mot de passe ne peut pas etre utilise tel quel.',
        },
        secureWallet: {
          pinAlreadyConfigured: 'Un PIN transactionnel existe deja pour ce compte.',
          invalidPin: 'Le PIN doit etre valide avant de pouvoir continuer.',
        },
      },
      fields: {
        firstName: 'Prenom',
        firstNamePlaceholder: 'Maeva',
        lastName: 'Nom',
        lastNamePlaceholder: 'Ngoma',
        phoneNumber: 'Numero de telephone',
        phoneNumberPlaceholder: '242060123456',
        email: 'Email',
        emailPlaceholder: 'vous@example.com',
        password: 'Mot de passe',
        passwordPlaceholder: 'Votre mot de passe',
        newPassword: 'Nouveau mot de passe',
        newPasswordPlaceholder: 'Votre nouveau mot de passe',
        confirmPassword: 'Confirmer le mot de passe',
        confirmPasswordPlaceholder: 'Confirmez le mot de passe',
        transactionPin: 'PIN transactionnel',
        transactionPinPlaceholder: '4 chiffres',
        confirmTransactionPin: 'Confirmer le PIN',
        confirmTransactionPinPlaceholder: 'Saisissez a nouveau le PIN',
        otpCode: 'Code OTP',
      },
    },
    tabs: {
      home: 'Accueil',
      scanner: 'Scanner',
      transactions: 'Transactions',
      profile: 'Profil',
    },
    home: {
      header: {
        eyebrow: 'Bon retour',
      },
      wallets: {
        retry: 'Reessayer',
        empty: 'Aucun wallet disponible pour le moment.',
        messages: {
          loading: 'Chargement des wallets...',
          genericError: 'Impossible de charger les wallets.',
          networkError: 'Connexion impossible. Reessayez.',
        },
        types: {
          personal: 'Wallet principal',
          merchant: 'Wallet marchand',
          agent: 'Wallet agent',
          system: 'Wallet systeme',
        },
      },
      actions: {
        scanPay: 'Scan & Pay',
        topUp: 'Recharger',
        request: 'Demander',
        transfer: 'Transferer',
      },
      transactions: {
        title: 'Transactions',
        seeAll: 'Tout voir',
        retry: 'Reessayer',
        empty: 'Aucune transaction recente pour le moment.',
        messages: {
          loading: 'Chargement des transactions...',
          genericError: 'Impossible de charger les transactions.',
          networkError: 'Connexion impossible. Reessayez.',
        },
        types: {
          p2pTransferOut: 'Transfert envoye',
          p2pTransferIn: 'Transfert recu',
          merchantPayment: 'Paiement marchand',
          cashIn: 'Rechargement wallet',
          cashOut: 'Retrait',
          moneyRequest: "Demande d'argent",
          refund: 'Remboursement',
          adminAdjustment: 'Ajustement',
        },
        items: {
          market: {
            title: 'Epicerie Mbolo',
            subtitle: 'Paiement marchand',
            amount: '-12 500 FCFA',
            time: '09:39',
          },
          philip: {
            title: 'Philip',
            subtitle: 'Transfert recu',
            amount: '+8 000 FCFA',
            time: '08:52',
          },
          cashIn: {
            title: 'Rechargement wallet',
            subtitle: 'Cash-in agent',
            amount: '+20 000 FCFA',
            time: 'Hier',
          },
        },
      },
    },
    scanner: {
      hero: {
        eyebrow: 'Onglet scanner',
        title: "Le QR devient le point d'entree.",
        description:
          "{{brandName}} s'appuie sur des parcours QR lisibles: paiement marchand, demande d'argent et reception.",
        highlights: {
          personal: 'QR personnel et marchand',
          verification: 'Verification cote backend',
          signature: 'Signature et statut du QR',
          payments: 'Paiement marchand et P2P',
        },
      },
      journeys: {
        title: 'Parcours a exposer ici',
        subtitle: 'Fondes sur le backend actuel',
        merchant: {
          title: 'Payer un commercant',
          description: 'Scanner un QR marchand, verifier le montant et confirmer avec le PIN.',
        },
        request: {
          title: "Regler une demande d'argent",
          description: "Accepter une demande envoyee par un autre user et payer depuis le wallet.",
        },
        personalQr: {
          title: 'Afficher mon QR',
          description: 'Partager un QR personnel pour recevoir un transfert rapidement.',
        },
      },
      camera: {
        sectionTitle: 'Etape camera',
        cardTitle: 'Prochaine integration',
        description: "Brancher Expo Camera pour scanner, decoder, puis router vers paiement marchand ou demande d'argent.",
      },
      trust: {
        title: 'Regles de confiance',
        verify: 'Toujours verifier le nom et le montant avant confirmation.',
        expired: 'Ne jamais valider un QR expire ou deja utilise.',
        pin: 'Reconfirmer les operations sensibles avec le PIN transactionnel.',
      },
    },
    transactionsPage: {
      topBar: {
        eyebrow: 'Historique du wallet',
      },
      retry: 'Reessayer',
      header: {
        title: 'Transactions',
        description: 'Retrouvez ici vos paiements, transferts et mouvements wallet dans une seule liste claire.',
      },
      summary: {
        title: 'Historique du wallet',
        subtitle: '{{count}} operation(s) disponible(s)',
      },
      filters: {
        walletLabel: 'Wallet',
        walletTitle: 'Choisir un wallet',
        allWallets: 'Tous les wallets',
        typeLabel: 'Type',
        typeTitle: 'Choisir un type',
        allTypes: 'Tous les types',
      },
      messages: {
        loading: 'Chargement des transactions...',
        loadingMore: 'Chargement de la suite...',
        genericError: 'Impossible de charger les transactions.',
        networkError: 'Connexion impossible. Reessayez.',
        endReached: 'Fin de la timeline.',
      },
      emptyFiltered: 'Aucune transaction ne correspond aux filtres selectionnes.',
    },
    profile: {
      hero: {
        eyebrow: 'Mon compte',
        kycLevel: 'KYC niveau 1',
        walletStatus: 'Wallet actif',
      },
      security: {
        title: 'Compte et securite',
        subtitle: 'Base deja supportee dans le backend',
        pin: {
          title: 'PIN transactionnel',
          subtitle: 'Valider les paiements sensibles avec un code court.',
        },
        password: {
          title: 'Mot de passe',
          subtitle: 'Login, refresh token et reset OTP sont deja supportes backend.',
        },
        personalQr: {
          title: 'Mon QR personnel',
          subtitle: 'Afficher ou partager mon QR pour recevoir un paiement.',
        },
      },
      structure: {
        title: 'Structure recommandee',
        subtitle: 'Un profil simple, pratique et rassurant',
        personalInfo: {
          title: 'Infos personnelles',
          subtitle: 'GET /auth/me',
        },
        merchantMode: {
          title: 'Mode commercant',
          subtitle: 'Profil marchand et QR statique quand active.',
        },
        support: {
          title: 'Support et aide',
          subtitle: 'Canal a relier plus tard au support Yeba Pay.',
        },
      },
      note: {
        title: 'Pourquoi pas un tab marchand distinct',
        description:
          'Dans le MVP customer, le profil marchand peut rester un mode secondaire depuis le compte. Les actions frequentes restent sur Accueil et Scanner.',
      },
      actions: {
        logout: 'Se deconnecter',
        loggingOut: 'Deconnexion...',
      },
    },
  },
  en: {
    common: {
      mvp: 'MVP',
      walletQr: 'QR wallet',
      account: 'Account',
      continue: 'Continue',
      getStarted: 'Get started',
      login: 'Sign in',
      register: 'Sign up',
      save: 'Save',
      resend: 'Resend',
      done: 'Done',
      ordinaryAccount: 'Primary account',
      available: 'Available',
      active: 'Active',
      today: 'Today',
      pending: 'Pending',
      returnHome: 'Back to home',
    },
    brand: {
      slogan: 'Scan. Pay. Done.',
      productLine: 'The everyday QR wallet.',
      splashSubtitle: 'Payments, transfers and QR in a simpler experience.',
    },
    modal: {
      close: 'Back to home',
    },
    onboarding: {
      slides: {
        pay: {
          title: 'Pay everyday life in one scan.',
          description:
            'At the merchant counter or in close-range payments, Yeba Pay makes the gesture more direct and easier to read.',
        },
        money: {
          title: 'Send and request money without confusion.',
          description:
            'Amount, fees and confirmation stay visible before validation for a more reassuring experience.',
        },
        qr: {
          title: 'A QR wallet built for real life.',
          description:
            'Personal QR, merchant payment and clear history inside an app that is easy to learn.',
        },
      },
    },
    auth: {
      login: {
        title: 'Welcome back',
        footerPrompt: "Don't have an account?",
        footerCta: 'Sign up',
        forgotPassword: 'Forgot password?',
        submit: 'Sign in',
      },
      register: {
        title: 'Create an account',
        footerPrompt: 'Already have an account?',
        footerCta: 'Sign in',
        submit: 'Create my account',
      },
      secureWallet: {
        title: 'Secure your wallet',
        subtitle: 'Add a PIN to confirm payments, transfers, and sensitive money actions.',
        note: 'This PIN will be requested when moving money. You can manage it later from your security settings.',
        submit: 'Enable my PIN',
        skip: "I'll do it later",
        footerPrompt: 'Prefer to continue without a PIN for now?',
        footerCta: 'Skip',
      },
      forgotPassword: {
        title: 'Forgot password',
        footerPrompt: 'Do you remember your password?',
        footerCta: 'Sign in',
        submit: 'Receive code',
      },
      verifyOtp: {
        title: 'Verify code',
        footerPrompt: "Didn't receive the code?",
        footerCta: 'Resend',
        submit: 'Verify code',
        back: 'Go back to previous step',
      },
      resetPassword: {
        title: 'New password',
        footerPrompt: 'Prefer to go back to login?',
        footerCta: 'Back to login',
        submit: 'Save',
      },
      success: {
        accountCreated: {
          title: 'Account created',
          description: 'Your account is ready. Open your space to get started.',
          button: 'Continue',
        },
        passwordReset: {
          title: 'Password updated',
          description: 'Reset is complete. You can sign in again now.',
          button: 'Back to sign in',
        },
      },
      status: {
        signingIn: 'Signing in...',
        creatingAccount: 'Creating account...',
        savingPin: 'Enabling PIN...',
        requestingCode: 'Sending code...',
        verifyingCode: 'Verifying code...',
        savingPassword: 'Updating password...',
      },
      messages: {
        otpResent: 'A new code has been sent.',
      },
      errors: {
        generic: 'Something went wrong. Please try again.',
        network: 'Unable to reach the server. Check your connection.',
        server: 'The service is temporarily unavailable. Please try again shortly.',
        tooManyAttempts: 'Too many attempts. Please wait a moment before trying again.',
        sessionExpired: 'Your session has expired. Sign in again to continue.',
        pinMismatch: 'The two PIN codes do not match.',
        login: {
          invalidCredentials: 'The phone number or password is incorrect.',
          accountInactive: 'This account is not active yet. Contact support if needed.',
          accountLocked: 'This account is temporarily locked. Please try again later.',
        },
        register: {
          phoneAlreadyRegistered: 'This phone number is already used by another account.',
          emailAlreadyRegistered: 'This email address is already in use.',
          invalidData: 'Some information is invalid. Please review the form.',
        },
        forgotPassword: {
          invalidPhone: 'Enter a valid phone number to receive the code.',
        },
        verifyOtp: {
          invalidCode: 'The code is invalid or has expired.',
        },
        resetPassword: {
          invalidToken: 'This reset session has expired. Please start the process again.',
          invalidPassword: 'The new password cannot be used as entered.',
        },
        secureWallet: {
          pinAlreadyConfigured: 'A transaction PIN is already configured for this account.',
          invalidPin: 'The PIN must be valid before you can continue.',
        },
      },
      fields: {
        firstName: 'First name',
        firstNamePlaceholder: 'Maeva',
        lastName: 'Last name',
        lastNamePlaceholder: 'Ngoma',
        phoneNumber: 'Phone number',
        phoneNumberPlaceholder: '242060123456',
        email: 'Email',
        emailPlaceholder: 'you@example.com',
        password: 'Password',
        passwordPlaceholder: 'Your password',
        newPassword: 'New password',
        newPasswordPlaceholder: 'Your new password',
        confirmPassword: 'Confirm password',
        confirmPasswordPlaceholder: 'Confirm your password',
        transactionPin: 'Transaction PIN',
        transactionPinPlaceholder: '4 digits',
        confirmTransactionPin: 'Confirm PIN',
        confirmTransactionPinPlaceholder: 'Enter the PIN again',
        otpCode: 'OTP code',
      },
    },
    tabs: {
      home: 'Home',
      scanner: 'Scan',
      transactions: 'Transactions',
      profile: 'Profile',
    },
    home: {
      header: {
        eyebrow: 'Welcome back',
      },
      wallets: {
        retry: 'Retry',
        empty: 'No wallet available yet.',
        messages: {
          loading: 'Loading wallets...',
          genericError: 'Unable to load wallets.',
          networkError: 'Unable to connect. Please try again.',
        },
        types: {
          personal: 'Main wallet',
          merchant: 'Merchant wallet',
          agent: 'Agent wallet',
          system: 'System wallet',
        },
      },
      actions: {
        scanPay: 'Scan & Pay',
        topUp: 'Top up',
        request: 'Request',
        transfer: 'Transfer',
      },
      transactions: {
        title: 'Transactions',
        seeAll: 'See all',
        retry: 'Retry',
        empty: 'No recent transactions yet.',
        messages: {
          loading: 'Loading transactions...',
          genericError: 'Unable to load transactions.',
          networkError: 'Unable to connect. Please try again.',
        },
        types: {
          p2pTransferOut: 'Transfer sent',
          p2pTransferIn: 'Transfer received',
          merchantPayment: 'Merchant payment',
          cashIn: 'Wallet top up',
          cashOut: 'Cash out',
          moneyRequest: 'Money request',
          refund: 'Refund',
          adminAdjustment: 'Adjustment',
        },
        items: {
          market: {
            title: 'Mbolo Grocery',
            subtitle: 'Merchant payment',
            amount: '-12,500 XAF',
            time: '09:39 AM',
          },
          philip: {
            title: 'Philip',
            subtitle: 'Transfer received',
            amount: '+8,000 XAF',
            time: '08:52 AM',
          },
          cashIn: {
            title: 'Wallet top up',
            subtitle: 'Agent cash-in',
            amount: '+20,000 XAF',
            time: 'Yesterday',
          },
        },
      },
    },
    scanner: {
      hero: {
        eyebrow: 'Scan tab',
        title: 'QR becomes the entry point.',
        description:
          '{{brandName}} relies on clear QR journeys: merchant payment, money request and receiving money.',
        highlights: {
          personal: 'Personal and merchant QR',
          verification: 'Backend verification',
          signature: 'Signature and QR status',
          payments: 'Merchant payment and P2P',
        },
      },
      journeys: {
        title: 'Journeys to expose here',
        subtitle: 'Based on the current backend',
        merchant: {
          title: 'Pay a merchant',
          description: 'Scan a merchant QR, review the amount and confirm with the PIN.',
        },
        request: {
          title: 'Pay a money request',
          description: 'Accept a request sent by another user and pay from the wallet.',
        },
        personalQr: {
          title: 'Show my QR',
          description: 'Share a personal QR to receive a transfer quickly.',
        },
      },
      camera: {
        sectionTitle: 'Camera step',
        cardTitle: 'Next integration',
        description:
          'Connect Expo Camera to scan, decode, then route to merchant payment or money request.',
      },
      trust: {
        title: 'Trust rules',
        verify: 'Always review the name and amount before confirming.',
        expired: 'Never validate an expired or already used QR.',
        pin: 'Reconfirm sensitive operations with the transaction PIN.',
      },
    },
    transactionsPage: {
      topBar: {
        eyebrow: 'Wallet history',
      },
      retry: 'Retry',
      header: {
        title: 'Transactions',
        description: 'See your payments, transfers and wallet movements in one clear list.',
      },
      summary: {
        title: 'Wallet history',
        subtitle: '{{count}} operation(s) available',
      },
      filters: {
        walletLabel: 'Wallet',
        walletTitle: 'Choose a wallet',
        allWallets: 'All wallets',
        typeLabel: 'Type',
        typeTitle: 'Choose a type',
        allTypes: 'All types',
      },
      messages: {
        loading: 'Loading transactions...',
        loadingMore: 'Loading more...',
        genericError: 'Unable to load transactions.',
        networkError: 'Connection unavailable. Try again.',
        endReached: 'End of timeline.',
      },
      emptyFiltered: 'No transaction matches the selected filters.',
    },
    profile: {
      hero: {
        eyebrow: 'My account',
        kycLevel: 'KYC level 1',
        walletStatus: 'Active wallet',
      },
      security: {
        title: 'Account and security',
        subtitle: 'Already supported by the backend',
        pin: {
          title: 'Transaction PIN',
          subtitle: 'Validate sensitive payments with a short code.',
        },
        password: {
          title: 'Password',
          subtitle: 'Login, refresh token and OTP reset are already supported by the backend.',
        },
        personalQr: {
          title: 'My personal QR',
          subtitle: 'Show or share my QR to receive a payment.',
        },
      },
      structure: {
        title: 'Recommended structure',
        subtitle: 'A simple, practical and reassuring profile',
        personalInfo: {
          title: 'Personal information',
          subtitle: 'GET /auth/me',
        },
        merchantMode: {
          title: 'Merchant mode',
          subtitle: 'Merchant profile and static QR when enabled.',
        },
        support: {
          title: 'Help and support',
          subtitle: 'Channel to connect later to Yeba Pay support.',
        },
      },
      note: {
        title: 'Why not a dedicated merchant tab',
        description:
          'In the customer MVP, the merchant profile can stay a secondary mode from the account. Frequent actions remain on Home and Scan.',
      },
      actions: {
        logout: 'Sign out',
        loggingOut: 'Signing out...',
      },
    },
  },
} as const;
