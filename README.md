# GreenNouala

Prototype statique modulaire, sans dépendances. Lancer `npm run dev`, puis ouvrir http://localhost:4173. `npm run check` vérifie la syntaxe du contrôleur.

## Scènes indépendantes

Chaque fichier dans `dist/scenes/` contient une scène : accueil, serre, croisement, conseiller, collections, jardins. L’ordre et les imports sont dans `dist/app.js`. Les styles partagés sont dans `dist/styles.css`.

Pour remplacer une photographie, modifier `image` dans la scène, ou le chemin de son élément img. Pour l’entrée et la serre, renseigner `video` avec un fichier MP4 local : le contrôleur synchronise sa progression avec le scroll. Encoder des versions légères avec des images clés rapprochées ; tester le seeking sur téléphones réels avant livraison. La vidéo doit suivre un mouvement réel stabilisé. La version actuelle utilise un zoom/parallaxe photographique, pas une vraie visite filmée ni une reconstruction de la pépinière.

La vidéo du conseiller se configure dans `04-conseiller.js`. Fournir `dist/assets/conseiller.vtt` pour les sous-titres français. Les scènes utilisent des ancres : remplacer une scène n’affecte pas les liens si son id reste identique.

## Contenus à fournir

Logo, photos et vidéos de la vraie pépinière, vidéo du conseiller, catalogue vérifié, réalisations paysagères et numéro WhatsApp international. Renseigner ce dernier dans `dist/config.js`. Sans numéro, le site propose de copier un message et n’envoie rien. Les photographies Unsplash distantes sont des références d’ambiance ; aucune ne constitue une réalisation GreenNouala. Télécharger et valider les droits des assets définitifs avant exploitation commerciale. Les photos illustratives de plantes doivent être remplacées par les bons spécimens.

## Accessibilité et vérification

Ancres directes, clavier, dialogue fermable avec Échap, filtres avec état accessible, préférence système de mouvements réduits. Vérifier les parcours, les médias, les contrastes et les performances dans des navigateurs réels, notamment Safari mobile. Les fichiers sources se déploient tels quels depuis `dist/`.
