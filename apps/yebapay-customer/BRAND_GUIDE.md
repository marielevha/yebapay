# YebaPay Brand Guide

Ce document fixe une premiere base de marque pour `apps/yebapay-customer`.

## 1. Noyau de marque

Nom:

- `YebaPay`

Promesse:

- Le paiement du quotidien par QR, simple, rapide et traçable.

Mission:

- Rendre le paiement de proximite plus fluide pour les particuliers et les commerçants, sans la friction habituelle des parcours mobile money traditionnels.

Vision:

- Faire du QR le geste naturel de paiement local: visible, comprehensible et fiable.

## 2. Positionnement

Positionnement court:

- `YebaPay` est le wallet QR du quotidien congolais.

Positionnement detaille:

- YebaPay ne se positionne pas comme "un autre mobile money".
- YebaPay se positionne comme une experience de paiement plus moderne pour les interactions de proximite.
- Le coeur de valeur n'est pas seulement le transfert d'argent, mais la clarte des flux: scan, confirmation, recu, historique, frais visibles.

## 3. Differentiateurs vs mobile money existants

Ce que YebaPay doit raconter:

- `Plus simple en face-a-face`: un scan vaut mieux qu'une saisie longue ou un menu peu lisible.
- `Plus clair`: les frais et le resultat final sont visibles avant confirmation.
- `Plus commerçant`: QR statique, QR dynamique, encaissement structure, historique plus lisible.
- `Plus rassurant`: recu immediat, historique propre, logique comptable serieuse en backend.
- `Plus moderne`: interface plus directe, plus visuelle, plus rapide.

Ce que YebaPay ne doit pas raconter:

- ne pas se presenter comme une copie "plus jolie" d'un mobile money existant
- ne pas promettre la banque universelle des le debut
- ne pas surjouer le cote crypto / neo-bank / fintech internationale

## 4. Cibles prioritaires

- particuliers urbains qui veulent payer ou transferer vite
- petits commerçants qui veulent encaisser simplement
- utilisateurs qui veulent un historique plus lisible et des operations plus previsibles

## 5. Territoire verbal

Personnalite:

- claire
- confiante
- chaleureuse
- terrain
- rapide

Ton:

- direct
- simple
- sans jargon
- rassurant sans etre administratif

Lexique a privilegier:

- scanner
- payer
- encaisser
- confirmer
- recu
- historique
- solde

Lexique a eviter:

- jargon bancaire lourd
- langage corporate froid
- promesses trop "future of finance"

## 6. Slogan

Slogan principal recommande:

- `Scanne. Paye. C'est regle.`

Ligne descriptive secondaire:

- `Le wallet QR du quotidien.`

Autres slogans possibles:

- `Payer en un scan, en toute confiance.`
- `Le paiement simple de proximite.`
- `Votre quotidien passe au QR.`

Recommendation:

- garder `Scanne. Paye. C'est regle.` comme signature principale de lancement
- utiliser `Le wallet QR du quotidien.` comme sous-titre produit

## 7. Identite visuelle

Direction generale:

- chaleureuse mais nette
- plus locale et humaine qu'une fintech bleue standard
- plus premium qu'un simple service utilitaire
- inspiree par le commerce de proximite, la confiance et la rapidite

Palette recommande:

- `Ink`: `#12312E`
- `Palm`: `#1E6B5B`
- `Sand`: `#F4E8D1`
- `Mist`: `#EEF5F1`
- `Sun`: `#D79A2B`
- `Clay`: `#D85C34`
- `Cloud`: `#FAFAF7`
- `Slate`: `#667874`

Interpretation:

- `Ink` = confiance / structure / lisibilite
- `Palm` = modernite calme / flux / argent vivant
- `Sand` = chaleur / accessibilite / ancrage terrain
- `Sun` = energie / confirmation / montant / call-to-action
- `Clay` = accent emotionnel / alertes / intensite

## 8. Typographie

Direction recommande:

- display: `Sora` ou `Space Grotesk`
- texte UI: `Manrope`
- chiffres / references: `IBM Plex Mono`

Pourquoi:

- `Sora` donne une presence moderne sans tomber dans la fintech generique
- `Manrope` reste lisible pour les parcours transactionnels
- `IBM Plex Mono` clarifie les refs, montants et reçus

Note:

- ces polices ne sont pas encore branchees dans l'app
- elles servent ici de cap pour le design system

## 9. Concept de logo

Concept retenu:

- un `Y` central
- encadre par des coins inspires d'un QR
- avec un point d'accent qui evoque le paiement, le scan ou la confirmation

Ce que le logo doit raconter:

- QR-first
- paiement rapide
- structure fiable
- marque simple a reconnaitre sur mobile

Livrable initial:

- voir `assets/brand/yebapay-mark.svg`

## 10. Principes UI pour l'app customer

- grands montants tres lisibles
- CTAs francs et courts
- cartes claires plutot que listes denses
- confirmations visuelles tres explicites
- couleurs chaudes et contraste propre
- ne pas partir sur une UI ultra sombre, froide ou trop "dashboard SaaS"

## 11. Motion

Directions recommandees:

- reveal progressif a l'ouverture
- halo ou pulse bref apres succes transaction
- balayage subtil sur le scan QR
- transitions courtes, pas gadget

## 12. Traduction produit immediate

Dans `apps/yebapay-customer`, cette marque implique:

- un ecran d'accueil centre sur le solde et les actions rapides
- une forte mise en avant du scan
- une interface qui donne confiance aux montants et confirmations
- une experience commerçant visuellement coherente avec le flux particulier

## 13. A faire ensuite

- brancher les tokens de marque dans le theme mobile
- installer les polices retenues
- affiner les variantes raster si le logo evolue
- produire les premiers ecrans avec cette direction

Etat actuel:

- le logo a ete decline en icone app
- les assets Expo ont ete remplaces par des assets YebaPay
- un generateur local permet de regenerer le set dans `scripts/generate-brand-assets.py`
