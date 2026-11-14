let AC: AudioContext | null = null;
export let soundOn = true;
export const setSound = (v: boolean) => { soundOn = v; };
function ac() { if (!AC) { try { AC = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { /* no audio */ } } return AC; }
export function unlockAudio() { ac()?.resume?.(); }
export function beep(f = 880, d = .12) {
  const a = ac(); if (!a || !soundOn) return;
  const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f;
  g.gain.setValueAtTime(.08, a.currentTime); g.gain.exponentialRampToValueAtTime(.0001, a.currentTime + d);
  o.connect(g).connect(a.destination); o.start(); o.stop(a.currentTime + d);
}
export function shutter() {
  const a = ac(); if (!a || !soundOn) return;
  const len = Math.floor(a.sampleRate * .2), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3) * (t < .08 || (t > .35 && t < .45) ? 1 : .3); }
  const s = a.createBufferSource(), g = a.createGain(); g.gain.value = .4; s.buffer = buf; s.connect(g).connect(a.destination); s.start();
}
export function chime() { [660, 880, 1320].forEach((f, i) => setTimeout(() => beep(f, .25), i * 110)); }
