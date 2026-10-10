import {settings} from './config.js';
import accueil from './scenes/01-accueil.js';
import serre from './scenes/02-serre.js';
import croisement, {savoirFaire} from './scenes/03-croisement.js';
import conseiller from './scenes/04-conseiller.js';
import collections from './scenes/05-collections.js';
import jardins, {projects} from './scenes/06-jardins.js';
import {scrollProgress, sceneAt} from './engine/timeline.js';
import {VideoScrubber} from './engine/video-scrubber.js';

const scenes = [accueil, serre, savoirFaire, croisement];
const panels = {conseiller, collections, jardins};
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const track = document.querySelector('#journey-track');
const overlays = document.querySelector('#scene-overlays');
overlays.innerHTML = scenes.map(scene => scene.render()).join('');
track.style.height = `${(settings.scrollScreens + 1) * innerHeight}px`;
document.querySelector('.chapter-nav').innerHTML = scenes.map((scene, i) => `<a href="#${scene.id}" title="${scene.label}" aria-label="Étape ${i + 1} : ${scene.label}"><span>0${i + 1}</span><i></i></a>`).join('');

const status = document.querySelector('.media-status');
const retry = document.querySelector('#retry-video');
const motionToggle = document.querySelector('#motion-toggle');
const scrubber = new VideoScrubber(document.querySelector('#journey-video'), {
  source: matchMedia('(max-width: 700px)').matches ? settings.media.mobile : settings.media.desktop,
  enabled: !reducedMotion.matches,
  onStatus(state) {
    const text = {loading: 'Préparation de la promenade…', ready: 'Défilez pour avancer', paused: 'Visite sans mouvement', error: 'La vidéo est indisponible. Vous pouvez explorer les espaces.'};
    document.querySelector('#media-status-text').textContent = text[state];
    status.dataset.state = state;
    retry.hidden = state !== 'error';
  },
});
retry.onclick = () => scrubber.load();
let activeScene;
let raf = 0;
let distance = 1;
function update() {
  raf = 0;
  if (document.body.classList.contains('dialog-open')) return;
  const progress = scrollProgress(scrollY, distance);
  scrubber.setProgress(progress);
  document.querySelector('#journey-progress').style.transform = `scaleX(${progress})`;
  document.querySelector('#journey-percent').textContent = String(Math.round(progress * 100)).padStart(2, '0');
  const scene = sceneAt(progress, scenes);
  if (scene !== activeScene) {
    activeScene = scene;
    document.querySelector('#chapter-label').textContent = scene.label;
    overlays.querySelectorAll('[data-scene]').forEach(el => {
      const visible = el.dataset.scene === scene.id;
      el.hidden = !visible;
      el.inert = !visible;
    });
    document.querySelectorAll('.chapter-nav a').forEach((a, index) => {
      a.classList.toggle('active', scenes[index] === scene);
      if (scenes[index] === scene) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    });
    document.body.dataset.scene = scene.id;
  }
}
function measure() { track.style.height = `${(settings.scrollScreens + 1) * innerHeight}px`; distance = Math.max(1, track.offsetHeight - innerHeight); update(); }
addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, {passive: true});
addEventListener('resize', measure);
addEventListener('pageshow', measure);
function gotoScene(id, smooth = true) {
  const scene = scenes.find(s => s.id === id);
  if (!scene) return;
  scrollTo({top: (scene.start ? scene.start + .015 : 0) * distance, behavior: smooth && !reducedMotion.matches ? 'smooth' : 'instant'});
}

function updateMotion() {
  motionToggle.setAttribute('aria-pressed', String(!scrubber.enabled));
  motionToggle.setAttribute('aria-label', scrubber.enabled ? 'Désactiver les mouvements de la visite' : 'Activer les mouvements de la visite');
  document.querySelector('#motion-label').textContent = scrubber.enabled ? 'Mouvement activé' : 'Mouvement désactivé';
  document.body.classList.toggle('motion-paused', !scrubber.enabled);
}
motionToggle.onclick = () => { scrubber.setEnabled(!scrubber.enabled); updateMotion(); };
reducedMotion.addEventListener('change', () => { scrubber.setEnabled(!reducedMotion.matches); updateMotion(); });
updateMotion();
const clean = document.querySelector('#clean-toggle');
clean.onclick = () => {
  const enabled = !document.body.classList.contains('clean-view');
  document.body.classList.toggle('clean-view', enabled);
  overlays.inert = enabled;
  overlays.setAttribute('aria-hidden', String(enabled));
  clean.setAttribute('aria-pressed', String(enabled));
  clean.setAttribute('aria-label', enabled ? 'Afficher les textes de la visite' : 'Masquer les textes pour admirer la serre');
  clean.firstChild.textContent = enabled ? 'Afficher les textes ' : 'Vue libre ';
};

