export const clamp = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export function scrollProgress(scroll, distance) { return distance > 0 ? clamp(scroll / distance) : 0; }
export function videoTime(progress, duration) { return clamp(progress) * Math.max(0, (Number.isFinite(duration) ? duration : 0) - .045); }
export function sceneAt(progress, scenes) { return scenes.find(scene => progress >= scene.start && progress < scene.end) ?? scenes.at(-1); }
