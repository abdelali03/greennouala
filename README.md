# GreenNouala — visite vidéo au scroll

Site statique sans dépendances. Lancer `npm run dev`, puis ouvrir http://localhost:4173. Le serveur prend en charge les requêtes partielles HTTP Range nécessaires à la recherche vidéo.

## Parcours continu

Une seule vidéo plein écran reste montée pendant toute la visite. Le scroll contrôle sa position de lecture dans les deux sens. Elle est en pause lorsqu’on ne défile plus. Les scènes sont des textes et des actions superposés au même décor, pas des sections photographiques.

`dist/engine/video-scrubber.js` attend la fin du décodage précédent avant de rechercher l’image suivante et conserve la cible de scroll la plus récente. `dist/engine/timeline.js` calcule les positions. `dist/app.js` relie le moteur, la navigation et les panneaux.

## Scènes indépendantes

| Module | Rôle |
| --- | --- |
| `dist/scenes/01-accueil.js` | Accueil, de 0 à 24 % du parcours |
| `dist/scenes/02-serre.js` | Promenade, de 24 à 52 % |
| `dist/scenes/03-croisement.js` | Savoir-faire de 52 à 77 %, puis choix des espaces |
| `dist/scenes/04-conseiller.js` | Panneau conseil, indépendant du travelling |
| `dist/scenes/05-collections.js` | Galerie d’ambiances et filtres |
| `dist/scenes/06-jardins.js` | Concepts paysagers et messages de contact |

Modifier `start` et `end` pour déplacer un texte sur la vidéo. Garder les intervalles continus de 0 à 1. `scrollScreens` dans `dist/config.js` règle la longueur du défilement. Le bouton « Vue libre » masque les textes tout en conservant le travelling.

## Médias fournis

Un MP4 et un PNG ont été reçus. Le MP4 dure 10,042 s, mesure 1920 × 1080, contient 241 images et une seule image clé. Ce fichier est Full HD, pas 4K.

Deux versions ont été encodées à partir du même MP4, avec une image clé toutes les six images et la table MP4 en tête :

- `dist/assets/serre-scroll.mp4` : 1920 × 1080, CRF 20, environ 26 Mo.
- `dist/assets/serre-scroll-mobile.mp4` : 1280 × 720, CRF 22, environ 11 Mo.
- `dist/assets/serre-entree.jpg` : première image du MP4, pour afficher la même entrée pendant le chargement.
- `dist/assets/serre-poster.png` : PNG fourni, utilisé dans les panneaux de découverte.

Les fichiers originaux de Downloads restent inchangés. Les copies intermédiaires et outils sont dans `.qa/`, ignoré par Git et exclu du déploiement. Remplacer les chemins dans `dist/config.js` pour changer de travelling ; remplacer aussi l’image d’entrée et son chemin dans `dist/index.html`. Pour une vraie version 4K, utiliser une source 3840 × 2160 : agrandir la vidéo actuelle ne crée pas de détails supplémentaires.

Le croisement ouvre les panneaux sur le même décor. Le fichier reçu ne contient pas de bifurcations filmées ni de conseiller. Pour une rotation réelle à gauche ou à droite, fournir les séquences raccordées correspondantes et étendre le moteur de médias ; l’interface actuelle ne prétend pas simuler ces déplacements.

## Contact et conseiller

Configurer `whatsapp` dans `dist/config.js` avec le numéro international sans + ni espaces. Sans numéro, le visiteur prépare et copie son message. La vidéo du conseiller et ses sous-titres sont facultatifs : renseigner `advisorVideo` et `advisorCaptions`.

Les galeries présentent des ambiances issues de l’image fournie, sans inventer de références disponibles ou de jardins réalisés. Remplacer ces contenus quand le catalogue et les réalisations seront prêts.

## Vérification

`npm run check` vérifie les modules JavaScript. Avec Chrome installé à son emplacement Windows habituel et le serveur lancé, `node scripts/verify-browser.mjs` vérifie dans un vrai navigateur : avancée/recul, changements des images décodées, vidéo unique, filtres, messages paysagers, panneaux, conservation du scroll, affichage mobile et mouvements réduits. Captures dans `.qa/`.

La préférence système de mouvements réduits affiche une image fixe et ne charge pas le travelling avant activation volontaire. Les panneaux sont des dialogues natifs accessibles au clavier, fermables avec Échap. Safari/iPhone et les connexions lentes restent à tester sur appareils réels.