const exploreDialog = document.querySelector('#explore-dialog');
const contactDialog = document.querySelector('#contact-dialog');
let savedScroll = 0;
function lockScroll() { if (document.body.classList.contains('dialog-open')) return; savedScroll = scrollY; document.body.style.top = `-${savedScroll}px`; document.body.classList.add('dialog-open'); }
function unlockScroll() { if (exploreDialog.open || contactDialog.open) return; document.body.classList.remove('dialog-open'); document.body.style.top = ''; scrollTo({top: savedScroll, behavior: 'instant'}); }
function showPanel(id, changeHash = true) {
  if (!panels[id]) return;
  document.querySelector('#panel-content').innerHTML = panels[id].render(settings);
  document.querySelectorAll('.panel-nav [data-panel]').forEach(button => {
    if (button.dataset.panel === id) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
  });
  if (!exploreDialog.open) { lockScroll(); exploreDialog.showModal(); }
  exploreDialog.scrollTop = 0;
  document.querySelector('#panel-heading').tabIndex = -1;
  document.querySelector('#panel-heading').focus({preventScroll: true});
  if (changeHash) history.replaceState(null, '', `#${id}`);
}
function showContact(message = 'Bonjour GreenNouala, je souhaite parler de mon projet végétal.') {
  const configured = /^\d{8,15}$/.test(settings.whatsapp);
  document.querySelector('#contact-message').value = message;
  document.querySelector('#contact-info').textContent = configured ? 'Présentez-nous votre idée. Vous pourrez compléter votre demande avec des photos dans WhatsApp.' : 'Le numéro WhatsApp de GreenNouala sera ajouté prochainement. Vous pouvez déjà préparer et copier votre message.';
  document.querySelector('#contact-action').innerHTML = configured ? 'Continuer sur WhatsApp <span>↗</span>' : 'Copier mon message <span>↗</span>';
  document.querySelector('#contact-feedback').textContent = '';
  lockScroll();
  if (!contactDialog.open) contactDialog.showModal();
}
document.querySelector('#contact-action').onclick = async () => {
  const message = document.querySelector('#contact-message').value.trim();
  if (!message) { document.querySelector('#contact-message').focus(); return; }
  if (/^\d{8,15}$/.test(settings.whatsapp)) { window.open(`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer'); return; }
  try { await navigator.clipboard.writeText(message); document.querySelector('#contact-feedback').textContent = 'Votre message est copié.'; }
  catch { document.querySelector('#contact-message').select(); document.querySelector('#contact-feedback').textContent = 'Copiez le texte sélectionné avec votre clavier ou le menu de votre téléphone.'; }
};
for (const dialog of [exploreDialog, contactDialog]) {
  dialog.querySelector('.dialog-close').onclick = () => dialog.close();
  dialog.addEventListener('close', () => { if (dialog === exploreDialog) history.replaceState(null, '', `#${activeScene.id}`); unlockScroll(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
}
document.addEventListener('click', event => {
  const panel = event.target.closest('[data-panel]');
  if (panel) { event.preventDefault(); showPanel(panel.dataset.panel); return; }
  const contact = event.target.closest('[data-contact]');
  if (contact) { showContact(contact.dataset.message); return; }
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    document.querySelectorAll('[data-filter]').forEach(button => { button.classList.toggle('active', button === filter); button.setAttribute('aria-pressed', String(button === filter)); });
    document.querySelectorAll('.collection-card').forEach(card => { card.hidden = filter.dataset.filter !== 'all' && card.dataset.category !== filter.dataset.filter; });
    return;
  }
  const project = event.target.closest('[data-project]');
  if (project) {
    document.querySelectorAll('[data-project]').forEach(button => { button.classList.toggle('active', button === project); button.setAttribute('aria-pressed', String(button === project)); });
    const data = projects[project.dataset.project];
    document.querySelector('#project-title').textContent = data.title;
    document.querySelector('#project-description').textContent = data.description;
    document.querySelector('#project-contact').dataset.message = data.message;
    return;
  }
  const link = event.target.closest('a[href^="#"]');
  if (link && scenes.some(scene => `#${scene.id}` === link.getAttribute('href'))) {
    event.preventDefault();
    const id = link.getAttribute('href').slice(1);
    gotoScene(id);
    history.replaceState(null, '', `#${id}`);
  }
});
measure();
const initialHash = location.hash.slice(1);
if (panels[initialHash]) showPanel(initialHash, false); else if (scenes.some(s => s.id === initialHash)) gotoScene(initialHash, false);
