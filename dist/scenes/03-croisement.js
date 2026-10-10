export const savoirFaire = {
  id: 'savoir-faire', label: 'Des plantes aux jardins', start: .52, end: .77,
  render: () => `<section class="scene scene-craft" data-scene="savoir-faire" aria-labelledby="craft-title" hidden><p class="eyebrow">02 / CE QUI NOUS ANIME</p><h2 id="craft-title">Des plantes.<br>Des idées.<br><em>Votre jardin.</em></h2><p class="scene-description">Choisir un feuillage. Composer un espace.<br>Imaginer un endroit où l’on se sent bien.</p><div class="craft-tags"><span>Pépinière</span><span>Conseil</span><span>Paysage</span></div></section>`,
};
export default {
  id: 'croisement', label: 'À vous de choisir', start: .77, end: 1,
  render: () => `<section class="scene scene-crossroad" data-scene="croisement" aria-labelledby="crossroad-title" hidden><p class="eyebrow">03 / LA SUITE VOUS APPARTIENT</p><h2 id="crossroad-title">Où vous mène<br><em>votre envie de nature ?</em></h2><div class="branch-options"><button class="branch" data-panel="conseiller"><span class="branch-direction">← UN CONSEIL POUR COMMENCER</span><strong>Rencontrons-nous.</strong><span>Parlons de vos plantes et de vos envies.</span><i>↗</i></button><button class="branch" data-panel="collections"><span class="branch-direction">DE L’INSPIRATION POUR CONTINUER →</span><strong>Explorez les possibilités.</strong><span>Des feuillages aux jardins à imaginer.</span><i>↗</i></button></div><button class="landscape-link" data-panel="jardins">Vous avez un projet d’aménagement ? <span>Imaginons-le ensemble ↗</span></button></section>`,
};
