import {clamp, videoTime} from './timeline.js';

// Une seule vidéo reste à l’écran pendant toute la promenade. Chaque recherche
// attend le décodage précédent ; une rafale de scroll conserve la dernière cible.
export class VideoScrubber {
  constructor(video, {source, enabled = true, onStatus = () => {}}) {
    this.video = video;
    this.source = source;
    this.enabled = enabled;
    this.onStatus = onStatus;
    this.progress = 0;
    this.position = 0;
    this.ready = false;
    this.frame = 0;
    this.lastTick = 0;
    this.loaded = false;
    video.muted = true;
    video.playsInline = true;
    video.addEventListener('loadeddata', () => {
      this.ready = true;
      video.classList.toggle('is-ready', this.enabled);
      onStatus(this.enabled ? 'ready' : 'paused');
      this.request();
    });
    video.addEventListener('seeked', () => this.request());
    video.addEventListener('error', () => {
      this.ready = false;
      video.classList.remove('is-ready');
      onStatus('error');
    });
    if (enabled) this.load(); else onStatus('paused');
  }
  load() {
    this.onStatus('loading');
    this.loaded = true;
    this.video.src = this.source;
    this.video.load();
  }
  setProgress(progress) { this.progress = clamp(progress); this.request(); }
  setEnabled(enabled) {
    this.enabled = enabled;
    if (enabled && !this.loaded) this.load();
    this.video.classList.toggle('is-ready', enabled && this.ready);
    this.onStatus(enabled ? (this.ready ? 'ready' : 'loading') : 'paused');
    this.request();
  }
  request() {
    if (this.frame || !this.ready || !this.enabled || this.video.seeking) return;
    this.frame = requestAnimationFrame(time => this.tick(time));
  }
  tick(time) {
    this.frame = 0;
    if (!this.enabled || !this.ready) return;
    const target = videoTime(this.progress, this.video.duration);
    const elapsed = this.lastTick ? Math.min(80, time - this.lastTick) : 16;
    this.lastTick = time;
    const delta = target - this.position;
    this.position = Math.abs(delta) < .025 ? target : this.position + delta * (1 - Math.exp(-elapsed / 85));
    if (Math.abs(this.video.currentTime - this.position) > .012 && !this.video.seeking) {
      this.video.currentTime = this.position;
    }
    if (Math.abs(delta) >= .025) this.request();
  }
}
