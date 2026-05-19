/**
 * Lightweight sound system using the Web Audio API.
 * No external assets — all tones are synthesized.
 * Sounds are intentionally soft and short.
 */

let ctx = null;
let muted = false;
let masterGain = null;

let bgNodes = [];
let endingMode = false;
let musicLoop = null;
let endingAudio = null;

function ensureCtx() {
  if (typeof window === "undefined") return null;

  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;

    if (!AC) return null;

    ctx = new AC();

    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;

    masterGain.connect(ctx.destination);
  }

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  return ctx;
}

function tone({
  freq = 440,
  dur = 0.18,
  type = "sine",
  vol = 0.4,
  attack = 0.01,
  decay = 0.12,
  slideTo = null,
} = {}) {
  if (muted) return;

  // prevent gameplay sounds during ending
  if (endingMode) return;

  const c = ensureCtx();

  if (!c) return;

  const t = c.currentTime;

  const osc = c.createOscillator();
  const gain = c.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);

  if (slideTo) {
    osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  }

  gain.gain.setValueAtTime(0, t);

  gain.gain.linearRampToValueAtTime(vol, t + attack);

  gain.gain.exponentialRampToValueAtTime(0.001, t + attack + decay);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function chord(freqs, opts = {}) {
  freqs.forEach((f, i) => {
    setTimeout(() => tone({ freq: f, ...opts }), i * 40);
  });
}

export const Sound = {
  unlock() {
    ensureCtx();
  },

  setMuted(v) {
    muted = !!v;
  },

  isMuted() {
    return muted;
  },

  startEndingMusic() {
    endingMode = true;

    this.stopEndingMusic();

    endingAudio = new Audio(
      "/music/Patience and Prudence - A Smile And A Ribbon.mp3",
    );

    endingAudio.volume = 0.45;

    endingAudio.loop = true;

    endingAudio.play().catch((err) => {
      console.log("Audio autoplay blocked:", err);
    });
  },

  stopEndingMusic() {
    endingMode = false;

    if (!endingAudio) return;

    endingAudio.pause();

    endingAudio.currentTime = 0;
  },

  click() {
    tone({
      freq: 520,
      dur: 0.08,
      type: "triangle",
      vol: 0.25,
      attack: 0.002,
      decay: 0.06,
    });
  },

  pop() {
    tone({
      freq: 660,
      dur: 0.12,
      type: "sine",
      vol: 0.3,
      slideTo: 880,
      decay: 0.1,
    });
  },

  success() {
    chord([523.25, 659.25, 783.99], {
      dur: 0.35,
      type: "triangle",
      vol: 0.28,
      decay: 0.3,
    });
  },

  fanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((f, i) => {
      setTimeout(() => {
        tone({
          freq: f,
          dur: 0.4,
          type: "triangle",
          vol: 0.3,
          decay: 0.35,
        });
      }, i * 120);
    });
  },

  fail() {
    tone({
      freq: 220,
      dur: 0.25,
      type: "sine",
      vol: 0.25,
      slideTo: 110,
      decay: 0.22,
    });
  },

  layerAdd() {
    tone({
      freq: 392,
      dur: 0.18,
      type: "triangle",
      vol: 0.3,
      slideTo: 587,
      decay: 0.16,
    });

    setTimeout(() => {
      tone({
        freq: 784,
        dur: 0.25,
        type: "sine",
        vol: 0.22,
        decay: 0.22,
      });
    }, 120);
  },

  mudra(i = 0) {
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880];

    tone({
      freq: notes[i % notes.length],
      dur: 0.32,
      type: "sine",
      vol: 0.28,
      decay: 0.28,
    });
  },

  sparkle() {
    const f = 1200 + Math.random() * 600;

    tone({
      freq: f,
      dur: 0.18,
      type: "sine",
      vol: 0.18,
      slideTo: f * 1.6,
      decay: 0.15,
    });
  },

  tick() {
    tone({
      freq: 880,
      dur: 0.04,
      type: "square",
      vol: 0.12,
      decay: 0.03,
    });
  },
};
