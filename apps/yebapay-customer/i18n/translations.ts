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
        pinMismatch: 'Les deux PIN ne correspondent pas.',
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
      activity: 'Activite',
      profile: 'Profil',
    },
    home: {
      hero: {
        body: 'Le wallet QR du quotidien. Une base mobile claire pour transferer, demander et payer.',
        pillars: {
          fees: 'Frais visibles',
          fast: 'Paiement rapide',
          history: 'Historique clair',
        },
      },
      balance: {
        title: 'Solde principal',
        subtitle: "Carte d'accueil prete a etre branchee sur GET /wallets/me",
        lastActivityLabel: 'Derniere activite',
        lastActivityValue: 'P2P + paiement marchand',
      },
      quickActions: {
        title: 'Raccourcis',
        subtitle: 'Les parcours deja portes par le backend deviennent des tuiles claires ici.',
        payByQr: {
          title: 'Payer par QR',
          description: 'Scanner un QR marchand ou une demande de paiement.',
        },
        send: {
          title: 'Envoyer',
          description: 'Transferer des fonds entre particuliers avec idempotence.',
        },
        request: {
          title: 'Demander',
          description: "Creer une demande d'argent payable tout de suite ou plus tard.",
        },
        receive: {
          title: 'Recevoir',
          description: 'Partager un QR personnel pour etre paye plus vite.',
        },
      },
      backend: {
        title: 'Pret cote backend',
        subtitle: 'Cette premiere home met en avant ce qui est deja branchable sans inventer de faux flux.',
        items: {
          auth: 'Authentification + refresh token',
          wallet: 'Wallet + historique',
          p2p: 'Transfert P2P avec ledger',
          request: "Demande d'argent",
          merchant: 'Paiement marchand',
          qr: 'QR decode et verification',
        },
      },
      promise: {
        title: 'Pourquoi ca change',
        subtitle: 'Le branding doit soutenir une promesse simple: moins de friction, plus de lisibilite.',
        visibleFees: {
          title: 'Frais visibles',
          description: 'Le montant, les frais et le net credite restent lisibles avant confirmation.',
        },
        counterFast: {
          title: 'Rapide au comptoir',
          description: 'Le parcours QR est pense pour payer en quelques etapes, pas en plusieurs menus.',
        },
        traceable: {
          title: 'Flux tracables',
          description: "Le backend garde l'historique transactionnel et comptable comme source de verite.",
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
    activity: {
      hero: {
        eyebrow: 'Onglet activite',
        title: 'Historique clair, recus visibles.',
        description:
          "Cet onglet doit porter les transactions, les demandes d'argent et les etats utiles sans ressembler a un dashboard bancaire surcharge.",
      },
      stats: {
        today: "Aujourd'hui",
        todayValue: '3 operations',
        pending: 'En attente',
        pendingValue: '2 demandes',
      },
      transactions: {
        title: 'Derniers mouvements',
        subtitle: 'GET /wallets/me/transactions',
        sent: {
          title: 'Transfert envoye',
          subtitle: 'Vers Nadine Tati',
          status: 'Reussi',
        },
        requestPaid: {
          title: 'Demande reglee',
          subtitle: 'Remboursement recu',
          status: 'Credite',
        },
        merchantPayment: {
          title: 'Paiement marchand',
          subtitle: 'Chez Maeva',
          status: 'Confirme',
        },
      },
      requests: {
        title: 'Demandes en cours',
        subtitle: 'GET /money-requests/me',
        transport: {
          title: 'Remboursement transport',
          subtitle: 'En attente de paiement',
        },
        birthday: {
          title: 'Participation anniversaire',
          subtitle: 'Expire dans 1 h 40',
        },
      },
      pattern: {
        title: 'Structure recommandee',
        timeline: 'Une timeline simple pour les transactions.',
        requests: 'Un bloc dedie aux demandes en attente ou a payer.',
        receipts: 'Des recus lisibles, pas des graphiques inutiles.',
      },
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
        pinMismatch: 'The two PIN codes do not match.',
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
      activity: 'Activity',
      profile: 'Profile',
    },
    home: {
      hero: {
        body: 'The everyday QR wallet. A clear mobile base to send, request and pay.',
        pillars: {
          fees: 'Visible fees',
          fast: 'Fast payments',
          history: 'Clear history',
        },
      },
      balance: {
        title: 'Main balance',
        subtitle: 'Home card ready to connect to GET /wallets/me',
        lastActivityLabel: 'Last activity',
        lastActivityValue: 'P2P + merchant payment',
      },
      quickActions: {
        title: 'Quick actions',
        subtitle: 'Flows already supported by the backend become clear tiles here.',
        payByQr: {
          title: 'Pay by QR',
          description: 'Scan a merchant QR or a payment request.',
        },
        send: {
          title: 'Send',
          description: 'Transfer funds between individuals with idempotency.',
        },
        request: {
          title: 'Request',
          description: 'Create a money request payable now or later.',
        },
        receive: {
          title: 'Receive',
          description: 'Share a personal QR to get paid faster.',
        },
      },
      backend: {
        title: 'Backend ready',
        subtitle: 'This first home screen highlights what is already connectable without fake flows.',
        items: {
          auth: 'Authentication + refresh token',
          wallet: 'Wallet + history',
          p2p: 'P2P transfer with ledger',
          request: 'Money request',
          merchant: 'Merchant payment',
          qr: 'QR decode and verification',
        },
      },
      promise: {
        title: 'Why it matters',
        subtitle: 'Branding should support one simple promise: less friction, more clarity.',
        visibleFees: {
          title: 'Visible fees',
          description: 'Amount, fees and net credited remain easy to read before confirmation.',
        },
        counterFast: {
          title: 'Fast at the counter',
          description: 'The QR flow is designed for a few steps, not several menus.',
        },
        traceable: {
          title: 'Traceable flows',
          description: 'The backend keeps transactional and accounting history as the source of truth.',
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
    activity: {
      hero: {
        eyebrow: 'Activity tab',
        title: 'Clear history, readable receipts.',
        description:
          'This tab should carry transactions, money requests and useful states without feeling like an overloaded banking dashboard.',
      },
      stats: {
        today: 'Today',
        todayValue: '3 operations',
        pending: 'Pending',
        pendingValue: '2 requests',
      },
      transactions: {
        title: 'Latest activity',
        subtitle: 'GET /wallets/me/transactions',
        sent: {
          title: 'Transfer sent',
          subtitle: 'To Nadine Tati',
          status: 'Success',
        },
        requestPaid: {
          title: 'Request paid',
          subtitle: 'Refund received',
          status: 'Credited',
        },
        merchantPayment: {
          title: 'Merchant payment',
          subtitle: 'Chez Maeva',
          status: 'Confirmed',
        },
      },
      requests: {
        title: 'Current requests',
        subtitle: 'GET /money-requests/me',
        transport: {
          title: 'Transport refund',
          subtitle: 'Waiting for payment',
        },
        birthday: {
          title: 'Birthday contribution',
          subtitle: 'Expires in 1h 40m',
        },
      },
      pattern: {
        title: 'Recommended structure',
        timeline: 'A simple timeline for transactions.',
        requests: 'A dedicated block for pending or payable requests.',
        receipts: 'Readable receipts, not unnecessary charts.',
      },
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
